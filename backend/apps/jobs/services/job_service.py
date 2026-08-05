# apps/jobs/services/job_service.py
import logging
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import JobRepository
from apps.jobs.models import Job
from apps.audit.models import AuditLog
from apps.common.constants import JobStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)


class JobService:
    """
    Service for job management operations.
    Single Responsibility: Manage job postings.
    """
    
    def __init__(self):
        self.job_repo = JobRepository()
    
    # ============================================
    # CREATE JOB
    # ============================================
    
    @transaction.atomic
    def create_job(self, client, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new job posting.
        
        Args:
            client: The client user
            data: {
                title, description, budget, category_id,
                general_location, exact_location, latitude, longitude, radius
            }
        
        Returns:
            Dict with job details
        """
        # Check if client is verified
        if not client.is_verified:
            raise BusinessRuleViolation("You must be verified to post a job.")
        
        # Create job
        job = self.job_repo.create(
            client=client,
            title=data['title'],
            description=data['description'],
            budget=data['budget'],
            category_id=data['category_id'],
            general_location=data['general_location'],
            exact_location=data.get('exact_location', ''),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            radius=data.get('radius', 5),
            status=JobStatus.OPEN,
        )
        
        # Audit log
        AuditLog.objects.create(
            user=client,
            action='JOB_CREATED',
            entity_type='JOB',
            entity_id=job.id,
            details={
                'title': job.title,
                'budget': str(job.budget),
                'category_id': job.category_id,
            }
        )
        
        # Log instead of sending notifications (for now)
        logger.info(f"Job created: {job.title} by {client.email} (ID: {job.id})")
        
        return {
            'job': job,
            'message': 'Job posted successfully!'
        }
    
    # ============================================
    # GET JOBS
    # ============================================
    
    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Get job by ID"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        return job
    
    def get_open_jobs(self) -> List[Job]:
        """Get all open jobs"""
        return self.job_repo.get_open_jobs()
    
    def get_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get jobs posted by a client"""
        return self.job_repo.get_by_client_id(client_id)
    
    def get_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get jobs assigned to a worker"""
        return self.job_repo.get_jobs_by_worker(worker_id)
    
    def search_jobs(self, query: str) -> List[Job]:
        """Search jobs by title or description"""
        return self.job_repo.search_jobs(query)
    
    def filter_jobs(
        self, 
        category_id: int = None, 
        min_budget: float = None, 
        max_budget: float = None,
        location: str = None
    ) -> List[Job]:
        """Filter jobs by category, budget, and location"""
        return self.job_repo.filter_jobs(category_id, min_budget, max_budget, location)
    
    # ============================================
    # UPDATE JOB
    # ============================================
    
    @transaction.atomic
    def update_job(self, client, job_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a job posting.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to update this job.")
        
        # Check if job can be updated
        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(f"Cannot update a {job.status} job.")
        
        # Update job
        for key, value in data.items():
            if hasattr(job, key) and key not in ['id', 'client', 'created_at', 'posted_at']:
                setattr(job, key, value)
        job.save()
        
        # Audit log
        AuditLog.objects.create(
            user=client,
            action='JOB_UPDATED',
            entity_type='JOB',
            entity_id=job.id,
            details={'updated_fields': list(data.keys())}
        )
        
        return {
            'job': job,
            'message': 'Job updated successfully!'
        }
    
    # ============================================
    # DELETE JOB
    # ============================================
    
    @transaction.atomic
    def delete_job(self, client, job_id: int) -> Dict[str, Any]:
        """
        Delete (soft delete) a job.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to delete this job.")
        
        # Check if job can be deleted
        if job.status == JobStatus.COMPLETED:
            raise BusinessRuleViolation("Cannot delete a completed job.")
        
        # Soft delete
        self.job_repo.delete(job, user=client)
        
        # Audit log
        AuditLog.objects.create(
            user=client,
            action='JOB_DELETED',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title}
        )
        
        return {
            'message': 'Job deleted successfully!'
        }
    
    # ============================================
    # COMPLETE JOB
    # ============================================
    
    @transaction.atomic
    def complete_job(self, user, job_id: int) -> Dict[str, Any]:
        """
        Mark a job as completed.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check if user is the client or the assigned worker
        if job.client_id != user.id and job.assigned_worker_id != user.id:
            raise BusinessRuleViolation("You don't have permission to complete this job.")
        
        # Check if job is in progress
        if job.status != JobStatus.IN_PROGRESS:
            raise BusinessRuleViolation(f"Cannot complete a job with status '{job.status}'.")
        
        # Complete job
        self.job_repo.complete_job(job)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='JOB_COMPLETED',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title}
        )
        
        return {
            'job': job,
            'message': 'Job completed successfully!'
        }
    
    # ============================================
    # CANCEL JOB
    # ============================================
    
    @transaction.atomic
    def cancel_job(self, client, job_id: int) -> Dict[str, Any]:
        """
        Cancel a job.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to cancel this job.")
        
        # Check if job can be cancelled
        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(f"Cannot cancel a {job.status} job.")
        
        # Cancel job
        self.job_repo.cancel_job(job)
        
        # Audit log
        AuditLog.objects.create(
            user=client,
            action='JOB_CANCELLED',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title}
        )
        
        return {
            'job': job,
            'message': 'Job cancelled successfully!'
        }
