"""Main FastAPI Application Entry Point for Future Finance."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import remittance, credit, offline, mentor

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Future Finance: AI for Good API",
    description=(
        "Backend infrastructure powering L2 micro-remittances, AI TrustScore alternative credit evaluation, "
        "zero-connectivity cryptographic offline signing, and multilingual financial inclusion."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Next.js frontend
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for flexible local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "documentation": "/docs",
        "endpoints": [
            "/api/remittance/route",
            "/api/credit/evaluate",
            "/api/credit/zk-proof",
            "/api/offline/edge-guard",
            "/api/offline/sync",
            "/api/mentor/chat",
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "future-finance-backend"}
