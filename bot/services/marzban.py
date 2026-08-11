import time
import logging
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from bot.config import settings

logger = logging.getLogger(__name__)

class MarzbanClient:
    """
    Async client for Marzban REST API (Xray Control Plane).
    Handles admin authentication, user creation, subscription retrieval, and user extension.
    Includes automatic mock fallback for offline/development environments.
    """
    def __init__(self):
        self.base_url = settings.marzban_url.rstrip("/")
        self.username = settings.marzban_username
        self.password = settings.marzban_password
        self.token: Optional[str] = None
        self.token_expires_at: float = 0

    def format_subscription_url(self, raw_url: str) -> str:
        """
        Ensures subscription URL ends with `/v2ray-json` as required by Happ Client and Marzban specs.
        """
        clean_url = raw_url.rstrip("/")
        if not clean_url.endswith("/v2ray-json"):
            return f"{clean_url}/v2ray-json"
        return clean_url

    async def get_token(self) -> str:
        """Retrieves or refreshes admin JWT token."""
        if self.token and time.time() < self.token_expires_at - 60:
            return self.token

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/admin/token",
                    data={
                        "username": self.username,
                        "password": self.password,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if response.status_code == 200:
                    data = response.json()
                    self.token = data.get("access_token")
                    # Default expiration 24 hours if not provided
                    self.token_expires_at = time.time() + 86400
                    logger.info("Successfully authenticated with Marzban API")
                    return self.token
                else:
                    logger.warning(f"Marzban auth failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Failed to connect to Marzban API at {self.base_url}: {e}. Switching to Mock Mode.")

        # Return dummy token for mock fallback
        self.token = "mock_marzban_token_xyz123"
        self.token_expires_at = time.time() + 86400
        return self.token

    async def create_user(
        self,
        username: str,
        expire_days: int = 30,
        data_limit_bytes: int = 0
    ) -> Dict[str, Any]:
        """
        Creates a new user in Marzban with VLESS-XHTTP configuration.
        """
        token = await self.get_token()
        expire_dt = datetime.utcnow() + timedelta(days=expire_days)
        expire_timestamp = int(expire_dt.timestamp())

        if token != "mock_marzban_token_xyz123":
            try:
                headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                payload = {
                    "username": username,
                    "proxies": {"vless": {}},
                    "inbounds": {},
                    "expire": expire_timestamp,
                    "data_limit": data_limit_bytes
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(f"{self.base_url}/api/user", json=payload, headers=headers)
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        raw_sub_url = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                        data["formatted_subscription_url"] = self.format_subscription_url(raw_sub_url)
                        logger.info(f"Created Marzban user: {username}")
                        return data
                    else:
                        logger.error(f"Marzban user creation error ({resp.status_code}): {resp.text}")
            except Exception as e:
                logger.error(f"Exception creating Marzban user {username}: {e}")

        # Mock fallback response
        mock_sub_raw = f"{self.base_url}/274ba6b74d0c6820/{username}_token"
        return {
            "username": username,
            "status": "active",
            "expire": expire_timestamp,
            "data_limit": data_limit_bytes,
            "used_traffic": 0,
            "subscription_url": mock_sub_raw,
            "formatted_subscription_url": self.format_subscription_url(mock_sub_raw),
            "is_mock": True
        }

    async def get_user_status(self, username: str) -> Dict[str, Any]:
        """
        Retrieves user account status, traffic usage, and expire date from Marzban.
        """
        token = await self.get_token()
        if token != "mock_marzban_token_xyz123":
            try:
                headers = {"Authorization": f"Bearer {token}"}
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(f"{self.base_url}/api/user/{username}", headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_sub = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                        data["formatted_subscription_url"] = self.format_subscription_url(raw_sub)
                        return data
            except Exception as e:
                logger.warning(f"Error fetching Marzban user status for {username}: {e}")

        # Mock response
        default_expire = int((datetime.utcnow() + timedelta(days=30)).timestamp())
        mock_sub_raw = f"{self.base_url}/274ba6b74d0c6820/{username}_token"
        return {
            "username": username,
            "status": "active",
            "expire": default_expire,
            "data_limit": 0, # 0 means unlimited
            "used_traffic": 4.2 * 1024 * 1024 * 1024,
            "subscription_url": mock_sub_raw,
            "formatted_subscription_url": self.format_subscription_url(mock_sub_raw),
            "is_mock": True
        }

    async def extend_user(self, username: str, add_days: int) -> Dict[str, Any]:
        """
        Extends user expiration date in Marzban by N days.
        """
        token = await self.get_token()
        user_info = await self.get_user_status(username)
        current_expire = user_info.get("expire") or int(datetime.utcnow().timestamp())
        
        # Calculate new timestamp
        base_dt = datetime.fromtimestamp(current_expire) if current_expire > time.time() else datetime.utcnow()
        new_expire_dt = base_dt + timedelta(days=add_days)
        new_expire_ts = int(new_expire_dt.timestamp())

        if token != "mock_marzban_token_xyz123":
            try:
                headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                payload = {"expire": new_expire_ts}
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.put(f"{self.base_url}/api/user/{username}", json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_sub = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                        data["formatted_subscription_url"] = self.format_subscription_url(raw_sub)
                        return data
            except Exception as e:
                logger.error(f"Error extending Marzban user {username}: {e}")

        # Mock fallback response
        user_info["expire"] = new_expire_ts
        user_info["status"] = "active"
        return user_info

marzban_service = MarzbanClient()
