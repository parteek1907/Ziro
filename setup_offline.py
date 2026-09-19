import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/offline.py": """from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class OfflineTxState(str, Enum):
    CREATED = "CREATED"
    SIGNED_OFFLINE = "SIGNED_OFFLINE"
    QUEUED = "QUEUED"
    SYNCING = "SYNCING"
    READY_FOR_BROADCAST = "READY_FOR_BROADCAST"
    BROADCAST = "BROADCAST"
    CONFIRMING = "CONFIRMING"
    SETTLED = "SETTLED"
    INVALID_SIGNATURE = "INVALID_SIGNATURE"
    EXPIRED = "EXPIRED"
    DUPLICATE = "DUPLICATE"
    SYNC_FAILED = "SYNC_FAILED"
    BROADCAST_FAILED = "BROADCAST_FAILED"
    CONFIRMATION_FAILED = "CONFIRMATION_FAILED"

class OfflinePayload(BaseModel):
    transaction_id: str = Field(..., description="Unique ID for the transaction")
    sender: str = Field(..., description="Sender public address")
    recipient: str = Field(..., description="Recipient public address")
    amount: float = Field(..., gt=0, description="Amount to send")
    currency: str = Field(..., description="Currency symbol")
    chain: str = Field(..., description="Target blockchain")
    nonce: int = Field(..., ge=0, description="Unique strictly increasing number per sender")
    created_at: int = Field(..., description="UNIX timestamp of creation")
    expires_at: int = Field(..., description="UNIX timestamp of expiry")
    payment_intent: str = Field(default="", description="Context of the payment")
    signature: str = Field(..., description="Cryptographic signature of the payload")

class OfflineSyncRequest(BaseModel):
    payload: OfflinePayload

class OfflineSyncResponse(BaseModel):
    transaction_id: str
    state: OfflineTxState
    message: str

class OfflineVerifyResponse(BaseModel):
    is_valid: bool
    state: OfflineTxState
    message: str

class OfflineStatusResponse(BaseModel):
    transaction_id: str
    state: OfflineTxState
""",
    "app/services/offline.py": """import time
import logging
from app.models.offline import OfflinePayload, OfflineTxState
from app.services.blockchain import get_blockchain_service
from app.models.blockchain import BlockchainTransaction, TransactionStatus

logger = logging.getLogger(__name__)

# In-memory storage for hackathon simulation
_transactions = {}
_sender_nonces = {}

class OfflinePaymentEngine:
    
    def verify_payload(self, payload: OfflinePayload) -> tuple[bool, OfflineTxState, str]:
        current_time = int(time.time())
        
        # 1. Check Expiry
        if payload.expires_at < current_time:
            return False, OfflineTxState.EXPIRED, "Transaction has expired."
            
        # 2. Replay Protection (Duplicate TX)
        if payload.transaction_id in _transactions:
            return False, OfflineTxState.DUPLICATE, "Duplicate transaction ID."
            
        # 3. Replay Protection (Nonce)
        last_nonce = _sender_nonces.get(payload.sender, -1)
        if payload.nonce <= last_nonce:
            return False, OfflineTxState.DUPLICATE, f"Nonce {payload.nonce} has already been used by sender."
            
        # 4. Signature Verification (Mock)
        # In production, verify ECDSA signature of the payload bytes
        if not payload.signature.startswith("0xvalid_sig_"):
            return False, OfflineTxState.INVALID_SIGNATURE, "Cryptographic signature verification failed."
            
        return True, OfflineTxState.QUEUED, "Payload is valid and ready for sync."

    def sync_transaction(self, payload: OfflinePayload) -> OfflineTxState:
        # Step 1: Verify
        is_valid, state, message = self.verify_payload(payload)
        
        # Save state early
        _transactions[payload.transaction_id] = state
        
        if not is_valid:
            logger.warning(f"Offline sync failed for {payload.transaction_id}: {state.value}")
            return state
            
        # Update nonce
        _sender_nonces[payload.sender] = payload.nonce
        
        # Step 2: Syncing
        _transactions[payload.transaction_id] = OfflineTxState.SYNCING
        
        # Step 3: Ready for Broadcast
        _transactions[payload.transaction_id] = OfflineTxState.READY_FOR_BROADCAST
        
        # Step 4: Integration with Existing Blockchain Adapter
        try:
            blockchain_svc = get_blockchain_service(payload.chain)
            
            # Construct standard blockchain tx model
            bc_tx = BlockchainTransaction(
                id=payload.transaction_id,
                amount=payload.amount,
                currency=payload.currency,
                to_address=payload.recipient,
                status=TransactionStatus.SIGNED # Must be SIGNED for the adapter to accept it
            )
            
            _transactions[payload.transaction_id] = OfflineTxState.BROADCAST
            
            # Hand off to existing adapter!
            broadcast_result = blockchain_svc.broadcast_transaction(bc_tx)
            
            if broadcast_result.status == TransactionStatus.CONFIRMED:
                _transactions[payload.transaction_id] = OfflineTxState.SETTLED
            else:
                _transactions[payload.transaction_id] = OfflineTxState.CONFIRMATION_FAILED
                
        except Exception as e:
            logger.error(f"Blockchain broadcast failed: {e}")
            _transactions[payload.transaction_id] = OfflineTxState.BROADCAST_FAILED
            
        return _transactions[payload.transaction_id]

    def get_transaction_state(self, transaction_id: str) -> OfflineTxState:
        if transaction_id not in _transactions:
            raise KeyError("Transaction not found")
        return _transactions[transaction_id]

offline_engine = OfflinePaymentEngine()
""",
    "app/api/v1/endpoints/offline.py": """from fastapi import APIRouter, HTTPException
from app.models.offline import OfflineSyncRequest, OfflineSyncResponse, OfflineVerifyResponse, OfflineStatusResponse
from app.services.offline import offline_engine

router = APIRouter()

@router.post("/verify", response_model=OfflineVerifyResponse)
async def verify_offline_payload(request: OfflineSyncRequest):
    is_valid, state, msg = offline_engine.verify_payload(request.payload)
    return OfflineVerifyResponse(
        is_valid=is_valid,
        state=state,
        message=msg
    )

@router.post("/sync", response_model=OfflineSyncResponse)
async def sync_offline_payload(request: OfflineSyncRequest):
    final_state = offline_engine.sync_transaction(request.payload)
    return OfflineSyncResponse(
        transaction_id=request.payload.transaction_id,
        state=final_state,
        message=f"Transaction synchronization completed with state: {final_state.value}"
    )

@router.get("/{transaction_id}", response_model=OfflineStatusResponse)
async def get_offline_status(transaction_id: str):
    try:
        state = offline_engine.get_transaction_state(transaction_id)
        return OfflineStatusResponse(transaction_id=transaction_id, state=state)
    except KeyError:
        raise HTTPException(status_code=404, detail="Transaction not found")
""",
    "tests/api/test_offline.py": """import time
import pytest
from httpx import AsyncClient

@pytest.fixture
def valid_payload():
    return {
        "transaction_id": "tx_offline_001",
        "sender": "0xSender123",
        "recipient": "0xRecipient456",
        "amount": 100.0,
        "currency": "USDC",
        "chain": "simulation",
        "nonce": 1,
        "created_at": int(time.time()),
        "expires_at": int(time.time()) + 3600,
        "payment_intent": "groceries",
        "signature": "0xvalid_sig_abc123"
    }

@pytest.mark.asyncio
async def test_offline_verify_valid(async_client: AsyncClient, valid_payload):
    # Just verify, don't sync
    valid_payload["transaction_id"] = "tx_offline_v1"
    response = await async_client.post(
        "/api/v1/offline/verify",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] == True
    assert data["state"] == "QUEUED"

@pytest.mark.asyncio
async def test_offline_sync_successful(async_client: AsyncClient, valid_payload):
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    # Should flow all the way to settled via the simulation blockchain adapter
    assert data["state"] == "SETTLED"

@pytest.mark.asyncio
async def test_offline_sync_duplicate_tx(async_client: AsyncClient, valid_payload):
    # Try to sync the EXACT same payload again
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "DUPLICATE"

@pytest.mark.asyncio
async def test_offline_sync_invalid_signature(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_sig_fail"
    valid_payload["signature"] = "0xfake_sig_xyz"
    
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "INVALID_SIGNATURE"

@pytest.mark.asyncio
async def test_offline_sync_expired(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_expired"
    valid_payload["expires_at"] = int(time.time()) - 3600 # Expired 1 hour ago
    
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "EXPIRED"

@pytest.mark.asyncio
async def test_offline_sync_nonce_reuse(async_client: AsyncClient, valid_payload):
    valid_payload["transaction_id"] = "tx_offline_nonce_reuse"
    # Same nonce '1' from sender '0xSender123'
    response = await async_client.post(
        "/api/v1/offline/sync",
        json={"payload": valid_payload}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "DUPLICATE"

@pytest.mark.asyncio
async def test_offline_status_get(async_client: AsyncClient):
    response = await async_client.get("/api/v1/offline/tx_offline_001")
    assert response.status_code == 200
    data = response.json()
    assert data["state"] == "SETTLED"
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Offline Payment Engine files generated.")
