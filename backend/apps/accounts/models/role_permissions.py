from django.db import models
from apps.common.models.mixins import TimestampMixin


class RolePermission(TimestampMixin):
    """
    Maps permissions to roles.
    """
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE,
        related_name='role_permissions'  # This is what we use in Role.has_permission
    )
    permission = models.ForeignKey(
        'Permission',
        on_delete=models.CASCADE,
        related_name='role_permissions'
    )
    
    class Meta:
        db_table = 'role_permissions'
        unique_together = [['role', 'permission']]
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'
    
    def __str__(self):
        return f"{self.role.name} - {self.permission.name}"
