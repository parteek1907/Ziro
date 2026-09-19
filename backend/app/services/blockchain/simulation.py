import uuid
from datetime import datetime
from typing import Dict, Any
import hashlib
from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter

class SimulationAdapter(ChainAdapter):
    """
    A complete simulation adapter for testnet/simulation purposes only.
    No real money or mainnet interactions occur here.
    """
    
    def __init__(self):
        # In-memory store for simulated balances and tx statuses
        self._balances: Dict[str, Dict[str, float]] = {}
        self._transactions: Dict[str, TransactionState] = {}

    def validate_address(self, address: str) -> bool:
        if not address:
            return False
        addr = str(address).strip()
        return len(addr) >= 3

    def estimate_fee(self) -> float:
        return 0.001

    def create_transaction(self, payment_id: str, sender: str, recipient: str, amount: float, asset: str) -> BlockchainTransaction:
        if not self.validate_address(sender) or not self.validate_address(recipient):
            raise ValueError("Invalid sender or recipient address")
            
        fee = self.estimate_fee()
        tx = BlockchainTransaction(
            id=str(uuid.uuid4()),
            payment_id=payment_id,
            chain="simulation",
            asset=asset,
            sender=sender,
            recipient=recipient,
            amount=amount,
            network_fee=fee,
            status=TransactionState.CREATED
        )
        return tx

    def sign_transaction(self, tx: BlockchainTransaction, private_key: str) -> BlockchainTransaction:
        if tx.status != TransactionState.CREATED:
            raise ValueError("Transaction must be in CREATED state to be signed")
        
        tx.status = TransactionState.SIGNED
        return tx

    def broadcast_transaction(self, tx: BlockchainTransaction) -> BlockchainTransaction:
        if tx.status != TransactionState.SIGNED:
            raise ValueError("Transaction must be in SIGNED state to be broadcast")
            
        # Simulate network propagation and hash generation
        tx_hash_input = f"{tx.id}-{tx.sender}-{tx.recipient}-{tx.amount}-{datetime.utcnow().timestamp()}"
        tx.tx_hash = hashlib.sha256(tx_hash_input.encode()).hexdigest()
        
        # We automatically mark it as confirmed in simulation to avoid async polling for now
        tx.status = TransactionState.CONFIRMED
        tx.confirmed_at = datetime.utcnow()
        self._transactions[tx.tx_hash] = tx.status
        
        # Simulate balance update: credit recipient, debit sender
        recipient_balance = self.get_balance(tx.recipient, tx.asset)
        self._balances[tx.recipient][tx.asset] = recipient_balance + tx.amount

        sender_balance = self.get_balance(tx.sender, tx.asset)
        self._balances[tx.sender][tx.asset] = max(0.0, sender_balance - (tx.amount + tx.network_fee))
        
        return tx

    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        return self._transactions.get(tx_hash, TransactionState.FAILED)

    def verify_transaction(self, tx_hash: str) -> bool:
        return self.get_transaction_status(tx_hash) == TransactionState.CONFIRMED

    def get_balance(self, address: str, asset: str) -> float:
        if address not in self._balances:
            self._balances[address] = {}
        if asset not in self._balances[address]:
            self._balances[address][asset] = 1000.0
        return self._balances[address][asset]
