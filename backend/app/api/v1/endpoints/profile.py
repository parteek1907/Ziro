from fastapi import APIRouter, Depends, HTTPException
from app.models.identity import User, FinancialProfile, FinancialProfileUpdate
from app.api.deps import get_current_user
from app.services.identity import identity_service

router = APIRouter()

@router.get("", response_model=FinancialProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = identity_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("", response_model=FinancialProfile)
async def update_profile(
    update_data: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    profile = identity_service.update_profile(current_user.id, update_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
