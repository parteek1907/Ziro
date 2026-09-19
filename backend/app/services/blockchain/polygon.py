from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter
import logging

logger = logging.getLogger(__name__)

class PolygonAdapter(ChainAdapter):
    """
    Polygon (Amoy/Mumbai) adapter ready for Testnet integration.
    WARNING: TESTNET/SIMULATION ONLY. No real-money mainnet.
    """

    def validate_address(self, address: str) -> bool:
        logger.info("[Polygon Testnet] Validating address")
        return address.startswith("0x") and len(address) == 42

    def estimate_fee(self) -> float:
        logger.info("[Polygon Testnet] Estimating fee")
        return 0.005 # Mock MATIC fee

    def create_transaction(self, payment_id: str, sender: str, recipient: str, amount: float, asset: str) -> BlockchainTransaction:
        logger.info(f"[Polygon Testnet] Creating transaction for {payment_id}")
        return BlockchainTransaction(
            id="poly-mock-id",
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
        logger.info("[Polygon Testnet] Signing transaction (mocked)")
        tx.status = TransactionState.SIGNED
        return tx

    def broadcast_transaction(self, tx: BlockchainTransaction) -> BlockchainTransaction:
        logger.info("[Polygon Testnet] Broadcasting transaction (mocked)")
        tx.status = TransactionState.FAILED
        tx.tx_hash = "failed-polygon-hash"
        return tx

    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        logger.info("[Polygon Testnet] Getting transaction status")
        return TransactionState.FAILED

    def verify_transaction(self, tx_hash: str) -> bool:
        return False

    def get_balance(self, address: str, asset: str) -> float:
        logger.info(f"[Polygon Testnet] Fetching testnet balance for {address}")
        return 1000.0
