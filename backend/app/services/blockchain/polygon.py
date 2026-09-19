from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter
from app.core.config import settings
from web3 import Web3
from web3.exceptions import Web3Exception
import logging
import time

logger = logging.getLogger(__name__)

class PolygonAdapter(ChainAdapter):
    """
    Polygon (Amoy) adapter connecting via Web3.py.
    Used for live testnet transactions.
    """
    
    def __init__(self):
        self.rpc_url = settings.POLYGON_RPC_URL
        if self.rpc_url:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        else:
            self.w3 = None
            logger.warning("[Polygon Testnet] No RPC URL configured. Polygon adapter will fail.")

    def validate_address(self, address: str) -> bool:
        if not self.w3:
            # Fallback for tests if no RPC
            return address.startswith("0x") and len(address) == 42
        return self.w3.is_address(address)

    def estimate_fee(self) -> float:
        if not self.w3:
            return 0.005 # Mock MATIC fee
        
        try:
            gas_price = self.w3.eth.gas_price
            # Standard MATIC transfer is 21000 gas
            estimated_fee = self.w3.from_wei(gas_price * 21000, 'ether')
            return float(estimated_fee)
        except Exception as e:
            logger.error(f"[Polygon Testnet] Fee estimation failed: {e}")
            return 0.01

    def create_transaction(self, payment_id: str, sender: str, recipient: str, amount: float, asset: str) -> BlockchainTransaction:
        logger.info(f"[Polygon Testnet] Creating transaction for {payment_id}")
        return BlockchainTransaction(
            id=f"poly-{payment_id}",
            payment_id=payment_id,
            chain="polygon",
            asset=asset,
            sender=sender,
            recipient=recipient,
            amount=amount,
            network_fee=self.estimate_fee(),
            status=TransactionState.CREATED
        )

    def sign_transaction(self, tx: BlockchainTransaction, private_key: str) -> BlockchainTransaction:
        if not self.w3:
            tx.status = TransactionState.FAILED
            logger.error("[Polygon Testnet] No Web3 provider configured.")
            return tx
            
        try:
            # Prepare transaction dict
            nonce = self.w3.eth.get_transaction_count(tx.sender)
            
            tx_dict = {
                'nonce': nonce,
                'to': tx.recipient,
                'value': self.w3.to_wei(tx.amount, 'ether'),
                'gas': 21000, # Hardcoded for native MATIC transfer
                'gasPrice': self.w3.eth.gas_price,
                'chainId': 80002 # Polygon Amoy Chain ID
            }
            
            signed_txn = self.w3.eth.account.sign_transaction(tx_dict, private_key=private_key)
            tx.raw_tx = signed_txn.raw_transaction.hex()
            tx.status = TransactionState.SIGNED
            logger.info(f"[Polygon Testnet] Transaction signed successfully for {tx.id}")
            
        except Exception as e:
            logger.error(f"[Polygon Testnet] Failed to sign transaction: {e}")
            tx.status = TransactionState.FAILED
            
        return tx

    def broadcast_transaction(self, tx: BlockchainTransaction) -> BlockchainTransaction:
        if not self.w3 or not hasattr(tx, 'raw_tx'):
            tx.status = TransactionState.FAILED
            return tx
            
        try:
            tx_hash = self.w3.eth.send_raw_transaction(tx.raw_tx)
            tx.tx_hash = tx_hash.hex()
            tx.status = TransactionState.PENDING
            logger.info(f"[Polygon Testnet] Transaction broadcasted. Hash: {tx.tx_hash}")
        except ValueError as e:
            # Often happens if insufficient funds or nonce reuse
            logger.error(f"[Polygon Testnet] Broadcast rejected: {e}")
            tx.status = TransactionState.FAILED
        except Exception as e:
            logger.error(f"[Polygon Testnet] Broadcast failed: {e}")
            tx.status = TransactionState.FAILED
            
        return tx

    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        if not self.w3:
            return TransactionState.FAILED
            
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            if receipt is None:
                return TransactionState.PENDING
            
            if receipt.status == 1:
                return TransactionState.SETTLED
            else:
                return TransactionState.FAILED
        except Web3Exception:
            # If not found yet, it's pending
            return TransactionState.PENDING
        except Exception as e:
            logger.error(f"[Polygon Testnet] Error fetching receipt for {tx_hash}: {e}")
            return TransactionState.FAILED

    def verify_transaction(self, tx_hash: str) -> bool:
        status = self.get_transaction_status(tx_hash)
        return status == TransactionState.SETTLED

    def get_balance(self, address: str, asset: str) -> float:
        if not self.w3:
            return 0.0
            
        try:
            balance_wei = self.w3.eth.get_balance(address)
            return float(self.w3.from_wei(balance_wei, 'ether'))
        except Exception as e:
            logger.error(f"[Polygon Testnet] Failed to fetch balance for {address}: {e}")
            return 0.0
