import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/identity.py": """from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class User(BaseModel):
    id: str
    firebase_uid: str
    email: str
    display_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialProfile(BaseModel):
    user_id: str
    preferred_currency: str = "USD"
    country: str = "US"
    financial_goals: str = ""
    risk_preferences: str = "moderate"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialProfileUpdate(BaseModel):
    preferred_currency: Optional[str] = None
    country: Optional[str] = None
    financial_goals: Optional[str] = None
    risk_preferences: Optional[str] = None
""",
    "app/models/wallet.py": """from datetime import datetime
from pydantic import BaseModel, Field

class Wallet(BaseModel):
    id: str
    user_id: str
    chain: str
    public_address: str
    wallet_type: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WalletCreate(BaseModel):
    chain: str
    public_address: str
    wallet_type: str = "externally_owned"
""",
    "app/services/identity.py": """from typing import Optional, Dict
from app.models.identity import User, FinancialProfile, FinancialProfileUpdate
from datetime import datetime

class IdentityService:
    def __init__(self):
        self._users: Dict[str, User] = {}
        self._profiles: Dict[str, FinancialProfile] = {}
        
        # Seed a test user
        self._seed_test_user()

    def _seed_test_user(self):
        test_user_id = "test-user-123"
        self._users[test_user_id] = User(
            id=test_user_id,
            firebase_uid="firebase-test-123",
            email="test@ziro.app",
            display_name="Test User"
        )
        self._profiles[test_user_id] = FinancialProfile(
            user_id=test_user_id,
            preferred_currency="USD",
            country="US"
        )

    def get_user(self, user_id: str) -> Optional[User]:
        return self._users.get(user_id)

    def get_profile(self, user_id: str) -> Optional[FinancialProfile]:
        return self._profiles.get(user_id)

    def update_profile(self, user_id: str, update_data: FinancialProfileUpdate) -> Optional[FinancialProfile]:
        profile = self._profiles.get(user_id)
        if not profile:
            return None
            
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(profile, key, value)
            
        profile.updated_at = datetime.utcnow()
        return profile

identity_service = IdentityService()
""",
    "app/services/wallet.py": """from typing import List, Dict, Optional
import uuid
from app.models.wallet import Wallet, WalletCreate
from app.services.blockchain.service import BlockchainService

blockchain_service = BlockchainService()

class WalletService:
    def __init__(self):
        self._wallets: Dict[str, Wallet] = {}

    def create_wallet(self, user_id: str, data: WalletCreate) -> Wallet:
        # Validate address using blockchain adapter
        adapter = blockchain_service.get_adapter(data.chain)
        if not adapter.validate_address(data.public_address):
            raise ValueError(f"Invalid {data.chain} address format")

        wallet_id = str(uuid.uuid4())
        wallet = Wallet(
            id=wallet_id,
            user_id=user_id,
            chain=data.chain.lower(),
            public_address=data.public_address,
            wallet_type=data.wallet_type,
            is_verified=True # Auto-verify in simulation
        )
        
        self._wallets[wallet_id] = wallet
        return wallet

    def get_wallets_for_user(self, user_id: str) -> List[Wallet]:
        return [w for w in self._wallets.values() if w.user_id == user_id]

    def get_wallet(self, wallet_id: str, user_id: str) -> Optional[Wallet]:
        wallet = self._wallets.get(wallet_id)
        if wallet and wallet.user_id == user_id:
            return wallet
        return None

wallet_service = WalletService()
""",
    "app/api/deps.py": """from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.identity import User
from app.services.identity import identity_service

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> User:
    # MOCK implementation: Always return the test user for testnet/simulation hackathon mode
    test_user = identity_service.get_user("test-user-123")
    if not test_user:
        raise HTTPException(status_code=401, detail="Test user not found")
    return test_user
""",
    "app/api/v1/endpoints/users.py": """from fastapi import APIRouter, Depends
from app.models.identity import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
""",
    "app/api/v1/endpoints/profile.py": """from fastapi import APIRouter, Depends, HTTPException
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
""",
    "app/api/v1/endpoints/wallets.py": """from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.models.identity import User
from app.models.wallet import Wallet, WalletCreate
from app.api.deps import get_current_user
from app.services.wallet import wallet_service

router = APIRouter()

@router.post("", response_model=Wallet)
async def create_wallet(
    data: WalletCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        wallet = wallet_service.create_wallet(current_user.id, data)
        return wallet
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[Wallet])
async def list_wallets(current_user: User = Depends(get_current_user)):
    return wallet_service.get_wallets_for_user(current_user.id)

@router.get("/{wallet_id}", response_model=Wallet)
async def get_wallet(wallet_id: str, current_user: User = Depends(get_current_user)):
    wallet = wallet_service.get_wallet(wallet_id, current_user.id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet
""",
    "tests/api/test_identity.py": """import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_user_me(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@ziro.app"

@pytest.mark.asyncio
async def test_get_profile(async_client: AsyncClient):
    response = await async_client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["preferred_currency"] == "USD"

@pytest.mark.asyncio
async def test_patch_profile(async_client: AsyncClient):
    response = await async_client.patch(
        "/api/v1/profile", 
        json={"financial_goals": "Buy a house"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["financial_goals"] == "Buy a house"
""",
    "tests/api/test_wallets.py": """import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_wallet_success(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/wallets",
        json={"chain": "simulation", "public_address": "0x1234567890abcdef"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["chain"] == "simulation"
    assert data["is_verified"] == True

@pytest.mark.asyncio
async def test_create_wallet_invalid_address(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/wallets",
        json={"chain": "polygon", "public_address": "invalid_address"}
    )
    assert response.status_code == 400
    assert "Invalid polygon address format" in response.json()["detail"]

@pytest.mark.asyncio
async def test_list_wallets(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/wallets",
        json={"chain": "simulation", "public_address": "0x1234567890abcdef"}
    )
    
    response = await async_client.get("/api/v1/wallets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[-1]["public_address"] == "0x1234567890abcdef"
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Identity and Wallet files generated.")
