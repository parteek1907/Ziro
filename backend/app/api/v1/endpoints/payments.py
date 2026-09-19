from fastapi import APIRouter
from app.models.payment import RouteComparisonRequest, RouteComparisonResponse
from app.services.router import smart_router

router = APIRouter()

@router.post("/compare-routes", response_model=RouteComparisonResponse)
async def compare_routes(request: RouteComparisonRequest):
    routes = smart_router.compare_routes(request)
    return RouteComparisonResponse(routes=routes)
