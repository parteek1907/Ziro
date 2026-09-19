from fastapi import APIRouter
from app.models.security import RecipientCheckRequest, RecipientCheckResponse
from app.services.security import address_protection_service

router = APIRouter()

@router.post("/check-recipient", response_model=RecipientCheckResponse)
async def check_recipient(request: RecipientCheckRequest):
    return address_protection_service.check_recipient(request)
