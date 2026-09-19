from typing import List
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
