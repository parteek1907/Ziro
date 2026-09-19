import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/security.py": """from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class RecipientCheckStatus(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    BLOCKED = "BLOCKED"

class RecipientCheckRequest(BaseModel):
    user_id: str = Field(..., description="ID of the sender")
    recipient_address: str = Field(..., description="The wallet address to check")
    chain: str = Field(..., description="The target blockchain network")

class RecipientCheckResponse(BaseModel):
    status: RecipientCheckStatus
    risk_score: int = Field(..., ge=0, le=100)
    warnings: List[str] = Field(default_factory=list)
    matched_saved_address: bool = Field(..., description="True if an exact match was found in contacts")
""",
    "app/services/security.py": """import difflib
from app.models.security import RecipientCheckRequest, RecipientCheckResponse, RecipientCheckStatus

# Mock saved addresses for user_id 'user123'
SAVED_ADDRESSES = {
    "user123": [
        "0x1234567890abcdef1234567890abcdef12345678", # Polygon
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr" # Stellar
    ]
}

class AddressProtectionService:
    
    def _validate_format(self, address: str, chain: str) -> bool:
        if chain == "polygon":
            return address.startswith("0x") and len(address) == 42
        elif chain == "stellar":
            return address.startswith("G") and len(address) == 56
        elif chain == "simulation":
            return True
        return False
        
    def check_recipient(self, request: RecipientCheckRequest) -> RecipientCheckResponse:
        # 1. Format & Chain Validation
        if not self._validate_format(request.recipient_address, request.chain):
            return RecipientCheckResponse(
                status=RecipientCheckStatus.BLOCKED,
                risk_score=100,
                warnings=[f"Address format is invalid for chain: {request.chain}"],
                matched_saved_address=False
            )
            
        saved = SAVED_ADDRESSES.get(request.user_id, [])
        
        # 2. Exact Match Check
        if request.recipient_address in saved:
            return RecipientCheckResponse(
                status=RecipientCheckStatus.SAFE,
                risk_score=0,
                warnings=[],
                matched_saved_address=True
            )
            
        # 3. Similarity Check (Address Poisoning / Look-alike)
        highest_similarity = 0
        for saved_addr in saved:
            ratio = difflib.SequenceMatcher(None, request.recipient_address, saved_addr).ratio()
            if ratio > highest_similarity:
                highest_similarity = ratio
                
        if highest_similarity > 0.80:
            return RecipientCheckResponse(
                status=RecipientCheckStatus.BLOCKED,
                risk_score=95,
                warnings=["HIGH RISK: The recipient address is suspiciously similar to a saved contact. This resembles an Address Poisoning attack."],
                matched_saved_address=False
            )
            
        # 4. First-time Address Check (No match, no high similarity)
        return RecipientCheckResponse(
            status=RecipientCheckStatus.WARNING,
            risk_score=30,
            warnings=["First-time recipient. Please verify the address carefully before proceeding."],
            matched_saved_address=False
        )

address_protection_service = AddressProtectionService()
""",
    "app/api/v1/endpoints/security.py": """from fastapi import APIRouter
from app.models.security import RecipientCheckRequest, RecipientCheckResponse
from app.services.security import address_protection_service

router = APIRouter()

@router.post("/check-recipient", response_model=RecipientCheckResponse)
async def check_recipient(request: RecipientCheckRequest):
    return address_protection_service.check_recipient(request)
""",
    "tests/api/test_security.py": """import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_security_exact_match(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x1234567890abcdef1234567890abcdef12345678",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SAFE"
    assert data["matched_saved_address"] == True

@pytest.mark.asyncio
async def test_security_look_alike(async_client: AsyncClient):
    # Mutate the last few characters of the saved polygon address
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x1234567890abcdef1234567890abcdef12345000",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "BLOCKED"
    assert "Address Poisoning" in data["warnings"][0]
    assert data["matched_saved_address"] == False

@pytest.mark.asyncio
async def test_security_first_time(async_client: AsyncClient):
    # Completely different address
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "0x9999999999999999999999999999999999999999",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "WARNING"
    assert "First-time recipient" in data["warnings"][0]

@pytest.mark.asyncio
async def test_security_invalid_chain(async_client: AsyncClient):
    # Give a stellar address but say it's polygon
    response = await async_client.post(
        "/api/v1/security/check-recipient",
        json={
            "user_id": "user123",
            "recipient_address": "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr",
            "chain": "polygon"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "BLOCKED"
    assert "Address format is invalid" in data["warnings"][0]
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Wallet Address Protection files generated.")
