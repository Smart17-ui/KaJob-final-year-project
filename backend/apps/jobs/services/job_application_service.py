# apps/jobs/services/job_application_service.py
import logging
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import JobRepository, JobApplicationRepository
from apps.jobs.models import JobApplication
from apps.accounts.repositories import WorkerProfileRepository
from apps.audit.models import AuditLog
from apps.common.constants import ApplicationStatus, JobStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)


class JobApplicationService:
    """
    Service for job application operations.
    Single Responsibility: Manage job applications.
    """

    def __init__(self):
        self.job_repo = JobRepository()
        self.application_repo = JobApplicationRepository()
        self.worker_repo = WorkerProfileRepository()

    # ============================================
    # APPLY FOR JOB
    # ============================================

  
    @transaction.atomic
    def apply_for_job(self, worker, job_id: int) -> Dict[str, Any]:
        """
        Apply for a job.

        Worker must be verified
        Worker must be available
        Worker cannot apply to their own job

        If the worker previously withdrew or was rejected,
        the existing application record is reused and changed
        back to PENDING because the database enforces a unique
        job + worker combination.
        """
        # Get the job
        job = self.job_repo.get_by_id(job_id)

        if not job:
            raise ResourceNotFound("Job not found.")

        # Check if job is open
        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(
                f"Cannot apply for a {job.status} job."
            )

        # Check if worker is verified
        if not worker.is_verified:
            raise BusinessRuleViolation(
                "You must be verified to apply for jobs."
            )

        # Check if worker is applying to their own job
        if job.client_id == worker.id:
            raise BusinessRuleViolation(
                "You cannot apply to a job you created."
            )

        # Check if worker is available (not busy)
        worker_profile = self.worker_repo.get_by_user_id(worker.id)

        if worker_profile and not worker_profile.is_available:
            raise BusinessRuleViolation(
                "You are currently busy with another job."
            )

        # Get any existing application for this job and worker.
        # The database has a unique constraint on job + worker,
        # so we must reuse an existing withdrawn/rejected record
        # instead of creating a second one.
        existing_application = (
            self.application_repo.get_by_job_and_worker(
                job_id,
                worker.id
            )
        )

        if existing_application:
            # Active applications cannot be submitted again.
            if existing_application.status in [
                ApplicationStatus.PENDING,
                ApplicationStatus.ACCEPTED,
            ]:
                raise BusinessRuleViolation(
                    "You have already applied for this job."
                )

            # Withdrawn/rejected applications can be submitted again.
            if existing_application.status in [
                ApplicationStatus.WITHDRAWN,
                ApplicationStatus.REJECTED,
            ]:
                application = self.application_repo.update(
                    existing_application,
                    status=ApplicationStatus.PENDING,
                    applied_at=timezone.now(),
                )

            else:
                raise BusinessRuleViolation(
                    f"Cannot apply again while your application "
                    f"has status '{existing_application.status}'."
                )

        else:
            # No previous application exists, so create a new one.
            application = self.application_repo.create(
                job=job,
                worker=worker,
                status=ApplicationStatus.PENDING,
            )

        # Audit log
        AuditLog.objects.create(
            user=worker,
            action='JOB_APPLIED',
            entity_type='JOB_APPLICATION',
            entity_id=application.id,
            details={
                'job_id': job_id,
                'job_title': job.title,
            }
        )

        logger.info(
            f"Worker {worker.id} applied for job {job_id}"
        )

        # Notify the client
        try:
            from apps.notifications.services import NotificationService

            NotificationService().create_notification(
                recipient_id=job.client_id,
                notification_type='APPLICATION_RECEIVED',
                title='New Application Received',
                message=(
                    f"{worker.full_name} applied for your job: "
                    f"{job.title}"
                ),
                related_entity_id=application.id,
                related_entity_type='JOB_APPLICATION',
                redirect_url=f"/client/dashboard/applications/{job.id}",
                data={
                    'job_id': job.id,
                    'application_id': application.id,
                },
                send_email=True,
                send_push=True,
            )

            logger.info(
                f"[notify] application_received sent to client "
                f"{job.client_id}"
            )

        except Exception as e:
            logger.error(
                f"[notify] apply_for_job failed: {e}"
            )

        return {
            'application': application,
            'message': 'Application submitted successfully!'
        }


    # ============================================
    # GET APPLICATIONS
    # ============================================

    def get_applications_for_job(self, client, job_id: int) -> List[JobApplication]:
        """Get all applications for a job (newest first)"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")

        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to view applications for this job.")

        return self.application_repo.get_by_job_id(job_id).order_by('-applied_at')

    def get_pending_applications_for_job(self, client, job_id: int) -> List[JobApplication]:
        """Get pending applications for a job (newest first)"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")

        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to view applications for this job.")

        return self.application_repo.get_pending_applications_by_job(job_id).order_by('-applied_at')

    def get_applications_by_worker(self, worker_id: int) -> List[JobApplication]:
        """Get applications by a worker (newest first)"""
        return self.application_repo.get_by_worker_id(worker_id).order_by('-applied_at')

    def get_pending_applications_by_worker(self, worker_id: int) -> List[JobApplication]:
        """Get pending applications by a worker (newest first)"""
        return self.application_repo.get_pending_applications_by_worker(worker_id).order_by('-applied_at')

    def get_application_detail(self, client, application_id: int) -> JobApplication:
        """Get detailed application information"""
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")

        job = application.job
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to view this application.")

        return application

    def get_applications_by_client(self, client_id: int) -> List[JobApplication]:
        """Get all applications for jobs posted by a client"""
        return self.application_repo.filter(
            job__client_id=client_id,
            deleted_at__isnull=True
        ).order_by('-applied_at')

    # ============================================
    # UPDATE APPLICATION STATUS
    # ============================================

    @transaction.atomic
    def accept_application(self, client, application_id: int) -> Dict[str, Any]:
        """Accept a job application."""
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")

        job = application.job

        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to accept this application.")

        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot accept an application with status '{application.status}'.")

        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(f"Cannot accept application for a {job.status} job.")

        self.application_repo.accept_application(application)
        self.application_repo.reject_all_other_applications(job.id, application.worker_id)

        AuditLog.objects.create(
            user=client,
            action='APPLICATION_ACCEPTED',
            entity_type='JOB_APPLICATION',
            entity_id=application.id,
            details={
                'job_id': job.id,
                'worker_id': application.worker_id,
            }
        )

        logger.info(f"Client {client.id} accepted application {application_id}")

        # 🆕 Notify the worker
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_application_accepted(
                worker=application.worker,
                job=job,
            )
            logger.info(
                f"[notify] application_accepted sent to worker "
                f"{application.worker.id}"
            )
        except Exception as e:
            logger.error(f"[notify] accept_application failed: {e}")

        return {
            'application': application,
            'message': 'Application accepted successfully!'
        }

    @transaction.atomic
    def reject_application(self, client, application_id: int) -> Dict[str, Any]:
        """Reject a job application."""
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")

        job = application.job

        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to reject this application.")

        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot reject an application with status '{application.status}'.")

        self.application_repo.reject_application(application)

        AuditLog.objects.create(
            user=client,
            action='APPLICATION_REJECTED',
            entity_type='JOB_APPLICATION',
            entity_id=application.id,
            details={
                'job_id': job.id,
                'worker_id': application.worker_id,
            }
        )

        logger.info(f"Client {client.id} rejected application {application_id}")

        # 🆕 Notify the worker
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_application_rejected(
                worker=application.worker,
                job=job,
            )
            logger.info(
                f"[notify] application_rejected sent to worker "
                f"{application.worker.id}"
            )
        except Exception as e:
            logger.error(f"[notify] reject_application failed: {e}")

        return {
            'application': application,
            'message': 'Application rejected successfully!'
        }

    @transaction.atomic
    def withdraw_application(self, worker, application_id: int) -> Dict[str, Any]:
        """Withdraw a job application."""
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")

        if application.worker_id != worker.id:
            raise BusinessRuleViolation("You don't have permission to withdraw this application.")

        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot withdraw an application with status '{application.status}'.")

        self.application_repo.withdraw_application(application)

        AuditLog.objects.create(
            user=worker,
            action='APPLICATION_WITHDRAWN',
            entity_type='JOB_APPLICATION',
            entity_id=application.id,
            details={
                'job_id': application.job.id,
            }
        )

        logger.info(f"Worker {worker.id} withdrew application {application_id}")

        return {
            'application': application,
            'message': 'Application withdrawn successfully!'
        }
