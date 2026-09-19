import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "app/models/blockchain.py": """from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TransactionState(str, Enum):
    CREATED = "CREATED"
    SIGNED = "SIGNED"
    BROADCAST = "BROADCAST"
    CONFIRMING = "CONFIRMING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"

class BlockchainTransaction(BaseModel):
    id: str
    payment_id: str
    chain: str
    asset: str
    sender: str
    recipient: str
    amount: float
    network_fee: float
    tx_hash: Optional[str] = None
    status: TransactionState = TransactionState.CREATED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
""",
    "app/services/blockchain/__init__.py": "",
    "app/services/blockchain/adapter.py": """from abc import ABC, abstractmethod
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
""",
    "app/services/blockchain/simulation.py": """import uuid
from datetime import datetime
from typing import Dict, Any
import hashlib
from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter

class SimulationAdapter(ChainAdapter):
    \"\"\"
    A complete simulation adapter for testnet/simulation purposes only.
    No real money or mainnet interactions occur here.
    \"\"\"
    
    def __init__(self):
        # In-memory store for simulated balances and tx statuses
        self._balances: Dict[str, Dict[str, float]] = {}
        self._transactions: Dict[str, TransactionState] = {}

    def validate_address(self, address: str) -> bool:
        return len(address) >= 10  # Simple mock validation

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
        
        # Simulate balance update
        if tx.recipient not in self._balances:
            self._balances[tx.recipient] = {}
        self._balances[tx.recipient][tx.asset] = self.get_balance(tx.recipient, tx.asset) + tx.amount
        
        return tx

    def get_transaction_status(self, tx_hash: str) -> TransactionState:
        return self._transactions.get(tx_hash, TransactionState.FAILED)

    def verify_transaction(self, tx_hash: str) -> bool:
        return self.get_transaction_status(tx_hash) == TransactionState.CONFIRMED

    def get_balance(self, address: str, asset: str) -> float:
        if address not in self._balances:
            # Seed test address with some fake balance
            self._balances[address] = {asset: 1000.0}
        return self._balances[address].get(asset, 0.0)
""",
    "app/services/blockchain/stellar.py": """from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter
import logging

logger = logging.getLogger(__name__)

class StellarAdapter(ChainAdapter):
    \"\"\"
    Stellar adapter ready for Testnet integration.
    WARNING: TESTNET/SIMULATION ONLY. No real-money mainnet.
    \"\"\"

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
        return 0.0
""",
    "app/services/blockchain/polygon.py": """from app.models.blockchain import BlockchainTransaction, TransactionState
from app.services.blockchain.adapter import ChainAdapter
import logging

logger = logging.getLogger(__name__)

class PolygonAdapter(ChainAdapter):
    \"\"\"
    Polygon (Amoy/Mumbai) adapter ready for Testnet integration.
    WARNING: TESTNET/SIMULATION ONLY. No real-money mainnet.
    \"\"\"

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
        return 0.0
""",
    "app/services/blockchain/service.py": """from typing import Dict, Optional
from app.services.blockchain.adapter import ChainAdapter
from app.services.blockchain.simulation import SimulationAdapter
from app.services.blockchain.stellar import StellarAdapter
from app.services.blockchain.polygon import PolygonAdapter

class BlockchainService:
    def __init__(self):
        self._adapters: Dict[str, ChainAdapter] = {
            "simulation": SimulationAdapter(),
            "stellar": StellarAdapter(),
            "polygon": PolygonAdapter()
        }

    def get_adapter(self, chain: str) -> ChainAdapter:
        adapter = self._adapters.get(chain.lower())
        if not adapter:
            raise ValueError(f"Unsupported blockchain: {chain}")
        return adapter
""",
    "app/api/v1/endpoints/blockchain.py": """from fastapi import APIRouter, HTTPException, Query
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
""",
    "tests/services/test_blockchain.py": """import pytest
from app.services.blockchain.adapter import ChainAdapter
from app.services.blockchain.simulation import SimulationAdapter
from app.models.blockchain import TransactionState

def test_chain_adapter_is_abstract():
    with pytest.raises(TypeError):
        ChainAdapter()

def test_simulation_adapter_validate_address():
    adapter = SimulationAdapter()
    assert adapter.validate_address("long_enough_address") == True
    assert adapter.validate_address("short") == False

def test_simulation_adapter_fee():
    adapter = SimulationAdapter()
    assert adapter.estimate_fee() > 0

def test_simulation_adapter_lifecycle():
    adapter = SimulationAdapter()
    sender = "sender_address_mock"
    recipient = "recipient_address_mock"
    
    # Create
    tx = adapter.create_transaction("pay_123", sender, recipient, 50.0, "USDC")
    assert tx.status == TransactionState.CREATED
    assert tx.network_fee > 0
    
    # Sign
    tx = adapter.sign_transaction(tx, "mock_key")
    assert tx.status == TransactionState.SIGNED
    
    # Broadcast
    tx = adapter.broadcast_transaction(tx)
    assert tx.status == TransactionState.CONFIRMED
    assert tx.tx_hash is not None
    assert tx.confirmed_at is not None
    
    # Status
    status = adapter.get_transaction_status(tx.tx_hash)
    assert status == TransactionState.CONFIRMED
    assert adapter.verify_transaction(tx.tx_hash) == True

def test_simulation_adapter_balance():
    adapter = SimulationAdapter()
    recipient = "recipient_address_mock"
    
    # Check initial (will be seeded)
    balance = adapter.get_balance(recipient, "USDC")
    assert balance == 1000.0
    
    # Process tx to increase balance
    tx = adapter.create_transaction("pay_123", "sender_address_mock", recipient, 50.0, "USDC")
    adapter.sign_transaction(tx, "key")
    adapter.broadcast_transaction(tx)
    
    new_balance = adapter.get_balance(recipient, "USDC")
    assert new_balance == 1050.0
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Blockchain adapter files generated.")
