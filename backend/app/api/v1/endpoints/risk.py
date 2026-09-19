from fastapi import APIRouter
from app.models.risk import RiskAnalysisRequest, RiskAnalysisResponse
from app.services.risk import ai_firewall

router = APIRouter()

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_payment_risk(request: RiskAnalysisRequest):
    return ai_firewall.analyze(request)
