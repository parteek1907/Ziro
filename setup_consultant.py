import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/consultant.py": """from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ConsultationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ConsultationRequest(BaseModel):
    user_id: str
    payment_id: str
    message: str = Field(..., description="Message from the user to the consultant")

class ConsultantReviewAction(BaseModel):
    consultation_id: str
    is_safe: bool = Field(..., description="Verdict from the consultant")
    notes: str = Field(..., description="Notes provided by the consultant")

class ConsultationResponse(BaseModel):
    id: str
    user_id: str
    payment_id: str
    status: ConsultationStatus
    consultant_notes: Optional[str] = None
    consultant_fee_usd: float = 0.0
    platform_commission_usd: float = 0.0
    success_fee_usd: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
""",
    "app/services/consultant.py": """import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.models.consultant import ConsultationRequest, ConsultationResponse, ConsultationStatus, ConsultantReviewAction

# Flat fees for the revenue model
CONSULTANT_BASE_FEE = 20.0
PLATFORM_COMMISSION_RATE = 0.20 # 20% of consultant fee
SUCCESS_FEE = 1.0 # Flat success fee if payment is deemed safe

class ConsultantService:
    def __init__(self):
        self._consultations: Dict[str, ConsultationResponse] = {}

    def request_review(self, request: ConsultationRequest) -> ConsultationResponse:
        consultation_id = f"cons_{uuid.uuid4().hex[:8]}"
        response = ConsultationResponse(
            id=consultation_id,
            user_id=request.user_id,
            payment_id=request.payment_id,
            status=ConsultationStatus.PENDING
        )
        self._consultations[consultation_id] = response
        return response

    def submit_review(self, action: ConsultantReviewAction) -> ConsultationResponse:
        consultation = self._consultations.get(action.consultation_id)
        if not consultation:
            raise ValueError("Consultation not found")
            
        if consultation.status != ConsultationStatus.PENDING:
            raise ValueError("Consultation already resolved")

        consultation.status = ConsultationStatus.APPROVED if action.is_safe else ConsultationStatus.REJECTED
        consultation.consultant_notes = action.notes
        consultation.resolved_at = datetime.utcnow()

        # Revenue Logic
        consultation.consultant_fee_usd = CONSULTANT_BASE_FEE
        consultation.platform_commission_usd = CONSULTANT_BASE_FEE * PLATFORM_COMMISSION_RATE
        
        # Only charge success fee if the blockchain payment is safe to execute
        if action.is_safe:
            consultation.success_fee_usd = SUCCESS_FEE

        return consultation

    def get_user_consultations(self, user_id: str) -> List[ConsultationResponse]:
        return [c for c in self._consultations.values() if c.user_id == user_id]

consultant_service = ConsultantService()
""",
    "app/api/v1/endpoints/consultant.py": """from fastapi import APIRouter, HTTPException
from typing import List
from app.models.consultant import ConsultationRequest, ConsultantReviewAction, ConsultationResponse
from app.services.consultant import consultant_service

router = APIRouter()

@router.post("/request", response_model=ConsultationResponse)
async def request_review(request: ConsultationRequest):
    return consultant_service.request_review(request)

@router.post("/review", response_model=ConsultationResponse)
async def submit_review(action: ConsultantReviewAction):
    try:
        return consultant_service.submit_review(action)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=List[ConsultationResponse])
async def get_consultations(user_id: str):
    return consultant_service.get_user_consultations(user_id)
""",
    "tests/api/test_consultant.py": """import pytest
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
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Consultant files generated.")
