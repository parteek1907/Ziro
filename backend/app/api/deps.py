from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.identity import User
from app.services.identity import identity_service

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> User:
    # MOCK implementation: Always return the test user for testnet/simulation hackathon mode
    test_user = identity_service.get_user("test-user-123")
    if not test_user:
        raise HTTPException(status_code=401, detail="Test user not found")
    return test_user
