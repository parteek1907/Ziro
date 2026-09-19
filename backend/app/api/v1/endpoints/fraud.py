from fastapi import APIRouter
from app.models.fraud import FraudAnalysisRequest, FraudAnalysisResponse
from app.services.fraud_detector import fraud_detector

router = APIRouter()

@router.post("/analyze", response_model=FraudAnalysisResponse)
async def analyze_fraud(request: FraudAnalysisRequest):
    """
    AI Scam & Fraud Detector.
    Analyzes text (and optionally images) for phishing, urgency manipulation, and social engineering.
    Returns a structured risk assessment.
    """
    return fraud_detector.analyze(request)
