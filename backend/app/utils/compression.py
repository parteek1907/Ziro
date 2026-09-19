import struct
import base64
import time
import uuid
from typing import Dict, Any
from app.models.offline import OfflinePayload

CHAIN_MAP = {1: "polygon", 2: "stellar", 3: "simulation"}
CHAIN_REV_MAP = {v: k for k, v in CHAIN_MAP.items()}

CURRENCY_MAP = {1: "USDC", 2: "USDT", 3: "ETH"}
CURRENCY_REV_MAP = {v: k for k, v in CURRENCY_MAP.items()}

def compress_payload(payload: OfflinePayload) -> str:
    """
    Simulates the PWA frontend byte-packing logic.
    Converts the transaction into a dense 123-byte structure, then Base85 encodes it.
    """
    # Convert hex addresses to bytes (strip '0x' if present and pad/truncate to 20 bytes)
    def clean_addr(addr: str) -> bytes:
        a = addr.replace("0x", "")
        # Real addresses are 40 hex chars -> 20 bytes. Let's try fromhex, fallback to utf-8 if invalid
        try:
            b = bytes.fromhex(a)
        except ValueError:
            b = a.encode('utf-8')
        return b[:20].ljust(20, b'\0')

    sender_b = clean_addr(payload.sender)
    recipient_b = clean_addr(payload.recipient)
    
    chain_id = CHAIN_REV_MAP.get(payload.chain.lower(), 3)
    currency_id = CURRENCY_REV_MAP.get(payload.currency.upper(), 1)
    
    # Signature: real ECDSA is 64-65 bytes. Convert hex string to raw bytes.
    sig_b = bytes.fromhex(payload.signature.replace("0x", ""))
    sig_b = sig_b[:65].ljust(65, b'\0')

    # Pack format: 20s (sender), 20s (recipient), f (amount), I (nonce), I (created_at), I (expires_at), B (chain), B (currency), 65s (signature)
    # Total: 20 + 20 + 4 + 4 + 4 + 4 + 1 + 1 + 65 = 123 bytes
    packed_data = struct.pack(
        '>20s 20s f I I I B B 65s',
        sender_b,
        recipient_b,
        payload.amount,
        payload.nonce,
        payload.created_at,
        payload.expires_at,
        chain_id,
        currency_id,
        sig_b
    )
    
    # Base85 encode for SMS density
    encoded = base64.b85encode(packed_data).decode('utf-8')
    return encoded


def decompress_payload(encoded_str: str) -> OfflinePayload:
    """
    Edge Gateway Decompressor.
    Takes a <160 char Base85 string from Twilio SMS, unpacks it into the OfflinePayload model.
    """
    try:
        packed_data = base64.b85decode(encoded_str.encode('utf-8'))
        if len(packed_data) != 123:
            raise ValueError(f"Invalid unpacked byte length. Expected 123, got {len(packed_data)}")
            
        unpacked = struct.unpack('>20s 20s f I I I B B 65s', packed_data)
        
        def unpack_addr(b: bytes) -> str:
            # Assume it's 20 raw bytes, convert to hex
            # if padding exists, maybe it was a short address, but let's just use .hex()
            return "0x" + b.hex()

        sender = unpack_addr(unpacked[0])
        recipient = unpack_addr(unpacked[1])
        amount = unpacked[2]
        nonce = unpacked[3]
        created_at = unpacked[4]
        expires_at = unpacked[5]
        chain = CHAIN_MAP.get(unpacked[6], "simulation")
        currency = CURRENCY_MAP.get(unpacked[7], "USDC")
        
        # signature was stored as raw bytes padded to 65 chars, convert back to hex string
        signature = "0x" + unpacked[8].rstrip(b'\0').hex()
        
        # We generate a deterministic transaction ID from the payload (or random if not possible)
        tx_id = f"off_{nonce}_{int(time.time())}"
        
        return OfflinePayload(
            transaction_id=tx_id,
            sender=sender,
            recipient=recipient,
            amount=round(amount, 2),
            currency=currency,
            chain=chain,
            nonce=nonce,
            created_at=created_at,
            expires_at=expires_at,
            signature=signature,
            payment_intent="Offline SMS Relay" # Default intent for SMS
        )
    except Exception as e:
        raise ValueError(f"Failed to decompress SMS payload: {str(e)}")
