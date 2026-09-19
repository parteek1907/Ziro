from typing import Dict, Optional, List
from app.models.payment_execution import PaymentRecord, PaymentState
import uuid

# In-memory mock database for Payment execution lifecycle
class MockDB:
    def __init__(self):
        self.payments: Dict[str, PaymentRecord] = {}

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
