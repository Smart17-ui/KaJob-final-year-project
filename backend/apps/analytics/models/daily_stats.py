# apps/analytics/models/daily_stats.py

from django.db import models
from apps.common.models.mixins import BaseModel


class DailyStats(BaseModel):
    """
    Daily snapshot of platform statistics.
    """
    
    date = models.DateField(unique=True)
    
    # User Stats
    total_users = models.IntegerField(default=0)
    total_workers = models.IntegerField(default=0)
    total_clients = models.IntegerField(default=0)
    total_both_roles = models.IntegerField(default=0)
    verified_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    
    # New Users
    new_users = models.IntegerField(default=0)
    new_workers = models.IntegerField(default=0)
    new_clients = models.IntegerField(default=0)
    
    # Job Stats
    total_jobs = models.IntegerField(default=0)
    jobs_created = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    jobs_cancelled = models.IntegerField(default=0)
    open_jobs = models.IntegerField(default=0)
    assigned_jobs = models.IntegerField(default=0)
    in_progress_jobs = models.IntegerField(default=0)
    
    # Review Stats
    total_reviews = models.IntegerField(default=0)
    reviews_created = models.IntegerField(default=0)
    avg_rating = models.FloatField(default=0)
    rating_distribution = models.JSONField(default=dict)
    
    # Visit Stats
    total_page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analytics_daily_stats'
        ordering = ['-date']
        verbose_name = 'Daily Stat'
        verbose_name_plural = 'Daily Stats'
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Stats for {self.date}"
