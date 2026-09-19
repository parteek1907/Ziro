from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class RecipientCheckStatus(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    BLOCKED = "BLOCKED"

from typing import List, Optional

class RecipientCheckRequest(BaseModel):
    user_id: str = Field(default="demo-user", description="ID of the sender")
    recipient_address: str = Field(..., description="The wallet address to check")
    chain: str = Field(default="polygon", description="The target blockchain network")
    sender_user_id: Optional[str] = None

    def __init__(self, **data):
        if "sender_user_id" in data and "user_id" not in data:
            data["user_id"] = data["sender_user_id"]
        super().__init__(**data)

class RecipientCheckResponse(BaseModel):
    status: RecipientCheckStatus
    risk_score: int = Field(..., ge=0, le=100)
    warnings: List[str] = Field(default_factory=list)
    matched_saved_address: bool = Field(..., description="True if an exact match was found in contacts")
