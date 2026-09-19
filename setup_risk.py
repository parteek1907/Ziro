import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/risk.py": """from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RiskAnalysisRequest(BaseModel):
    user_id: str = Field(..., description="ID of the sender")
    recipient: str = Field(..., description="Recipient address or identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: str = Field(..., description="Transaction currency")
    payment_intent: str = Field(..., description="Reason or context for the payment")
    chain: str = Field(..., description="Target blockchain or simulation")

class RiskAnalysisResponse(BaseModel):
    risk_level: RiskLevel
    risk_score: int = Field(..., ge=0, le=100, description="Aggregated risk score (0-100)")
    reasons: List[str] = Field(default_factory=list, description="List of triggered risk rules")
    warnings: List[str] = Field(default_factory=list, description="List of AI generated warnings")
    requires_confirmation: bool = Field(..., description="Whether explicit user confirmation is needed")
""",
    "app/services/risk.py": """from typing import List
from app.models.risk import RiskAnalysisRequest, RiskAnalysisResponse, RiskLevel

KNOWN_SCAM_ADDRESSES = [
    "0xScamAddress123",
    "GSCAMSTELLARADDRESS456"
]

class AIPaymentFirewall:
    
    def analyze(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        risk_score = 0
        reasons = []
        warnings = []
        
        # 1. Deterministic Rules
        if request.recipient in KNOWN_SCAM_ADDRESSES:
            risk_score += 80
            reasons.append("Recipient is on a known scam blocklist.")
            
        if request.amount > 2000:
            risk_score += 40
            reasons.append(f"Unusually large transaction amount: {request.amount} {request.currency}.")
            
        # 2. Simulated AI Intent Analysis
        # In production, this calls Groq/Gemini with the payment_intent
        intent_lower = request.payment_intent.lower()
        
        high_risk_keywords = ["urgent", "irs", "taxes", "prince", "lottery", "bail"]
        medium_risk_keywords = ["investment", "crypto", "unknown", "fee"]
        
        for kw in high_risk_keywords:
            if kw in intent_lower:
                risk_score += 50
                warnings.append(f"AI flagged high-risk keyword in intent: '{kw}'. This resembles common scam patterns.")
                
        for kw in medium_risk_keywords:
            if kw in intent_lower:
                risk_score += 20
                warnings.append(f"AI flagged medium-risk context in intent: '{kw}'.")

        # 3. Aggregation & Decision Logic
        # Cap score at 100
        risk_score = min(risk_score, 100)
        
        if risk_score > 70:
            level = RiskLevel.HIGH
            requires_conf = False # High risk is blocked, not confirmed
        elif risk_score > 30:
            level = RiskLevel.MEDIUM
            requires_conf = True
        else:
            level = RiskLevel.LOW
            requires_conf = False
            
        return RiskAnalysisResponse(
            risk_level=level,
            risk_score=risk_score,
            reasons=reasons,
            warnings=warnings,
            requires_confirmation=requires_conf
        )

ai_firewall = AIPaymentFirewall()
""",
    "app/api/v1/endpoints/risk.py": """from fastapi import APIRouter
from app.models.risk import RiskAnalysisRequest, RiskAnalysisResponse
from app.services.risk import ai_firewall

router = APIRouter()

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_payment_risk(request: RiskAnalysisRequest):
    return ai_firewall.analyze(request)
""",
    "tests/api/test_risk.py": """import pytest
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
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("AI Payment Firewall files generated.")
