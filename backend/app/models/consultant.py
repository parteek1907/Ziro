from enum import Enum
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
    consultation_id: str = Field(..., description="ID of the consultation")
    is_safe: Optional[bool] = Field(default=True, description="Verdict from the consultant: true if safe")
    verdict: Optional[str] = Field(default=None, description="Alternative verdict: APPROVED, REJECTED, SAFE, or UNSAFE")
    notes: Optional[str] = Field(default="Verified transaction security.", description="Notes provided by the consultant")

class ConsultationResponse(BaseModel):
    id: str
    consultation_id: Optional[str] = None
    user_id: str
    payment_id: str
    status: ConsultationStatus
    verdict: Optional[str] = None
    is_safe: bool = True
    notes: Optional[str] = None
    consultant_notes: Optional[str] = None
    consultant_fee_usd: float = 20.0
    platform_commission_usd: float = 4.0
    success_fee_usd: float = 1.0
    total_fee_usd: float = 25.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
