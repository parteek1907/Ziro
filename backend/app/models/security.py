from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class RecipientCheckStatus(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    BLOCKED = "BLOCKED"

class RecipientCheckRequest(BaseModel):
    user_id: str = Field(..., description="ID of the sender")
    recipient_address: str = Field(..., description="The wallet address to check")
    chain: str = Field(..., description="The target blockchain network")

class RecipientCheckResponse(BaseModel):
    status: RecipientCheckStatus
    risk_score: int = Field(..., ge=0, le=100)
    warnings: List[str] = Field(default_factory=list)
    matched_saved_address: bool = Field(..., description="True if an exact match was found in contacts")
