from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager

class Review(SoftDeleteMixin):
    """
    Stores user reviews and ratings.
    """
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='reviews',
        help_text="Job being reviewed"
    )
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_given',
        help_text="User giving the review"
    )
    reviewee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_received',
        help_text="User receiving the review"
    )
    rating = models.IntegerField(
        help_text="Rating (1-5 stars)"
    )
    comment = models.TextField(
        blank=True,
        help_text="Review comment"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'reviews'
        unique_together = [['job', 'reviewer']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reviewee', 'rating']),
            models.Index(fields=['job', 'reviewer']),
        ]

    def __str__(self):
        return f"{self.reviewer.full_name} -> {self.reviewee.full_name} ({self.rating}★)"

    def save(self, *args, **kwargs):
        """Override save to update worker rating"""
        super().save(*args, **kwargs)
        self.update_worker_rating()

    def update_worker_rating(self):
        """Update the reviewee's average rating"""
        from apps.accounts.models.worker_profile import WorkerProfile
        try:
            worker_profile = WorkerProfile.objects.get(user=self.reviewee)
            worker_profile.update_rating()
        except WorkerProfile.DoesNotExist:
            pass  # Not a worker
