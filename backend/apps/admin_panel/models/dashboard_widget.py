# apps/admin_panel/models/dashboard_widget.py

from django.db import models
from apps.common.models.mixins import BaseModel


class DashboardWidget(BaseModel):
    """
    Configurable dashboard widgets for admin panel.
    """
    
    WIDGET_TYPES = [
        ('USER_STATS', 'User Statistics'),
        ('JOB_STATS', 'Job Statistics'),
        ('REVIEW_STATS', 'Review Statistics'),
        ('REVENUE_STATS', 'Revenue Statistics'),
        ('RECENT_ACTIVITY', 'Recent Activity'),
        ('PENDING_VERIFICATIONS', 'Pending Verifications'),
        ('REPORTS', 'Reports'),
        ('DISCIPLINARY', 'Disciplinary Actions'),
    ]
    
    title = models.CharField(max_length=100)
    widget_type = models.CharField(max_length=50, choices=WIDGET_TYPES)
    position = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'dashboard_widgets'
        ordering = ['position']
        verbose_name = 'Dashboard Widget'
        verbose_name_plural = 'Dashboard Widgets'
    
    def __str__(self):
        return f"{self.title} ({self.get_widget_type_display()})"
