# apps/jobs/views/__init__.py
from .job_views import (
    CreateJobView,
    JobDetailView,
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
    'CreateJobView',
    'JobDetailView',
    'OpenJobsView',
    'MyJobsView',
    'SearchJobsView',
    'FilterJobsView',
    'UpdateJobView',
    'DeleteJobView',
    'CompleteJobView',
    'CancelJobView',
    'ApplyForJobView',
    'JobApplicationsView',
    'PendingApplicationsView',
    'UpdateApplicationStatusView',
    'AssignWorkerView',
    'WorkerAssignmentsView',
    'CompleteAssignmentView',
]
