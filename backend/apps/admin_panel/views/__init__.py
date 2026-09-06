# apps/admin_panel/views/__init__.py

from .dashboard_views import (
    AdminDashboardView,
    AdminRecentActivityView,
    AdminActivityChartView,
)
from .user_management_views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserSuspendView,
    AdminUserActivateView,
)
from .job_moderation_views import (
    AdminJobListView,
    AdminJobDetailView,
    AdminJobDeleteView,
)
from .review_moderation_views import (
    AdminReviewListView,
    AdminReviewApproveView,
    AdminReviewRejectView,
)
from .verification_views import (
    AdminVerificationListView,
    AdminVerificationDetailView,
    AdminVerificationApproveView,
    AdminVerificationRejectView,
    AdminVerificationStatsView,
    AdminVerificationDocumentView,
)
from .disciplinary_views import (
    DisciplinaryActionListView,
    DisciplinaryActionDetailView,
    DisciplinaryUserActionsView,
    DisciplinaryCreateView,
)
from .report_views import (
    AdminReportListView,
    AdminReportDetailView,
    AdminReportStartInvestigationView,
    AdminReportResolveView,
    AdminReportEvidenceView,
    AdminReportStatsView,
)

__all__ = [
    # Dashboard
    'AdminDashboardView',
    'AdminRecentActivityView',
    'AdminActivityChartView',
    # User Management
    'AdminUserListView',
    'AdminUserDetailView',
    'AdminUserSuspendView',
    'AdminUserActivateView',
    # Job Moderation
    'AdminJobListView',
    'AdminJobDetailView',
    'AdminJobDeleteView',
    # Review Moderation
    'AdminReviewListView',
    'AdminReviewApproveView',
    'AdminReviewRejectView',
    # Verification
    'AdminVerificationListView',
    'AdminVerificationDetailView',
    'AdminVerificationApproveView',
    'AdminVerificationRejectView',
    'AdminVerificationStatsView',
    'AdminVerificationDocumentView',
    # Disciplinary
    'DisciplinaryActionListView',
    'DisciplinaryActionDetailView',
    'DisciplinaryUserActionsView',
    'DisciplinaryCreateView',
    # Reports
    'AdminReportListView',
    'AdminReportDetailView',
    'AdminReportStartInvestigationView',
    'AdminReportResolveView',
    'AdminReportEvidenceView',
    'AdminReportStatsView',
]
