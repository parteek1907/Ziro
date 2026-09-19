from fastapi import APIRouter
from app.models.trustscore import TrustScoreResponse
from app.services.trustscore import trustscore_service
from pydantic import BaseModel

router = APIRouter()

class TrustScoreCalculateRequest(BaseModel):
    user_id: str

@router.post("/calculate", response_model=TrustScoreResponse)
async def calculate_trustscore(request: TrustScoreCalculateRequest):
    return trustscore_service.calculate_score(request.user_id)

@router.get("/{user_id}", response_model=TrustScoreResponse)
async def get_trustscore(user_id: str):
    return trustscore_service.calculate_score(user_id)

@router.get("/{user_id}/explanation")
async def get_trustscore_explanation(user_id: str):
    score_data = trustscore_service.calculate_score(user_id)
    return {"explanation": score_data.explanation, "factors": [f.model_dump() for f in score_data.factors]}
