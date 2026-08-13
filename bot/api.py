import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bot.config import settings
from bot.auth import verify_and_parse_init_data
from bot.database import db
from bot.services.marzban import marzban_service

logger = logging.getLogger(__name__)

app = FastAPI(title="PARTIZAN VPN TWA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ValidatePromoRequest(BaseModel):
    code: str


class ProcessPaymentRequest(BaseModel):
    plan_id: str
    promo_code: Optional[str] = None


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

    # Fallback user ONLY in explicit DEV_MODE environment
    if os.getenv("DEV_MODE") == "1":
        return {
            "id": 999999999,
            "first_name": "Партизан",
            "username": "partizan_tester"
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Telegram initData authorization is required. Access available only via Telegram Mini App."
    )


@app.on_event("startup")
async def startup_event():
    await db.init_db()


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
                "whitelistUsedBytes": 0,
                "whitelistTotalBytes": 20 * 1024 * 1024 * 1024,
                "usedBytes": 0,
                "totalBytes": 0,
                "activeDevicesCount": 0,
                "maxDevicesCount": 5,
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
            "whitelistUsedBytes": 0,
            "whitelistTotalBytes": 20 * 1024 * 1024 * 1024,
            "usedBytes": marzban_info.get("used_traffic", 0),
            "totalBytes": marzban_info.get("data_limit", 0),
            "activeDevicesCount": 1,
            "maxDevicesCount": 5,
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
            "whitelistUsedBytes": 0,
            "whitelistTotalBytes": 20 * 1024 * 1024 * 1024,
            "usedBytes": 0,
            "totalBytes": 0,
            "activeDevicesCount": 1,
            "maxDevicesCount": 5,
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
            
        if await db.has_user_used_promo(telegram_id, promo_code):
            return {"success": False, "message": "Вы уже активировали этот промокод ранее!"}

        bonus_days = promo.get("bonus_days", 30)
        
        # Apply promo to user in DB
        await db.apply_promo_to_user(telegram_id, promo_code)
        
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
                "whitelistUsedBytes": 0,
                "whitelistTotalBytes": 20 * 1024 * 1024 * 1024,
                "usedBytes": 0,
                "totalBytes": 0,
                "activeDevicesCount": 1,
                "maxDevicesCount": 5,
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
