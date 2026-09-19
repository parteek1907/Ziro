import pytest
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
