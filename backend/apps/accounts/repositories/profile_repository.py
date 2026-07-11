from typing import Optional
from apps.accounts.models import Profile
from apps.common.repositories import BaseRepository


class ProfileRepository(BaseRepository[Profile]):
    """
    Repository for Profile model operations.
    """
    
    def __init__(self):
        super().__init__(Profile)
    
    def get_by_user_id(self, user_id: int) -> Optional[Profile]:
        """Get profile by user ID"""
        return self.get_by_field('user_id', user_id)
    
    def get_or_create_profile(self, user_id: int) -> Profile:
        """Get or create a profile for a user"""
        profile, _ = self.get_or_create(
            defaults={'bio': '', 'address': ''},
            user_id=user_id
        )
        return profile
    
    def update_profile(self, user_id: int, **kwargs) -> Optional[Profile]:
        """Update a user's profile"""
        profile = self.get_by_user_id(user_id)
        if not profile:
            return None
        return self.update(profile, **kwargs)
    
    def get_profile_with_user(self, user_id: int) -> Optional[Profile]:
        """Get profile with user data prefetched"""
        try:
            return self.model_class.objects.select_related('user').get(user_id=user_id)
        except self.model_class.DoesNotExist:
            return None
