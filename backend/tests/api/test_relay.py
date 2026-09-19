import pytest
import time
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.utils.compression import compress_payload, decompress_payload
from app.models.offline import OfflinePayload

client = TestClient(app)

def test_compression_decompression():
    # 1. Create a dummy offline payload
    sender = "0x1234567890abcdef1234567890abcdef12345678"
    recipient = "0x876543210fedcba09876543210fedcba09876543"
    amount = 50.5
    nonce = 12
    created_at = int(time.time())
    expires_at = created_at + 3600
    
    # Generate exact mock signature matching our security validation logic
    expected_hash_bytes = hashlib.sha256(f"{sender}-{recipient}-{amount}-{nonce}".encode()).digest()
    signature = "0x" + expected_hash_bytes.hex()

    payload = OfflinePayload(
        transaction_id="dummy",
        sender=sender,
        recipient=recipient,
        amount=amount,
        currency="USDC",
        chain="polygon",
        nonce=nonce,
        created_at=created_at,
        expires_at=expires_at,
        signature=signature
    )
    
    # 2. Compress it
    compressed = compress_payload(payload)
    
    # Verify density - must be well under 160 characters for SMS
    assert len(compressed) <= 160
    
    # 3. Decompress it
    decompressed = decompress_payload(compressed)
    
    # Verify strict integrity mapping
    assert decompressed.sender == payload.sender
    assert decompressed.recipient == payload.recipient
    assert decompressed.amount == payload.amount
    assert decompressed.nonce == payload.nonce
    assert decompressed.currency == payload.currency
    assert decompressed.chain == payload.chain
    assert decompressed.signature == payload.signature


def test_twilio_webhook_success():
    sender = "0x1234567890abcdef1234567890abcdef12345678"
    recipient = "0x876543210fedcba09876543210fedcba09876543"
    amount = 25.0
    nonce = 99
    
    expected_hash_bytes = hashlib.sha256(f"{sender}-{recipient}-{amount}-{nonce}".encode()).digest()
    signature = "0x" + expected_hash_bytes.hex()
    
    payload = OfflinePayload(
        transaction_id="dummy",
        sender=sender,
        recipient=recipient,
        amount=amount,
        currency="USDC",
        chain="simulation",
        nonce=nonce,
        created_at=int(time.time()),
        expires_at=int(time.time()) + 3600,
        signature=signature
    )
    compressed = compress_payload(payload)
    
    # Twilio sends form data
    data = {
        "From": "+1234567890",
        "Body": compressed
    }
    
    response = client.post("/api/v1/relay/twilio", data=data)
    
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    xml_content = response.text
    # Should say SUCCESS because simulation adapter returns CONFIRMED
    assert "SUCCESS" in xml_content


def test_twilio_webhook_mitm_tampering():
    # Simulate a Man-in-the-Middle altering the amount
    sender = "0x1234567890abcdef1234567890abcdef12345678"
    recipient = "0x876543210fedcba09876543210fedcba09876543"
    amount = 25.0
    nonce = 100
    
    # Hacker signs it for 25.0
    expected_hash_bytes = hashlib.sha256(f"{sender}-{recipient}-{amount}-{nonce}".encode()).digest()
    signature = "0x" + expected_hash_bytes.hex()
    
    # Hacker then tampers with the payload amount to 5000.0 before sending it
    tampered_payload = OfflinePayload(
        transaction_id="dummy",
        sender=sender,
        recipient=recipient,
        amount=5000.0, # Tampered!
        currency="USDC",
        chain="simulation",
        nonce=nonce,
        created_at=int(time.time()),
        expires_at=int(time.time()) + 3600,
        signature=signature # Original signature
    )
    
    compressed_tampered = compress_payload(tampered_payload)
    
    data = {
        "From": "+1234567890",
        "Body": compressed_tampered
    }
    
    response = client.post("/api/v1/relay/twilio", data=data)
    
    assert response.status_code == 200
    xml_content = response.text
    # The cryptographic logic should catch the mismatch and reject it
    assert "Cryptographic verification failed" in xml_content
