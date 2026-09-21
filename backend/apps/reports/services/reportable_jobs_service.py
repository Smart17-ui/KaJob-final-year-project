# apps/reports/services/reportable_jobs_service.py

from django.db.models import Q

from apps.jobs.models import Job, JobApplication, JobAssignment
from apps.common.constants import (
    ApplicationStatus, AssignmentStatus, JobStatus,
)
from apps.reports.models import Report


# Job statuses where a report makes sense
REPORTABLE_JOB_STATUSES = [
    JobStatus.ASSIGNED,
    JobStatus.IN_PROGRESS,
    JobStatus.AWAITING_CONFIRMATION,
    JobStatus.COMPLETED,
    JobStatus.CANCELLED,
]


def get_reportable_jobs(user, role=None):
    """
    Return jobs the user can file a report on, scoped to `role`.

    role='CLIENT':
        Jobs the user posted (as client) that have an assigned worker.
        Other party = the assigned worker.

    role='WORKER':
        Jobs the user was actually assigned to.
        Other party = the job's client.

    role=None or any other value:
        Empty list — the caller must select a role.

    Already-reported jobs are excluded.
    """
    if role not in ('CLIENT', 'WORKER'):
        return Job.objects.none()

    # Jobs the user already reported on (job-specific reports only)
    already_reported = Report.objects.filter(
        reporter=user,
        job__isnull=False,
    ).values_list('job_id', flat=True)

    if role == 'CLIENT':
        # Jobs where I'm the client AND there's an assignment
        jobs = (
            Job.objects
            .filter(
                client_id=user.id,
                status__in=REPORTABLE_JOB_STATUSES,
                deleted_at__isnull=True,
                assignments__isnull=False,
            )
            .exclude(id__in=list(already_reported))
            .select_related('client')
            .distinct()
        )
        return jobs.order_by('-posted_at')

    # role == 'WORKER'
    assigned_job_ids = (
        JobAssignment.objects
        .filter(
            worker_id=user.id,
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
                AssignmentStatus.CANCELLED,
            ],
        )
        .values_list('job_id', flat=True)
    )

    jobs = (
        Job.objects
        .filter(
            id__in=assigned_job_ids,
            status__in=REPORTABLE_JOB_STATUSES,
            deleted_at__isnull=True,
        )
        .exclude(id__in=list(already_reported))
        .select_related('client')
    )

    return jobs.order_by('-posted_at')
