from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TransactionState(str, Enum):
    CREATED = "CREATED"
    SIGNED = "SIGNED"
    BROADCAST = "BROADCAST"
    CONFIRMING = "CONFIRMING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"

class BlockchainTransaction(BaseModel):
    id: str
    payment_id: str
    chain: str
    asset: str
    sender: str
    recipient: str
    amount: float
    network_fee: float
    tx_hash: Optional[str] = None
    status: TransactionState = TransactionState.CREATED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
