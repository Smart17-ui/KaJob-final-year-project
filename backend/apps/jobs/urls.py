# apps/jobs/urls.py

from django.urls import path
from apps.jobs.views import (
    # Job Views
    CreateJobView,
    JobDetailView,
    JobDetailForWorkerView,  # 🆕 Import the new worker view
    OpenJobsView,
    MyJobsView,
    SearchJobsView,
    FilterJobsView,
    UpdateJobView,
    DeleteJobView,
    CompleteJobView,
    CancelJobView,
    # Job Application Views
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    # MyApplicationsView,  # ← Remove
    # Job Assignment Views
    AssignWorkerView,
    WorkerAssignmentsView,
    # ActiveAssignmentsView,  # ← Remove
    CompleteAssignmentView,
    # CancelAssignmentView,  # ← Remove
)

app_name = 'jobs'

urlpatterns = [
    # ============================================
    # JOB ENDPOINTS
    # ============================================
    
    path('jobs/', OpenJobsView.as_view(), name='jobs-list'),
    path('jobs/create/', CreateJobView.as_view(), name='jobs-create'),
    path('jobs/<int:job_id>/', JobDetailView.as_view(), name='jobs-detail'),
    
    # 🆕 Worker job detail with conditional disclosure
    path('jobs/<int:job_id>/worker/', JobDetailForWorkerView.as_view(), name='jobs-detail-worker'),
    
    path('jobs/<int:job_id>/update/', UpdateJobView.as_view(), name='jobs-update'),
    path('jobs/<int:job_id>/delete/', DeleteJobView.as_view(), name='jobs-delete'),
    path('jobs/<int:job_id>/complete/', CompleteJobView.as_view(), name='jobs-complete'),
    path('jobs/<int:job_id>/cancel/', CancelJobView.as_view(), name='jobs-cancel'),
    path('jobs/search/', SearchJobsView.as_view(), name='jobs-search'),
    path('jobs/filter/', FilterJobsView.as_view(), name='jobs-filter'),
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    
    # ============================================
    # JOB APPLICATION ENDPOINTS
    # ============================================
    
    path('jobs/<int:job_id>/apply/', ApplyForJobView.as_view(), name='jobs-apply'),
    path('jobs/<int:job_id>/applications/', JobApplicationsView.as_view(), name='jobs-applications'),
    path('jobs/<int:job_id>/applications/pending/', PendingApplicationsView.as_view(), name='jobs-applications-pending'),
    path('applications/<int:application_id>/status/', UpdateApplicationStatusView.as_view(), name='applications-status'),
    # path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),  # ← Commented out
    
    # ============================================
    # JOB ASSIGNMENT ENDPOINTS
    # ============================================
    
    path('jobs/<int:job_id>/assign/', AssignWorkerView.as_view(), name='jobs-assign'),
    path('my-assignments/', WorkerAssignmentsView.as_view(), name='my-assignments'),
    # path('my-assignments/active/', ActiveAssignmentsView.as_view(), name='my-assignments-active'),  # ← Commented out
    path('assignments/<int:assignment_id>/complete/', CompleteAssignmentView.as_view(), name='assignments-complete'),
    # path('assignments/<int:assignment_id>/cancel/', CancelAssignmentView.as_view(), name='assignments-cancel'),  # ← Commented out
]
