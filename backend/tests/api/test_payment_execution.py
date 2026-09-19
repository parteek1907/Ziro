import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.payment_execution import PaymentState
import uuid

client = TestClient(app)

def test_happy_path_execution():
    # 1. Create Payment (Safe Address, Low Risk Intent)
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "user_id": "user123",
        "payment_intent": "Grocery shopping",
        "sender_address": "0xSender123",
        "recipient_address": "0x1234567890abcdef1234567890abcdef12345678", # Saved address -> Safe
        "amount": 50.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == PaymentState.RISK_APPROVED
    payment_id = data["payment_id"]

    # 2. Execute Payment
    execute_res = client.post(f"/api/v1/payments/{payment_id}/execute")
    assert execute_res.status_code == 200
    exec_data = execute_res.json()
    
    assert exec_data["state"] == PaymentState.SETTLED
    assert exec_data["blockchain_tx_hash"] is not None
    assert exec_data["settled_at"] is not None

def test_medium_risk_requires_confirmation():
    # 1. Create Payment (First time address -> Medium risk)
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "user_id": "user123",
        "payment_intent": "Sending money to a friend",
        "sender_address": "0xSender123",
        "recipient_address": "0xNewAddress1234567890abcdef1234567890abcd", # Not in saved
        "amount": 50.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == PaymentState.AWAITING_CONFIRMATION
    payment_id = data["payment_id"]
    
    # 2. Try to execute before confirmation (Should fail)
    execute_res = client.post(f"/api/v1/payments/{payment_id}/execute")
    assert execute_res.status_code == 400

    # 3. Confirm Payment
    confirm_res = client.post(f"/api/v1/payments/{payment_id}/confirm")
    assert confirm_res.status_code == 200
    assert confirm_res.json()["state"] == PaymentState.RISK_APPROVED

    # 4. Execute Payment
    execute_res = client.post(f"/api/v1/payments/{payment_id}/execute")
    assert execute_res.status_code == 200
    assert execute_res.json()["state"] == PaymentState.SETTLED

def test_high_risk_rejection():
    # High risk keyword "lottery"
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "user_id": "user123",
        "payment_intent": "Paying fees for lottery win",
        "sender_address": "0xSender123",
        "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
        "amount": 3000.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 200
    assert response.json()["state"] == PaymentState.RISK_REJECTED

def test_scam_address_rejection():
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "user_id": "user123",
        "payment_intent": "Normal transfer",
        "sender_address": "0xSender123",
        "recipient_address": "0xScamAddress123", # From known blocklist
        "amount": 50.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 200
    assert response.json()["state"] == PaymentState.RISK_REJECTED

def test_idempotency_creation():
    idemp_key = str(uuid.uuid4())
    payload = {
        "idempotency_key": idemp_key,
        "user_id": "user123",
        "payment_intent": "Grocery",
        "sender_address": "0xSender123",
        "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
        "amount": 50.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response1 = client.post("/api/v1/payments", json=payload)
    response2 = client.post("/api/v1/payments", json=payload)
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    assert response1.json()["payment_id"] == response2.json()["payment_id"]

def test_idempotency_execution():
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "user_id": "user123",
        "payment_intent": "Grocery",
        "sender_address": "0xSender123",
        "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
        "amount": 50.0,
        "currency": "USDC",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/payments", json=payload)
    payment_id = response.json()["payment_id"]
    
    exec1 = client.post(f"/api/v1/payments/{payment_id}/execute")
    exec2 = client.post(f"/api/v1/payments/{payment_id}/execute")
    
    assert exec1.status_code == 200
    assert exec2.status_code == 200
    assert exec1.json()["blockchain_tx_hash"] == exec2.json()["blockchain_tx_hash"]
