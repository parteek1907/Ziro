from pydantic import BaseModel, Field
from typing import List, Optional

class FraudAnalysisRequest(BaseModel):
    text: str = Field(..., description="Text from SMS, chat, or payment intent to analyze")
    screenshot_base64: Optional[str] = Field(None, description="Base64 encoded screenshot of the conversation/scam")

class FraudAnalysisResponse(BaseModel):
    risk_level: str = Field(..., description="LOW | MEDIUM | HIGH")
    risk_score: int = Field(..., description="Score from 0 to 100")
    red_flags: List[str] = Field(default_factory=list, description="List of detected scam indicators")
    explanation: str = Field(..., description="Detailed explanation of the risk assessment")
    recommended_action: str = Field(..., description="What the user or system should do next")
