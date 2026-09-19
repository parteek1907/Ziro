import os
from pathlib import Path

base_dir = Path("d:/PROJECTS/Prayas/backend")

files = {
    "requirements.txt": """fastapi[standard]>=0.110.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
httpx>=0.27.0
""",
    ".env.example": """PROJECT_NAME="ZIRO Backend"
API_V1_STR="/api/v1"
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT="development"
""",
    "README.md": """# ZIRO Backend

AI-powered Future Finance platform.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   fastapi dev app/main.py
   ```
""",
    "app/__init__.py": "",
    "app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers
from app.api.v1.router import api_router

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

setup_exception_handlers(app)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to ZIRO API"}
""",
    "app/core/__init__.py": "",
    "app/core/config.py": """from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZIRO Backend"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

settings = Settings()
""",
    "app/core/logging.py": """import logging
import sys

def setup_logging():
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
""",
    "app/core/exceptions.py": """from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
""",
    "app/api/__init__.py": "",
    "app/api/v1/__init__.py": "",
    "app/api/v1/router.py": """from fastapi import APIRouter
from app.api.v1.endpoints import health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
""",
    "app/api/v1/endpoints/__init__.py": "",
    "app/api/v1/endpoints/health.py": """from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", service="ziro-backend")
""",
    "app/models/__init__.py": "",
    "app/schemas/__init__.py": "",
    "app/schemas/health.py": """from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
""",
    "app/services/__init__.py": "",
    "app/repositories/__init__.py": "",
    "app/utils/__init__.py": "",
    "pytest.ini": """[pytest]
asyncio_mode = auto
asyncio_default_fixture_loop_scope = function
""",
    "tests/__init__.py": "",
    "tests/conftest.py": """import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
""",
    "tests/api/__init__.py": "",
    "tests/api/test_health.py": """import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ziro-backend"
"""
}

for file_path, content in files.items():
    full_path = base_dir / file_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Backend foundation created successfully.")
