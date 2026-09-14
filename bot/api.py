import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Header, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from bot.config import settings
from bot.auth import verify_and_parse_init_data
from bot.database import db
from bot.services.marzban import marzban_service

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()
    yield
    await marzban_service.close()

app = FastAPI(title="PARTIZAN VPN TWA API", version="2.0.0", lifespan=lifespan)

# Restrict CORS to configured allowed origins
allowed_origins_list = [orig.strip() for orig in settings.allowed_origins.split(",") if orig.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list if allowed_origins_list else ["https://axisforge.tech", "https://web.telegram.org"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidatePromoRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=32, pattern=r"^[A-Za-z0-9А-Яа-яЁё_-]+$")


class ProcessPaymentRequest(BaseModel):
    plan_id: str = Field(..., pattern=r"^plan-(1m|3m|12m)$")
    promo_code: Optional[str] = Field(None, max_length=32, pattern=r"^[A-Za-z0-9А-Яа-яЁё_-]+$")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_telegram_init_data: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Validates Telegram WebApp initData from headers.
    Returns user dict with telegram id, first_name, username.
    Raises 401 Unauthorized if initData is missing or invalid.
    """
    init_data_raw = x_telegram_init_data or authorization
    if init_data_raw and init_data_raw.startswith("Bearer "):
        init_data_raw = init_data_raw[7:]

    if init_data_raw and settings.bot_token != "YOUR_TELEGRAM_BOT_TOKEN":
        try:
            parsed = verify_and_parse_init_data(init_data_raw, settings.bot_token)
            if "user" in parsed:
                return parsed["user"]
        except ValueError as e:
            logger.warning(f"initData verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Telegram authentication: {str(e)}"
            )

    # Fallback user ONLY in explicit DEV_MODE environment AND outside production
    if os.getenv("DEV_MODE") == "1" and settings.environment != "production":
        return {
            "id": 999999999,
            "first_name": "Партизан",
            "username": "partizan_tester"
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Telegram initData authorization is required. Access available only via Telegram Mini App."
    )


# ==============================================================================
# ENGINE INTEGRATION HELPERS (HWID & CDN QUOTA)
# ==============================================================================
def read_hwid_database() -> dict:
    """Safely reads hwid_devices.json from disk."""
    path = settings.hwid_devices_path
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read HWID database at {path}: {e}")
        return {}


def save_hwid_database(data: dict) -> bool:
    """Atomically writes hwid_devices.json to disk."""
    path = settings.hwid_devices_path
    tmp_path = f"{path}.tmp.{os.getpid()}"
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)
        return True
    except Exception as e:
        logger.error(f"Failed to write HWID database at {path}: {e}")
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        return False


def get_user_devices_info(marzban_username: str) -> Dict[str, Any]:
    """Retrieves user active devices from HWID engine database."""
    db_hwid = read_hwid_database()
    # Case-insensitive lookup
    user_data = None
    for u_key, val in db_hwid.items():
        if u_key.upper() == marzban_username.upper():
            user_data = val
            break

    if not user_data:
        return {"activeDevicesCount": 0, "maxDevicesCount": 3, "devices": []}

    max_dev = user_data.get("max_devices", 3)
    raw_devices = user_data.get("devices", {})
    device_list = []

    for dev_k, dev_v in raw_devices.items():
        device_list.append({
            "key": dev_k,
            "type": dev_v.get("type", "hwid"),
            "os": dev_v.get("os", "Unknown OS"),
            "model": dev_v.get("model", "Device"),
            "user_agent": dev_v.get("user_agent", ""),
            "first_seen": dev_v.get("first_seen", ""),
            "last_seen": dev_v.get("last_seen", ""),
            "last_ip": dev_v.get("last_ip", "")
        })

    return {
        "activeDevicesCount": len(device_list),
        "maxDevicesCount": max_dev,
        "devices": device_list
    }


def get_user_cdn_quota_info(marzban_username: str) -> Dict[str, Any]:
    """Retrieves two-way CDN accounting data from cdn_quota_state.json."""
    soft_limit = 20 * 1024 * 1024 * 1024   # 20 GiB
    hard_limit = 25 * 1024 * 1024 * 1024   # 25 GiB
    path = settings.cdn_quota_state_path

    used_bytes = 0
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                state = json.load(f)
                users = state.get("users", {})
                for u_key, val in users.items():
                    if u_key.upper() == marzban_username.upper():
                        used_bytes = val
                        break
        except Exception as e:
            logger.warning(f"Failed to read CDN quota state: {e}")

    # Estimate download / upload breakdown (CDN typically 85% downlink, 15% uplink)
    download_bytes = int(used_bytes * 0.85)
    upload_bytes = used_bytes - download_bytes

    if used_bytes < soft_limit:
        status_str = "normal"
    elif used_bytes < hard_limit:
        status_str = "throttled"
    else:
        status_str = "blocked"

    return {
        "used_bytes": used_bytes,
        "download_bytes": download_bytes,
        "upload_bytes": upload_bytes,
        "soft_limit_bytes": soft_limit,
        "hard_limit_bytes": hard_limit,
        "status": status_str,
        "throttle_speed": "512 кбит/с",
        "resets_at": "1-е число следующего месяца"
    }


@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "app": "PARTIZAN VPN API", "time": datetime.utcnow().isoformat()}


@app.get("/api/v1/user/profile")
async def get_user_profile(user_data: Dict[str, Any] = Depends(get_current_user)):
    telegram_id = user_data["id"]
    username = user_data.get("username")
    first_name = user_data.get("first_name", "Партизан")

    user = await db.get_user(telegram_id)
    if not user:
        user = await db.create_or_update_user(telegram_id, username, first_name)

    has_used_trial = bool(user.get("has_used_trial"))
    user_status = user.get("status", "inactive")
    marzban_username = user.get("marzban_username") or f"partizan_{telegram_id}"
    referral_stats = await db.get_referral_stats(telegram_id)
    
    # Fetch real live telemetry from HWID engine and CDN quota state
    dev_info = get_user_devices_info(marzban_username)
    cdn_info = get_user_cdn_quota_info(marzban_username)

    # If user has NOT activated trial/subscription yet
    if not has_used_trial and user_status == 'inactive':
        return {
            "telegram_id": telegram_id,
            "first_name": first_name,
            "username": username,
            "has_used_trial": False,
            "subscription": {
                "hasSubscription": False,
                "status": "inactive",
                "expireDate": "",
                "daysRemaining": 0,
                "subscriptionUrl": "",
                "isTrafficUnlimited": True,
                "whitelistUsedBytes": cdn_info["used_bytes"],
                "whitelistTotalBytes": cdn_info["soft_limit_bytes"],
                "usedBytes": 0,
                "totalBytes": 0,
                "activeDevicesCount": dev_info["activeDevicesCount"],
                "maxDevicesCount": dev_info["maxDevicesCount"],
                "availableLocations": [
                    {"id": "de-aeza", "country": "Германия", "city": "Франкфурт (Aeza 9950X)", "flag": "🇩🇪", "protocol": "VLESS-XHTTP"},
                ]
            },
            "referrals": referral_stats
        }

    # If user HAS an active sub/trial: fetch live data from Marzban API
    marzban_info = await marzban_service.get_user_status(marzban_username)

    days_remaining = 0
    expire_str = user.get("expire_date")
    if expire_str:
        try:
            exp_dt = datetime.fromisoformat(expire_str)
            delta = exp_dt - datetime.utcnow()
            days_remaining = max(0, delta.days)
        except Exception:
            pass

    sub_url = marzban_info.get("formatted_subscription_url") or marzban_service.format_subscription_url(
        f"{settings.marzban_url}/274ba6b74d0c6820/{marzban_username}_token"
    )

    return {
        "telegram_id": telegram_id,
        "first_name": first_name,
        "username": username,
        "has_used_trial": True,
        "subscription": {
            "hasSubscription": True,
            "status": user.get("status", "active"),
            "expireDate": user.get("expire_date", ""),
            "daysRemaining": days_remaining,
            "subscriptionUrl": sub_url,
            "isTrafficUnlimited": True,
            "whitelistUsedBytes": cdn_info["used_bytes"],
            "whitelistTotalBytes": cdn_info["soft_limit_bytes"],
            "usedBytes": marzban_info.get("used_traffic", 0),
            "totalBytes": marzban_info.get("data_limit", 0),
            "activeDevicesCount": dev_info["activeDevicesCount"],
            "maxDevicesCount": dev_info["maxDevicesCount"],
            "availableLocations": [
                {"id": "de-aeza", "country": "Германия", "city": "Франкфурт (Aeza 9950X)", "flag": "🇩🇪", "protocol": "VLESS-XHTTP"},
            ]
        },
        "referrals": referral_stats
    }


@app.post("/api/v1/user/activate-trial")
async def activate_trial(user_data: Dict[str, Any] = Depends(get_current_user)):
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    if not user:
        user = await db.create_or_update_user(telegram_id, user_data.get("username"), user_data.get("first_name"))

    if user.get("has_used_trial"):
        return {"success": False, "message": "Вы уже использовали ваш бесплатный пробный период!"}

    marzban_username = user.get("marzban_username") or f"partizan_{telegram_id}"
    
    # Create Marzban user via REST API
    marzban_res = await marzban_service.create_user(
        username=marzban_username,
        expire_days=settings.trial_days
    )
    
    await db.mark_trial_used(telegram_id)
    new_expire = await db.add_user_days(telegram_id, settings.trial_days)

    # Process referral reward if user was invited by a referrer
    referrer_id = user.get("referrer_id")
    if referrer_id and referrer_id != telegram_id:
        try:
            await db.add_referral_reward(referrer_id, telegram_id, settings.referral_bonus_days)
            await marzban_service.extend_user(f"partizan_{referrer_id}", settings.referral_bonus_days)
        except Exception as e:
            logger.error(f"Error processing referral reward for {referrer_id}: {e}")

    sub_url = marzban_res.get("formatted_subscription_url") or marzban_service.format_subscription_url(
        f"{settings.marzban_url}/274ba6b74d0c6820/{marzban_username}_token"
    )

    dev_info = get_user_devices_info(marzban_username)
    cdn_info = get_user_cdn_quota_info(marzban_username)

    return {
        "success": True,
        "message": f"Бесплатный пробный период на {settings.trial_days} дня успешно активирован!",
        "subscription": {
            "hasSubscription": True,
            "status": "trial",
            "expireDate": new_expire,
            "daysRemaining": settings.trial_days,
            "subscriptionUrl": sub_url,
            "isTrafficUnlimited": True,
            "whitelistUsedBytes": cdn_info["used_bytes"],
            "whitelistTotalBytes": cdn_info["soft_limit_bytes"],
            "usedBytes": 0,
            "totalBytes": 0,
            "activeDevicesCount": dev_info["activeDevicesCount"],
            "maxDevicesCount": dev_info["maxDevicesCount"],
            "availableLocations": [
                {"id": "de-aeza", "country": "Германия", "city": "Франкфурт (Aeza 9950X)", "flag": "🇩🇪", "protocol": "VLESS-XHTTP"},
            ]
        }
    }


@app.post("/api/v1/user/validate-promo")
async def validate_promo(
    body: ValidatePromoRequest,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    telegram_id = user_data["id"]
    code = body.code.strip().upper()
    
    promo = await db.get_promo_code(code)
    if not promo:
        return {"valid": False, "message": "Промокод не существует или истёк."}

    used = await db.has_user_used_promo(telegram_id, code)
    if used:
        return {"valid": False, "message": "Вы уже активировали данный промокод ранее!"}

    return {
        "valid": True,
        "code": code,
        "discount_percent": promo.get("discount_percent", 0),
        "bonus_days": promo.get("bonus_days", 0),
        "target_plan_id": promo.get("target_plan_id"),
        "message": f"Промокод «{code}» успешно применён!"
    }


@app.post("/api/v1/user/process-payment")
async def process_payment(
    body: ProcessPaymentRequest,
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    if not user:
        user = await db.create_or_update_user(telegram_id, user_data.get("username"), user_data.get("first_name"))

    marzban_username = user.get("marzban_username") or f"partizan_{telegram_id}"
    promo_code = body.promo_code.strip().upper() if body.promo_code else None

    # Check 0 RUB promo code activation (e.g. ПЕРМЬ)
    if promo_code:
        promo = await db.get_promo_code(promo_code)
        if not promo:
            return {"success": False, "message": "Недействительный промокод!"}
            
        applied = await db.apply_promo_to_user(telegram_id, promo_code)
        if not applied:
            return {"success": False, "message": "Промокод уже был использован или превышен лимит активаций!"}

        bonus_days = promo.get("bonus_days", 30)
        
        # Check if Marzban user exists or create
        marzban_status = await marzban_service.get_user_status(marzban_username)
        if marzban_status and marzban_status.get("username"):
            marzban_res = await marzban_service.extend_user(marzban_username, bonus_days)
        else:
            marzban_res = await marzban_service.create_user(username=marzban_username, expire_days=bonus_days)

        new_expire = await db.add_user_days(telegram_id, bonus_days)
        await db.mark_trial_used(telegram_id)

        sub_url = marzban_res.get("formatted_subscription_url") or marzban_service.format_subscription_url(
            f"{settings.marzban_url}/274ba6b74d0c6820/{marzban_username}_token"
        )

        dev_info = get_user_devices_info(marzban_username)
        cdn_info = get_user_cdn_quota_info(marzban_username)

        return {
            "success": True,
            "message": f"Промокод «{promo_code}» успешно активирован! Подписка на {bonus_days} дней зачислена.",
            "subscription": {
                "hasSubscription": True,
                "status": "active",
                "expireDate": new_expire,
                "daysRemaining": bonus_days,
                "subscriptionUrl": sub_url,
                "isTrafficUnlimited": True,
                "whitelistUsedBytes": cdn_info["used_bytes"],
                "whitelistTotalBytes": cdn_info["soft_limit_bytes"],
                "usedBytes": 0,
                "totalBytes": 0,
                "activeDevicesCount": dev_info["activeDevicesCount"],
                "maxDevicesCount": dev_info["maxDevicesCount"],
                "availableLocations": [
                    {"id": "de-aeza", "country": "Германия", "city": "Франкфурт (Aeza 9950X)", "flag": "🇩🇪", "protocol": "VLESS-XHTTP"},
                ]
            }
        }

    return {"success": False, "message": "Прием платных заказов активен в демонстрационном режиме."}


@app.get("/api/v1/referrals/stats")
async def get_referral_stats(user_data: Dict[str, Any] = Depends(get_current_user)):
    telegram_id = user_data["id"]
    return await db.get_referral_stats(telegram_id)


# ==============================================================================
# HWID & CDN & WEBHOOK ENDPOINTS
# ==============================================================================
@app.get("/api/v1/user/devices")
async def get_user_devices(user_data: Dict[str, Any] = Depends(get_current_user)):
    """Returns active registered devices for the current user."""
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    marzban_username = user.get("marzban_username") if user else f"partizan_{telegram_id}"
    return get_user_devices_info(marzban_username)


@app.delete("/api/v1/user/devices/{device_key:path}")
async def revoke_user_device(device_key: str, user_data: Dict[str, Any] = Depends(get_current_user)):
    """Revokes an authorized device slot for the user."""
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    marzban_username = user.get("marzban_username") if user else f"partizan_{telegram_id}"

    db_hwid = read_hwid_database()
    found_user = None
    for u_key in db_hwid.keys():
        if u_key.upper() == marzban_username.upper():
            found_user = u_key
            break

    if not found_user or device_key not in db_hwid[found_user].get("devices", {}):
        raise HTTPException(status_code=404, detail="Device not found")

    del db_hwid[found_user]["devices"][device_key]
    save_hwid_database(db_hwid)
    logger.info(f"User {marzban_username} unlinked device: {device_key}")
    return {"success": True, "message": "Устройство успешно отвязано"}


@app.get("/api/v1/user/cdn-quota")
async def get_user_cdn_quota(user_data: Dict[str, Any] = Depends(get_current_user)):
    """Returns two-way CDN accounting data (download, upload, soft/hard limits, status)."""
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    marzban_username = user.get("marzban_username") if user else f"partizan_{telegram_id}"
    return get_user_cdn_quota_info(marzban_username)


@app.get("/api/v1/user/subscription-link")
async def get_subscription_link(
    dev: Optional[str] = Query(None, pattern=r"^[a-zA-Z0-9_-]{1,32}$"),
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    """Generates subscription link with optional ?dev= parameter for clients without HWID/cookies."""
    telegram_id = user_data["id"]
    user = await db.get_user(telegram_id)
    marzban_username = user.get("marzban_username") if user else f"partizan_{telegram_id}"

    marzban_info = await marzban_service.get_user_status(marzban_username)
    sub_url = marzban_info.get("formatted_subscription_url") or marzban_service.format_subscription_url(
        f"{settings.marzban_url}/274ba6b74d0c6820/{marzban_username}_token"
    )

    if dev:
        delimiter = "&" if "?" in sub_url else "?"
        sub_url = f"{sub_url}{delimiter}dev={dev}"

    return {"subscriptionUrl": sub_url, "dev": dev}


@app.post("/api/v1/bot/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None)
):
    """Telegram webhook endpoint with strict secret token validation."""
    if settings.bot_mode != "webhook":
        raise HTTPException(status_code=400, detail="Bot is configured for polling mode")

    if not settings.webhook_secret or x_telegram_bot_api_secret_token != settings.webhook_secret:
        logger.warning("Rejected webhook request: secret token mismatch or missing")
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        from bot.main import dp, bot
        from aiogram import types
        update_data = await request.json()
        update = types.Update.model_validate(update_data, context={"bot": bot})
        await dp.feed_update(bot, update)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Error processing Telegram webhook update: {e}")
        return {"ok": False, "error": str(e)}
