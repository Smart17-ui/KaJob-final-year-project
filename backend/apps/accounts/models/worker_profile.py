from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager
from apps.common.constants import AvailabilityStatus

class WorkerProfile(SoftDeleteMixin):
    """
    Worker-specific information.
    """
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='worker_profile'
    )
    bio = models.TextField(blank=True)
    current_location = models.JSONField(
        null=True,
        blank=True,
        default=dict
    )
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.CHOICES,
        default=AvailabilityStatus.AVAILABLE
    )
    availability_updated_at = models.DateTimeField(auto_now=True)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00
    )
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'worker_profiles'
        ordering = ['-average_rating']
        indexes = [
            models.Index(fields=['availability_status']),
            models.Index(fields=['user', 'availability_status']),
        ]

    def __str__(self):
        return f"Worker: {self.user.full_name}"

    @property
    def is_available(self):
        return (
            self.availability_status == AvailabilityStatus.AVAILABLE
            and self.user.is_verified
            and self.user.is_active
            and not self.is_deleted
        )

    def get_latitude(self):
        if self.current_location:
            return self.current_location.get('latitude')
        return None
    
    def get_longitude(self):
        if self.current_location:
            return self.current_location.get('longitude')
        return None
    
    def set_location(self, latitude, longitude):
        self.current_location = {
            'latitude': latitude,
            'longitude': longitude
        }

    def update_rating(self):
        from apps.reviews.models import Review
        from django.db.models import Avg
        
        reviews = Review.objects.filter(reviewee=self.user, deleted_at__isnull=True)
        if reviews.exists():
            avg = reviews.aggregate(Avg('rating'))['rating__avg']
            self.average_rating = round(avg, 2)
            self.total_reviews = reviews.count()
            self.save()
