import httpx
import time
from decimal import Decimal
from typing import Optional, Dict, Tuple
from app.core.config import settings

# DEMO/SIMULATED, not market data
SIMULATED_USD_RATES = {
    "USD": Decimal("1.0"),
    "INR": Decimal("83.33333333"),
    "EUR": Decimal("0.92592593"),
    "GBP": Decimal("0.78740157"),
    "SGD": Decimal("1.34000000"),
    "AED": Decimal("3.67250000"),
    "AUD": Decimal("1.52000000"),
    "CAD": Decimal("1.36000000"),
    "JPY": Decimal("150.00000000")
}

def get_simulated_rate(src: str, dst: str) -> Decimal:
    if src not in SIMULATED_USD_RATES or dst not in SIMULATED_USD_RATES:
        raise ValueError("Unsupported currency for simulation")
    usd_to_src = SIMULATED_USD_RATES[src]
    usd_to_dst = SIMULATED_USD_RATES[dst]
    return usd_to_dst / usd_to_src

class FxUnavailableError(Exception):
    pass

class FxRateResult:
    def __init__(self, rate: Decimal, status: str, as_of: Optional[str]):
        self.rate = rate
        self.status = status
        self.as_of = as_of

class FrankfurterFxProvider:
    def __init__(self):
        self.cache: Dict[str, Tuple[Decimal, float, str]] = {}

    async def get_rate(self, src: str, dst: str, clock_time: float = None) -> FxRateResult:
        if src == dst:
            return FxRateResult(Decimal("1.0"), "LIVE", None)
            
        now = clock_time if clock_time is not None else time.time()
        pair_key = f"{src}_{dst}"
        
        if pair_key in self.cache:
            rate, timestamp, as_of = self.cache[pair_key]
            if now - timestamp <= settings.FX_CACHE_TTL_SECONDS:
                return FxRateResult(rate, "LIVE", as_of)
                
        rate = None
        as_of = None
        fetch_success = False
        
        async with httpx.AsyncClient(timeout=3.0) as client:
            for _ in range(2):
                try:
                    resp = await client.get(f"{settings.FX_API_BASE_URL}/latest?from={src}&to={dst}")
                    if resp.status_code == 200:
                        data = resp.json()
                        rate = Decimal(str(data["rates"][dst]))
                        as_of = f"{data['date']}T00:00:00Z" if 'date' in data else None
                        fetch_success = True
                        break
                except Exception:
                    pass
                    
        if fetch_success:
            self.cache[pair_key] = (rate, now, as_of)
            return FxRateResult(rate, "LIVE", as_of)
            
        if pair_key in self.cache:
            rate, timestamp, as_of = self.cache[pair_key]
            if now - timestamp <= settings.FX_MAX_STALE_SECONDS:
                return FxRateResult(rate, "CACHED", as_of)
                
        if settings.FX_ALLOW_SIMULATED_FALLBACK:
            sim_rate = get_simulated_rate(src, dst)
            return FxRateResult(sim_rate, "SIMULATED", None)
            
        raise FxUnavailableError("FX rate unavailable and fallback disabled")

class SimulatedNetworkFeeProvider:
    def get_fee_usd(self) -> Decimal:
        return settings.NETWORK_FEE_USD
        
class SimulatedSettlementEstimator:
    def get_settlement_seconds(self) -> int:
        return settings.SETTLEMENT_SECONDS_ESTIMATE
