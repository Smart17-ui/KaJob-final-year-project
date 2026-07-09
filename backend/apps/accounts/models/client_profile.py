from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager

class ClientProfile(SoftDeleteMixin):
    """
    Client-specific information.
    """
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='client_profile'
    )
    organization_name = models.CharField(
        max_length=255,
        blank=True
    )
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'client_profiles'
        ordering = ['user__first_name']

    def __str__(self):
        return f"Client: {self.user.full_name}"
