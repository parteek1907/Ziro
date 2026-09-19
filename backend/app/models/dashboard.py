from pydantic import BaseModel
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
