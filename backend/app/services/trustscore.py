from typing import List
from app.models.trustscore import TrustScoreResponse, TrustFactor, ImpactLevel

class TrustScoreService:
    
    def calculate_score(self, user_id: str) -> TrustScoreResponse:
        # Mock logic based on user_id to simulate different profiles
        if user_id == "new_user":
            factors = [
                TrustFactor(name="Account Age", score=20, impact=ImpactLevel.NEGATIVE),
                TrustFactor(name="Payment Consistency", score=50, impact=ImpactLevel.NEUTRAL)
            ]
            return TrustScoreResponse(
                score=450,
                factors=factors,
                explanation="Your TrustScore is currently building. Consistently sending remittances will improve your Payment Consistency factor."
            )
        elif user_id == "bad_history":
            factors = [
                TrustFactor(name="Cash Flow Stability", score=15, impact=ImpactLevel.NEGATIVE),
                TrustFactor(name="Transaction Regularity", score=30, impact=ImpactLevel.NEGATIVE)
            ]
            return TrustScoreResponse(
                score=380,
                factors=factors,
                explanation="Your TrustScore is impacted by irregular cash flows and low transaction regularity."
            )
        else:
            # Default good user
            factors = [
                TrustFactor(name="Payment Consistency", score=92, impact=ImpactLevel.POSITIVE),
                TrustFactor(name="Cash Flow Stability", score=88, impact=ImpactLevel.POSITIVE),
                TrustFactor(name="Savings Behavior", score=75, impact=ImpactLevel.POSITIVE)
            ]
            return TrustScoreResponse(
                score=780,
                factors=factors,
                explanation="Your TrustScore is excellent! Your consistent remittance payments and stable cash flow contribute highly to your profile."
            )

trustscore_service = TrustScoreService()
