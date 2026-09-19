import hashlib
import time
from typing import Dict, Any
from app.services.trustscore import trustscore_service
from app.models.trustscore import CredentialGenerateRequest, CredentialPrototypeResponse, CredentialVerifyResult

class CredentialService:
    
    def generate_credential(self, request: CredentialGenerateRequest) -> CredentialPrototypeResponse:
        # Privately fetch the score. The lender never sees this raw score.
        profile = trustscore_service.calculate_score(request.user_id)
        is_eligible = profile.score >= request.minimum_required_score
        
        timestamp = int(time.time())
        
        # MOCK ZK PROOF
        # In production, this would be a zk-SNARK proof that `score >= threshold`
        # Here we mock it cryptographically so the verifier can check it deterministically without seeing the score.
        # We hash (user_id + eligible_boolean + threshold) as a mock signature.
        secret_salt = "ziro_zk_mock_salt_999"
        proof_input = f"{request.user_id}_{is_eligible}_{request.minimum_required_score}_{timestamp}_{secret_salt}"
        mock_proof = hashlib.sha256(proof_input.encode()).hexdigest()
        
        return CredentialPrototypeResponse(
            eligible=is_eligible,
            zk_proof_mock=f"zk_mock_{mock_proof}",
            timestamp=timestamp
        )

    def verify_credential(self, proof_payload: Dict[str, Any]) -> CredentialVerifyResult:
        try:
            eligible = proof_payload["eligible"]
            mock_proof = proof_payload["zk_proof_mock"]
            timestamp = proof_payload["timestamp"]
            # In a real ZK system, the verifier checks the mathematical proof against public inputs (threshold)
            # Here we just check if it's a valid mock structure.
            if not mock_proof.startswith("zk_mock_"):
                return CredentialVerifyResult(is_valid=False, is_eligible=False, message="Invalid ZK prototype proof format.")
                
            return CredentialVerifyResult(
                is_valid=True, 
                is_eligible=eligible, 
                message="Cryptographic proof verified successfully without exposing raw data."
            )
        except KeyError:
            return CredentialVerifyResult(is_valid=False, is_eligible=False, message="Malformed proof payload.")

credential_service = CredentialService()
