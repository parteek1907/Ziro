import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_trustscore_calculate(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/trustscore/calculate",
        json={"user_id": "good_user"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 780
    assert len(data["factors"]) == 3
    assert data["factors"][0]["impact"] == "positive"
    assert "excellent" in data["explanation"].lower()

@pytest.mark.asyncio
async def test_trustscore_missing_data(async_client: AsyncClient):
    response = await async_client.get("/api/v1/trustscore/new_user")
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 450
    assert data["factors"][0]["impact"] == "negative"

@pytest.mark.asyncio
async def test_trustscore_explanation(async_client: AsyncClient):
    response = await async_client.get("/api/v1/trustscore/good_user/explanation")
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data
    assert "factors" in data
    assert "score" not in data # Testing exact endpoint return

@pytest.mark.asyncio
async def test_credential_generate_eligible(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/credentials/generate",
        json={"user_id": "good_user", "minimum_required_score": 600}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] == True
    assert "zk_mock_" in data["zk_proof_mock"]
    assert "score" not in data # Privacy check

@pytest.mark.asyncio
async def test_credential_generate_ineligible(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/credentials/generate",
        json={"user_id": "bad_history", "minimum_required_score": 600}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] == False
    assert "score" not in data # Privacy check

@pytest.mark.asyncio
async def test_credential_verify_valid(async_client: AsyncClient):
    # First generate
    gen_response = await async_client.post(
        "/api/v1/credentials/generate",
        json={"user_id": "good_user", "minimum_required_score": 600}
    )
    proof_payload = gen_response.json()
    
    # Then verify
    response = await async_client.post(
        "/api/v1/credentials/verify",
        json={"proof_payload": proof_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] == True
    assert data["is_eligible"] == True

@pytest.mark.asyncio
async def test_credential_verify_tampered(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/credentials/verify",
        json={"proof_payload": {"eligible": True, "zk_proof_mock": "invalid_fake_hash", "timestamp": 123}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] == False
