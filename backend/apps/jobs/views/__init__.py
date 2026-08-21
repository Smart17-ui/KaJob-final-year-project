# apps/jobs/views/__init__.py

from .job_views import (
    CreateJobView,
    JobDetailView,
    JobDetailForWorkerView,  # 🆕 Add this import
    OpenJobsView,
    MyJobsView,
    SearchJobsView,
    FilterJobsView,
    UpdateJobView,
    DeleteJobView,
    CompleteJobView,
    CancelJobView,
)
from .job_application_views import (
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    # MyApplicationsView,  # ← Remove this if not defined
)
from .job_assignment_views import (
    AssignWorkerView,
    WorkerAssignmentsView,
    # ActiveAssignmentsView,  # ← Remove this if not defined
    CompleteAssignmentView,
    # CancelAssignmentView,  # ← Remove this if not defined
)

__all__ = [
    # Job Views
    'CreateJobView',
    'JobDetailView',
    'JobDetailForWorkerView',  # 🆕 Add this to __all__
    'OpenJobsView',
    'MyJobsView',
    'SearchJobsView',
    'FilterJobsView',
    'UpdateJobView',
    'DeleteJobView',
    'CompleteJobView',
    'CancelJobView',
    
    # Job Application Views
    'ApplyForJobView',
    'JobApplicationsView',
    'PendingApplicationsView',
    'UpdateApplicationStatusView',
    
    # Job Assignment Views
    'AssignWorkerView',
    'WorkerAssignmentsView',
    'CompleteAssignmentView',
]
