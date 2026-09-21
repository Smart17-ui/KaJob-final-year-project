# apps/reports/urls.py

from django.urls import path

from apps.reports.views import (
    ReportableJobsView,
    CreateReportView,
    MyReportsView,
    MyReportDetailView,
    AdminReportListView,
    AdminReportDetailView,
    AdminReportStartInvestigationView,
    AdminReportResolveView,
    AdminReportEvidenceView,
    AdminReportStatsView,
)

app_name = 'reports'

urlpatterns = [
    # ============================================
    # USER-FACING (worker + client)
    # ============================================
    path(
        'reportable-jobs/',
        ReportableJobsView.as_view(),
        name='reportable-jobs',
    ),
    path(
        '',
        CreateReportView.as_view(),
        name='create-report',
    ),
    path(
        'my/',
        MyReportsView.as_view(),
        name='my-reports',
    ),
    path(
        'my/<int:report_id>/',
        MyReportDetailView.as_view(),
        name='my-report-detail',
    ),

    # ============================================
    # ADMIN-FACING
    # Full URLs become:
    #   /api/reports/admin/
    #   /api/reports/admin/stats/
    #   /api/reports/admin/<id>/
    #   /api/reports/admin/<id>/investigate/
    #   /api/reports/admin/<id>/resolve/
    #   /api/reports/admin/<id>/evidence/
    # ============================================
    path(
        'admin/',
        AdminReportListView.as_view(),
        name='admin-report-list',
    ),
    path(
        'admin/stats/',
        AdminReportStatsView.as_view(),
        name='admin-report-stats',
    ),
    path(
        'admin/<int:report_id>/',
        AdminReportDetailView.as_view(),
        name='admin-report-detail',
    ),
    path(
        'admin/<int:report_id>/investigate/',
        AdminReportStartInvestigationView.as_view(),
        name='admin-report-investigate',
    ),
    path(
        'admin/<int:report_id>/resolve/',
        AdminReportResolveView.as_view(),
        name='admin-report-resolve',
    ),
    path(
        'admin/<int:report_id>/evidence/',
        AdminReportEvidenceView.as_view(),
        name='admin-report-evidence',
    ),
]
