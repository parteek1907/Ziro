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
            
        # 2. Simulated AI Intent Analysis
        # In production, this calls Groq/Gemini with the payment_intent
        intent_lower = request.payment_intent.lower()
        
        high_risk_keywords = ["urgent", "irs", "taxes", "prince", "lottery", "bail"]
        medium_risk_keywords = ["investment", "crypto", "unknown", "fee"]
        
        for kw in high_risk_keywords:
            if kw in intent_lower:
                risk_score += 50
                warnings.append(f"AI flagged high-risk keyword in intent: '{kw}'. This resembles common scam patterns.")
                
        for kw in medium_risk_keywords:
            if kw in intent_lower:
                risk_score += 20
                warnings.append(f"AI flagged medium-risk context in intent: '{kw}'.")

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
