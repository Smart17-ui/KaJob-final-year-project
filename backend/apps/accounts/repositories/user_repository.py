from typing import Optional, List, Tuple
from django.db.models import Q
from apps.accounts.models import User
from apps.common.repositories import BaseRepository
from apps.common.constants import UserAccountStatus


class UserRepository(BaseRepository[User]):
    """
    Repository for User model operations.
    Handles all database interactions for users.
    """
    
    def __init__(self):
        super().__init__(User)
    
    # ============================================
    # FIND BY UNIQUE FIELDS
    # ============================================
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.get_by_field('email', email)
    
    def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number"""
        return self.get_by_field('phone_number', phone)
    
    def get_by_email_or_phone(self, email: str, phone: str) -> Optional[User]:
        """Get user by email or phone"""
        try:
            return self.model_class.objects.get(
                Q(email=email) | Q(phone_number=phone)
            )
        except self.model_class.DoesNotExist:
            return None
        except self.model_class.MultipleObjectsReturned:
            return self.filter(email=email).first()
    
    # ============================================
    # CHECK EXISTENCE
    # ============================================
    
    def email_exists(self, email: str) -> bool:
        """Check if email exists"""
        return self.exists(email=email)
    
    def phone_exists(self, phone: str) -> bool:
        """Check if phone exists"""
        return self.exists(phone_number=phone)
    
    # ============================================
    # FILTER BY STATUS
    # ============================================
    
    def get_active_users(self) -> List[User]:
        """Get all active users"""
        return self.filter(
            account_status=UserAccountStatus.ACTIVE,
            deleted_at__isnull=True
        )
    
    def get_active_verified_users(self) -> List[User]:
        """Get active and verified users"""
        return self.filter(
            account_status=UserAccountStatus.ACTIVE,
            is_verified=True,
            deleted_at__isnull=True
        )
    
    def get_deleted_users(self) -> List[User]:
        """Get soft-deleted users"""
        return self.model_class.objects.deleted()
    
    def get_suspended_users(self) -> List[User]:
        """Get suspended users"""
        return self.filter(
            account_status=UserAccountStatus.SUSPENDED,
            deleted_at__isnull=True
        )
    
    def get_banned_users(self) -> List[User]:
        """Get banned users"""
        return self.filter(
            account_status=UserAccountStatus.BANNED,
            deleted_at__isnull=True
        )
    
    # ============================================
    # FILTER BY ROLE
    # ============================================
    
    def get_users_by_role(self, role_name: str) -> List[User]:
        """Get users by role name"""
        return self.filter(
            user_roles__role__name=role_name,
            deleted_at__isnull=True
        )
    
    def get_admin_users(self) -> List[User]:
        """Get all admin users"""
        return self.get_users_by_role('ADMIN')
    
    def get_worker_users(self) -> List[User]:
        """Get all worker users"""
        return self.get_users_by_role('WORKER')
    
    def get_client_users(self) -> List[User]:
        """Get all client users"""
        return self.get_users_by_role('CLIENT')
    
    # ============================================
    # SEARCH
    # ============================================
    
    def search_users(self, query: str) -> List[User]:
        """Search users by name, email, or phone"""
        return self.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query) |
            Q(phone_number__icontains=query),
            deleted_at__isnull=True
        )
    
    # ============================================
    # UPDATE OPERATIONS
    # ============================================
    
    def update_last_login(self, user: User) -> User:
        """Update user's last login time"""
        from django.utils import timezone
        return self.update(user, last_login=timezone.now())
    
    def verify_user(self, user: User) -> User:
        """Mark user as verified"""
        return self.update(user, is_verified=True)
    
    def suspend_user(self, user: User) -> User:
        """Suspend user account"""
        return self.update(user, account_status=UserAccountStatus.SUSPENDED)
    
    def ban_user(self, user: User) -> User:
        """Ban user account"""
        return self.update(user, account_status=UserAccountStatus.BANNED)
    
    def activate_user(self, user: User) -> User:
        """Activate user account"""
        return self.update(user, account_status=UserAccountStatus.ACTIVE)
    
    def deactivate_user(self, user: User) -> User:
        """Deactivate user account"""
        return self.update(user, account_status=UserAccountStatus.DEACTIVATED)
    
    # ============================================
    # VALIDATION HELPERS
    # ============================================
    
    def is_account_active(self, user_id: int) -> bool:
        """Check if user account is active"""
        user = self.get_by_id(user_id)
        if not user:
            return False
        return user.account_status == UserAccountStatus.ACTIVE and not user.is_deleted
    
    def can_login(self, user: User) -> Tuple[bool, Optional[str]]:
        """
        Check if user can login.
        Returns: (can_login, error_message)
        """
        if user.is_deleted:
            return False, "Account not found."
        
        if user.account_status == UserAccountStatus.BANNED:
            return False, "Account has been permanently banned."
        
        if user.account_status == UserAccountStatus.SUSPENDED:
            return False, "Account has been suspended."
        
        if user.account_status == UserAccountStatus.DEACTIVATED:
            return False, "Account has been deactivated."
        
        return True, None
    
    def get_user_with_roles(self, user_id: int) -> Optional[User]:
        """Get user with roles prefetched"""
        try:
            return self.model_class.objects.prefetch_related(
                'user_roles__role'
            ).get(id=user_id)
        except self.model_class.DoesNotExist:
            return None
