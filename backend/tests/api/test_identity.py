import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_user_me(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@ziro.app"

@pytest.mark.asyncio
async def test_get_profile(async_client: AsyncClient):
    response = await async_client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["preferred_currency"] == "USD"

@pytest.mark.asyncio
async def test_patch_profile(async_client: AsyncClient):
    response = await async_client.patch(
        "/api/v1/profile", 
        json={"financial_goals": "Buy a house"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["financial_goals"] == "Buy a house"
