"""Main FastAPI Application Entry Point for Future Finance."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers
from app.api.v1.router import api_router

from app.routers import remittance, credit, offline, mentor

# Load environment variables
load_dotenv()
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend infrastructure powering L2 micro-remittances, AI TrustScore alternative credit evaluation, "
        "zero-connectivity cryptographic offline signing, and multilingual financial inclusion."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

setup_exception_handlers(app)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Include Modular Feature Routers
app.include_router(remittance.router)
app.include_router(credit.router)
app.include_router(offline.router)
app.include_router(mentor.router)

@app.get("/")
async def root():
    return {
        "project": "Future Finance — AI for Good",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "future-finance-backend"}
