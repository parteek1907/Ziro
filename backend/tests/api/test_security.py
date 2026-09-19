import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_security_exact_match(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SAFE"
    assert data["matched_saved_address"] == True

@pytest.mark.asyncio
async def test_security_look_alike(async_client: AsyncClient):
    # Mutate the last few characters of the saved polygon address
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x1234567890abcdef1234567890abcdef12345000",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "BLOCKED"
    assert "Address Poisoning" in data["warnings"][0]
    assert data["matched_saved_address"] == False

@pytest.mark.asyncio
async def test_security_first_time(async_client: AsyncClient):
    # Completely different address
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x9999999999999999999999999999999999999999",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "WARNING"
    assert "First-time recipient" in data["warnings"][0]

@pytest.mark.asyncio
async def test_security_invalid_chain(async_client: AsyncClient):
    # Give a stellar address but say it's polygon
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "BLOCKED"
    assert "Address format is invalid" in data["warnings"][0]
