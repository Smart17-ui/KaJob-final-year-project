from django.db import models
from apps.common.models.mixins import BaseModel


class Profile(BaseModel):
    """
    User profile information (separate from authentication).
    """
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Profile Information
    bio = models.TextField(blank=True)
    profile_photo_path = models.CharField(max_length=500, blank=True)
    
    # Address
    address = models.TextField(blank=True)
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    
    # Location
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    class Meta:
        db_table = 'profiles'
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        indexes = [
            models.Index(fields=['province']),
            models.Index(fields=['district']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"Profile: {self.user.full_name}"
