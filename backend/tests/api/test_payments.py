import pytest
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
