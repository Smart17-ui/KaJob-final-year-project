from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from apps.common.models.mixins import BaseModel
from apps.common.constants import UserAccountStatus, RoleType


class User(BaseModel):
    """
    Core user model for authentication.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    
    # Authentication
    password_hash = models.CharField(max_length=255)
    
    # Status
    account_status = models.CharField(
        max_length=20,
        choices=UserAccountStatus.CHOICES,
        default=UserAccountStatus.ACTIVE
    )
    is_verified = models.BooleanField(default=False)
    
    # Tracking
    last_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['account_status', 'is_verified']),
        ]
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active(self):
        return (
            self.account_status == UserAccountStatus.ACTIVE
            and not self.is_deleted
        )
    
    @property
    def roles(self):
        """Get all roles for this user"""
        return [ur.role for ur in self.user_roles.all()]
    
    @property
    def is_admin(self):
        return any(role.name == RoleType.ADMIN for role in self.roles)
    
    @property
    def is_worker(self):
        return any(role.name == RoleType.WORKER for role in self.roles)
    
    @property
    def is_client(self):
        return any(role.name == RoleType.CLIENT for role in self.roles)
    
    def has_role(self, role_name):
        """Check if user has a specific role"""
        return any(role.name == role_name for role in self.roles)
    
    def has_permission(self, permission_codename):
        """Check if user has a specific permission"""
        if self.is_admin:
            return True
        for role in self.roles:
            if role.has_permission(permission_codename):
                return True
        return False
    
    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)
    
    def add_role(self, role):
        """Add a role to the user"""
        from .user_role import UserRole
        UserRole.objects.get_or_create(user=self, role=role)
    
    def remove_role(self, role):
        """Remove a role from the user"""
        from .user_role import UserRole
        UserRole.objects.filter(user=self, role=role).delete()
