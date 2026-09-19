import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_risk_low(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/risk/analyze",
        json={
            "user_id": "user123",
            "recipient": "friend456",
            "amount": 50.0,
            "currency": "USD",
            "payment_intent": "coffee",
            "chain": "simulation"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "LOW"
    assert data["requires_confirmation"] == False

@pytest.mark.asyncio
async def test_risk_medium(async_client: AsyncClient):
    # Triggers medium risk via amount > 2000
    response = await async_client.post(
        "/api/v1/risk/analyze",
        json={
            "user_id": "user123",
            "recipient": "friend456",
            "amount": 2500.0,
            "currency": "USD",
            "payment_intent": "rent",
            "chain": "simulation"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "MEDIUM"
    assert data["requires_confirmation"] == True
    assert "Unusually large transaction amount" in data["reasons"][0]

@pytest.mark.asyncio
async def test_risk_high(async_client: AsyncClient):
    # Triggers high risk via known scam address AND high risk keyword
    response = await async_client.post(
        "/api/v1/risk/analyze",
        json={
            "user_id": "user123",
            "recipient": "0xScamAddress123",
            "amount": 500.0,
            "currency": "USD",
            "payment_intent": "urgent taxes",
            "chain": "simulation"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "HIGH"
    assert data["requires_confirmation"] == False
