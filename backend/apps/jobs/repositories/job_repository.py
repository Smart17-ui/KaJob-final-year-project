# apps/jobs/repositories/job_repository.py
from typing import Optional, List
from django.db.models import Q
from django.utils import timezone
from apps.jobs.models import Job
from apps.common.repositories import BaseRepository
from apps.common.constants import JobStatus


class JobRepository(BaseRepository[Job]):
    """
    Repository for Job model operations.
    """
    
    def __init__(self):
        super().__init__(Job)
    
    # ============================================
    # FIND BY CLIENT
    # ============================================
    
    def get_by_client_id(self, client_id: int) -> List[Job]:
        """Get all jobs posted by a client"""
        return self.filter(client_id=client_id, deleted_at__isnull=True).order_by('-posted_at')
    
    def get_open_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get open jobs posted by a client"""
        return self.filter(
            client_id=client_id,
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).order_by('-posted_at')
    
    # ============================================
    # FIND BY STATUS
    # ============================================
    
    def get_open_jobs(self) -> List[Job]:
        """Get all open jobs"""
        return self.filter(status=JobStatus.OPEN, deleted_at__isnull=True).order_by('-posted_at')
    
    def get_jobs_by_status(self, status: str) -> List[Job]:
        """Get jobs by status"""
        return self.filter(status=status, deleted_at__isnull=True).order_by('-posted_at')
    
    def get_active_jobs(self) -> List[Job]:
        """Get all active jobs (not completed or cancelled)"""
        return self.filter(
            status__in=[JobStatus.OPEN, JobStatus.ASSIGNED, JobStatus.IN_PROGRESS],
            deleted_at__isnull=True
        ).order_by('-posted_at')
    
    # ============================================
    # FIND BY WORKER (Assigned)
    # ============================================
    
    def get_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get jobs assigned to a worker"""
        return self.filter(
            assigned_worker_id=worker_id,
            deleted_at__isnull=True
        ).order_by('-posted_at')
    
    def get_active_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get active jobs assigned to a worker"""
        return self.filter(
            assigned_worker_id=worker_id,
            status__in=[JobStatus.ASSIGNED, JobStatus.IN_PROGRESS],
            deleted_at__isnull=True
        ).order_by('-posted_at')
    
    # ============================================
    # SEARCH AND FILTER
    # ============================================
    
    def search_jobs(self, query: str) -> List[Job]:
        """Search jobs by title or description"""
        return self.filter(
            Q(title__icontains=query) | Q(description__icontains=query),
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).order_by('-posted_at')
    
    def filter_jobs(
        self, 
        category_id: int = None, 
        min_budget: float = None, 
        max_budget: float = None,
        location: str = None
    ) -> List[Job]:
        """Filter jobs by category, budget, and location"""
        filters = {'status': JobStatus.OPEN, 'deleted_at__isnull': True}
        
        if category_id:
            filters['category_id'] = category_id
        if min_budget is not None:
            filters['budget__gte'] = min_budget
        if max_budget is not None:
            filters['budget__lte'] = max_budget
        if location:
            filters['general_location__icontains'] = location
        
        return self.filter(**filters).order_by('-posted_at')
    
    # ============================================
    # UPDATE OPERATIONS
    # ============================================
    
    def update_status(self, job: Job, status: str) -> Job:
        """Update job status"""
        return self.update(job, status=status)
    
    def assign_worker(self, job: Job, worker_id: int) -> Job:
        """Assign a worker to a job"""
        return self.update(job, assigned_worker_id=worker_id, status=JobStatus.ASSIGNED)
    
    def complete_job(self, job: Job) -> Job:
        """Mark job as completed"""
        return self.update(job, status=JobStatus.COMPLETED, completed_at=timezone.now())
    
    def cancel_job(self, job: Job) -> Job:
        """Cancel a job"""
        return self.update(job, status=JobStatus.CANCELLED)
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_open_jobs(self) -> int:
        """Count open jobs"""
        return self.filter(status=JobStatus.OPEN, deleted_at__isnull=True).count()
    
    def count_jobs_by_client(self, client_id: int) -> int:
        """Count jobs posted by a client"""
        return self.filter(client_id=client_id, deleted_at__isnull=True).count()
    
    def count_active_jobs_by_worker(self, worker_id: int) -> int:
        """Count active jobs assigned to a worker"""
        return self.filter(
            assigned_worker_id=worker_id,
            status__in=[JobStatus.ASSIGNED, JobStatus.IN_PROGRESS],
            deleted_at__isnull=True
        ).count()
