"""Alternative Credit Scoring (TrustScore) and zk-Credit Credential Engine."""
import math
from fastapi import APIRouter
from app.schemas import (
    CreditEvaluationRequest,
    CreditEvaluationResponse,
    ZKProofRequest,
    ZKProofResponse,
    ZKProofPublicInputs
)
from app.core.trust_model import (
    MODEL_VERSION, SCALE,
    V1_WEIGHT, V1_ALPHA, MIN_REMITTANCE_INTERVALS, X_TARGET_USD,
    V2_WEIGHT, STREAK_TARGET,
    V3_WEIGHT, STAKE_TARGET_USD, MAX_STAKE_DURATION_DAYS,
    V4_WEIGHT, THIN_FILE_CAP, MAX_APR_POLICY
)

router = APIRouter(prefix="/api/credit", tags=["Credit & TrustScore"])

def calculate_cv(intervals: list[float]) -> float:
    if len(intervals) < MIN_REMITTANCE_INTERVALS:
        return 0.0
    mean = sum(intervals) / len(intervals)
    if mean == 0:
        return 0.0
    variance = sum((x - mean) ** 2 for x in intervals) / len(intervals)
    stddev = math.sqrt(variance)
    return stddev / mean

def clamp_scale(val: float) -> int:
    return int(max(0.0, min(1.0, val)) * SCALE)

@router.post("/evaluate", response_model=CreditEvaluationResponse)
async def evaluate_trust_score(req: CreditEvaluationRequest):
    """
    Evaluates objective financial telemetry mapped to a 300-850 TrustScore
    using strict v0 fixed-point arithmetic.
    """
    # V1 Calculation [MEASURED]
    v1_has_data = len(req.remittance_intervals_days) >= MIN_REMITTANCE_INTERVALS
    if v1_has_data:
        cv = calculate_cv(req.remittance_intervals_days)
        Cr = clamp_scale(1.0 - cv)
        Vs = clamp_scale(req.mean_monthly_inflow_usd / (X_TARGET_USD / SCALE))
        V1 = (V1_ALPHA * Cr + (SCALE - V1_ALPHA) * Vs) // SCALE
    else:
        V1 = 0

    # V2 Calculation [MEASURED]
    v2_has_data = len(req.utility_payments) > 0
    if v2_has_data:
        on_time_count = sum(1 for p in req.utility_payments if p.is_on_time)
        on_time_ratio = clamp_scale(on_time_count / len(req.utility_payments))
        streak_val = clamp_scale(req.utility_streak / STREAK_TARGET)
        V2 = (int(0.7 * SCALE) * on_time_ratio + int(0.3 * SCALE) * streak_val) // SCALE
    else:
        V2 = 0

    if not v1_has_data and not v2_has_data:
        return CreditEvaluationResponse(
            applicant_id=req.applicant_id,
            model_version=MODEL_VERSION,
            status="INSUFFICIENT_DATA",
            reason_codes=["MISSING_CORE_TELEMETRY"],
            borrower_protection_max_apr=MAX_APR_POLICY
        )

    # V3 Calculation [MEASURED]
    capped_stake_sum = 0.0
    duration_sum = 0
    repayment_rate_sum = 0.0
    for p in req.peer_stakes:
        capped_stake_sum += p.stake_amount_usd
        duration_sum += min(p.duration_days, MAX_STAKE_DURATION_DAYS)
        repayment_rate_sum += p.peer_repayment_rate
        
    num_peers = len(req.peer_stakes)
    if num_peers > 0:
        stake_val = clamp_scale(capped_stake_sum / (STAKE_TARGET_USD / SCALE))
        duration_val = clamp_scale((duration_sum / num_peers) / MAX_STAKE_DURATION_DAYS)
        repayment_val = clamp_scale(repayment_rate_sum / num_peers)
        V3 = (int(0.5 * SCALE) * stake_val + int(0.3 * SCALE) * duration_val + int(0.2 * SCALE) * repayment_val) // SCALE
    else:
        V3 = 0
        
    # V4 Calculation [MEASURED]
    has_v4 = req.v4_assessment_score is not None
    if has_v4:
        V4 = clamp_scale(req.v4_assessment_score)
    else:
        V4 = 0

    # Weights [ASSUMPTION]
    w1, w2, w3, w4 = V1_WEIGHT, V2_WEIGHT, V3_WEIGHT, V4_WEIGHT
    
    # Renormalize if v4 is missing
    if not has_v4:
        total_w = w1 + w2 + w3
        if total_w > 0:
            w1 = (w1 * SCALE) // total_w
            w2 = (w2 * SCALE) // total_w
            w3 = (w3 * SCALE) // total_w
        w4 = 0

    # Calculate score
    weighted_sum = (w1 * V1 + w2 * V2 + w3 * V3 + w4 * V4) // SCALE
    score = 300 + (550 * weighted_sum) // SCALE
    
    # Thin file cap [TARGET]
    is_thin = not v1_has_data or not v2_has_data or num_peers == 0
    if is_thin and score > THIN_FILE_CAP:
        score = THIN_FILE_CAP
        
    reason_codes = []
    if is_thin:
        reason_codes.append("CAPPED_THIN_FILE")
    if V1 > int(0.8 * SCALE):
        reason_codes.append("STRONG_REMITTANCE_HISTORY")
    if V2 < int(0.5 * SCALE) and v2_has_data:
        reason_codes.append("POOR_UTILITY_CONSISTENCY")

    return CreditEvaluationResponse(
        applicant_id=req.applicant_id,
        model_version=MODEL_VERSION,
        trust_score=score,
        status="SUCCESS",
        reason_codes=reason_codes,
        borrower_protection_max_apr=MAX_APR_POLICY,
        score_breakdown={
            "V1": V1 / SCALE,
            "V2": V2 / SCALE,
            "V3": V3 / SCALE,
            "V4": V4 / SCALE
        }
    )

@router.post("/zk-proof", response_model=ZKProofResponse)
async def generate_zk_credit_proof(req: ZKProofRequest):
    """
    [SIMULATED] Generates a Zero-Knowledge proof.
    The lender only receives the proof and public inputs (threshold_met, model_version, nullifier).
    They never learn the borrower's identity, actual score, or raw telemetry.
    """
    # For MVP simulation, we pretend the Oracle generates the proof locally on behalf of the user.
    threshold_met = True # Assumed true for simulation
    
    # Simulate a Groth16 / Circom proof payload
    proof_str = f"0xGroth16Proof_Applicant{req.applicant_id}_Threshold{req.min_required_score}"
    
    public_inputs = ZKProofPublicInputs(
        score_threshold_met=threshold_met,
        model_version=MODEL_VERSION,
        pool_scoped_nullifier=req.pool_scoped_nullifier
    )
    
    return ZKProofResponse(
        proof=proof_str,
        public_inputs=public_inputs
    )
