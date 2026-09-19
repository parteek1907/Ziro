import os
import json
import google.generativeai as genai
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
            
        # 2. Heuristic AI Intent Analysis with Gemini API
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = (
                    "You are an AI payment firewall. Analyze the following payment intent for scam or fraud risk. "
                    "Return ONLY a JSON object with two fields: 'risk_score' (an integer from 0 to 100, 100 being certain scam) "
                    f"and 'warning' (a short explanation if risk_score > 30, else empty string). Payment intent: '{request.payment_intent}'"
                )
                response = model.generate_content(prompt)
                
                # Parse JSON block
                text = response.text.strip().replace("```json", "").replace("```", "")
                result = json.loads(text)
                
                ai_risk_score = int(result.get("risk_score", 0))
                ai_warning = result.get("warning", "")
                
                risk_score += ai_risk_score
                if ai_warning and ai_risk_score > 30:
                    warnings.append(f"AI Firewall: {ai_warning}")
                    
            except Exception as e:
                print(f"Gemini AI Firewall check failed: {e}")
                self._fallback_check(request.payment_intent, warnings)
                if warnings:
                    risk_score += 40
        else:
            self._fallback_check(request.payment_intent, warnings)
            if warnings:
                risk_score += 40

        # 3. Aggregation & Decision Logic
        risk_score = min(risk_score, 100)
        
        if risk_score > 70:
            level = RiskLevel.HIGH
            requires_conf = False 
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

    def _fallback_check(self, intent: str, warnings: List[str]):
        intent_lower = intent.lower()
        if "urgent" in intent_lower and "irs" in intent_lower:
            warnings.append("AI Firewall: Urgent tax-related intent detected. High risk of scam.")
        elif "giveaway" in intent_lower:
            warnings.append("AI Firewall: Giveaway related keyword detected.")

ai_firewall = AIPaymentFirewall()
