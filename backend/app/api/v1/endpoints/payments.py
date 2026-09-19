from fastapi import APIRouter, Request, Body, HTTPException
from app.models.payment import RouteComparisonRequest, RouteComparisonResponse
from app.services.router import smart_router
from app.schemas.quote import QuoteRequest, QuoteResponse
from app.services.quote_engine import QuoteEngine

router = APIRouter()

quote_engine = QuoteEngine()

@router.post("/quote", response_model=QuoteResponse)
async def generate_quote(request: Request, body: QuoteRequest = Body(...)):
    # Check Content-Length for 10KB limit
    cl = request.headers.get("content-length")
    if cl and int(cl) > 10240:
        raise HTTPException(status_code=413, detail="Request body too large")
    return await quote_engine.generate_quote(body)

@router.post("/compare-routes", response_model=RouteComparisonResponse)
async def compare_routes(request: RouteComparisonRequest):
    routes = smart_router.compare_routes(request)
    return RouteComparisonResponse(routes=routes)

# ==========================================
# PAYMENT EXECUTION LIFECYCLE ENDPOINTS
# ==========================================

from app.models.payment_execution import PaymentCreateRequest, PaymentRecord
from app.services.payment_execution import payment_execution_service
from app.db.mock_db import mock_db

@router.post("", response_model=PaymentRecord)
async def create_payment(request: PaymentCreateRequest):
    """
    Initializes a payment, running it through the Address Protection and AI Payment Firewall.
    Returns the payment in RISK_APPROVED, AWAITING_CONFIRMATION, or RISK_REJECTED state.
    """
    return payment_execution_service.create_payment(request)

@router.post("/{payment_id}/confirm", response_model=PaymentRecord)
async def confirm_payment(payment_id: str):
    """
    Explicitly confirms a payment that was held in AWAITING_CONFIRMATION due to medium risk.
    """
    try:
        return payment_execution_service.confirm_payment(payment_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{payment_id}/execute", response_model=PaymentRecord)
async def execute_payment(payment_id: str):
    """
    Executes the approved payment: Creates, signs, and broadcasts the blockchain transaction,
    then awaits settlement verification.
    """
    try:
        return payment_execution_service.execute_payment(payment_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{payment_id}", response_model=PaymentRecord)
async def get_payment(payment_id: str):
    """Retrieves the full payment record including audit trails."""
    payment = mock_db.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/{payment_id}/status")
async def get_payment_status(payment_id: str):
    """Retrieves just the current status of the payment."""
    payment = mock_db.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"payment_id": payment_id, "state": payment.state}

@router.get("/user/{user_id}/history")
async def get_payment_history(user_id: str):
    """Retrieves the payment history for a user."""
    return mock_db.get_history_by_user(user_id)
