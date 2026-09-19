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
