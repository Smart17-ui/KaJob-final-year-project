from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager
from apps.common.constants import AccountStatus, RoleType

class User(SoftDeleteMixin):
    """
    Core user model for authentication and basic profile information.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.ForeignKey('Role', on_delete=models.PROTECT)
    account_status = models.CharField(
        max_length=20,
        choices=AccountStatus.CHOICES,
        default=AccountStatus.ACTIVE
    )
    is_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['role', 'account_status', 'is_verified']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    @property
    def is_active(self):
        return (
            self.account_status == AccountStatus.ACTIVE
            and not self.is_deleted
        )

    @property
    def is_admin(self):
        return self.role.name == RoleType.ADMIN

    @property
    def is_worker(self):
        return self.role.name == RoleType.WORKER

    @property
    def is_client(self):
        return self.role.name == RoleType.CLIENT

    @property
    def can_post_jobs(self):
        return self.is_active and self.is_verified and self.is_client

    @property
    def can_apply_jobs(self):
        return self.is_active and self.is_verified and self.is_worker
