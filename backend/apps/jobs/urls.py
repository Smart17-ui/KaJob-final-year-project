# apps/jobs/urls.py

from django.urls import path
from apps.jobs.views.job_views import (
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
)
from apps.jobs.views.job_application_views import (
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    MyApplicationsView,
    MyJobApplicationsView,
)
from apps.jobs.views.job_assignment_views import (
    AssignWorkerView,
    WorkerMarkCompleteView,
    ClientConfirmCompleteView,
)

app_name = 'jobs'

urlpatterns = [
    # ============================================
    # JOB CRUD
    # ============================================
    
    path('', OpenJobsView.as_view(), name='open-jobs'),  # /api/jobs/
    path('create/', CreateJobView.as_view(), name='create-job'),  # /api/jobs/create/
    path('<int:job_id>/', JobDetailView.as_view(), name='job-detail'),  # /api/jobs/4/
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
    path('applications/<int:application_id>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
    
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
