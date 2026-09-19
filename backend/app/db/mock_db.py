import json
import logging
from pathlib import Path
from typing import Dict, Optional, List
from app.models.payment_execution import PaymentRecord, PaymentState

logger = logging.getLogger(__name__)

DB_FILE = Path(__file__).parent / "payments_store.json"

# File-backed mock database for Payment execution lifecycle
class MockDB:
    def __init__(self):
        self.payments: Dict[str, PaymentRecord] = {}
        self._load_from_disk()

    def _load_from_disk(self):
        if DB_FILE.exists():
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        payment = PaymentRecord(**item)
                        self.payments[payment.payment_id] = payment
                logger.info(f"Loaded {len(self.payments)} payments from {DB_FILE}")
            except Exception as e:
                logger.error(f"Failed to load payments from {DB_FILE}: {e}")

    def _persist_to_disk(self):
        try:
            records = [p.model_dump() for p in self.payments.values()]
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to persist payments to {DB_FILE}: {e}")

    def save_payment(self, payment: PaymentRecord) -> PaymentRecord:
        self.payments[payment.payment_id] = payment
        self._persist_to_disk()
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
