# apps/analytics/serializers/__init__.py

from .analytics_serializer import (
    DailyStatsSerializer,
    WeeklyStatsSerializer,
    MonthlyStatsSerializer,
    UserActivitySerializer,
    TrendDataSerializer,
    SummaryStatsSerializer,
)

# 🆕 Import client analytics serializers
from .client_analytics_serializer import (
    ClientAnalyticsSerializer,
    ClientJobStatsSerializer,
    ClientApplicationStatsSerializer,
    ClientSpendingStatsSerializer,
    ClientWorkerStatsSerializer,
    ClientJobDetailSerializer,
    ClientApplicationDetailSerializer,
)

# 🆕 Import worker analytics serializers
from .worker_analytics_serializer import (
    WorkerAnalyticsSerializer,
    WorkerOverviewStatsSerializer,
    WorkerJobStatsSerializer,
    WorkerEarningsStatsSerializer,
    WorkerPerformanceStatsSerializer,
    WorkerJobDetailSerializer,
    WorkerEarningDetailSerializer,
)

__all__ = [
    # Admin Analytics
    'DailyStatsSerializer',
    'WeeklyStatsSerializer',
    'MonthlyStatsSerializer',
    'UserActivitySerializer',
    'TrendDataSerializer',
    'SummaryStatsSerializer',
    
    # Client Analytics
    'ClientAnalyticsSerializer',
    'ClientJobStatsSerializer',
    'ClientApplicationStatsSerializer',
    'ClientSpendingStatsSerializer',
    'ClientWorkerStatsSerializer',
    'ClientJobDetailSerializer',
    'ClientApplicationDetailSerializer',
    
    # Worker Analytics
    'WorkerAnalyticsSerializer',
    'WorkerOverviewStatsSerializer',
    'WorkerJobStatsSerializer',
    'WorkerEarningsStatsSerializer',
    'WorkerPerformanceStatsSerializer',
    'WorkerJobDetailSerializer',
    'WorkerEarningDetailSerializer',
]
