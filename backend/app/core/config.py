from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from decimal import Decimal

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZIRO Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    ENVIRONMENT: str = "development"

    # Quote Engine Settings
    SUPPORTED_CURRENCIES: List[str] = ["INR", "USD", "EUR", "GBP", "SGD", "AED", "AUD", "CAD", "JPY"]
    QUOTE_MIN_AMOUNT: Decimal = Decimal("0.01")
    QUOTE_MAX_AMOUNT: Decimal = Decimal("100000000.00")
    
    # FX Settings
    FX_API_BASE_URL: str = "https://api.frankfurter.app"
    FX_CACHE_TTL_SECONDS: int = 60
    FX_MAX_STALE_SECONDS: int = 900
    FX_ALLOW_SIMULATED_FALLBACK: bool = True
    FX_MARGIN_BPS: int = 50
    
    # Fees & Settlement
    PLATFORM_FEE_BPS: int = 0
    PLATFORM_FEE_FIXED_USD: Decimal = Decimal("0.00")
    NETWORK_FEE_USD: Decimal = Decimal("0.01")
    SETTLEMENT_SECONDS_ESTIMATE: int = 5

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

settings = Settings()
