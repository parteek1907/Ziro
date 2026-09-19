from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class User(BaseModel):
    id: str
    firebase_uid: str
    email: str
    display_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialProfile(BaseModel):
    user_id: str
    preferred_currency: str = "USD"
    country: str = "US"
    financial_goals: str = ""
    risk_preferences: str = "moderate"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialProfileUpdate(BaseModel):
    preferred_currency: Optional[str] = None
    country: Optional[str] = None
    financial_goals: Optional[str] = None
    risk_preferences: Optional[str] = None
