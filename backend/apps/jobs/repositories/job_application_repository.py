# apps/jobs/repositories/job_application_repository.py
from typing import Optional, List
from django.db.models import Q
from apps.jobs.models import JobApplication
from apps.common.repositories import BaseRepository
from apps.common.constants import ApplicationStatus
from django.utils import timezone


class JobApplicationRepository(BaseRepository[JobApplication]):
    """
    Repository for JobApplication model operations.
    """
    
    def __init__(self):
        super().__init__(JobApplication)
    
    # ============================================
    # FIND BY JOB
    # ============================================
    
    def get_by_job_id(self, job_id: int) -> List[JobApplication]:
        """Get all applications for a job"""
        return self.filter(job_id=job_id, deleted_at__isnull=True).order_by('-applied_at')
    
    def get_pending_applications_by_job(self, job_id: int) -> List[JobApplication]:
        """Get pending applications for a job"""
        return self.filter(
            job_id=job_id,
            status=ApplicationStatus.PENDING,
            deleted_at__isnull=True
        ).order_by('-applied_at')
    
    # ============================================
    # FIND BY WORKER
    # ============================================
    
    def get_by_worker_id(self, worker_id: int) -> List[JobApplication]:
        """Get all applications by a worker"""
        return self.filter(worker_id=worker_id, deleted_at__isnull=True).order_by('-applied_at')
    
    def get_pending_applications_by_worker(self, worker_id: int) -> List[JobApplication]:
        """Get pending applications by a worker"""
        return self.filter(
            worker_id=worker_id,
            status=ApplicationStatus.PENDING,
            deleted_at__isnull=True
        ).order_by('-applied_at')
    
    # ============================================
    # FIND BY JOB AND WORKER
    # ============================================
    
    def get_by_job_and_worker(self, job_id: int, worker_id: int) -> Optional[JobApplication]:
        """Get application by job and worker"""
        return self.filter(
            job_id=job_id,
            worker_id=worker_id,
            deleted_at__isnull=True
        ).first()
    
    def has_applied(self, job_id: int, worker_id: int) -> bool:
        """Check if a worker has already applied for a job"""
        return self.filter(
            job_id=job_id,
            worker_id=worker_id,
            deleted_at__isnull=True
        ).exists()
    
    # ============================================
    # UPDATE OPERATIONS
    # ============================================
    
    def accept_application(self, application: JobApplication) -> JobApplication:
        """Accept an application"""
        return self.update(application, status=ApplicationStatus.ACCEPTED)
    
    def reject_application(self, application: JobApplication) -> JobApplication:
        """Reject an application"""
        return self.update(application, status=ApplicationStatus.REJECTED)
    
    def withdraw_application(self, application: JobApplication) -> JobApplication:
        """Withdraw an application"""
        return self.update(application, status=ApplicationStatus.WITHDRAWN)
    
    def reject_all_other_applications(self, job_id: int, accepted_worker_id: int) -> int:
        """Reject all other applications for a job except the accepted one"""
        return self.filter(
            job_id=job_id,
            deleted_at__isnull=True
        ).exclude(
            worker_id=accepted_worker_id
        ).update(
            status=ApplicationStatus.REJECTED,
            updated_at=timezone.now()
        )
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_applications_by_job(self, job_id: int) -> int:
        """Count total applications for a job"""
        return self.filter(job_id=job_id, deleted_at__isnull=True).count()
    
    def count_pending_applications_by_job(self, job_id: int) -> int:
        """Count pending applications for a job"""
        return self.filter(
            job_id=job_id,
            status=ApplicationStatus.PENDING,
            deleted_at__isnull=True
        ).count()
