import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/payment.py": """from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RouteType(str, Enum):
    TRADITIONAL = "TRADITIONAL"
    BLOCKCHAIN = "BLOCKCHAIN"
    SIMULATION = "SIMULATION"

class RouteComparisonRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to transfer")
    source_currency: str = Field(..., description="Source fiat or crypto currency")
    target_currency: str = Field(..., description="Target fiat or crypto currency")
    preference: Optional[str] = Field(default="lowest_cost", description="e.g. lowest_cost, fastest_settlement")

class PaymentRoute(BaseModel):
    route: RouteType
    estimated_fee: float = Field(..., description="Estimated network or bank fee")
    fx_cost: float = Field(..., description="Estimated cost lost to exchange spread")
    total_cost: float = Field(..., description="Total cost of the transfer")
    estimated_time_seconds: int = Field(..., description="Estimated settlement time in seconds")
    intermediaries: int = Field(..., description="Number of intermediary hops")
    risk_metadata: Dict[str, Any] = Field(default_factory=dict, description="Risk properties associated with the route")
    available: bool = True

class RouteComparisonResponse(BaseModel):
    routes: List[PaymentRoute]
""",
    "app/services/router.py": """from typing import List
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
""",
    "app/api/v1/endpoints/payments.py": """from fastapi import APIRouter
from app.models.payment import RouteComparisonRequest, RouteComparisonResponse
from app.services.router import smart_router

router = APIRouter()

@router.post("/compare-routes", response_model=RouteComparisonResponse)
async def compare_routes(request: RouteComparisonRequest):
    routes = smart_router.compare_routes(request)
    return RouteComparisonResponse(routes=routes)
""",
    "tests/api/test_payments.py": """import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_compare_routes_lowest_cost(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/payments/compare-routes",
        json={
            "amount": 1000.0,
            "source_currency": "USD",
            "target_currency": "EUR",
            "preference": "lowest_cost"
        }
    )
    assert response.status_code == 200
    data = response.json()
    routes = data["routes"]
    assert len(routes) == 3
    # Simulation should be cheapest (0.0)
    assert routes[0]["route"] == "SIMULATION"
    assert routes[0]["total_cost"] == 0.0

@pytest.mark.asyncio
async def test_compare_routes_fastest(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/payments/compare-routes",
        json={
            "amount": 100.0,
            "source_currency": "USD",
            "target_currency": "INR",
            "preference": "fastest_settlement"
        }
    )
    assert response.status_code == 200
    data = response.json()
    routes = data["routes"]
    # Simulation should be fastest (0 seconds)
    assert routes[0]["route"] == "SIMULATION"
    
    # Let's ensure TRADITIONAL is present and has the longest time and intermediaries
    trad_route = next((r for r in routes if r["route"] == "TRADITIONAL"), None)
    assert trad_route is not None
    assert trad_route["intermediaries"] > 0
    assert trad_route["estimated_time_seconds"] > 1000
    assert trad_route["total_cost"] == trad_route["estimated_fee"] + trad_route["fx_cost"]
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Smart Settlement Router files generated.")
