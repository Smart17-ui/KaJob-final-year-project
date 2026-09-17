# apps/accounts/models/user.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password
from apps.common.models.mixins import BaseModel
from apps.common.constants import UserAccountStatus, RoleType


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('account_status', UserAccountStatus.ACTIVE)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        from apps.accounts.models.role import Role
        admin_role, _ = Role.objects.get_or_create(name='ADMIN')
        user = self.create_user(email, password, **extra_fields)
        user.add_role(admin_role)
        return user

    def get_by_natural_key(self, username):
        return self.get(email=username)


class User(BaseModel):

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number']

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

    # ============================================
    # 🆕 DISCIPLINARY / SUSPENSION TRACKING
    # ============================================
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspended_until = models.DateTimeField(null=True, blank=True)
    suspension_reason = models.TextField(blank=True)

    banned_at = models.DateTimeField(null=True, blank=True)
    ban_reason = models.TextField(blank=True)

    warning_count = models.PositiveIntegerField(default=0)

    # ============================================
    # PHONE VERIFICATION FIELDS
    # ============================================
    phone_verified = models.BooleanField(default=False)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    phone_otp = models.CharField(max_length=6, blank=True, default='')
    phone_otp_created_at = models.DateTimeField(null=True, blank=True)
    phone_attempts = models.IntegerField(default=0)

    # ============================================
    # EMAIL VERIFICATION FIELDS
    # ============================================
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    email_verification_token = models.CharField(max_length=255, blank=True, default='')
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)

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

    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['account_status', 'is_verified']),
            models.Index(fields=['phone_verified']),
            models.Index(fields=['email_verified']),
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
    # PERMISSIONS
    # ============================================

    def has_perm(self, perm, obj=None):
        if self.is_superuser:
            return True
        return self.has_permission(perm)

    def has_module_perms(self, app_label):
        if self.is_superuser:
            return True
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

    # ============================================
    # VERIFICATION HELPERS
    # ============================================

    def is_phone_verified(self):
        return self.phone_verified

    def is_email_verified(self):
        return self.email_verified

    def is_fully_verified(self):
        return self.is_verified and self.phone_verified and self.email_verified

    def get_verification_progress(self):
        steps = [self.phone_verified, self.email_verified, self.is_verified]
        completed = sum(1 for step in steps if step)
        return int((completed / len(steps)) * 100)

    def reset_verification(self):
        self.phone_verified = False
        self.phone_verified_at = None
        self.phone_otp = ''
        self.phone_otp_created_at = None
        self.phone_attempts = 0
        self.email_verified = False
        self.email_verified_at = None
        self.email_verification_token = ''
        self.email_verification_sent_at = None
        self.is_verified = False
        self.save()

    # ============================================
    # 🆕 DISCIPLINARY HELPERS
    # ============================================

    @property
    def is_currently_suspended(self):
        from django.utils import timezone
        if self.account_status != UserAccountStatus.SUSPENDED:
            return False
        if self.suspended_until and self.suspended_until <= timezone.now():
            return False
        return True

    @property
    def is_banned(self):
        return self.account_status == UserAccountStatus.BANNED

    def can_log_in(self):
        """
        Central check used by the login service.
        Returns (allowed: bool, reason: str | None).
        """
        from django.utils import timezone

        if self.account_status == UserAccountStatus.BANNED:
            return False, (
                f"Your account has been permanently banned. "
                f"Reason: {self.ban_reason or 'Not provided'}"
            )

        if self.account_status == UserAccountStatus.SUSPENDED:
            if self.suspended_until and self.suspended_until <= timezone.now():
                self.account_status = UserAccountStatus.ACTIVE
                self.suspended_at = None
                self.suspended_until = None
                self.save(update_fields=[
                    'account_status', 'suspended_at', 'suspended_until'
                ])
                return True, None

            until_str = (
                self.suspended_until.strftime('%Y-%m-%d %H:%M')
                if self.suspended_until else 'further notice'
            )
            return False, (
                f"Your account is suspended until {until_str}. "
                f"Reason: {self.suspension_reason or 'Not provided'}"
            )

        if self.account_status == UserAccountStatus.DEACTIVATED:
            return False, "Your account is deactivated."

        return True, None
