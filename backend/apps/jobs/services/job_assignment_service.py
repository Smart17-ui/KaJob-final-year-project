# apps/jobs/services/job_assignment_service.py

import logging
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional

from apps.jobs.models import Job, JobAssignment, JobApplication
from apps.common.constants import JobStatus, AssignmentStatus, ApplicationStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.accounts.models import WorkerProfile

logger = logging.getLogger(__name__)


class JobAssignmentService:
    """
    Service for job assignment operations.
    """

    def __init__(self):
        pass

    # ============================================
    # ASSIGN WORKER
    # ============================================

    @transaction.atomic
    def assign_worker(self, client, job_id: int, worker_id: int) -> Dict[str, Any]:
        """
        Assign a worker to a job.
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to assign workers to this job."
            )

        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(
                f"Cannot assign worker to a job with status '{job.status}'."
            )

        application = JobApplication.objects.filter(
            job_id=job_id,
            worker_id=worker_id,
            status=ApplicationStatus.PENDING
        ).first()

        if not application:
            raise BusinessRuleViolation(
                "Worker has not applied for this job."
            )

        existing_active = JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()

        if existing_active:
            raise BusinessRuleViolation(
                "Worker is already assigned to another job."
            )

        assignment = JobAssignment.objects.create(
            job=job,
            worker_id=worker_id,
            assigned_by=client,
            status=AssignmentStatus.ACTIVE
        )

        job.status = JobStatus.ASSIGNED
        job.save()

        application.status = ApplicationStatus.ACCEPTED
        application.save()

        rejected_count = JobApplication.objects.filter(
            job_id=job_id,
            status=ApplicationStatus.PENDING
        ).exclude(id=application.id).update(
            status=ApplicationStatus.REJECTED
        )

        # Update worker availability
        # (the post_save signal will also handle this, but we do it explicitly
        # so the response is immediate)
        try:
            worker_profile = WorkerProfile.objects.get(user_id=worker_id)
            worker_profile.availability_status = 'BUSY'
            worker_profile.save(update_fields=['availability_status', 'availability_updated_at'])
        except WorkerProfile.DoesNotExist:
            pass

        logger.info(
            f"Worker {worker_id} assigned to job {job_id} by client {client.id}"
        )

        # 🆕 Notify the worker
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_job_assigned(
                worker=assignment.worker,
                job=job,
            )
            logger.info(
                f"[notify] worker_assigned sent to worker {worker_id}"
            )
        except Exception as e:
            logger.error(f"[notify] assign_worker failed: {e}")

        return {
            'message': 'Worker assigned successfully! All other applications have been withdrawn.',
            'assignment': assignment,
            'job': {
                'id': job.id,
                'status': job.status,
                'status_display': dict(JobStatus.CHOICES).get(job.status),
            },
            'withdrawn_applications': rejected_count,
        }

    # ============================================
    # WORKER MARK COMPLETE
    # ============================================

    @transaction.atomic
    def worker_mark_complete(self, worker, job_id: int) -> Dict[str, Any]:
        """
        Worker marks the job as complete (pending client confirmation).
        Worker stays BUSY until client confirms or auto-confirm fires.
        """
        from datetime import timedelta

        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")

        assignment = JobAssignment.objects.filter(
            job=job,
            worker_id=worker.id,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS],
        ).first()

        if not assignment:
            raise BusinessRuleViolation(
                "You are not assigned to this job."
            )

        if job.status not in [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS]:
            raise BusinessRuleViolation(
                f"Cannot mark a job with status '{job.status}' as complete."
            )

        now = timezone.now()

        job.status = JobStatus.AWAITING_CONFIRMATION
        job.worker_marked_complete = True
        job.worker_marked_complete_at = now
        # Schedule auto-confirm after the grace period
        job.auto_confirm_at = now + timedelta(
            minutes=job.auto_confirm_grace_minutes
        )
        job.save(update_fields=[
            'status',
            'worker_marked_complete',
            'worker_marked_complete_at',
            'auto_confirm_at',
            'updated_at',
        ])

        logger.info(
            f"Worker {worker.id} marked job {job_id} as complete; "
            f"auto-confirm at {job.auto_confirm_at}"
        )

        # 🆕 Notify the client
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_job_completed(
                client=job.client,
                job=job,
                worker=worker,
            )
            logger.info(
                f"[notify] job_completed sent to client {job.client_id}"
            )
        except Exception as e:
            logger.error(f"[notify] worker_mark_complete failed: {e}")

        return {
            'message': (
                f'Job marked as complete. Client has '
                f'{job.auto_confirm_grace_minutes} minutes to confirm, '
                f'otherwise it will auto-complete.'
            ),
            'job': {
                'id': job.id,
                'status': job.status,
                'status_display': dict(JobStatus.CHOICES).get(job.status),
                'auto_confirm_at': job.auto_confirm_at,
            },
        }

    # ============================================
    # CLIENT CONFIRM COMPLETE
    # ============================================

    @transaction.atomic
    def client_confirm_complete(self, client, job_id: int) -> Dict[str, Any]:
        """
        Client confirms the job is complete.
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to confirm this job."
            )

        if job.status != JobStatus.AWAITING_CONFIRMATION:
            raise BusinessRuleViolation(
                f"Cannot confirm a job with status '{job.status}'."
            )

        now = timezone.now()

        job.status = JobStatus.COMPLETED
        job.client_confirmed_complete = True
        job.client_confirmed_at = now
        job.completed_at = now
        job.save(update_fields=[
            'status',
            'client_confirmed_complete',
            'client_confirmed_at',
            'completed_at',
            'updated_at',
        ])

        assignment = job.assignments.filter(
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
        ).first()
        if assignment:
            assignment.status = AssignmentStatus.COMPLETED
            assignment.completed_at = now
            assignment.save(update_fields=['status', 'completed_at', 'updated_at'])

        logger.info(f"Client {client.id} confirmed job {job_id} as complete")

        return {
            'message': 'Job confirmed successfully!',
            'job': {
                'id': job.id,
                'status': job.status,
                'status_display': dict(JobStatus.CHOICES).get(job.status),
                'completed_at': job.completed_at,
            },
        }

    # ============================================
    # GET ASSIGNMENTS
    # ============================================

    def get_assignments_by_worker(self, worker_id: int) -> List[JobAssignment]:
        """Get all assignments for a worker."""
        return JobAssignment.objects.filter(
            worker_id=worker_id,
            deleted_at__isnull=True
        ).order_by('-assigned_at')

    def get_active_assignments_by_worker(self, worker_id: int) -> List[JobAssignment]:
        """Get active assignments for a worker."""
        return JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE,
            deleted_at__isnull=True
        ).order_by('-assigned_at')

    def complete_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """Complete an assignment."""
        try:
            assignment = JobAssignment.objects.get(
                id=assignment_id,
                worker_id=worker.id,
                deleted_at__isnull=True
            )
        except JobAssignment.DoesNotExist:
            raise ResourceNotFound("Assignment not found.")

        if assignment.status != AssignmentStatus.ACTIVE:
            raise BusinessRuleViolation(
                f"Cannot complete an assignment with status '{assignment.status}'."
            )

        assignment.complete()

        return {
            'message': 'Assignment completed successfully!',
            'assignment': assignment,
        }

    def cancel_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """Cancel an assignment."""
        try:
            assignment = JobAssignment.objects.get(
                id=assignment_id,
                worker_id=worker.id,
                deleted_at__isnull=True
            )
        except JobAssignment.DoesNotExist:
            raise ResourceNotFound("Assignment not found.")

        if assignment.status != AssignmentStatus.ACTIVE:
            raise BusinessRuleViolation(
                f"Cannot cancel an assignment with status '{assignment.status}'."
            )

        assignment.cancel()

        job = assignment.job
        job.status = JobStatus.OPEN
        job.save()

        return {
            'message': 'Assignment cancelled successfully!',
            'assignment': assignment,
        }
