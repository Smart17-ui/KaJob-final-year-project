# apps/analytics/services/analytics_service.py

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from apps.analytics.repositories import AnalyticsRepository
from apps.analytics.models import DailyStats, WeeklyStats, MonthlyStats, UserActivity

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Main service for analytics operations.
    """
    
    def __init__(self):
        self.repository = AnalyticsRepository()
    
    # ============================================
    # GET STATS
    # ============================================
    
    def get_daily_stats(self, date=None) -> Optional[DailyStats]:
        """Get daily stats for a specific date."""
        return self.repository.get_daily_stats(date)
    
    def get_weekly_stats(self, week_start=None) -> Optional[WeeklyStats]:
        """Get weekly stats for a specific week."""
        return self.repository.get_weekly_stats(week_start)
    
    def get_monthly_stats(self, month=None) -> Optional[MonthlyStats]:
        """Get monthly stats for a specific month."""
        return self.repository.get_monthly_stats(month)
    
    def get_user_activity(self, user_id: int, date=None) -> Optional[UserActivity]:
        """Get user activity for a specific date."""
        return self.repository.get_user_activity(user_id, date)
    
    # ============================================
    # TREND DATA
    # ============================================
    
    def get_trend_data(self, days: int = 30) -> Dict[str, Any]:
        """Get trend data for the last N days."""
        return self.repository.get_trend_data(days)
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics."""
        return self.repository.get_summary_stats()
    
    # ============================================
    # USER ACTIVITY TRACKING
    # ============================================
    
    def track_page_view(self, user, request=None):
        """Track a page view for a user."""
        if not user or not user.is_authenticated:
            return
        
        from apps.analytics.services import TrackingService
        TrackingService.track_page_view(user, request)
    
    def track_job_view(self, user, job):
        """Track a job view."""
        if not user or not user.is_authenticated:
            return
        
        from apps.analytics.services import TrackingService
        TrackingService.track_job_view(user, job)
    
    def track_job_application(self, user, job):
        """Track a job application."""
        if not user or not user.is_authenticated:
            return
        
        from apps.analytics.services import TrackingService
        TrackingService.track_job_application(user, job)
    
    def track_job_completion(self, user, job):
        """Track a job completion."""
        if not user or not user.is_authenticated:
            return
        
        from apps.analytics.services import TrackingService
        TrackingService.track_job_completion(user, job)
