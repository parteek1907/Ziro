from typing import List
from app.models.risk import RiskAnalysisRequest, RiskAnalysisResponse, RiskLevel

KNOWN_SCAM_ADDRESSES = [
    "0xScamAddress123",
    "GSCAMSTELLARADDRESS456"
]

class AIPaymentFirewall:
    
    def analyze(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        risk_score = 0
        reasons = []
        warnings = []
        
        # 1. Deterministic Rules
        if request.recipient in KNOWN_SCAM_ADDRESSES:
            risk_score += 80
            reasons.append("Recipient is on a known scam blocklist.")
            
        if request.amount > 2000:
            risk_score += 40
            reasons.append(f"Unusually large transaction amount: {request.amount} {request.currency}.")
            
        # 2. Heuristic AI Intent Analysis (Mock)
        # E.g. "urgent irs", "prince", "giveaway"
        intent_lower = request.payment_intent.lower()
        if "urgent" in intent_lower and "irs" in intent_lower:
            risk_score += 60
            warnings.append("AI Firewall: Urgent tax-related intent detected. High risk of scam.")
        elif "giveaway" in intent_lower:
            risk_score += 30
            warnings.append("AI Firewall: Giveaway related keyword detected.")

        # 3. Aggregation & Decision Logic
        # Cap score at 100
        risk_score = min(risk_score, 100)
        
        if risk_score > 70:
            level = RiskLevel.HIGH
            requires_conf = False # High risk is blocked, not confirmed
        elif risk_score > 30:
            level = RiskLevel.MEDIUM
            requires_conf = True
        else:
            level = RiskLevel.LOW
            requires_conf = False
            
        return RiskAnalysisResponse(
            risk_level=level,
            risk_score=risk_score,
            reasons=reasons,
            warnings=warnings,
            requires_confirmation=requires_conf
        )

ai_firewall = AIPaymentFirewall()
