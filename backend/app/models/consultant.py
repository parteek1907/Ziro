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
