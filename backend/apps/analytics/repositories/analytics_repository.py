# apps/analytics/repositories/analytics_repository.py

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from apps.common.repositories import BaseRepository
from apps.analytics.models import DailyStats, WeeklyStats, MonthlyStats, UserActivity


class AnalyticsRepository(BaseRepository):
    """Repository for analytics data operations."""
    
    def __init__(self):
        pass
    
    # ============================================
    # DAILY STATS
    # ============================================
    
    def get_daily_stats(self, date=None) -> Optional[DailyStats]:
        """Get daily stats for a specific date."""
        if date is None:
            date = timezone.now().date()
        try:
            return DailyStats.objects.get(date=date)
        except DailyStats.DoesNotExist:
            return None
    
    def get_daily_stats_range(self, start_date, end_date) -> List[DailyStats]:
        """Get daily stats for a date range."""
        return DailyStats.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
    
    # ============================================
    # WEEKLY STATS
    # ============================================
    
    def get_weekly_stats(self, week_start=None) -> Optional[WeeklyStats]:
        """Get weekly stats for a specific week."""
        if week_start is None:
            today = timezone.now().date()
            week_start = today - timedelta(days=today.weekday())
        try:
            return WeeklyStats.objects.get(week_start=week_start)
        except WeeklyStats.DoesNotExist:
            return None
    
    def get_weekly_stats_range(self, start_date, end_date) -> List[WeeklyStats]:
        """Get weekly stats for a date range."""
        return WeeklyStats.objects.filter(
            week_start__gte=start_date,
            week_start__lte=end_date
        ).order_by('week_start')
    
    # ============================================
    # MONTHLY STATS
    # ============================================
    
    def get_monthly_stats(self, month=None) -> Optional[MonthlyStats]:
        """Get monthly stats for a specific month."""
        if month is None:
            month = timezone.now().date().replace(day=1)
        try:
            return MonthlyStats.objects.get(month=month)
        except MonthlyStats.DoesNotExist:
            return None
    
    def get_monthly_stats_range(self, start_date, end_date) -> List[MonthlyStats]:
        """Get monthly stats for a date range."""
        return MonthlyStats.objects.filter(
            month__gte=start_date,
            month__lte=end_date
        ).order_by('month')
    
    # ============================================
    # USER ACTIVITY
    # ============================================
    
    def get_user_activity(self, user_id: int, date=None) -> Optional[UserActivity]:
        """Get user activity for a specific date."""
        if date is None:
            date = timezone.now().date()
        try:
            return UserActivity.objects.get(user_id=user_id, date=date)
        except UserActivity.DoesNotExist:
            return None
    
    def get_user_activity_range(self, user_id: int, start_date, end_date) -> List[UserActivity]:
        """Get user activity for a date range."""
        return UserActivity.objects.filter(
            user_id=user_id,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
    
    # ============================================
    # AGGREGATED DATA
    # ============================================
    
    def get_trend_data(self, days: int = 30) -> Dict[str, Any]:
        """Get trend data for the last N days."""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        daily_stats = self.get_daily_stats_range(start_date, end_date)
        
        return {
            'labels': [stat.date.strftime('%b %d') for stat in daily_stats],
            'datasets': {
                'new_users': [stat.new_users for stat in daily_stats],
                'jobs_created': [stat.jobs_created for stat in daily_stats],
                'reviews_created': [stat.reviews_created for stat in daily_stats],
                'page_views': [stat.total_page_views for stat in daily_stats],
            }
        }
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics."""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        today_stats = self.get_daily_stats(today)
        week_stats = self.get_daily_stats_range(week_ago, today)
        month_stats = self.get_daily_stats_range(month_ago, today)
        
        return {
            'today': {
                'new_users': today_stats.new_users if today_stats else 0,
                'new_jobs': today_stats.jobs_created if today_stats else 0,
                'new_reviews': today_stats.reviews_created if today_stats else 0,
                'page_views': today_stats.total_page_views if today_stats else 0,
                'unique_visitors': today_stats.unique_visitors if today_stats else 0,
            },
            'week': {
                'new_users': sum(stat.new_users for stat in week_stats),
                'new_jobs': sum(stat.jobs_created for stat in week_stats),
                'new_reviews': sum(stat.reviews_created for stat in week_stats),
                'page_views': sum(stat.total_page_views for stat in week_stats),
                'unique_visitors': sum(stat.unique_visitors for stat in week_stats),
            },
            'month': {
                'new_users': sum(stat.new_users for stat in month_stats),
                'new_jobs': sum(stat.jobs_created for stat in month_stats),
                'new_reviews': sum(stat.reviews_created for stat in month_stats),
                'page_views': sum(stat.total_page_views for stat in month_stats),
                'unique_visitors': sum(stat.unique_visitors for stat in month_stats),
            },
        }
