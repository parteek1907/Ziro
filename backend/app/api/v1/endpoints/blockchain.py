from fastapi import APIRouter, HTTPException, Query
from app.services.blockchain.service import BlockchainService
from app.models.blockchain import BlockchainTransaction, TransactionState

router = APIRouter()
blockchain_service = BlockchainService()

@router.get("/estimate-fee")
async def estimate_fee(chain: str = Query(..., description="Target blockchain (e.g., simulation, stellar, polygon)")):
    try:
        adapter = blockchain_service.get_adapter(chain)
        fee = adapter.estimate_fee()
        return {"chain": chain, "estimated_fee": fee}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transaction/{tx_hash}")
async def get_transaction(tx_hash: str, chain: str = Query(..., description="Target blockchain")):
    try:
        adapter = blockchain_service.get_adapter(chain)
        status = adapter.get_transaction_status(tx_hash)
        return {"tx_hash": tx_hash, "chain": chain, "status": status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/balance/{address}")
async def get_balance(address: str, chain: str = Query(..., description="Target blockchain"), asset: str = Query("USD", description="Asset ticker")):
    try:
        adapter = blockchain_service.get_adapter(chain)
        if not adapter.validate_address(address):
            raise HTTPException(status_code=400, detail="Invalid address for the specified chain")
            
        balance = adapter.get_balance(address, asset)
        return {"address": address, "chain": chain, "asset": asset, "balance": balance}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

import hashlib
from app.schemas.blockchain import (
    ConstructUserOpRequest, ConstructUserOpResponse, UserOperation,
    PaymasterSponsorRequest, PaymasterSponsorResponse
)

# Dummy Paymaster address for simulation
ZIRO_PAYMASTER_ADDRESS = "0xZiroPaymaster0000000000000000000000000000"

@router.post("/user-op/construct", response_model=ConstructUserOpResponse)
async def construct_user_op(request: ConstructUserOpRequest):
    """
    Constructs an ERC-4337 UserOperation for the client to sign.
    """
    dummy_op = UserOperation(
        sender=request.sender_address,
        nonce="0x1",
        initCode="0x",
        callData=f"0xTransferTo{request.recipient_address}Amount{request.amount}",
        callGasLimit="0x5208", # 21000
        verificationGasLimit="0x186a0", # 100000
        preVerificationGas="0x5208", # 21000
        maxFeePerGas="0x3b9aca00", # 1 gwei
        maxPriorityFeePerGas="0x3b9aca00",
        paymasterAndData="0x", # Unsigned
        signature="0x" # Unsigned
    )
    
    op_hash = hashlib.sha256(str(dummy_op.model_dump()).encode()).hexdigest()
    
    return ConstructUserOpResponse(
        user_op=dummy_op,
        user_op_hash=f"0x{op_hash}"
    )

@router.post("/paymaster/sponsor", response_model=PaymasterSponsorResponse)
async def sponsor_user_op(request: PaymasterSponsorRequest):
    """
    Paymaster validates the UserOperation and signs the paymasterAndData.
    """
    dummy_signature = hashlib.sha256(b"ziro_sponsor").hexdigest()
    paymaster_and_data = f"{ZIRO_PAYMASTER_ADDRESS}{dummy_signature}"
    
    return PaymasterSponsorResponse(
        paymasterAndData=paymaster_and_data,
        sponsor_status="APPROVED"
    )
