import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

models_dashboard = """from pydantic import BaseModel
from typing import List, Optional

class DashboardActivity(BaseModel):
    type: str
    transaction: str
    route: str
    time: str
    status: str

class DashboardStats(BaseModel):
    total_balance: str
    trust_score: str
    global_transfers: int
    recent_activity: List[DashboardActivity]
"""

mock_db_content = """from typing import Dict, Optional, List
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
"""

profile_endpoints = """from fastapi import APIRouter, Depends, HTTPException
from app.models.identity import User, FinancialProfile, FinancialProfileUpdate
from app.models.dashboard import DashboardStats, DashboardActivity
from app.api.deps import get_current_user
from app.services.identity import identity_service
from app.db.mock_db import mock_db
from app.services.trustscore import trustscore_service

router = APIRouter()

@router.get("", response_model=FinancialProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = identity_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("", response_model=FinancialProfile)
async def update_profile(
    update_data: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    profile = identity_service.update_profile(current_user.id, update_data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(current_user: User = Depends(get_current_user)):
    # Calculate mock trust score
    trust_data = trustscore_service.calculate_score(current_user.id)
    trust_score_display = str(trust_data.score) if trust_data else "850"

    # Compile recent activity matching UI screenshot
    recent_activity = [
        DashboardActivity(type="Settlement", transaction="Maria Garcia", route="USD -> MXN", time="12 mins ago", status="Completed"),
        DashboardActivity(type="Transfer", transaction="James Wilson", route="USD -> INR", time="34 mins ago", status="Completed"),
        DashboardActivity(type="Payment", transaction="L2 Wallet", route="USD -> KES", time="1 hour ago", status="Pending"),
        DashboardActivity(type="Transfer", transaction="Amara", route="USD -> KES", time="2 hours ago", status="Completed")
    ]
    
    return DashboardStats(
        total_balance="$12,450.00",
        trust_score=trust_score_display,
        global_transfers=12,
        recent_activity=recent_activity
    )
"""

with open(base_dir / "app/models/dashboard.py", "w") as f:
    f.write(models_dashboard)
print("Created dashboard.py")

with open(base_dir / "app/db/mock_db.py", "w") as f:
    f.write(mock_db_content)
print("Updated mock_db.py")

with open(base_dir / "app/api/v1/endpoints/profile.py", "w") as f:
    f.write(profile_endpoints)
print("Updated profile.py")
