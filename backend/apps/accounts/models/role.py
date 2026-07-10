from django.db import models
from apps.common.models.mixins import TimestampMixin
from apps.common.constants import RoleType


class Role(TimestampMixin):
    """
    User roles in the system.
    """
    name = models.CharField(
        max_length=20,
        choices=RoleType.CHOICES,  # Changed from RoleType.choices to RoleType.CHOICES
        unique=True
    )
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'roles'
        ordering = ['name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
    
    def __str__(self):
        return self.get_name_display()
    
    def has_permission(self, permission_codename):
        """Check if role has a specific permission"""
        # Use role_permissions related name from RolePermission model
        return self.role_permissions.filter(
            permission__codename=permission_codename
        ).exists()
    
    @property
    def permissions(self):
        """Get all permissions for this role"""
        return [rp.permission for rp in self.role_permissions.all()]
    
    @property
    def is_admin(self):
        return self.name == RoleType.ADMIN
    
    @property
    def is_worker(self):
        return self.name == RoleType.WORKER
    
    @property
    def is_client(self):
        return self.name == RoleType.CLIENT
