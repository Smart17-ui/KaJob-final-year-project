from django.db import models
from apps.common.models.mixins import TimestampMixin


class Permission(TimestampMixin):
    """
    Granular permissions that can be assigned to roles.
    """
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'permissions'
        ordering = ['name']
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
    
    def __str__(self):
        return self.name
