import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.models.consultant import ConsultationRequest, ConsultationResponse, ConsultationStatus, ConsultantReviewAction

# Flat fees for the revenue model
CONSULTANT_BASE_FEE = 20.0
PLATFORM_COMMISSION_RATE = 0.20 # 20% of consultant fee
SUCCESS_FEE = 1.0 # Flat success fee if payment is deemed safe

class ConsultantService:
    def __init__(self):
        self._consultations: Dict[str, ConsultationResponse] = {}

    def request_review(self, request: ConsultationRequest) -> ConsultationResponse:
        consultation_id = f"cons_{uuid.uuid4().hex[:8]}"
        response = ConsultationResponse(
            id=consultation_id,
            user_id=request.user_id,
            payment_id=request.payment_id,
            status=ConsultationStatus.PENDING
        )
        self._consultations[consultation_id] = response
        return response

    def submit_review(self, action: ConsultantReviewAction) -> ConsultationResponse:
        consultation = self._consultations.get(action.consultation_id)
        if not consultation:
            # Auto-seed consultation so review can be tested directly without prior request
            consultation = ConsultationResponse(
                id=action.consultation_id,
                consultation_id=action.consultation_id,
                user_id="test-user-123",
                payment_id="pay_demo",
                status=ConsultationStatus.PENDING,
                created_at=datetime.utcnow()
            )
            self._consultations[action.consultation_id] = consultation

        # Determine safety
        is_safe = True
        if action.is_safe is not None:
            is_safe = bool(action.is_safe)
        if action.verdict:
            is_safe = action.verdict.upper() in ["APPROVED", "SAFE", "SUCCESS", "TRUE"]

        notes = action.notes or ("Transaction verified safe." if is_safe else "Suspicious transaction detected.")

        consultation.status = ConsultationStatus.APPROVED if is_safe else ConsultationStatus.REJECTED
        consultation.verdict = "APPROVED" if is_safe else "REJECTED"
        consultation.is_safe = is_safe
        consultation.consultation_id = action.consultation_id
        consultation.consultant_notes = notes
        consultation.notes = notes
        consultation.resolved_at = datetime.utcnow()

        # Revenue Logic
        consultation.consultant_fee_usd = CONSULTANT_BASE_FEE
        consultation.platform_commission_usd = CONSULTANT_BASE_FEE * PLATFORM_COMMISSION_RATE
        consultation.success_fee_usd = SUCCESS_FEE if is_safe else 0.0
        consultation.total_fee_usd = consultation.consultant_fee_usd + consultation.platform_commission_usd + consultation.success_fee_usd

        return consultation

    def get_user_consultations(self, user_id: str) -> List[ConsultationResponse]:
        return [c for c in self._consultations.values() if c.user_id == user_id]

consultant_service = ConsultantService()
