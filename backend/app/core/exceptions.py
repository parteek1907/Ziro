from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.services.quote_engine import AmountTooSmallError
from app.services.providers import FxUnavailableError
import uuid
import logging

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        req_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        request.state.req_id = req_id
        try:
            response = await call_next(request)
            response.headers["x-request-id"] = req_id
            return response
        except Exception as e:
            raise e

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        details = []
        for err in exc.errors():
            if err["type"] == "json_invalid":
                return JSONResponse(
                    status_code=400,
                    content={"error": {"code": "INVALID_REQUEST_BODY", "message": "Malformed JSON"}}
                )
            
            ctx_error = err.get("ctx", {}).get("error")
            if ctx_error and hasattr(ctx_error, "custom_errors"):
                details.extend(ctx_error.custom_errors)
                continue
                
            loc = err.get("loc", [])
            field = str(loc[-1]) if loc else "unknown"
            # If the error is inside body, first element is usually 'body'
            if len(loc) > 1 and loc[0] == "body":
                field = str(loc[-1])
            
            code = "VALIDATION_ERROR"
            if err["type"] == "missing":
                code = "REQUIRED"
            elif "type" in err["type"]:
                code = "INVALID_TYPE"
            elif err["type"] == "extra_forbidden":
                code = "UNKNOWN_FIELD"
                
            details.append({
                "field": field,
                "code": code,
                "message": err.get("msg", "Invalid value")
            })
            
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Validation failed",
                    "details": details
                }
            }
        )
        
    @app.exception_handler(AmountTooSmallError)
    async def amount_too_small_handler(request: Request, exc: AmountTooSmallError):
        return JSONResponse(
            status_code=422,
            content={"error": {"code": "AMOUNT_TOO_SMALL_FOR_FEES", "message": str(exc)}}
        )
        
    @app.exception_handler(FxUnavailableError)
    async def fx_unavailable_handler(request: Request, exc: FxUnavailableError):
        return JSONResponse(
            status_code=503,
            content={"error": {"code": "FX_UNAVAILABLE", "message": str(exc)}}
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        if exc.status_code in (400, 415, 422):
            return JSONResponse(
                status_code=400,
                content={"error": {"code": "INVALID_REQUEST_BODY", "message": str(exc.detail)}}
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": "HTTP_ERROR", "message": str(exc.detail)}}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred"}}
        )
