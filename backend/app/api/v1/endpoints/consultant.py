from fastapi import APIRouter, HTTPException
from typing import List
from app.models.consultant import ConsultationRequest, ConsultantReviewAction, ConsultationResponse
from app.services.consultant import consultant_service

router = APIRouter()

@router.post("/request", response_model=ConsultationResponse)
async def request_review(request: ConsultationRequest):
    return consultant_service.request_review(request)

@router.post("/review", response_model=ConsultationResponse)
async def submit_review(action: ConsultantReviewAction):
    try:
        return consultant_service.submit_review(action)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=List[ConsultationResponse])
async def get_consultations(user_id: str):
    return consultant_service.get_user_consultations(user_id)
