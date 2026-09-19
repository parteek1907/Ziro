import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.trust_model import THIN_FILE_CAP

client = TestClient(app)

def test_perfect_score_all_vectors():
    # Provide perfect data for V1, V2, V3, and V4
    payload = {
        "applicant_id": "test_user_perfect",
        "remittance_intervals_days": [30.0, 30.0, 30.0, 30.0],  # CV = 0 -> Cr = 1
        "mean_monthly_inflow_usd": 1000.0,  # >> 500 target -> Vs = 1
        "utility_payments": [
            {"biller_id": "water", "is_on_time": True, "aggregator_signature": "mock"},
            {"biller_id": "electric", "is_on_time": True, "aggregator_signature": "mock"}
        ],  # 100% on time
        "utility_streak": 12,  # > 6 target -> streak = 1
        "peer_stakes": [
            {
                "peer_id": "peer1",
                "stake_amount_usd": 200.0,
                "duration_days": 100,
                "peer_repayment_rate": 1.0
            }
        ],  # > 100 stake, > 90 days duration, 1.0 repayment -> V3 = 1
        "v4_assessment_score": 1.0  # V4 = 1
    }
    
    response = client.post("/api/credit/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["trust_score"] == 850  # Perfect score

def test_insufficient_data():
    # Provide too few remittance intervals and no utilities
    payload = {
        "applicant_id": "test_user_insufficient",
        "remittance_intervals_days": [30.0, 30.0],  # Only 2 intervals, requires 3
        "mean_monthly_inflow_usd": 1000.0,
        "utility_payments": [],
        "utility_streak": 0,
        "peer_stakes": [],
        "v4_assessment_score": None
    }
    
    response = client.post("/api/credit/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "INSUFFICIENT_DATA"
    assert "MISSING_CORE_TELEMETRY" in data["reason_codes"]
    assert data["trust_score"] is None

def test_thin_file_cap():
    # Only V1 data, but perfect.
    payload = {
        "applicant_id": "test_user_thin",
        "remittance_intervals_days": [30.0, 30.0, 30.0, 30.0],
        "mean_monthly_inflow_usd": 1000.0,
        "utility_payments": [],  # Missing V2
        "utility_streak": 0,
        "peer_stakes": [],       # Missing V3
        "v4_assessment_score": None
    }
    
    response = client.post("/api/credit/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    # Even if they score high on V1, it must be capped at THIN_FILE_CAP
    assert data["trust_score"] <= THIN_FILE_CAP
    assert "CAPPED_THIN_FILE" in data["reason_codes"]

def test_zk_proof_endpoint():
    payload = {
        "applicant_id": "test_user_zk",
        "min_required_score": 600,
        "pool_scoped_nullifier": "lending_pool_A_nonce_123"
    }
    
    response = client.post("/api/credit/zk-proof", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert "proof" in data
    assert "public_inputs" in data
    assert data["public_inputs"]["pool_scoped_nullifier"] == "lending_pool_A_nonce_123"
    assert data["public_inputs"]["model_version"] == "v0"
    
    # Ensure raw telemetry is NOT leaked
    assert "trust_score" not in data
    assert "remittance_history" not in data
    assert "identity" not in data
