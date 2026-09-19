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
            raise ValueError("Consultation not found")
            
        if consultation.status != ConsultationStatus.PENDING:
            raise ValueError("Consultation already resolved")

        consultation.status = ConsultationStatus.APPROVED if action.is_safe else ConsultationStatus.REJECTED
        consultation.consultant_notes = action.notes
        consultation.resolved_at = datetime.utcnow()

        # Revenue Logic
        consultation.consultant_fee_usd = CONSULTANT_BASE_FEE
        consultation.platform_commission_usd = CONSULTANT_BASE_FEE * PLATFORM_COMMISSION_RATE
        
        # Only charge success fee if the blockchain payment is safe to execute
        if action.is_safe:
            consultation.success_fee_usd = SUCCESS_FEE

        return consultation

    def get_user_consultations(self, user_id: str) -> List[ConsultationResponse]:
        return [c for c in self._consultations.values() if c.user_id == user_id]

consultant_service = ConsultantService()
