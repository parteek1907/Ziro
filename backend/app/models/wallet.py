from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from typing import Optional

class Wallet(BaseModel):
    id: str
    user_id: str
    chain: str
    public_address: str
    private_key: Optional[str] = None # For custodial hackathon signing
    wallet_type: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
class WalletCreate(BaseModel):
    chain: str
    public_address: Optional[str] = None
    wallet_type: str = "externally_owned"
