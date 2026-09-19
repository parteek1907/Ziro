import json
import logging
import os
from pathlib import Path
from typing import Dict, Optional, List
from app.models.payment_execution import PaymentRecord, PaymentState
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

DB_FILE = Path(__file__).parent / "payments_store.json"

# Hybrid mock database for Payment execution lifecycle (Local + Firebase)
class MockDB:
    def __init__(self):
        self.payments: Dict[str, PaymentRecord] = {}
        self.db = None
        
        try:
            # Initialize Firebase
            if not firebase_admin._apps:
                creds_json = os.environ.get("FIREBASE_CREDENTIALS")
                
                # Check for either Vercel env variable OR local JSON file
                if creds_json:
                    cred_dict = json.loads(creds_json)
                    cred = credentials.Certificate(cred_dict)
                else:
                    # Look for firebase_credentials.json in the backend root
                    backend_root = Path(__file__).parent.parent.parent
                    cred_path = backend_root / "firebase_credentials.json"
                    cred = credentials.Certificate(str(cred_path))
                    
                firebase_admin.initialize_app(cred)
                
            self.db = firestore.client()
            logger.info("Firebase Firestore initialized successfully!")
            self._load_from_firebase()
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}. Falling back to local file.")
            self._load_from_disk()

    def _load_from_firebase(self):
        try:
            docs = self.db.collection("payments").stream()
            for doc in docs:
                data = doc.to_dict()
                try:
                    payment = PaymentRecord(**data)
                    self.payments[payment.payment_id] = payment
                except Exception as e:
                    logger.error(f"Error parsing payment {doc.id}: {e}")
            logger.info(f"Loaded {len(self.payments)} payments from Firebase.")
        except Exception as e:
            logger.error(f"Failed to load payments from Firebase: {e}")

    def _persist_to_firebase(self, payment: PaymentRecord):
        if self.db:
            try:
                # Convert the pydantic model to a dict properly parsing datetime strings
                data = json.loads(payment.model_dump_json())
                self.db.collection("payments").document(payment.payment_id).set(data)
            except Exception as e:
                logger.error(f"Failed to persist payment {payment.payment_id} to Firebase: {e}")
        else:
            self._persist_to_disk()

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
            records = [json.loads(p.model_dump_json()) for p in self.payments.values()]
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to persist payments to {DB_FILE}: {e}")

    def save_payment(self, payment: PaymentRecord) -> PaymentRecord:
        self.payments[payment.payment_id] = payment
        self._persist_to_firebase(payment)
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
