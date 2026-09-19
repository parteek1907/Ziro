import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_consultant_flow_safe(async_client: AsyncClient):
    # 1. Request review
    req_response = await async_client.post(
        "/api/v1/consultant/request",
        json={"user_id": "test_user", "payment_id": "pay_123", "message": "Is this safe?"}
    )
    assert req_response.status_code == 200
    data = req_response.json()
    assert data["status"] == "PENDING"
    cons_id = data["id"]
    
    # 2. Consultant reviews as safe
    rev_response = await async_client.post(
        "/api/v1/consultant/review",
        json={"consultation_id": cons_id, "is_safe": True, "notes": "Yes, verified."}
    )
    assert rev_response.status_code == 200
    rev_data = rev_response.json()
    assert rev_data["status"] == "APPROVED"
    assert rev_data["consultant_fee_usd"] == 20.0
    assert rev_data["platform_commission_usd"] == 4.0
    assert rev_data["success_fee_usd"] == 1.0

@pytest.mark.asyncio
async def test_consultant_flow_unsafe(async_client: AsyncClient):
    req_response = await async_client.post(
        "/api/v1/consultant/request",
        json={"user_id": "test_user2", "payment_id": "pay_456", "message": "Scam?"}
    )
    cons_id = req_response.json()["id"]
    
    rev_response = await async_client.post(
        "/api/v1/consultant/review",
        json={"consultation_id": cons_id, "is_safe": False, "notes": "Scam detected!"}
    )
    rev_data = rev_response.json()
    assert rev_data["status"] == "REJECTED"
    assert rev_data["consultant_fee_usd"] == 20.0
    assert rev_data["platform_commission_usd"] == 4.0
    assert rev_data["success_fee_usd"] == 0.0 # No success fee on unsafe tx
