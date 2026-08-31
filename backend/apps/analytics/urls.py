# apps/analytics/urls.py

from django.urls import path
from apps.analytics.views import (
    # Analytics Views
    AnalyticsDashboardView,
    AnalyticsTrendView,
    AnalyticsSummaryView,
    AnalyticsDailyView,
    AnalyticsWeeklyView,
    AnalyticsMonthlyView,
    # Stats Views
    UserActivityView,
    UserActivitySummaryView,
    TopUsersView,
    PlatformStatsView,
    ComparisonStatsView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    
    # Trend Data
    path('trend/', AnalyticsTrendView.as_view(), name='analytics-trend'),
    
    # Summary
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    
    # Daily Stats
    path('daily/', AnalyticsDailyView.as_view(), name='analytics-daily'),
    
    # Weekly Stats
    path('weekly/', AnalyticsWeeklyView.as_view(), name='analytics-weekly'),
    
    # Monthly Stats
    path('monthly/', AnalyticsMonthlyView.as_view(), name='analytics-monthly'),
    
    # User Activity
    path('user-activity/<int:user_id>/', UserActivityView.as_view(), name='user-activity'),
    path('user-activity/<int:user_id>/summary/', UserActivitySummaryView.as_view(), name='user-activity-summary'),
    
    # Top Users
    path('top-users/', TopUsersView.as_view(), name='top-users'),
    
    # Platform Stats
    path('platform-stats/', PlatformStatsView.as_view(), name='platform-stats'),
    
    # Comparison
    path('comparison/', ComparisonStatsView.as_view(), name='comparison-stats'),
]
