from fastapi import APIRouter
from app.models.trustscore import CredentialGenerateRequest, CredentialVerifyRequest, CredentialPrototypeResponse, CredentialVerifyResult
from app.services.credentials import credential_service

router = APIRouter()

@router.post("/generate", response_model=CredentialPrototypeResponse)
async def generate_credential(request: CredentialGenerateRequest):
    return credential_service.generate_credential(request)

@router.post("/verify", response_model=CredentialVerifyResult)
async def verify_credential(request: CredentialVerifyRequest):
    return credential_service.verify_credential(request.proof_payload)

@router.get("/{user_id}", response_model=CredentialPrototypeResponse)
async def get_credential_default(user_id: str):
    # Generates a default eligibility proof against a baseline 600 score for quick fetching
    req = CredentialGenerateRequest(user_id=user_id, minimum_required_score=600)
    return credential_service.generate_credential(req)
