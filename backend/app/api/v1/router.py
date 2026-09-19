from fastapi import APIRouter
from app.api.v1.endpoints import health, blockchain, users, profile, wallets, payments, risk, security, offline, trustscore, credentials, consultant, explorer

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(blockchain.router, prefix="/blockchain", tags=["blockchain"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["wallets"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(risk.router, prefix="/risk", tags=["risk"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(offline.router, prefix="/offline", tags=["offline"])
api_router.include_router(trustscore.router, prefix="/trustscore", tags=["trustscore"])
api_router.include_router(credentials.router, prefix="/credentials", tags=["credentials"])
api_router.include_router(consultant.router, prefix="/consultant", tags=["consultant"])
api_router.include_router(explorer.router, prefix="/explorer", tags=["explorer"])
