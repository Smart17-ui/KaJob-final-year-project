# apps/jobs/urls.py

from django.urls import path
from apps.jobs.views import (  # Import from views __init__
    # Job Views
    CreateJobView,
    JobDetailView,
    OpenJobsView,
    MyJobsView,
    MyOpenJobsView,
    MyActiveJobsView,
    SearchJobsView,
    FilterJobsView,
    UpdateJobView,
    DeleteJobView,
    CancelJobView,
    CompleteJobView,
    JobDetailForWorkerView,
    # Job Application Views
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    MyApplicationsView,
    MyJobApplicationsView,
    ClientApplicationsView,
    # Job Assignment Views
    AssignWorkerView,
    WorkerMarkCompleteView,
    ClientConfirmCompleteView,
    # Application Status Views  # 🆕 Add these
    ApplicationStatusView,
    ApplicationStatusTransitionView,
    ApplicationStatusSummaryView,
    ApplicationStatusOptionsView,
)

app_name = 'jobs'

urlpatterns = [
    # ============================================
    # JOB CRUD
    # ============================================
    
    path('create/', CreateJobView.as_view(), name='create-job'),
    path('', OpenJobsView.as_view(), name='open-jobs'),
    path('<int:job_id>/', JobDetailView.as_view(), name='job-detail'),
    path('<int:job_id>/update/', UpdateJobView.as_view(), name='update-job'),
    path('<int:job_id>/delete/', DeleteJobView.as_view(), name='delete-job'),
    path('<int:job_id>/cancel/', CancelJobView.as_view(), name='cancel-job'),
    
    # ============================================
    # APPLY FOR JOB
    # ============================================
    
    path('<int:job_id>/apply/', ApplyForJobView.as_view(), name='apply-for-job'),
    
    # ============================================
    # JOB APPLICATIONS (Client View)
    # ============================================
    
    path('<int:job_id>/applications/', JobApplicationsView.as_view(), name='job-applications'),
    path('<int:job_id>/applications/pending/', PendingApplicationsView.as_view(), name='pending-applications'),
    
    # Application Status Summary
    path('<int:job_id>/applications/summary/', ApplicationStatusSummaryView.as_view(), name='application-status-summary'),
    
    # Client Applications (Consolidated)
    path('applications/client/', ClientApplicationsView.as_view(), name='client-applications'),
    
    # Update Application Status (Atomic Accept/Reject)
    path('applications/<int:application_id>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    
    # ============================================
    # APPLICATION STATUS MANAGEMENT
    # ============================================
    
    # Get status info for an application
    path('applications/<int:application_id>/status-info/', ApplicationStatusView.as_view(), name='application-status-info'),
    
    # Transition to a new status
    path('applications/<int:application_id>/transition/', ApplicationStatusTransitionView.as_view(), name='application-transition'),
    
    # Get all available statuses
    path('applications/statuses/', ApplicationStatusOptionsView.as_view(), name='application-statuses'),
    
    # ============================================
    # MY JOBS & APPLICATIONS (Worker View)
    # ============================================
    
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),
    path('my-job-applications/', MyJobApplicationsView.as_view(), name='my-job-applications'),
    
    # ============================================
    # WORKER JOB DETAIL (Conditional Disclosure)
    # ============================================
    
    path('<int:job_id>/worker/', JobDetailForWorkerView.as_view(), name='job-detail-for-worker'),
    
    # ============================================
    # JOB ASSIGNMENTS
    # ============================================
    
    path('<int:job_id>/assign/', AssignWorkerView.as_view(), name='assign-worker'),
    path('<int:job_id>/mark-complete/', WorkerMarkCompleteView.as_view(), name='worker-mark-complete'),
    path('<int:job_id>/confirm/', ClientConfirmCompleteView.as_view(), name='client-confirm-complete'),
    
    # ============================================
    # MY JOBS
    # ============================================
    
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    path('my-open-jobs/', MyOpenJobsView.as_view(), name='my-open-jobs'),
    path('my-active-jobs/', MyActiveJobsView.as_view(), name='my-active-jobs'),
    
    # ============================================
    # SEARCH & FILTER
    # ============================================
    
    path('search/', SearchJobsView.as_view(), name='search-jobs'),
    path('filter/', FilterJobsView.as_view(), name='filter-jobs'),
]
