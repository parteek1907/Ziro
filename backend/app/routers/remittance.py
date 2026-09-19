"""Remittance and L2 Liquidity Router."""
from datetime import datetime
import secrets
from fastapi import APIRouter
from app.schemas import RemittanceRouteRequest, RemittanceRouteResponse, LiquidityRouteOption

router = APIRouter(prefix="/api/remittance", tags=["Remittance"])

# Exchange rate reference table for common emerging market corridors
FX_RATES = {
    ("USD", "KES"): 131.50,
    ("USD", "MXN"): 18.25,
    ("USD", "PHP"): 56.40,
    ("EUR", "INR"): 91.80,
    ("USD", "INR"): 84.10,
    ("USD", "NGN"): 1620.00,
}


@router.post("/route", response_model=RemittanceRouteResponse)
async def calculate_remittance_route(req: RemittanceRouteRequest):
    """
    Calculate and compare traditional remittance rails vs. optimized L2 liquidity rail.
    Demonstrates >99.9% cost reduction and 2-second gas-abstracted settlement.
    """
    fx_rate = FX_RATES.get((req.source_currency.upper(), req.target_currency.upper()), 131.50)
    
    # Traditional remittance calculation: ~7.5% margin fee + $3.00 flat fee, 3-5 days
    traditional_fee_usd = round(req.amount * 0.075 + 3.00, 2)
    traditional_received = round((req.amount - traditional_fee_usd) * fx_rate, 2)

    # L2 Platform calculation: $0.0008 fixed fee with gas abstraction, 2 seconds settlement
    l2_fee_usd = 0.0008
    l2_received = round((req.amount - l2_fee_usd) * fx_rate, 2)
    savings_usd = round(traditional_fee_usd - l2_fee_usd, 2)

    simulated_hash = f"0x{secrets.token_hex(32)}"

    l2_option = LiquidityRouteOption(
        rail_name="FutureFinance L2 Polygon/Stellar Gasless Router",
        network="Polygon zkEVM / Stellar Soroban L2",
        estimated_time_seconds=1.8,
        total_fee_usd=l2_fee_usd,
        exchange_rate=fx_rate,
        recipient_receives=l2_received,
        gas_abstracted=True,
        savings_vs_traditional_usd=savings_usd,
    )

    traditional_rail = {
        "provider": "Legacy Rails (Western Union / SWIFT Wire)",
        "estimated_time_days": 3,
        "fee_usd": traditional_fee_usd,
        "exchange_rate": fx_rate * 0.96,  # Hidden 4% FX spread markup
        "recipient_receives": traditional_received,
        "hidden_fx_spread_percent": 4.0,
    }

    return RemittanceRouteResponse(
        source_amount=req.amount,
        source_currency=req.source_currency.upper(),
        target_currency=req.target_currency.upper(),
        traditional_rail=traditional_rail,
        l2_optimized_rail=l2_option,
        simulated_tx_hash=simulated_hash,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
