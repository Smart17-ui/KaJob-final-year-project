# apps/jobs/services/job_service.py
import logging
from datetime import date
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
                general_location, exact_location, latitude, longitude, radius,
                job_date (optional), job_time (optional), timeframe,
                is_flexible, duration_hours, urgency,
                required_skills (optional)
            }
        
        Notes:
            - latitude/longitude are auto-detected from device GPS
            - general_location is manually entered for display
            - required_skills is optional - only for skilled jobs
            - timing fields are optional
        
        Returns:
            Dict with job details
        """
        # Check if client is verified
        if not client.is_verified:
            raise BusinessRuleViolation("You must be verified to post a job.")
        
        # Check if client is active
        if not client.is_active:
            raise BusinessRuleViolation("Your account is not active.")
        
        # Validate budget
        if data['budget'] <= 0:
            raise BusinessRuleViolation("Budget must be greater than zero.")
        
        # Validate radius
        radius = data.get('radius', 5)
        if radius < 1 or radius > 100:
            raise BusinessRuleViolation("Radius must be between 1 and 100 kilometers.")
        
        # Validate duration
        duration_hours = data.get('duration_hours')
        if duration_hours is not None:
            if duration_hours <= 0:
                raise BusinessRuleViolation("Duration must be greater than zero.")
            if duration_hours > 24:
                raise BusinessRuleViolation("Duration cannot exceed 24 hours.")
        
        # Validate job date
        job_date = data.get('job_date')
        if job_date:
            if job_date < timezone.now().date():
                raise BusinessRuleViolation("Job date cannot be in the past.")
        
        # Create job with all fields
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
            radius=radius,
            status=JobStatus.OPEN,
            # Timing fields
            job_date=job_date,
            job_time=data.get('job_time'),
            timeframe=data.get('timeframe', 'ANYTIME'),
            is_flexible=data.get('is_flexible', True),
            duration_hours=duration_hours,
            urgency=data.get('urgency', 'NORMAL'),
        )
        
        # Add skills if provided (OPTIONAL)
        required_skills = data.get('required_skills', [])
        if required_skills:
            job.required_skills.set(required_skills)
            logger.info(f"Added {len(required_skills)} skills to job {job.id}")
        
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
                'job_date': str(job.job_date) if job.job_date else None,
                'urgency': job.urgency,
                'required_skills': required_skills,
            }
        )
        
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
    
    def get_urgent_jobs(self) -> List[Job]:
        """Get urgent and immediate jobs"""
        return self.job_repo.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        ).order_by('job_date', '-posted_at')
    
    def get_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get jobs posted by a client"""
        return self.job_repo.get_by_client_id(client_id)
    
    def get_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get jobs assigned to a worker"""
        return self.job_repo.get_jobs_by_worker(worker_id)
    
    def get_active_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get active jobs assigned to a worker"""
        return self.job_repo.get_active_jobs_by_worker(worker_id)
    
    def get_open_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get open jobs posted by a client"""
        return self.job_repo.get_open_jobs_by_client(client_id)
    
    def get_jobs_by_skills(self, skill_ids: List[int]) -> List[Job]:
        """Get jobs that require specific skills (optional)"""
        return self.job_repo.filter(
            required_skills__in=skill_ids,
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).distinct().order_by('-posted_at')
    
    def search_jobs(self, query: str) -> List[Job]:
        """Search jobs by title or description"""
        return self.job_repo.search_jobs(query)
    
    # ============================================
    # FILTER JOBS (Non-location filters)
    # ============================================
    
    def filter_jobs(
        self, 
        category_id: int = None, 
        min_budget: float = None, 
        max_budget: float = None,
        skill_ids: List[int] = None,
        urgency: str = None,
        job_date: date = None,
        timeframe: str = None,
    ) -> List[Job]:
        """
        Filter jobs by category, budget, skills, urgency, date, and timeframe.
        Location filtering is handled by the Matching Service.
        """
        jobs = self.job_repo.filter_jobs(category_id, min_budget, max_budget)
        
        # Filter by skills if provided (optional)
        if skill_ids:
            jobs = jobs.filter(required_skills__in=skill_ids).distinct()
        
        # Filter by urgency if provided
        if urgency:
            jobs = jobs.filter(urgency=urgency)
        
        # Filter by date if provided
        if job_date:
            jobs = jobs.filter(job_date=job_date)
        
        # Filter by timeframe if provided
        if timeframe:
            jobs = jobs.filter(timeframe=timeframe)
        
        return jobs.order_by('-posted_at')
    
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
        
        # Update job fields (including timing and skills)
        for key, value in data.items():
            if key == 'required_skills':
                if value:
                    job.required_skills.set(value)
                else:
                    job.required_skills.clear()
            elif hasattr(job, key) and key not in ['id', 'client', 'created_at', 'posted_at']:
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
        
        logger.info(f"Job {job_id} updated by {client.email}")
        
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
        
        logger.info(f"Job {job_id} deleted by {client.email}")
        
        return {
            'message': 'Job deleted successfully!'
        }
    
    # ============================================
    # COMPLETE JOB (DEPRECATED)
    # ============================================
    
    @transaction.atomic
    def complete_job(self, user, job_id: int) -> Dict[str, Any]:
        """
        Mark a job as completed.
        
        NOTE: This method is deprecated. Use JobAssignmentService.worker_mark_complete()
        or JobAssignmentService.client_confirm_complete() instead.
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
        
        logger.info(f"Job {job_id} completed by {user.email}")
        
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
        
        logger.info(f"Job {job_id} cancelled by {client.email}")
        
        return {
            'job': job,
            'message': 'Job cancelled successfully!'
        }
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_open_jobs(self) -> int:
        """Count open jobs"""
        return self.job_repo.count_open_jobs()
    
    def count_jobs_by_client(self, client_id: int) -> int:
        """Count jobs posted by a client"""
        return self.job_repo.count_jobs_by_client(client_id)
    
    def count_active_jobs_by_worker(self, worker_id: int) -> int:
        """Count active jobs assigned to a worker"""
        return self.job_repo.count_active_jobs_by_worker(worker_id)
    
    def count_urgent_jobs(self) -> int:
        """Count urgent and immediate jobs"""
        return self.job_repo.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        ).count()
