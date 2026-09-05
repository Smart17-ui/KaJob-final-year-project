# apps/analytics/views/__init__.py

# Admin Analytics
from .analytics_views import (
    AnalyticsDashboardView,
    AnalyticsTrendView,
    AnalyticsSummaryView,
    AnalyticsDailyView,
    AnalyticsWeeklyView,
    AnalyticsMonthlyView,
)

# Stats Views (Admin)
from .stats_views import (
    UserActivityView,
    UserActivitySummaryView,
    TopUsersView,
    PlatformStatsView,
    ComparisonStatsView,
)

# 🆕 Client Analytics
from .client_analytics import (
    ClientAnalyticsView,
    ClientJobAnalyticsView,
    ClientTrendsView,
)

# 🆕 Worker Analytics
from .worker_analytics import (
    WorkerAnalyticsView,
    WorkerJobHistoryView,
    WorkerEarningsTrendView,
)

__all__ = [
    # Admin Analytics
    'AnalyticsDashboardView',
    'AnalyticsTrendView',
    'AnalyticsSummaryView',
    'AnalyticsDailyView',
    'AnalyticsWeeklyView',
    'AnalyticsMonthlyView',
    
    # Stats Views
    'UserActivityView',
    'UserActivitySummaryView',
    'TopUsersView',
    'PlatformStatsView',
    'ComparisonStatsView',
    
    # Client Analytics
    'ClientAnalyticsView',
    'ClientJobAnalyticsView',
    'ClientTrendsView',
    
    # Worker Analytics
    'WorkerAnalyticsView',
    'WorkerJobHistoryView',
    'WorkerEarningsTrendView',
]
