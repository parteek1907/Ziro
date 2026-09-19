from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class UserOperation(BaseModel):
    sender: str
    nonce: str
    initCode: str
    callData: str
    callGasLimit: str
    verificationGasLimit: str
    preVerificationGas: str
    maxFeePerGas: str
    maxPriorityFeePerGas: str
    paymasterAndData: str
    signature: str

class ConstructUserOpRequest(BaseModel):
    recipient_address: str
    amount: str
    token_address: Optional[str] = None
    sender_address: str

class ConstructUserOpResponse(BaseModel):
    user_op: UserOperation
    user_op_hash: str

class PaymasterSponsorRequest(BaseModel):
    user_op: UserOperation

class PaymasterSponsorResponse(BaseModel):
    paymasterAndData: str
    sponsor_status: str
