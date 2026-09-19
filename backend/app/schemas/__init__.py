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

class UtilityPaymentReceipt(BaseModel):
    biller_id: str
    is_on_time: bool
    aggregator_signature: str = Field(description="[SIMULATED] Cryptographic signature from the bill aggregator.")

class PeerStake(BaseModel):
    peer_id: str
    stake_amount_usd: float
    duration_days: int
    peer_repayment_rate: float = Field(..., ge=0, le=1)

class CreditEvaluationRequest(BaseModel):
    applicant_id: str = Field(default="user_anon_01")
    # V1 Telemetry
    remittance_intervals_days: List[float] = Field(default_factory=list, description="Arrival intervals to calculate CV. Requires >= 3.")
    mean_monthly_inflow_usd: float = Field(default=0.0, ge=0)
    # V2 Telemetry
    utility_payments: List[UtilityPaymentReceipt] = Field(default_factory=list, description="Signed utility payment receipts.")
    utility_streak: int = Field(default=0, ge=0)
    # V3 Telemetry
    peer_stakes: List[PeerStake] = Field(default_factory=list, description="Endorsements from peers.")
    # V4 Telemetry (Optional)
    v4_assessment_score: Optional[float] = Field(default=None, ge=0, le=1, description="Composite of psychometric factors normalized to [0,1].")

class CreditEvaluationResponse(BaseModel):
    applicant_id: str
    model_version: str
    trust_score: Optional[int] = Field(None, ge=300, le=850, description="Omitted if INSUFFICIENT_DATA")
    status: str = Field(..., description="'SUCCESS' or 'INSUFFICIENT_DATA'")
    reason_codes: List[str]
    borrower_protection_max_apr: float
    # These fields are omitted in ZK payload, only used for API debugging/UX
    score_breakdown: Optional[Dict[str, float]] = None

class ZKProofRequest(BaseModel):
    applicant_id: str
    min_required_score: int = Field(default=600, ge=300, le=850)
    pool_scoped_nullifier: str = Field(..., description="Prevents proof replay across the same lending pool.")

class ZKProofPublicInputs(BaseModel):
    score_threshold_met: bool
    model_version: str
    pool_scoped_nullifier: str

class ZKProofResponse(BaseModel):
    proof: str = Field(..., description="Zero-Knowledge Groth16/Circom proof payload.")
    public_inputs: ZKProofPublicInputs


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
