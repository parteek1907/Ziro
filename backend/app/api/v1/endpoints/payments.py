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
