# apps/accounts/models/user.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password
from apps.common.models.mixins import BaseModel
from apps.common.constants import UserAccountStatus, RoleType


class UserManager(BaseUserManager):
    """
    Custom user manager for the User model.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        
        # Set default values for staff/superuser
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser.
        """
        extra_fields.setdefault('account_status', UserAccountStatus.ACTIVE)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        # Get admin role
        from apps.accounts.models.role import Role
        admin_role, _ = Role.objects.get_or_create(name='ADMIN')
        user = self.create_user(email, password, **extra_fields)
        user.add_role(admin_role)
        return user
    
    def get_by_natural_key(self, username):
        """Allow Django to use email as the natural key."""
        return self.get(email=username)


class User(BaseModel):
    """
    Core user model for authentication.
    Uses email as the username field.
    """
    
    # Required fields for Django auth
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    
    # Authentication
    password_hash = models.CharField(max_length=255)
    
    # Status Management
    account_status = models.CharField(
        max_length=20,
        choices=UserAccountStatus.CHOICES,
        default=UserAccountStatus.ACTIVE
    )
    is_verified = models.BooleanField(default=False)
    
    # Django Admin Required Fields
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into this admin site."
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text="Designates that this user has all permissions without explicitly assigning them."
    )
    
    # Tracking
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Use custom manager
    objects = UserManager()
    
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
    
    # ============================================
    # DJANGO AUTH REQUIRED PROPERTIES
    # ============================================
    
    @property
    def is_anonymous(self):
        return False
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_active(self):
        return (
            self.account_status == UserAccountStatus.ACTIVE
            and not self.is_deleted
        )
    
    # ============================================
    # PERMISSIONS (Required for Django Admin)
    # ============================================
    
    def has_perm(self, perm, obj=None):
        """
        Returns True if the user has the specified permission.
        Superusers have all permissions.
        """
        if self.is_superuser:
            return True
        # Check if user has the permission through roles
        return self.has_permission(perm)
    
    def has_module_perms(self, app_label):
        """
        Returns True if the user has any permissions in the given app.
        Superusers have all permissions.
        """
        if self.is_superuser:
            return True
        # For now, return True for any app
        # In a more complex system, you'd check actual permissions
        return True
    
    # ============================================
    # ROLE MANAGEMENT
    # ============================================
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def roles(self):
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
        return any(role.name == role_name for role in self.roles)
    
    def has_permission(self, permission_codename):
        if self.is_superuser or self.is_admin:
            return True
        for role in self.roles:
            if role.has_permission(permission_codename):
                return True
        return False
    
    # ============================================
    # PASSWORD MANAGEMENT
    # ============================================
    
    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)
    
    # ============================================
    # ROLE ASSIGNMENT
    # ============================================
    
    def add_role(self, role):
        from .user_role import UserRole
        UserRole.objects.get_or_create(user=self, role=role)
    
    def remove_role(self, role):
        from .user_role import UserRole
        UserRole.objects.filter(user=self, role=role).delete()
    
    def get_roles_names(self):
        return [role.name for role in self.roles]
