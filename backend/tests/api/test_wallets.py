import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_wallet_success(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/wallets",
        json={"chain": "simulation", "public_address": "0x1234567890abcdef"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["chain"] == "simulation"
    assert data["is_verified"] == True

@pytest.mark.asyncio
async def test_create_wallet_invalid_address(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/wallets",
        json={"chain": "polygon", "public_address": "invalid_address"}
    )
    assert response.status_code == 400
    assert "Invalid polygon address format" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_wallets(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/wallets",
        json={"chain": "simulation", "public_address": "0x1234567890abcdef"}
    )
    
    response = await async_client.get("/api/v1/wallets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[-1]["public_address"] == "0x1234567890abcdef"
