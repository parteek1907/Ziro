from typing import Dict, Optional, List
from app.models.payment_execution import PaymentRecord, PaymentState
import uuid

# In-memory mock database for Payment execution lifecycle
class MockDB:
    def __init__(self):
        self.payments: Dict[str, PaymentRecord] = {}
        self._seed_data()

    def _seed_data(self):
        # Seed mock data for the dashboard UI
        user_id = "test_user_01"
        
        p1 = PaymentRecord(
            payment_id="mock_pay_1",
            idempotency_key="idemp_1",
            user_id=user_id,
            payment_intent="Payment to Maria",
            sender_address="0xMockSender",
            recipient_address="0xMaria",
            amount=500.0,
            currency="USD",
            chain="simulation",
            state=PaymentState.SETTLED
        )
        self.payments[p1.payment_id] = p1

        p2 = PaymentRecord(
            payment_id="mock_pay_2",
            idempotency_key="idemp_2",
            user_id=user_id,
            payment_intent="Transfer to James",
            sender_address="0xMockSender",
            recipient_address="0xJames",
            amount=200.0,
            currency="USD",
            chain="simulation",
            state=PaymentState.SETTLED
        )
        self.payments[p2.payment_id] = p2
        
        p3 = PaymentRecord(
            payment_id="mock_pay_3",
            idempotency_key="idemp_3",
            user_id=user_id,
            payment_intent="Payment to L2 Wallet",
            sender_address="0xMockSender",
            recipient_address="0xL2Wallet",
            amount=1000.0,
            currency="USD",
            chain="simulation",
            state=PaymentState.RISK_CHECK_PENDING
        )
        self.payments[p3.payment_id] = p3

        p4 = PaymentRecord(
            payment_id="mock_pay_4",
            idempotency_key="idemp_4",
            user_id=user_id,
            payment_intent="Transfer to Amara",
            sender_address="0xMockSender",
            recipient_address="0xAmara",
            amount=300.0,
            currency="USD",
            chain="simulation",
            state=PaymentState.SETTLED
        )
        self.payments[p4.payment_id] = p4

    def save_payment(self, payment: PaymentRecord) -> PaymentRecord:
        self.payments[payment.payment_id] = payment
        return payment

    def get_payment(self, payment_id: str) -> Optional[PaymentRecord]:
        return self.payments.get(payment_id)

    def get_payment_by_idempotency_key(self, idempotency_key: str) -> Optional[PaymentRecord]:
        for payment in self.payments.values():
            if payment.idempotency_key == idempotency_key:
                return payment
        return None

    def get_history_by_user(self, user_id: str) -> List[PaymentRecord]:
        return [p for p in self.payments.values() if p.user_id == user_id]

# Singleton instance
mock_db = MockDB()
