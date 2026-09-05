# apps/jobs/views/__init__.py

from .job_views import (
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
from .job_application_views import (
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    MyApplicationsView,
    MyJobApplicationsView,
    ClientApplicationsView,
)
from .job_assignment_views import (
    AssignWorkerView,
    WorkerMarkCompleteView,
    ClientConfirmCompleteView,
)
from .application_status_views import (  # 🆕 Add this
    ApplicationStatusView,
    ApplicationStatusTransitionView,
    ApplicationStatusSummaryView,
    ApplicationStatusOptionsView,
)

__all__ = [
    # Job Views
    'CreateJobView',
    'JobDetailView',
    'OpenJobsView',
    'MyJobsView',
    'MyOpenJobsView',
    'MyActiveJobsView',
    'SearchJobsView',
    'FilterJobsView',
    'UpdateJobView',
    'DeleteJobView',
    'CancelJobView',
    'CompleteJobView',
    'JobDetailForWorkerView',
    
    # Job Application Views
    'ApplyForJobView',
    'JobApplicationsView',
    'PendingApplicationsView',
    'UpdateApplicationStatusView',
    'MyApplicationsView',
    'MyJobApplicationsView',
    'ClientApplicationsView',
    
    # Job Assignment Views
    'AssignWorkerView',
    'WorkerMarkCompleteView',
    'ClientConfirmCompleteView',
    
    # Application Status Views
    'ApplicationStatusView',
    'ApplicationStatusTransitionView',
    'ApplicationStatusSummaryView',
    'ApplicationStatusOptionsView',
]
