"""Pydantic v2 schemas for Future Finance API."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# 1. REMITTANCE SCHEMAS
# ==========================================

class RemittanceRouteRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to send in source currency")
    source_currency: str = Field(default="USD", description="Source currency (e.g. USD, EUR, GBP)")
    target_currency: str = Field(default="KES", description="Target recipient currency (e.g. KES, MXN, INR, PHP)")
    recipient_type: Optional[str] = Field(default="mobile_money", description="Payout rail (mobile_money, bank, cash_pickup)")


class LiquidityRouteOption(BaseModel):
    rail_name: str
    network: str
    estimated_time_seconds: float
    total_fee_usd: float
    exchange_rate: float
    recipient_receives: float
    gas_abstracted: bool = True
    savings_vs_traditional_usd: float


class RemittanceRouteResponse(BaseModel):
    source_amount: float
    source_currency: str
    target_currency: str
    traditional_rail: Dict[str, Any]
    l2_optimized_rail: LiquidityRouteOption
    simulated_tx_hash: str
    timestamp: str


# ==========================================
# 2. CREDIT & ZK-PROOF SCHEMAS
# ==========================================

class CreditEvaluationRequest(BaseModel):
    applicant_id: Optional[str] = Field(default="user_anon_01", description="Identifier for borrower")
    remittance_history_score: float = Field(default=210, ge=0, le=250, description="Remittance frequency & volume (0-250)")
    peer_trust_score: float = Field(default=180, ge=0, le=200, description="Community endorsement score (0-200)")
    psychometric_quiz_score: float = Field(default=170, ge=0, le=200, description="AI psychometric assessment (0-200)")
    utility_velocity_score: float = Field(default=160, ge=0, le=200, description="Mobile top-up and utility consistency (0-200)")
    monthly_income_usd: Optional[float] = Field(default=250.0, description="Estimated monthly earnings")


class CreditEvaluationResponse(BaseModel):
    applicant_id: str
    trust_score: int = Field(..., ge=300, le=850, description="Total score mapped to 300-850 range")
    credit_tier: str = Field(..., description="Tier 1 (Prime), Tier 2 (Growth), Tier 3 (Micro-Starter)")
    eligible_microloan_usd: float
    offered_apr_percent: float
    traditional_predatory_apr_percent: float = 120.0
    estimated_monthly_savings_usd: float
    risk_category: str
    score_breakdown: Dict[str, float]
    ai_reasoning: str


class ZKProofRequest(BaseModel):
    applicant_id: str
    min_required_score: int = Field(default=600, ge=300, le=850)
    verifier_id: Optional[str] = Field(default="lender_micro_finance_hub")


class ZKProofResponse(BaseModel):
    proof_id: str
    proof_type: str = "ZK-TrustScore-Tier1"
    is_verified: bool
    threshold_met: bool
    issued_at: str
    cryptographic_commitment: str
    disclosed_attributes: Dict[str, Any]
    hidden_attributes: List[str]


# ==========================================
# 3. OFFLINE VAULT & EDGE GUARD SCHEMAS
# ==========================================

class OfflineSignedPayload(BaseModel):
    sender_public_key: str
    recipient: str
    amount: float = Field(..., gt=0)
    currency: str = "USDC"
    nonce: int = Field(..., ge=0)
    timestamp: int
    signature: str
    client_device_id: Optional[str] = "edge-vault-pwa"


class EdgeGuardValidationResponse(BaseModel):
    is_valid: bool
    status: str
    risk_score: float
    flags: List[str]
    message: str
    estimated_settlement_on_relay: str


class BatchSyncRequest(BaseModel):
    payloads: List[OfflineSignedPayload]


class BatchSyncResponse(BaseModel):
    processed_count: int
    accepted_count: int
    rejected_count: int
    batch_tx_hash: Optional[str] = None
    results: List[Dict[str, Any]]


# ==========================================
# 4. MULTILINGUAL AI MENTOR SCHEMAS
# ==========================================

class MentorMessageRequest(BaseModel):
    message: str
    language: str = Field(default="en", description="ISO language code (en, es, sw, hi, etc.)")
    simplicity_mode: bool = Field(default=True, description="Converts complex APR/liquidity into local everyday metaphors")


class MentorMessageResponse(BaseModel):
    reply: str
    simplified_analogy: Optional[str] = None
    actionable_tip: Optional[str] = None
    language: str
