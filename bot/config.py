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
    
    # API Server
    api_host: str = Field(default="0.0.0.0", validation_alias="API_HOST")
    api_port: int = Field(default=8000, validation_alias="API_PORT")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
