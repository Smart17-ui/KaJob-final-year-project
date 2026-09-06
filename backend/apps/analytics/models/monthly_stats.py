# apps/analytics/models/monthly_stats.py

from django.db import models
from apps.common.models.mixins import BaseModel


class MonthlyStats(BaseModel):
    """
    Monthly aggregation of platform statistics.
    """
    
    month = models.DateField(unique=True)
    
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
        db_table = 'analytics_monthly_stats'
        ordering = ['-month']
        verbose_name = 'Monthly Stat'
        verbose_name_plural = 'Monthly Stats'
        indexes = [
            models.Index(fields=['month']),
        ]
    
    def __str__(self):
        return f"Month {self.month.strftime('%B %Y')}"
