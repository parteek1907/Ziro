from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.blockchain import BlockchainTransaction, TransactionState

class ChainAdapter(ABC):
    @abstractmethod
    def validate_address(self, address: str) -> bool:
        pass

    @abstractmethod
    def estimate_fee(self) -> float:
        pass

    @abstractmethod
    def create_transaction(self, payment_id: str, sender: str, recipient: str, amount: float, asset: str) -> BlockchainTransaction:
        pass

    @abstractmethod
    def sign_transaction(self, tx: BlockchainTransaction, private_key: str) -> BlockchainTransaction:
        pass

    @abstractmethod
    def broadcast_transaction(self, tx: BlockchainTransaction) -> BlockchainTransaction:
        pass

    @abstractmethod
    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        pass

    @abstractmethod
    def verify_transaction(self, tx_hash: str) -> bool:
        pass

    @abstractmethod
    def get_balance(self, address: str, asset: str) -> float:
        pass
