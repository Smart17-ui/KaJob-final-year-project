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
    # Job lifecycle
    WorkerWithdrawView,
    WorkerStartJobView,
    RaiseDisputeView,
    # Hide / Unhide (NEW)
    HideJobView,
    UnhideJobView,
    HideAssignmentView,
    UnhideAssignmentView,
)

from .job_application_views import (
    ApplyForJobView,
    JobApplicationsView,
    PendingApplicationsView,
    UpdateApplicationStatusView,
    WithdrawApplicationView,
    MyApplicationsView,
    MyJobApplicationsView,
    ClientApplicationsView,
)

from .job_assignment_views import (
    AssignWorkerView,
    WorkerAssignmentsView,
    ActiveAssignmentsView,
    WorkerMarkCompleteView,
    ClientConfirmCompleteView,
)

from .application_status_views import (
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

    # Job lifecycle
    'WorkerWithdrawView',
    'WorkerStartJobView',
    'RaiseDisputeView',

    # Hide / Unhide (NEW)
    'HideJobView',
    'UnhideJobView',
    'HideAssignmentView',
    'UnhideAssignmentView',

    # Job Application Views
    'ApplyForJobView',
    'JobApplicationsView',
    'PendingApplicationsView',
    'UpdateApplicationStatusView',
    'WithdrawApplicationView',
    'MyApplicationsView',
    'MyJobApplicationsView',
    'ClientApplicationsView',

    # Job Assignment Views
    'AssignWorkerView',
    'WorkerAssignmentsView',
    'ActiveAssignmentsView',
    'WorkerMarkCompleteView',
    'ClientConfirmCompleteView',

    # Application Status Views
    'ApplicationStatusView',
    'ApplicationStatusTransitionView',
    'ApplicationStatusSummaryView',
    'ApplicationStatusOptionsView',
]