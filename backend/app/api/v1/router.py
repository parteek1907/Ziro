from fastapi import APIRouter
from app.api.v1.endpoints import health, blockchain, users, profile, wallets

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["wallets"])
