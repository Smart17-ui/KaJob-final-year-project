from django.db import models
from apps.common.models.mixins import BaseModel


def profile_photo_upload_path(instance, filename):
    """
    Store profile photos as:
      media/profile_photos/<user_id>/<filename>
    """
    return f"profile_photos/{instance.user_id}/{filename}"


class Profile(BaseModel):
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='profile'
    )

    bio = models.TextField(blank=True)

    profile_photo_path = models.ImageField(
        upload_to=profile_photo_upload_path,
        max_length=500,
        blank=True,
        null=True,
    )

    address = models.TextField(blank=True)
    province = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)

    # Location
    latitude = models.DecimalField(
        max_digits=10, decimal_places=8, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=11, decimal_places=8, null=True, blank=True
    )
    location_updated_at = models.DateTimeField(null=True, blank=True)

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
