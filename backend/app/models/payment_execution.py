from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class PaymentState(str, Enum):
    CREATED = "CREATED"
    VALIDATING = "VALIDATING"
    RISK_CHECK_PENDING = "RISK_CHECK_PENDING"
    RISK_APPROVED = "RISK_APPROVED"
    AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION"
    TRANSACTION_CREATED = "TRANSACTION_CREATED"
    SIGNED = "SIGNED"
    BROADCAST = "BROADCAST"
    CONFIRMING = "CONFIRMING"
    SETTLED = "SETTLED"
    # Failure states
    RISK_REJECTED = "RISK_REJECTED"
    CANCELLED = "CANCELLED"
    BROADCAST_FAILED = "BROADCAST_FAILED"
    CONFIRMATION_FAILED = "CONFIRMATION_FAILED"
    EXPIRED = "EXPIRED"

class PaymentRecord(BaseModel):
    payment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    idempotency_key: str
    user_id: str
    
    # Intent and target
    payment_intent: str
    sender_address: str
    recipient_address: str
    amount: float
    currency: str
    chain: str
    
    # State tracking
    state: PaymentState = PaymentState.CREATED
    
    # Blockchain execution tracking
    blockchain_tx_id: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    network_fee: Optional[float] = None
    
    # Timestamps
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    settled_at: Optional[str] = None
    
    # Audit log
    audit_trail: List[str] = Field(default_factory=list)

    def log_audit(self, message: str):
        self.audit_trail.append(f"[{datetime.utcnow().isoformat()}] {message}")
        self.updated_at = datetime.utcnow().isoformat() + "Z"

class PaymentCreateRequest(BaseModel):
    idempotency_key: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "test_user_01"
    payment_intent: str = "transfer"
    sender_address: str = "0xYourWalletAddress"
    recipient_address: str
    amount: float
    currency: str = "USD"
    chain: str = "simulation"
