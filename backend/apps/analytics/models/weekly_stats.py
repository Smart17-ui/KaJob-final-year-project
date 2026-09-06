# apps/analytics/models/weekly_stats.py

from django.db import models
from apps.common.models.mixins import BaseModel


class WeeklyStats(BaseModel):
    """
    Weekly aggregation of platform statistics.
    """
    
    week_start = models.DateField(unique=True)
    week_end = models.DateField()
    
    # User Stats
    total_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    
    # Job Stats
    jobs_created = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    
    # Review Stats
    reviews_created = models.IntegerField(default=0)
    avg_rating = models.FloatField(default=0)
    
    # Visit Stats
    total_page_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'analytics_weekly_stats'
        ordering = ['-week_start']
        verbose_name = 'Weekly Stat'
        verbose_name_plural = 'Weekly Stats'
        indexes = [
            models.Index(fields=['week_start']),
        ]
    
    def __str__(self):
        return f"Week {self.week_start} to {self.week_end}"
