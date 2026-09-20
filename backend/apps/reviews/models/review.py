# apps/reviews/models/review.py

from django.db import models
from apps.common.models.mixins import BaseModel


class Review(BaseModel):
    """
    Rating and review for a job.

    Supports two directions:
    - Client → Worker (updates WorkerProfile.average_rating)
    - Worker → Client (updates ClientProfile.average_rating)
    """
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )

    # Review Content
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    job_completed = models.BooleanField(
        default=True,
        help_text=(
            "Whether the job was actually completed by the worker. "
            "If False, the rating must be 0."
        ),
    )

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        unique_together = [['job', 'reviewer']]
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        indexes = [
            models.Index(fields=['reviewee', 'rating']),
            models.Index(fields=['job', 'reviewer']),
        ]

    def __str__(self):
        return f"{self.reviewer.full_name} -> {self.reviewee.full_name} ({self.rating}★)"

    # ============================================
    # DISPLAY HELPERS
    # ============================================

    @property
    def rating_display(self) -> str:
        """Human-readable rating string."""
        if self.rating == 0 and not self.job_completed:
            return "Job not completed"
        star_word = "star" if self.rating == 1 else "stars"
        return f"{self.rating} {star_word}"

    @property
    def is_positive(self) -> bool:
        """True if the review is 4★ or above."""
        return self.rating >= 4

    @property
    def is_negative(self) -> bool:
        """True if the review is 2★ or below (including 0)."""
        return self.rating <= 2

    @property
    def direction(self) -> str:
        """
        Return 'CLIENT_TO_WORKER' or 'WORKER_TO_CLIENT' based on who
        the reviewer is relative to the job.

        Falls back to 'UNKNOWN' if the reviewer isn't a party of the job
        (shouldn't happen since the service validates it).
        """
        if self.job.client_id == self.reviewer_id:
            return 'CLIENT_TO_WORKER'
        # Otherwise, if the reviewer is the assigned worker
        if self.job.assignments.filter(worker_id=self.reviewer_id).exists():
            return 'WORKER_TO_CLIENT'
        return 'UNKNOWN'

    # ============================================
    # SAVE HOOK — ROUTE TO THE RIGHT PROFILE
    # ============================================

    def save(self, *args, **kwargs):
        """
        Save the review, then update the appropriate profile's rating.

        - If the reviewee is a worker (has WorkerProfile) → update it
        - If the reviewee is a client (has ClientProfile) → update it
        - If both exist on the same user (admin accounts), update both
        """
        super().save(*args, **kwargs)

        from apps.accounts.models import WorkerProfile, ClientProfile

        # Try worker profile (reviewee was reviewed as a worker)
        try:
            worker_profile = WorkerProfile.objects.get(user=self.reviewee)
            worker_profile.update_rating()
        except WorkerProfile.DoesNotExist:
            pass

        # Try client profile (reviewee was reviewed as a client)
        try:
            client_profile = ClientProfile.objects.get(user=self.reviewee)
            client_profile.update_rating()
        except ClientProfile.DoesNotExist:
            pass
