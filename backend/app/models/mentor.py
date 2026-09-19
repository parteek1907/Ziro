from pydantic import BaseModel, Field
from typing import Optional

class MentorChatRequest(BaseModel):
    user_id: str
    message: str = Field(..., description="The user's question or statement")
    financial_goals: Optional[str] = Field(default="Unknown", description="User's stated financial goals")
    trust_score: Optional[int] = Field(default=None, description="User's Ziro TrustScore")
    profile_type: Optional[str] = Field(default="Standard", description="User's profile type (e.g., Unbanked, Standard, Premium)")

class MentorChatResponse(BaseModel):
    reply: str
    safety_flagged: bool = Field(default=False, description="True if the request violated safety constraints")
