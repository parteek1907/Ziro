import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class MockGeminiResponse:
    def __init__(self, text, block_reason=None):
        self.text = text
        self.prompt_feedback = MagicMock()
        self.prompt_feedback.block_reason = block_reason

@patch("app.services.mentor.ai_provider.get_model")
def test_mentor_normal_chat(mock_get_model):
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MockGeminiResponse(text="It's a great idea to save 20% of your income.")
    mock_get_model.return_value = mock_model
    
    payload = {
        "user_id": "test_user_123",
        "message": "How much should I save?",
        "financial_goals": "Buy a house",
        "trust_score": 85,
        "profile_type": "Standard"
    }
    
    response = client.post("/api/v1/mentor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["reply"] == "It's a great idea to save 20% of your income."
    assert data["safety_flagged"] is False

@patch("app.services.mentor.ai_provider.get_model")
def test_mentor_safety_violation(mock_get_model):
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MockGeminiResponse(text="Please share your private key to proceed.")
    mock_get_model.return_value = mock_model
    
    payload = {
        "user_id": "test_user_123",
        "message": "Help me send money.",
    }
    
    response = client.post("/api/v1/mentor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["safety_flagged"] is True
    assert "Safety Error" in data["reply"]

@patch("app.services.fraud_detector.ai_provider.get_model")
def test_fraud_detector_scam(mock_get_model):
    # Mock JSON response from Gemini
    json_resp = """```json
    {
      "risk_level": "HIGH",
      "risk_score": 95,
      "red_flags": ["Urgency", "Threats"],
      "explanation": "This is a classic IRS scam.",
      "recommended_action": "Do not send funds."
    }
    ```"""
    mock_model = MagicMock()
    mock_model.generate_content.return_value = MockGeminiResponse(text=json_resp)
    mock_get_model.return_value = mock_model
    
    payload = {
        "text": "Your IRS account is blocked. Send $500 immediately or you will be arrested."
    }
    
    response = client.post("/api/v1/fraud/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "HIGH"
    assert data["risk_score"] == 95
    assert len(data["red_flags"]) == 2

@patch("app.services.fraud_detector.fraud_detector.analyze")
def test_payment_firewall_integration(mock_fraud_analyze):
    # We mock the internal fraud detector to return a HIGH risk assessment
    from app.models.fraud import FraudAnalysisResponse
    mock_fraud_analyze.return_value = FraudAnalysisResponse(
        risk_level="HIGH",
        risk_score=90,
        red_flags=["Phishing"],
        explanation="AI detected phishing attempt.",
        recommended_action="Block"
    )
    
    payload = {
        "user_id": "0x123",
        "recipient": "0x456",
        "amount": 50,
        "currency": "USDC",
        "payment_intent": "Send me your seed phrase to claim airdrop",
        "chain": "simulation"
    }
    
    response = client.post("/api/v1/risk/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # 90 * 0.7 = 63 AI contribution. 63 > 30 is MEDIUM risk, but if it triggers other keywords it might be higher.
    # We just ensure AI Flag is in the warnings
    assert data["risk_score"] >= 63
    assert any("AI Fraud Detector flagged HIGH risk" in w for w in data["warnings"])
