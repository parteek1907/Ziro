from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RouteType(str, Enum):
    TRADITIONAL = "TRADITIONAL"
    BLOCKCHAIN = "BLOCKCHAIN"
    SIMULATION = "SIMULATION"

class RouteComparisonRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to transfer")
    source_currency: str = Field(..., description="Source fiat or crypto currency")
    target_currency: str = Field(..., description="Target fiat or crypto currency")
    preference: Optional[str] = Field(default="lowest_cost", description="e.g. lowest_cost, fastest_settlement")

class PaymentRoute(BaseModel):
    route: RouteType
    estimated_fee: float = Field(..., description="Estimated network or bank fee")
    fx_cost: float = Field(..., description="Estimated cost lost to exchange spread")
    total_cost: float = Field(..., description="Total cost of the transfer")
    estimated_time_seconds: int = Field(..., description="Estimated settlement time in seconds")
    intermediaries: int = Field(..., description="Number of intermediary hops")
    risk_metadata: Dict[str, Any] = Field(default_factory=dict, description="Risk properties associated with the route")
    available: bool = True

class RouteComparisonResponse(BaseModel):
    routes: List[PaymentRoute]
