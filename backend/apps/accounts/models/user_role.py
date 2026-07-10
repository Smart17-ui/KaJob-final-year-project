from django.db import models
from apps.common.models.mixins import TimestampMixin


class UserRole(TimestampMixin):
    """
    Many-to-many relationship between users and roles.
    """
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='user_roles'
    )
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE,
        related_name='user_roles'
    )
    
    class Meta:
        db_table = 'user_roles'
        unique_together = [['user', 'role']]
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
    
    def __str__(self):
        return f"{self.user.full_name} - {self.role.name}"
