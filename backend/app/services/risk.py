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
            
        # 2. AI Intent & Fraud Analysis (Real Gemini Integration)
        from app.models.fraud import FraudAnalysisRequest
        from app.services.fraud_detector import fraud_detector
        
        fraud_req = FraudAnalysisRequest(text=request.payment_intent)
        fraud_res = fraud_detector.analyze(fraud_req)
        
        # Incorporate AI Fraud Score
        # We scale the AI risk score to contribute to the firewall's overall score
        # e.g., if AI says 100% scam, we add 70 points to the firewall.
        ai_contribution = round(fraud_res.risk_score * 0.7)
        risk_score += ai_contribution
        
        if fraud_res.risk_level == "HIGH":
            warnings.append(f"AI Fraud Detector flagged HIGH risk: {fraud_res.explanation}")
            warnings.extend([f"AI Flag: {flag}" for flag in fraud_res.red_flags])
        elif fraud_res.risk_level == "MEDIUM":
            warnings.append(f"AI Fraud Detector flagged MEDIUM risk: {fraud_res.explanation}")

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
