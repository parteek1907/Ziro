from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter
import logging

logger = logging.getLogger(__name__)

class StellarAdapter(ChainAdapter):
    """
    Stellar adapter ready for Testnet integration.
    WARNING: TESTNET/SIMULATION ONLY. No real-money mainnet.
    """

    def validate_address(self, address: str) -> bool:
        # Placeholder for stellar-sdk Keypair.from_public_key validation
        logger.info("[Stellar Testnet] Validating address")
        return address.startswith("G")

    def estimate_fee(self) -> float:
        logger.info("[Stellar Testnet] Estimating fee")
        return 0.00001 # 100 stroops typically

    def create_transaction(self, payment_id: str, sender: str, recipient: str, amount: float, asset: str) -> BlockchainTransaction:
        logger.info(f"[Stellar Testnet] Creating transaction for {payment_id}")
        return BlockchainTransaction(
            id="stlr-mock-id",
            payment_id=payment_id,
            chain="stellar",
            asset=asset,
            sender=sender,
            recipient=recipient,
            amount=amount,
            network_fee=self.estimate_fee(),
            status=TransactionState.CREATED
        )

    def sign_transaction(self, tx: BlockchainTransaction, private_key: str) -> BlockchainTransaction:
        logger.info("[Stellar Testnet] Signing transaction (mocked)")
        tx.status = TransactionState.SIGNED
        return tx

    def broadcast_transaction(self, tx: BlockchainTransaction) -> BlockchainTransaction:
        logger.info("[Stellar Testnet] Broadcasting transaction (mocked)")
        tx.status = TransactionState.FAILED # Ensure explicit fallback behavior if no real credentials are provided
        tx.tx_hash = "failed-stellar-hash"
        return tx

    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        logger.info("[Stellar Testnet] Getting transaction status")
        return TransactionState.FAILED

    def verify_transaction(self, tx_hash: str) -> bool:
        return False

    def get_balance(self, address: str, asset: str) -> float:
        logger.info(f"[Stellar Testnet] Fetching testnet balance for {address}")
        return 1000.0
