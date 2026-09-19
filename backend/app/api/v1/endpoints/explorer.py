from fastapi import APIRouter
from app.db.mock_db import mock_db
from pydantic import BaseModel
from typing import List
import hashlib

router = APIRouter()

class ExplorerTransaction(BaseModel):
    tx_hash: str
    block_number: int
    from_address: str
    to_address: str
    amount: float
    currency: str
    status: str
    timestamp: str

def encrypt_hash(address: str) -> str:
    """Simulates an encrypted blockchain hash for the UI."""
    return "0x" + hashlib.sha256(address.encode()).hexdigest()[:40]

@router.get("/transactions", response_model=List[ExplorerTransaction])
async def get_explorer_transactions():
    """
    Returns a mock blockchain explorer view of all transactions.
    Addresses are hashed to simulate privacy/encryption.
    """
    transactions = []
    block_counter = 14502000
    
    # Sort payments by created_at descending (newest first)
    sorted_payments = sorted(mock_db.payments.values(), key=lambda p: p.created_at, reverse=True)
    
    for p in sorted_payments:
        tx_hash = p.blockchain_tx_hash if p.blockchain_tx_hash else f"0x{hashlib.sha256(p.payment_id.encode()).hexdigest()[:64]}"
        
        transactions.append(
            ExplorerTransaction(
                tx_hash=tx_hash,
                block_number=block_counter,
                from_address=encrypt_hash(p.sender_address),
                to_address=encrypt_hash(p.recipient_address),
                amount=p.amount,
                currency=p.currency,
                status=p.state.value,
                timestamp=p.created_at
            )
        )
        block_counter -= 1
        
    return transactions
