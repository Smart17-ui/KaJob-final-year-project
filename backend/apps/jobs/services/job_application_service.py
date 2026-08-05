# apps/jobs/services/job_application_service.py
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import JobRepository, JobApplicationRepository
from apps.jobs.models import JobApplication
from apps.audit.models import AuditLog
from apps.common.constants import ApplicationStatus, JobStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


class JobApplicationService:
    """
    Service for job application operations.
    Single Responsibility: Manage job applications.
    """
    
    def __init__(self):
        self.job_repo = JobRepository()
        self.application_repo = JobApplicationRepository()
        
    # ============================================
    # APPLY FOR JOB
    # ============================================
    
    @transaction.atomic
    def apply_for_job(self, worker, job_id: int) -> Dict[str, Any]:
        """
        Apply for a job.
        
        Args:
            worker: The worker user
            job_id: ID of the job to apply for
        
        Returns:
            Dict with application details
        """
        # Get the job
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check if job is open
        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(f"Cannot apply for a {job.status} job.")
        
        # Check if worker has already applied
        if self.application_repo.has_applied(job_id, worker.id):
            raise BusinessRuleViolation("You have already applied for this job.")
        
        # Check if worker is verified
        if not worker.is_verified:
            raise BusinessRuleViolation("You must be verified to apply for jobs.")
        
        # Create application
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
        
        # Notify client
        # self._notify_client(application)
        
        return {
            'application': application,
            'message': 'Application submitted successfully!'
        }
    
    # ============================================
    # GET APPLICATIONS
    # ============================================
    
    def get_applications_for_job(self, client, job_id: int) -> List[JobApplication]:
        """Get all applications for a job"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to view applications for this job.")
        
        return self.application_repo.get_by_job_id(job_id)
    
    def get_pending_applications_for_job(self, client, job_id: int) -> List[JobApplication]:
        """Get pending applications for a job"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to view applications for this job.")
        
        return self.application_repo.get_pending_applications_by_job(job_id)
    
    def get_applications_by_worker(self, worker_id: int) -> List[JobApplication]:
        """Get applications by a worker"""
        return self.application_repo.get_by_worker_id(worker_id)
    
    # ============================================
    # UPDATE APPLICATION STATUS
    # ============================================
    
    @transaction.atomic
    def accept_application(self, client, application_id: int) -> Dict[str, Any]:
        """
        Accept a job application.
        """
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")
        
        job = application.job
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to accept this application.")
        
        # Check if application is pending
        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot accept an application with status '{application.status}'.")
        
        # Check if job is still open
        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(f"Cannot accept application for a {job.status} job.")
        
        # Accept application
        self.application_repo.accept_application(application)
        
        # Reject all other applications
        self.application_repo.reject_all_other_applications(job.id, application.worker_id)
        
        # Audit log
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
        
        return {
            'application': application,
            'message': 'Application accepted successfully!'
        }
    
    @transaction.atomic
    def reject_application(self, client, application_id: int) -> Dict[str, Any]:
        """
        Reject a job application.
        """
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")
        
        job = application.job
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to reject this application.")
        
        # Check if application is pending
        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot reject an application with status '{application.status}'.")
        
        # Reject application
        self.application_repo.reject_application(application)
        
        # Audit log
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
        
        return {
            'application': application,
            'message': 'Application rejected successfully!'
        }
    
    @transaction.atomic
    def withdraw_application(self, worker, application_id: int) -> Dict[str, Any]:
        """
        Withdraw a job application.
        """
        application = self.application_repo.get_by_id(application_id)
        if not application:
            raise ResourceNotFound("Application not found.")
        
        # Check ownership
        if application.worker_id != worker.id:
            raise BusinessRuleViolation("You don't have permission to withdraw this application.")
        
        # Check if application is pending
        if application.status != ApplicationStatus.PENDING:
            raise BusinessRuleViolation(f"Cannot withdraw an application with status '{application.status}'.")
        
        # Withdraw application
        self.application_repo.withdraw_application(application)
        
        # Audit log
        AuditLog.objects.create(
            user=worker,
            action='APPLICATION_WITHDRAWN',
            entity_type='JOB_APPLICATION',
            entity_id=application.id,
            details={
                'job_id': application.job.id,
            }
        )
        
        return {
            'application': application,
            'message': 'Application withdrawn successfully!'
        }
