from typing import List
from app.models.payment import RouteComparisonRequest, PaymentRoute, RouteType

class SmartSettlementRouter:
    def compare_routes(self, request: RouteComparisonRequest) -> List[PaymentRoute]:
        # 1. TRADITIONAL ROUTE (e.g., SWIFT)
        # Assumptions: High fee (e.g. $15 flat + spread), 3 days (259200s), 3 intermediaries
        trad_fee = 15.0
        trad_fx = request.amount * 0.03 # 3% spread
        trad_route = PaymentRoute(
            route=RouteType.TRADITIONAL,
            estimated_fee=trad_fee,
            fx_cost=trad_fx,
            total_cost=trad_fee + trad_fx,
            estimated_time_seconds=259200, 
            intermediaries=3,
            risk_metadata={"counterparty_risk": "medium", "fx_volatility": "high"},
            available=True
        )

        # 2. BLOCKCHAIN ROUTE (e.g., Stellar / Polygon)
        # Assumptions: Low fee (gas), low spread via stablecoins/AMM, seconds, 1 intermediary (smart contract)
        chain_fee = 0.05
        chain_fx = request.amount * 0.005 # 0.5% spread
        chain_route = PaymentRoute(
            route=RouteType.BLOCKCHAIN,
            estimated_fee=chain_fee,
            fx_cost=chain_fx,
            total_cost=chain_fee + chain_fx,
            estimated_time_seconds=5,
            intermediaries=1,
            risk_metadata={"counterparty_risk": "low", "regulatory_scrutiny": "medium"},
            available=True
        )

        # 3. SIMULATION ROUTE
        # Strictly for testing: 0 fee, 0 fx, 0 seconds
        sim_route = PaymentRoute(
            route=RouteType.SIMULATION,
            estimated_fee=0.0,
            fx_cost=0.0,
            total_cost=0.0,
            estimated_time_seconds=0,
            intermediaries=0,
            risk_metadata={"note": "Simulation mode for testnet"},
            available=True
        )

        routes = [trad_route, chain_route, sim_route]

        # Apply configurable sorting based on preference
        if request.preference == "lowest_cost":
            routes.sort(key=lambda r: r.total_cost)
        elif request.preference == "fastest_settlement":
            routes.sort(key=lambda r: r.estimated_time_seconds)
            
        return routes

smart_router = SmartSettlementRouter()
