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
    
    # ZiroStream Pricing Tiers & Legacy Comparison
    TIER1_MAX_USD: Decimal = Decimal("50.00")
    TIER2_FEE_BPS: int = 20  # 0.2%
    LEGACY_FLAT_FEE_USD: Decimal = Decimal("8.50")
    LEGACY_FX_SPREAD_BPS: int = 200  # 2.0%
    
    # Fees & Settlement
    PLATFORM_FEE_FIXED_USD: Decimal = Decimal("0.00") # Base platform fee
    NETWORK_FEE_USD: Decimal = Decimal("0.001") # Hardcoded Paymaster gas
    SETTLEMENT_SECONDS_ESTIMATE: int = 5

    # Web3
    POLYGON_RPC_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

settings = Settings()
