from enum import Enum
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class ImpactLevel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class TrustFactor(BaseModel):
    name: str = Field(..., description="Name of the factor (e.g. Payment Consistency)")
    score: int = Field(..., ge=0, le=100, description="Individual score for this factor")
    impact: ImpactLevel = Field(..., description="How this factor impacts the overall score")

class TrustScoreResponse(BaseModel):
    score: int = Field(..., ge=300, le=850, description="Overall ZIRO TrustScore")
    factors: List[TrustFactor]
    explanation: str = Field(..., description="Detailed, explainable text for the user")

class CredentialGenerateRequest(BaseModel):
    user_id: str
    minimum_required_score: int = Field(..., ge=300, le=850)

class CredentialVerifyRequest(BaseModel):
    proof_payload: Dict[str, Any]

class CredentialPrototypeResponse(BaseModel):
    eligible: bool
    zk_proof_mock: str = Field(..., description="Cryptographic prototype string simulating a ZK proof")
    timestamp: int
    verifier_instructions: str = Field(default="Provide this payload to the /verify endpoint. Raw score is never exposed.")

class CredentialVerifyResult(BaseModel):
    is_valid: bool
    is_eligible: bool
    message: str
