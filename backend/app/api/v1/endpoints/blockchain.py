from fastapi import APIRouter, HTTPException, Query
from app.services.blockchain.service import blockchain_service
from app.models.blockchain import BlockchainTransaction, TransactionState

router = APIRouter()

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
async def get_balance(
    address: str,
    chain: str = Query("simulation", description="Target blockchain (default: simulation)"),
    asset: str = Query("USD", description="Asset ticker (USD, USDC, etc.)")
):
    try:
        adapter = blockchain_service.get_adapter(chain)
        if chain.lower() != "simulation" and not adapter.validate_address(address):
            raise HTTPException(status_code=400, detail="Invalid address for the specified chain")
            
        balance = adapter.get_balance(address, asset)
        return {
            "address": address,
            "wallet_address": address,
            "chain": chain,
            "asset": asset,
            "balance": balance,
            "formatted": f"${balance:,.2f}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
