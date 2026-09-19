from fastapi import APIRouter, HTTPException
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
