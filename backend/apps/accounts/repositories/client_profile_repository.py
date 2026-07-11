from typing import Optional
from apps.accounts.models import ClientProfile
from apps.common.repositories import BaseRepository


class ClientProfileRepository(BaseRepository[ClientProfile]):
    """
    Repository for ClientProfile model operations.
    """
    
    def __init__(self):
        super().__init__(ClientProfile)
    
    def get_by_user_id(self, user_id: int) -> Optional[ClientProfile]:
        """Get client profile by user ID"""
        return self.get_by_field('user_id', user_id)
    
    def get_or_create_client_profile(self, user_id: int) -> ClientProfile:
        """Get or create a client profile"""
        client, _ = self.get_or_create(user_id=user_id)
        return client
    
    def update_client_profile(self, user_id: int, **kwargs) -> Optional[ClientProfile]:
        """Update a client profile"""
        client = self.get_by_user_id(user_id)
        if not client:
            return None
        return self.update(client, **kwargs)
