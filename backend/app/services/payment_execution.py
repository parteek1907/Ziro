from typing import List, Optional
from app.models.payment_execution import PaymentRecord, PaymentState, PaymentCreateRequest
from app.db.mock_db import mock_db

from app.services.risk import ai_firewall, RiskAnalysisRequest, RiskLevel
from app.services.security import address_protection_service, RecipientCheckRequest, RecipientCheckStatus
from app.services.blockchain.service import BlockchainService

class PaymentExecutionService:
    def __init__(self):
        self.blockchain_service = BlockchainService()

    def create_payment(self, request: PaymentCreateRequest) -> PaymentRecord:
        # Check Idempotency
        existing = mock_db.get_payment_by_idempotency_key(request.idempotency_key)
        if existing:
            return existing

        payment = PaymentRecord(**request.model_dump())
        payment.log_audit("Payment created in system.")
        payment.state = PaymentState.VALIDATING
        
        # 1. Address Security Check
        addr_req = RecipientCheckRequest(
            user_id=payment.user_id,
            recipient_address=payment.recipient_address,
            chain=payment.chain
        )
        addr_res = address_protection_service.check_recipient(addr_req)
        
        if addr_res.status == RecipientCheckStatus.BLOCKED:
            payment.state = PaymentState.RISK_REJECTED
            payment.log_audit(f"Payment rejected due to address security: {addr_res.warnings}")
            return mock_db.save_payment(payment)

        # 2. AI Payment Firewall (Risk & Intent)
        payment.state = PaymentState.RISK_CHECK_PENDING
        
        risk_req = RiskAnalysisRequest(
            user_id=payment.user_id,
            recipient=payment.recipient_address,
            amount=payment.amount,
            currency=payment.currency,
            payment_intent=payment.payment_intent,
            chain=payment.chain
        )
        risk_res = ai_firewall.analyze(risk_req)
        
        if risk_res.risk_level == RiskLevel.HIGH:
            payment.state = PaymentState.RISK_REJECTED
            payment.log_audit(f"AI Firewall blocked payment: {risk_res.reasons} {risk_res.warnings}")
            return mock_db.save_payment(payment)
            
        elif risk_res.risk_level == RiskLevel.MEDIUM or addr_res.status == RecipientCheckStatus.WARNING:
            payment.state = PaymentState.AWAITING_CONFIRMATION
            payment.log_audit(f"Payment requires explicit confirmation. Risk: {risk_res.risk_level}. Address Warn: {addr_res.status}")
            return mock_db.save_payment(payment)
            
        # Low risk, perfectly safe
        payment.state = PaymentState.RISK_APPROVED
        payment.log_audit("Payment passed all risk checks.")
        return mock_db.save_payment(payment)

    def confirm_payment(self, payment_id: str) -> PaymentRecord:
        payment = mock_db.get_payment(payment_id)
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")
            
        if payment.state != PaymentState.AWAITING_CONFIRMATION:
            raise ValueError(f"Payment cannot be confirmed from state {payment.state}")
            
        payment.state = PaymentState.RISK_APPROVED
        payment.log_audit("User explicitly confirmed the payment.")
        return payment

    def execute_payment(self, payment_id: str) -> PaymentRecord:
        payment = mock_db.get_payment(payment_id)
        if not payment:
            raise ValueError(f"Payment {payment_id} not found")
            
        if payment.state == PaymentState.SETTLED:
            return payment # Idempotent safety

        if payment.state not in [PaymentState.RISK_APPROVED, PaymentState.TRANSACTION_CREATED, PaymentState.SIGNED, PaymentState.BROADCAST_FAILED, PaymentState.CONFIRMATION_FAILED]:
            raise ValueError(f"Payment cannot be executed from state {payment.state}")

        # Ensure idempotency logic during transaction creation
        if not payment.blockchain_tx_id:
            payment.state = PaymentState.TRANSACTION_CREATED
            payment.log_audit("Preparing blockchain transaction.")
            
        try:
            adapter = self.blockchain_service.get_adapter(payment.chain)
            
            # Step 1: Create
            tx = adapter.create_transaction(
                payment_id=payment.payment_id,
                sender=payment.sender_address,
                recipient=payment.recipient_address,
                amount=payment.amount,
                asset=payment.currency
            )
            payment.blockchain_tx_id = tx.id
            payment.network_fee = tx.network_fee
            payment.log_audit("Transaction created.")
            
            # Step 2: Sign
            payment.state = PaymentState.SIGNED
            # Never use real private keys here, passing dummy since we default to simulation
            dummy_private_key = "0xSIMULATED_PRIVATE_KEY"
            tx = adapter.sign_transaction(tx, dummy_private_key)
            payment.log_audit("Transaction signed.")
            
            # Step 3: Broadcast
            payment.state = PaymentState.BROADCAST
            tx = adapter.broadcast_transaction(tx)
            payment.blockchain_tx_hash = tx.tx_hash
            payment.log_audit(f"Transaction broadcasted with hash {tx.tx_hash}.")
            
            # Step 4: Confirm/Settle (In a real system, this would poll async. For simulation, we check synchronously)
            payment.state = PaymentState.CONFIRMING
            is_verified = adapter.verify_transaction(tx.tx_hash)
            
            if is_verified:
                payment.state = PaymentState.SETTLED
                from datetime import datetime
                payment.settled_at = datetime.utcnow().isoformat() + "Z"
                payment.log_audit("Blockchain settlement verified successfully.")
            else:
                payment.state = PaymentState.CONFIRMATION_FAILED
                payment.log_audit("Settlement verification failed.")
                
        except Exception as e:
            # If broadcast fails, we log it and keep the failure state
            payment.state = PaymentState.BROADCAST_FAILED
            payment.log_audit(f"Execution failed: {str(e)}")
            raise e
            
        return payment

payment_execution_service = PaymentExecutionService()
