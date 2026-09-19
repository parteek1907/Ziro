import difflib
from app.models.security import RecipientCheckRequest, RecipientCheckResponse, RecipientCheckStatus

# Mock saved addresses for user_id 'user123'
SAVED_ADDRESSES = {
    "user123": [
        "0x1234567890abcdef1234567890abcdef12345678", # Polygon
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr" # Stellar
    ]
}

class AddressProtectionService:
    
    def _validate_format(self, address: str, chain: str) -> bool:
        if chain == "polygon":
            return address.startswith("0x") and len(address) == 42
        elif chain == "stellar":
            return address.startswith("G") and len(address) == 56
        elif chain == "simulation":
            return True
        return False
        
    def check_recipient(self, request: RecipientCheckRequest) -> RecipientCheckResponse:
        # 1. Format & Chain Validation
        if not self._validate_format(request.recipient_address, request.chain):
            return RecipientCheckResponse(
                status=RecipientCheckStatus.BLOCKED,
                risk_score=100,
                warnings=[f"Address format is invalid for chain: {request.chain}"],
                matched_saved_address=False
            )
            
        saved = SAVED_ADDRESSES.get(request.user_id, [])
        
        # 2. Exact Match Check
        if request.recipient_address in saved:
            return RecipientCheckResponse(
                status=RecipientCheckStatus.SAFE,
                risk_score=0,
                warnings=[],
                matched_saved_address=True
            )
            
        # 3. Similarity Check (Address Poisoning / Look-alike)
        highest_similarity = 0
        for saved_addr in saved:
            ratio = difflib.SequenceMatcher(None, request.recipient_address, saved_addr).ratio()
            if ratio > highest_similarity:
                highest_similarity = ratio
                
        if highest_similarity > 0.80:
            return RecipientCheckResponse(
                status=RecipientCheckStatus.BLOCKED,
                risk_score=95,
                warnings=["HIGH RISK: The recipient address is suspiciously similar to a saved contact. This resembles an Address Poisoning attack."],
                matched_saved_address=False
            )
            
        # 4. First-time Address Check (No match, no high similarity)
        return RecipientCheckResponse(
            status=RecipientCheckStatus.WARNING,
            risk_score=30,
            warnings=["First-time recipient. Please verify the address carefully before proceeding."],
            matched_saved_address=False
        )

address_protection_service = AddressProtectionService()
