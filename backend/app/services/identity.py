from typing import Optional, Dict
from app.models.identity import User, FinancialProfile, FinancialProfileUpdate
from datetime import datetime

class IdentityService:
    def __init__(self):
        self._users: Dict[str, User] = {}
        self._profiles: Dict[str, FinancialProfile] = {}
        
        # Seed a test user
        self._seed_test_user()

    def _seed_test_user(self):
        test_user_id = "test-user-123"
        self._users[test_user_id] = User(
            id=test_user_id,
            firebase_uid="firebase-test-123",
            email="test@ziro.app",
            display_name="Test User"
        )
        self._profiles[test_user_id] = FinancialProfile(
            user_id=test_user_id,
            preferred_currency="USD",
            country="US"
        )

    def get_user(self, user_id: str) -> Optional[User]:
        return self._users.get(user_id)

    def get_profile(self, user_id: str) -> Optional[FinancialProfile]:
        return self._profiles.get(user_id)

    def update_profile(self, user_id: str, update_data: FinancialProfileUpdate) -> Optional[FinancialProfile]:
        profile = self._profiles.get(user_id)
        if not profile:
            return None
            
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(profile, key, value)
            
        profile.updated_at = datetime.utcnow()
        return profile

identity_service = IdentityService()
