from enum import Enum
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
