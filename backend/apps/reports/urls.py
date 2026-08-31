# apps/admin_panel/urls.py

from django.urls import path
from apps.admin_panel.views import (
    # Dashboard
    AdminDashboardView,
    AdminRecentActivityView,
    AdminActivityChartView,
    # User Management
    AdminUserListView,
    AdminUserDetailView,
    AdminUserSuspendView,
    AdminUserActivateView,
    # Job Moderation
    AdminJobListView,
    AdminJobDetailView,
    AdminJobDeleteView,
    # Review Moderation
    AdminReviewListView,
    AdminReviewApproveView,
    AdminReviewRejectView,
    # Verification
    AdminVerificationListView,
    AdminVerificationDetailView,
    AdminVerificationApproveView,
    AdminVerificationRejectView,
    AdminVerificationStatsView,
    AdminVerificationDocumentView,
    # Disciplinary
    DisciplinaryActionListView,
    DisciplinaryActionDetailView,
    DisciplinaryUserActionsView,
    DisciplinaryCreateView,
    # Reports
    AdminReportListView,
    AdminReportDetailView,
    AdminReportStartInvestigationView,
    AdminReportResolveView,
    AdminReportEvidenceView,
    AdminReportStatsView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('activity/recent/', AdminRecentActivityView.as_view(), name='admin-activity-recent'),
    path('activity/chart/', AdminActivityChartView.as_view(), name='admin-activity-chart'),
    
    # User Management
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:user_id>/suspend/', AdminUserSuspendView.as_view(), name='admin-user-suspend'),
    path('users/<int:user_id>/activate/', AdminUserActivateView.as_view(), name='admin-user-activate'),
    
    # Job Moderation
    path('jobs/', AdminJobListView.as_view(), name='admin-jobs'),
    path('jobs/<int:job_id>/', AdminJobDetailView.as_view(), name='admin-job-detail'),
    path('jobs/<int:job_id>/delete/', AdminJobDeleteView.as_view(), name='admin-job-delete'),
    
    # Review Moderation
    path('reviews/', AdminReviewListView.as_view(), name='admin-reviews'),
    path('reviews/<int:review_id>/approve/', AdminReviewApproveView.as_view(), name='admin-review-approve'),
    path('reviews/<int:review_id>/reject/', AdminReviewRejectView.as_view(), name='admin-review-reject'),
    
    # Verification
    path('verifications/', AdminVerificationListView.as_view(), name='admin-verifications'),
    path('verifications/<int:verification_id>/', AdminVerificationDetailView.as_view(), name='admin-verification-detail'),
    path('verifications/<int:verification_id>/approve/', AdminVerificationApproveView.as_view(), name='admin-verification-approve'),
    path('verifications/<int:verification_id>/reject/', AdminVerificationRejectView.as_view(), name='admin-verification-reject'),
    path('verifications/stats/', AdminVerificationStatsView.as_view(), name='admin-verification-stats'),
    path('verifications/<int:verification_id>/documents/', AdminVerificationDocumentView.as_view(), name='admin-verification-documents'),
    
    # Disciplinary Actions
    path('disciplinary/create/', DisciplinaryCreateView.as_view(), name='disciplinary-create'),
    path('disciplinary/actions/', DisciplinaryActionListView.as_view(), name='disciplinary-actions'),
    path('disciplinary/actions/<int:action_id>/', DisciplinaryActionDetailView.as_view(), name='disciplinary-action-detail'),
    path('disciplinary/users/<int:user_id>/actions/', DisciplinaryUserActionsView.as_view(), name='disciplinary-user-actions'),
    
    # Reports
    path('reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('reports/<int:report_id>/', AdminReportDetailView.as_view(), name='admin-report-detail'),
    path('reports/<int:report_id>/investigate/', AdminReportStartInvestigationView.as_view(), name='admin-report-investigate'),
    path('reports/<int:report_id>/resolve/', AdminReportResolveView.as_view(), name='admin-report-resolve'),
    path('reports/<int:report_id>/evidence/', AdminReportEvidenceView.as_view(), name='admin-report-evidence'),
    path('reports/stats/', AdminReportStatsView.as_view(), name='admin-report-stats'),
]
