from fastapi import APIRouter, Depends, HTTPException
from app.models.identity import User, FinancialProfile, FinancialProfileUpdate
from app.models.dashboard import DashboardStats, DashboardActivity
from app.api.deps import get_current_user
from app.services.identity import identity_service
from app.db.mock_db import mock_db
from app.services.trustscore import trustscore_service

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

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(current_user: User = Depends(get_current_user)):
    # Calculate mock trust score
    trust_data = trustscore_service.calculate_score(current_user.id)
    trust_score_display = str(trust_data.score) if trust_data else "850"

    # Compile recent activity matching UI screenshot
    recent_activity = [
        DashboardActivity(type="Settlement", transaction="Maria Garcia", route="USD -> MXN", time="12 mins ago", status="Completed"),
        DashboardActivity(type="Transfer", transaction="James Wilson", route="USD -> INR", time="34 mins ago", status="Completed"),
        DashboardActivity(type="Payment", transaction="L2 Wallet", route="USD -> KES", time="1 hour ago", status="Pending"),
        DashboardActivity(type="Transfer", transaction="Amara", route="USD -> KES", time="2 hours ago", status="Completed")
    ]
    
    return DashboardStats(
        total_balance="$12,450.00",
        trust_score=trust_score_display,
        global_transfers=12,
        recent_activity=recent_activity
    )
