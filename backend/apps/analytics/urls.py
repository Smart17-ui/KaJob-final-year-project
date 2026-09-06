# apps/analytics/urls.py

from django.urls import path
from apps.analytics.views import (
    # Admin Analytics
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
    
    # Client Analytics
    ClientAnalyticsView,
    ClientJobAnalyticsView,
    ClientTrendsView,
    
    # Worker Analytics
    WorkerAnalyticsView,
    WorkerJobHistoryView,
    WorkerEarningsTrendView,
)

app_name = 'analytics'

urlpatterns = [
    # ============================================
    # ADMIN ANALYTICS DASHBOARD
    # ============================================
    
    path('admin/dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('admin/trend/', AnalyticsTrendView.as_view(), name='analytics-trend'),
    path('admin/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    
    # ============================================
    # ADMIN DAILY/WEEKLY/MONTHLY STATS
    # ============================================
    
    path('admin/daily/', AnalyticsDailyView.as_view(), name='analytics-daily'),
    path('admin/weekly/', AnalyticsWeeklyView.as_view(), name='analytics-weekly'),
    path('admin/monthly/', AnalyticsMonthlyView.as_view(), name='analytics-monthly'),
    
    # ============================================
    # ADMIN USER ACTIVITY
    # ============================================
    
    path('admin/user-activity/<int:user_id>/', UserActivityView.as_view(), name='user-activity'),
    path('admin/user-activity/<int:user_id>/summary/', UserActivitySummaryView.as_view(), name='user-activity-summary'),
    path('admin/top-users/', TopUsersView.as_view(), name='top-users'),
    
    # ============================================
    # ADMIN PLATFORM STATS
    # ============================================
    
    path('admin/platform-stats/', PlatformStatsView.as_view(), name='platform-stats'),
    path('admin/comparison/', ComparisonStatsView.as_view(), name='comparison-stats'),
    
    # ============================================
    # 🆕 CLIENT ANALYTICS
    # ============================================
    
    path('client/', ClientAnalyticsView.as_view(), name='client-analytics'),
    path('client/jobs/', ClientJobAnalyticsView.as_view(), name='client-job-analytics'),
    path('client/trends/', ClientTrendsView.as_view(), name='client-trends'),
    
    # ============================================
    # 🆕 WORKER ANALYTICS
    # ============================================
    
    path('worker/', WorkerAnalyticsView.as_view(), name='worker-analytics'),
    path('worker/jobs/', WorkerJobHistoryView.as_view(), name='worker-job-history'),
    path('worker/earnings-trend/', WorkerEarningsTrendView.as_view(), name='worker-earnings-trend'),
]
