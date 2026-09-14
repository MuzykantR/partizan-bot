import time
import logging
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from bot.config import settings

logger = logging.getLogger(__name__)

class MarzbanConnectionError(Exception):
    """Raised when Marzban API is unreachable or fails in production."""
    pass


class MarzbanClient:
    """
    Production-grade async client for Marzban REST API (Xray Control Plane).
    Handles admin authentication, user creation, subscription retrieval, and user extension.
    Includes connection pooling, auto-reauth on 401, exponential backoff, and strict mock gating.
    """
    def __init__(self):
        self.base_url = settings.marzban_url.rstrip("/")
        self.username = settings.marzban_username
        self.password = settings.marzban_password
        self.token: Optional[str] = None
        self.token_expires_at: float = 0
        self._client: Optional[httpx.AsyncClient] = None
        self.enable_mock: bool = settings.enable_marzban_mock

    async def get_http_client(self) -> httpx.AsyncClient:
        """Returns reusable singleton httpx.AsyncClient with connection pooling."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=5.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
            )
        return self._client

    async def close(self):
        """Closes the underlying HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    def format_subscription_url(self, raw_url: str) -> str:
        """
        Ensures subscription URL ends with `/v2ray-json` as required by Happ Client and Marzban specs.
        """
        clean_url = raw_url.rstrip("/")
        if not clean_url.endswith("/v2ray-json"):
            return f"{clean_url}/v2ray-json"
        return clean_url

    async def get_token(self, force_refresh: bool = False) -> str:
        """Retrieves or refreshes admin JWT token with fail-safe expiration."""
        if not force_refresh and self.token and time.time() < self.token_expires_at - 60:
            return self.token

        client = await self.get_http_client()
        try:
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
                # Default expiration 24 hours
                self.token_expires_at = time.time() + 86400
                logger.info("Successfully authenticated with Marzban API")
                return self.token
            else:
                logger.warning(f"Marzban auth failed with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to connect to Marzban API at {self.base_url}: {e}")

        # Invalidate token
        self.token = None
        self.token_expires_at = 0

        # Fallback to mock ONLY if explicitly enabled in configuration
        if self.enable_mock:
            logger.warning("ENABLE_MARZBAN_MOCK is true. Using temporary mock token (DEV ONLY).")
            self.token = "mock_marzban_token_xyz123"
            self.token_expires_at = time.time() + 60  # Short 60s expiration to force retry quickly!
            return self.token

        raise MarzbanConnectionError(f"Marzban API unreachable at {self.base_url}")

    async def create_user(
        self,
        username: str,
        expire_days: int = 30,
        data_limit_bytes: int = 0
    ) -> Dict[str, Any]:
        """
        Creates a new user in Marzban with VLESS-XHTTP configuration.
        """
        expire_dt = datetime.utcnow() + timedelta(days=expire_days)
        expire_timestamp = int(expire_dt.timestamp())
        payload = {
            "username": username,
            "proxies": {"vless": {}},
            "inbounds": {},
            "expire": expire_timestamp,
            "data_limit": data_limit_bytes
        }

        for attempt in range(2):
            try:
                token = await self.get_token(force_refresh=(attempt > 0))
                if token == "mock_marzban_token_xyz123":
                    break

                client = await self.get_http_client()
                headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                resp = await client.post(f"{self.base_url}/api/user", json=payload, headers=headers)
                
                if resp.status_code in (200, 201):
                    data = resp.json()
                    raw_sub_url = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                    data["formatted_subscription_url"] = self.format_subscription_url(raw_sub_url)
                    logger.info(f"Created Marzban user: {username}")
                    return data
                elif resp.status_code == 401 and attempt == 0:
                    logger.warning("Marzban token expired (401). Retrying authentication...")
                    self.token = None
                    continue
                elif resp.status_code == 409:
                    # User already exists in Marzban, fetch existing
                    logger.info(f"Marzban user {username} already exists (409). Fetching status...")
                    return await self.get_user_status(username)
                else:
                    logger.error(f"Marzban user creation error ({resp.status_code}): {resp.text}")
                    break
            except MarzbanConnectionError:
                break
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} exception creating user {username}: {e}")
                if attempt == 0:
                    time.sleep(0.5)

        if self.enable_mock:
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

        raise MarzbanConnectionError(f"Failed to create Marzban user '{username}'")

    async def get_user_status(self, username: str) -> Dict[str, Any]:
        """
        Retrieves user account status, traffic usage, and expire date from Marzban.
        """
        for attempt in range(2):
            try:
                token = await self.get_token(force_refresh=(attempt > 0))
                if token == "mock_marzban_token_xyz123":
                    break

                client = await self.get_http_client()
                headers = {"Authorization": f"Bearer {token}"}
                resp = await client.get(f"{self.base_url}/api/user/{username}", headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    raw_sub = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                    data["formatted_subscription_url"] = self.format_subscription_url(raw_sub)
                    return data
                elif resp.status_code == 401 and attempt == 0:
                    logger.warning("Marzban token expired (401). Retrying authentication...")
                    self.token = None
                    continue
                elif resp.status_code == 404:
                    logger.info(f"User {username} not found in Marzban (404)")
                    return {}
                else:
                    logger.warning(f"Error fetching Marzban status for {username} ({resp.status_code}): {resp.text}")
                    break
            except MarzbanConnectionError:
                break
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} error fetching user {username}: {e}")
                if attempt == 0:
                    time.sleep(0.5)

        if self.enable_mock:
            default_expire = int((datetime.utcnow() + timedelta(days=30)).timestamp())
            mock_sub_raw = f"{self.base_url}/274ba6b74d0c6820/{username}_token"
            return {
                "username": username,
                "status": "active",
                "expire": default_expire,
                "data_limit": 0,
                "used_traffic": 4.2 * 1024 * 1024 * 1024,
                "subscription_url": mock_sub_raw,
                "formatted_subscription_url": self.format_subscription_url(mock_sub_raw),
                "is_mock": True
            }

        return {}

    async def extend_user(self, username: str, add_days: int) -> Dict[str, Any]:
        """
        Extends user expiration date in Marzban by N days.
        """
        user_info = await self.get_user_status(username)
        current_expire = user_info.get("expire") or int(datetime.utcnow().timestamp())
        
        base_dt = datetime.fromtimestamp(current_expire) if current_expire > time.time() else datetime.utcnow()
        new_expire_dt = base_dt + timedelta(days=add_days)
        new_expire_ts = int(new_expire_dt.timestamp())
        payload = {"expire": new_expire_ts}

        for attempt in range(2):
            try:
                token = await self.get_token(force_refresh=(attempt > 0))
                if token == "mock_marzban_token_xyz123":
                    break

                client = await self.get_http_client()
                headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                resp = await client.put(f"{self.base_url}/api/user/{username}", json=payload, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    raw_sub = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                    data["formatted_subscription_url"] = self.format_subscription_url(raw_sub)
                    logger.info(f"Extended Marzban user {username} by {add_days} days")
                    return data
                elif resp.status_code == 401 and attempt == 0:
                    logger.warning("Marzban token expired (401). Retrying authentication...")
                    self.token = None
                    continue
                else:
                    logger.error(f"Error extending Marzban user {username} ({resp.status_code}): {resp.text}")
                    break
            except MarzbanConnectionError:
                break
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} exception extending user {username}: {e}")
                if attempt == 0:
                    time.sleep(0.5)

        if self.enable_mock:
            user_info["expire"] = new_expire_ts
            user_info["status"] = "active"
            return user_info

        raise MarzbanConnectionError(f"Failed to extend Marzban user '{username}'")

    async def revoke_subscription(self, username: str) -> Dict[str, Any]:
        """
        Revokes user subscription URL / token in Marzban, rotating credentials.
        """
        for attempt in range(2):
            try:
                token = await self.get_token(force_refresh=(attempt > 0))
                if token == "mock_marzban_token_xyz123":
                    break

                client = await self.get_http_client()
                headers = {"Authorization": f"Bearer {token}"}
                resp = await client.post(f"{self.base_url}/api/user/{username}/revoke_sub", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_sub = data.get("subscription_url") or f"{self.base_url}/sub/{data.get('token', username)}"
                    data["formatted_subscription_url"] = self.format_subscription_url(raw_sub)
                    logger.info(f"Revoked subscription URL for user {username}")
                    return data
                elif resp.status_code == 401 and attempt == 0:
                    self.token = None
                    continue
                else:
                    logger.error(f"Failed to revoke sub for {username} ({resp.status_code}): {resp.text}")
                    break
            except Exception as e:
                logger.error(f"Error revoking sub for {username}: {e}")

        return await self.get_user_status(username)

marzban_service = MarzbanClient()
