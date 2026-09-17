# apps/reports/services/reportable_jobs_service.py

from django.db.models import Q

from apps.jobs.models import Job, JobApplication, JobAssignment
from apps.common.constants import (
    ApplicationStatus, AssignmentStatus,
)
from apps.reports.models import Report


def get_reportable_jobs(user):
    """
    Returns jobs where `user` was a participant.

    A user is a participant if:
      1. They are the client (posted the job), OR
      2. They had an ACCEPTED/COMPLETED application for the job, OR
      3. They had an ACTIVE/IN_PROGRESS/COMPLETED assignment for the job.

    Excludes jobs the user already filed a report on.
    """
    # Jobs where I'm the client
    as_client = Q(client=user)

    # Jobs where my application was accepted/completed
    accepted_app_jobs = JobApplication.objects.filter(
        worker=user,
        status__in=[
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.COMPLETED,
        ],
    ).values_list('job_id', flat=True)

    # Jobs where I had an assignment
    assignment_jobs = JobAssignment.objects.filter(
        worker=user,
        status__in=[
            AssignmentStatus.ACTIVE,
            AssignmentStatus.IN_PROGRESS,
            AssignmentStatus.COMPLETED,
        ],
    ).values_list('job_id', flat=True)

    # Already reported jobs (don't show again)
    already_reported = Report.objects.filter(
        reporter=user
    ).values_list('job_id', flat=True)

    jobs = Job.objects.filter(
        as_client | Q(id__in=list(accepted_app_jobs)) | Q(id__in=list(assignment_jobs))
    ).exclude(
        id__in=list(already_reported)
    ).select_related('client').order_by('-posted_at')

    return jobs
