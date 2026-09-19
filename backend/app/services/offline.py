import time
import logging
from app.models.offline import OfflinePayload, OfflineTxState
from app.services.blockchain.service import BlockchainService
from app.models.blockchain import BlockchainTransaction, TransactionState

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
            
        # 4. Cryptographic Verification (Prevent Man-in-the-Middle)
        # In a real environment, we would use eth_account or secp256k1 to recover the public address from the ECDSA signature
        # and verify it strictly matches payload.sender.
        # For this hackathon/simulation, we verify that the signature deterministically binds the core elements.
        import hashlib
        expected_hash_bytes = hashlib.sha256(f"{payload.sender}-{payload.recipient}-{payload.amount}-{payload.nonce}".encode()).digest()
        expected_hex = "0x" + expected_hash_bytes.hex()
        
        if payload.signature != expected_hex:
            return False, OfflineTxState.INVALID_SIGNATURE, "Cryptographic signature verification failed. Possible Man-in-the-Middle payload tampering detected."
            
        return True, OfflineTxState.QUEUED, "Payload is valid and ready for sync."

    def sync_transaction(self, payload: OfflinePayload) -> OfflineTxState:
        # Step 1: Verify
        is_valid, state, message = self.verify_payload(payload)
        
        if not is_valid:
            logger.warning(f"Offline sync failed for {payload.transaction_id}: {state.value}")
            if payload.transaction_id not in _transactions:
                _transactions[payload.transaction_id] = state
            return state
            
        # Record early state
        _transactions[payload.transaction_id] = state
            
        # Update nonce
        _sender_nonces[payload.sender] = payload.nonce
        
        # Step 2: Syncing
        _transactions[payload.transaction_id] = OfflineTxState.SYNCING
        
        # Step 3: Ready for Broadcast
        _transactions[payload.transaction_id] = OfflineTxState.READY_FOR_BROADCAST
        
        # Step 4: Integration with Existing Blockchain Adapter
        try:
            blockchain_svc = BlockchainService().get_adapter(payload.chain)
            
            # Construct standard blockchain tx model
            bc_tx = BlockchainTransaction(
                id=payload.transaction_id,
                payment_id=f"pay_{payload.transaction_id}",
                chain=payload.chain,
                asset=payload.currency,
                sender=payload.sender,
                recipient=payload.recipient,
                amount=payload.amount,
                network_fee=0.0,
                status=TransactionState.SIGNED # Must be SIGNED for the adapter to accept it
            )
            
            _transactions[payload.transaction_id] = OfflineTxState.BROADCAST
            
            # Hand off to existing adapter!
            broadcast_result = blockchain_svc.broadcast_transaction(bc_tx)
            
            if broadcast_result.status == TransactionState.CONFIRMED:
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
