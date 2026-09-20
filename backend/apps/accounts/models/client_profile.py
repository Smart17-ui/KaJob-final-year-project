# apps/accounts/models/client_profile.py

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

    # Reputation (updated by the reviews app)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        help_text="Average rating received from workers who completed jobs for this client.",
    )
    total_reviews = models.IntegerField(
        default=0,
        help_text="Number of reviews received from workers.",
    )

    class Meta:
        db_table = 'client_profiles'
        verbose_name = 'Client Profile'
        verbose_name_plural = 'Client Profiles'
        indexes = [
            models.Index(fields=['organization_name']),
            models.Index(fields=['average_rating']),
        ]

    def __str__(self):
        return f"Client: {self.user.full_name}"

    # ============================================
    # RATING AGGREGATION
    # ============================================

    def update_rating(self):
        """
        Recompute average_rating and total_reviews from all reviews
        received by this client.

        Called automatically after a Review is created, updated, or
        deleted where the reviewee is this client.
        """
        from django.db.models import Avg, Count

        reviews_qs = self.user.reviews_received.all()

        stats = reviews_qs.aggregate(
            total=Count('id'),
            avg=Avg('rating'),
        )

        avg_rating = stats['avg'] or 0
        total = stats['total'] or 0

        self.average_rating = round(avg_rating, 2)
        self.total_reviews = total
        self.save(update_fields=[
            'average_rating',
            'total_reviews',
            'updated_at',
        ])
