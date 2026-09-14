import os
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    bot_token: str = Field(default="YOUR_TELEGRAM_BOT_TOKEN", validation_alias="BOT_TOKEN")
    web_app_url: str = Field(default="https://axisforge.tech/twa", validation_alias="WEB_APP_URL")
    
    # Marzban API settings
    marzban_url: str = Field(default="https://axisforge.tech", validation_alias="MARZBAN_URL")
    marzban_username: str = Field(default="admin", validation_alias="MARZBAN_USERNAME")
    marzban_password: str = Field(default="admin_password", validation_alias="MARZBAN_PASSWORD")
    
    # Database
    database_path: str = Field(default=str(BASE_DIR / "partizan.db"), validation_alias="DATABASE_PATH")
    
    # Business logic
    trial_days: int = Field(default=3, validation_alias="TRIAL_DAYS")
    referral_bonus_days: int = Field(default=7, validation_alias="REFERRAL_BONUS_DAYS")
    referral_new_user_bonus_days: int = Field(default=3, validation_alias="REFERRAL_NEW_USER_BONUS_DAYS")
    
    # Bot Mode & Webhook
    bot_mode: str = Field(default="polling", validation_alias="BOT_MODE")
    webhook_url: str = Field(default="https://axisforge.tech/api/v1/bot/webhook", validation_alias="WEBHOOK_URL")
    webhook_secret: str = Field(default="", validation_alias="WEBHOOK_SECRET")
    allowed_origins: str = Field(default="https://axisforge.tech,https://web.telegram.org,https://t.me", validation_alias="ALLOWED_ORIGINS")
    environment: str = Field(default="production", validation_alias="ENVIRONMENT")
    enable_marzban_mock: bool = Field(default=False, validation_alias="ENABLE_MARZBAN_MOCK")
    
    # Engine Integration Paths
    hwid_devices_path: str = Field(default="/var/lib/marzban/hwid_devices.json", validation_alias="HWID_DEVICES_PATH")
    cdn_quota_state_path: str = Field(default="/var/log/nginx/cdn_quota_state.json", validation_alias="CDN_QUOTA_STATE_PATH")

    # API Server
    api_host: str = Field(default="0.0.0.0", validation_alias="API_HOST")
    api_port: int = Field(default=8000, validation_alias="API_PORT")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
