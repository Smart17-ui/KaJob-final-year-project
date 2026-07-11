# apps/accounts/models/user_role.py
from django.db import models
from apps.common.models.mixins import TimestampMixin


class UserRole(TimestampMixin):
    """
    Many-to-many relationship between users and roles.
    This implements the Role Player Pattern - a user can have multiple roles.
    """
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='user_roles',
        help_text="The user who has this role"
    )
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE,
        related_name='user_roles',
        help_text="The role assigned to this user"
    )
    
    class Meta:
        db_table = 'user_roles'
        unique_together = [['user', 'role']]
        ordering = ['role__name']
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        indexes = [
            models.Index(fields=['user', 'role']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.role.name}"
    
    def save(self, *args, **kwargs):
        """Override save to ensure the user exists"""
        if not self.user_id:
            raise ValueError("User must be set before saving UserRole")
        if not self.role_id:
            raise ValueError("Role must be set before saving UserRole")
        super().save(*args, **kwargs)
