# apps/analytics/models/user_activity.py

from django.db import models
from apps.common.models.mixins import BaseModel


class UserActivity(BaseModel):
    """
    Track individual user activity.
    """
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='analytics_activity'
    )
    
    # Activity counts
    page_views = models.IntegerField(default=0)
    jobs_viewed = models.IntegerField(default=0)
    jobs_applied = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    reviews_given = models.IntegerField(default=0)
    reviews_received = models.IntegerField(default=0)
    
    # Last activity
    last_active_at = models.DateTimeField(null=True, blank=True)
    
    # Session
    session_count = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0)
    
    # Date
    date = models.DateField()
    
    class Meta:
        db_table = 'analytics_user_activity'
        ordering = ['-date']
        unique_together = [['user', 'date']]
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.date}"
