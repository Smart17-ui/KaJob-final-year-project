from django.db import models
from apps.common.models.mixins import BaseModel


class ClientProfile(BaseModel):
    """
    Client-specific information.
    """
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    
    # Client Information
    organization_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'client_profiles'
        verbose_name = 'Client Profile'
        verbose_name_plural = 'Client Profiles'
        indexes = [
            models.Index(fields=['organization_name']),
        ]
    
    def __str__(self):
        return f"Client: {self.user.full_name}"
