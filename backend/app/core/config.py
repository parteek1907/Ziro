from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZIRO Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

settings = Settings()
