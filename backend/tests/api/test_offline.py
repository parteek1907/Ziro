import time
import pytest
from httpx import AsyncClient

@pytest.fixture
def valid_payload():
    return {
        "transaction_id": "tx_offline_001",
        "sender": "0xSender123",
        "recipient": "0xRecipient456",
        "amount": 100.0,
        "currency": "USDC",
        "chain": "simulation",
        "nonce": 1,
        "created_at": int(time.time()),
        "expires_at": int(time.time()) + 3600,
        "payment_intent": "groceries",
        "signature": "0xvalid_sig_abc123"
    }

@pytest.mark.asyncio
async def test_offline_verify_valid(async_client: AsyncClient, valid_payload):
    # Just verify, don't sync
    valid_payload["transaction_id"] = "tx_offline_v1"
    response = await async_client.post(
        "/api/v1/offline/verify",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] == True
    assert data["state"] == "QUEUED"

@pytest.mark.asyncio
async def test_offline_sync_successful(async_client: AsyncClient, valid_payload):
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    # Should flow all the way to settled via the simulation blockchain adapter
    assert data["state"] == "SETTLED"

@pytest.mark.asyncio
async def test_offline_sync_duplicate_tx(async_client: AsyncClient, valid_payload):
    # Try to sync the EXACT same payload again
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "DUPLICATE"

@pytest.mark.asyncio
async def test_offline_sync_invalid_signature(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_sig_fail"
    valid_payload["signature"] = "0xfake_sig_xyz"
    valid_payload["nonce"] = 2
    
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "INVALID_SIGNATURE"

@pytest.mark.asyncio
async def test_offline_sync_expired(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_expired"
    valid_payload["expires_at"] = int(time.time()) - 3600 # Expired 1 hour ago
    valid_payload["nonce"] = 3
    
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "EXPIRED"

@pytest.mark.asyncio
async def test_offline_sync_nonce_reuse(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_nonce_reuse"
    # Same nonce '1' from sender '0xSender123'
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "DUPLICATE"

@pytest.mark.asyncio
async def test_offline_status_get(async_client: AsyncClient):
    response = await async_client.get("/api/v1/offline/tx_offline_001")
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "SETTLED"
