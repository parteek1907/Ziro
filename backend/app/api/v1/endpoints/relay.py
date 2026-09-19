from fastapi import APIRouter, Request, Response
from app.utils.compression import decompress_payload
from app.services.offline import offline_engine
from app.models.offline import OfflineTxState
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/twilio")
async def twilio_sms_webhook(request: Request):
    """
    Edge Gateway for Offline Vault.
    Receives SMS payloads from Twilio, decompresses the Base85 string, validates cryptographically, 
    and forwards to the smart contract wallet relay.
    """
    form_data = await request.form()
    sender_phone = form_data.get("From", "")
    sms_body = form_data.get("Body", "").strip()
    
    logger.info(f"Received Offline SMS Relay from {sender_phone}")
    
    try:
        # 1. Decompress Base85 string into strictly typed OfflinePayload
        payload = decompress_payload(sms_body)
        
        # 2. Hand off to the Offline Engine for Nonce & Cryptographic Verification and Broadcast
        final_state = offline_engine.sync_transaction(payload)
        
        # 3. Construct SMS Response
        if final_state in [OfflineTxState.SETTLED, OfflineTxState.BROADCAST, OfflineTxState.QUEUED, OfflineTxState.READY_FOR_BROADCAST, OfflineTxState.SYNCING]:
            message = f"Ziro: TX {payload.transaction_id[:8]} SUCCESS. Amount: {payload.amount} {payload.currency} sent."
        elif final_state == OfflineTxState.INVALID_SIGNATURE:
            message = "Ziro: ERROR. Cryptographic verification failed. Payload may be tampered."
        elif final_state == OfflineTxState.DUPLICATE:
            message = "Ziro: ERROR. Duplicate transaction or used nonce."
        else:
            message = f"Ziro: ERROR. Status: {final_state.value}"
            
    except ValueError as e:
        logger.error(f"Failed to decompress SMS payload: {e}")
        message = "Ziro: ERROR. Unrecognized payload format. Ensure your Ziro Vault app is up to date."
    except Exception as e:
        logger.error(f"Unknown error processing SMS: {e}")
        message = "Ziro: ERROR. System failure. Try again later."

    # Return standard TwiML XML Response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""

    return Response(content=twiml_response, media_type="application/xml")
