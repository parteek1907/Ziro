from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RiskAnalysisRequest(BaseModel):
    user_id: str = Field(default="demo-user", description="ID of the sender")
    recipient: str = Field(..., description="Recipient address or identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: str = Field(default="USD", description="Transaction currency")
    payment_intent: str = Field(default="transfer", description="Reason or context for the payment")
    chain: str = Field(default="polygon", description="Target blockchain or simulation")
    note: Optional[str] = None

    def __init__(self, **data):
        if "note" in data and "payment_intent" not in data:
            data["payment_intent"] = data["note"] or "transfer"
        super().__init__(**data)

class RiskAnalysisResponse(BaseModel):
    risk_level: RiskLevel
    risk_score: int = Field(..., ge=0, le=100, description="Aggregated risk score (0-100)")
    reasons: List[str] = Field(default_factory=list, description="List of triggered risk rules")
    warnings: List[str] = Field(default_factory=list, description="List of AI generated warnings")
    requires_confirmation: bool = Field(..., description="Whether explicit user confirmation is needed")
