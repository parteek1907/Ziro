from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP, ROUND_DOWN
from typing import Optional
from app.core.config import settings
from app.schemas.quote import QuoteRequest, QuoteResponse, QuoteDataQuality, DataQuality, CURRENCY_DECIMALS
from app.services.providers import FrankfurterFxProvider, SimulatedNetworkFeeProvider, SimulatedSettlementEstimator

class AmountTooSmallError(Exception):
    pass

class QuoteEngine:
    def __init__(self, fx_provider=None, fee_provider=None, settlement_estimator=None):
        self.fx = fx_provider or FrankfurterFxProvider()
        self.fee = fee_provider or SimulatedNetworkFeeProvider()
        self.settlement = settlement_estimator or SimulatedSettlementEstimator()

    def _quantize(self, val: Decimal, places: int, rounding=ROUND_HALF_UP) -> Decimal:
        if places == 0:
            return val.quantize(Decimal("1"), rounding=rounding)
        return val.quantize(Decimal("10") ** -places, rounding=rounding)

    async def generate_quote(self, request: QuoteRequest, clock_time: float = None) -> QuoteResponse:
        src = request.source_currency
        dst = request.destination_currency
        src_decimals = CURRENCY_DECIMALS.get(src, 2)
        dst_decimals = CURRENCY_DECIMALS.get(dst, 2)
        
        source_amount = Decimal(str(request.amount))
        
        # 1. Fetch main rate
        fx_result = await self.fx.get_rate(src, dst, clock_time)
        mid = self._quantize(fx_result.rate, 8)
        
        # 2. Fetch USD->SRC rate for fees
        if src == "USD":
            usd_src_rate = Decimal("1.0")
            usd_src_status = "LIVE"
        else:
            usd_src_result = await self.fx.get_rate("USD", src, clock_time)
            usd_src_rate = usd_src_result.rate
            usd_src_status = usd_src_result.status
            
        # 3. Calculate applied_rate
        fx_margin_dec = Decimal(settings.FX_MARGIN_BPS) / Decimal("10000")
        applied_rate = self._quantize(mid * (Decimal("1") - fx_margin_dec), 8)
        
        # 4. Calculate fees
        platform_fee_fixed_src = usd_src_rate * settings.PLATFORM_FEE_FIXED_USD
        platform_fee_bps_src = source_amount * (Decimal(settings.PLATFORM_FEE_BPS) / Decimal("10000"))
        platform_fee = self._quantize(platform_fee_fixed_src + platform_fee_bps_src, src_decimals)
        
        network_fee_usd = self.fee.get_fee_usd()
        network_fee = self._quantize(network_fee_usd * usd_src_rate, src_decimals)
        
        # 5. Net amount
        net_amount = source_amount - platform_fee - network_fee
        if net_amount <= 0:
            raise AmountTooSmallError("Amount too small to cover fees")
            
        # 6. Destination amount
        destination_amount = self._quantize(net_amount * applied_rate, dst_decimals, rounding=ROUND_DOWN)
        
        # 7. FX cost
        fx_cost = self._quantize(net_amount * fx_margin_dec, src_decimals)
        
        # 8. Total cost
        total_cost = platform_fee + network_fee + fx_cost
        
        # 9. Total cost percent
        total_cost_percent = self._quantize((total_cost / source_amount) * Decimal("100"), 4)
        
        # Invariant check
        dst_minor_unit = Decimal("1") if dst_decimals == 0 else Decimal("10") ** -dst_decimals
        src_minor_unit = Decimal("1") if src_decimals == 0 else Decimal("10") ** -src_decimals
        
        inv_left = abs(source_amount - (destination_amount / mid + total_cost))
        inv_right = (dst_minor_unit / mid) + (Decimal("3") * src_minor_unit)
        if inv_left > inv_right:
            raise RuntimeError(f"Invariant violation: {inv_left} > {inv_right}")
            
        is_simulated = any(s == "SIMULATED" for s in [fx_result.status, usd_src_status, "SIMULATED"])
        
        source_amount_str = f"{source_amount:.{src_decimals}f}" if src_decimals > 0 else str(source_amount.quantize(Decimal("1")))
        
        return QuoteResponse(
            source_amount=source_amount_str,
            source_currency=src,
            destination_amount=str(destination_amount),
            destination_currency=dst,
            mid_market_rate=str(mid),
            fx_rate=str(applied_rate),
            fx_margin_bps=settings.FX_MARGIN_BPS,
            fx_cost=str(fx_cost),
            network_fee=str(network_fee),
            platform_fee=str(platform_fee),
            total_cost=str(total_cost),
            total_cost_percent=str(total_cost_percent),
            cost_currency=src,
            estimated_settlement_seconds=self.settlement.get_settlement_seconds(),
            route="BLOCKCHAIN",
            is_simulated=is_simulated,
            data_quality=QuoteDataQuality(
                fx_rate=DataQuality(status=fx_result.status, source="frankfurter", as_of=fx_result.as_of),
                network_fee=DataQuality(status="SIMULATED", source="config:NETWORK_FEE_USD", as_of=None),
                settlement_time=DataQuality(status="SIMULATED", source="config:SETTLEMENT_SECONDS_ESTIMATE", as_of=None)
            ),
            generated_at=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        )
