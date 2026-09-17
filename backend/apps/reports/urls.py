# apps/reports/urls.py

from django.urls import path

from apps.reports.views import (
    ReportableJobsView,
    CreateReportView,
    MyReportsView,
    MyReportDetailView,
)

app_name = 'reports'

urlpatterns = [
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
]
