from django.db import models
from apps.common.models.mixins import BaseModel


class Review(BaseModel):
    """
    Rating and review for a job.
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
    
    def save(self, *args, **kwargs):
        """Override save to update worker rating"""
        super().save(*args, **kwargs)
        
        # Update worker's average rating
        from apps.accounts.models import WorkerProfile
        try:
            worker_profile = WorkerProfile.objects.get(user=self.reviewee)
            worker_profile.update_rating()
        except WorkerProfile.DoesNotExist:
            pass
