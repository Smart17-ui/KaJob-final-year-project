# apps/jobs/repositories/job_assignment_repository.py
from typing import Optional, List
from django.utils import timezone
from apps.jobs.models import JobAssignment
from apps.common.repositories import BaseRepository
from apps.common.constants import AssignmentStatus


class JobAssignmentRepository(BaseRepository[JobAssignment]):
    """
    Repository for JobAssignment model operations.
    """
    
    def __init__(self):
        super().__init__(JobAssignment)
    
    # ============================================
    # FIND BY JOB
    # ============================================
    
    def get_by_job_id(self, job_id: int) -> List[JobAssignment]:
        """Get all assignments for a job"""
        return self.filter(job_id=job_id).order_by('-assigned_at')
    
    def get_active_by_job_id(self, job_id: int) -> Optional[JobAssignment]:
        """Get active assignment for a job"""
        return self.filter(
            job_id=job_id,
            status=AssignmentStatus.ACTIVE
        ).first()
    
    # ============================================
    # FIND BY WORKER
    # ============================================
    
    def get_by_worker_id(self, worker_id: int) -> List[JobAssignment]:
        """Get all assignments for a worker"""
        return self.filter(worker_id=worker_id).order_by('-assigned_at')
    
    def get_active_by_worker_id(self, worker_id: int) -> Optional[JobAssignment]:
        """Get active assignment for a worker"""
        return self.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).first()
    
    # ============================================
    # UPDATE OPERATIONS
    # ============================================
    
    def complete_assignment(self, assignment: JobAssignment) -> JobAssignment:
        """Complete an assignment"""
        assignment.status = AssignmentStatus.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.save()
        return assignment
    
    def cancel_assignment(self, assignment: JobAssignment) -> JobAssignment:
        """Cancel an assignment"""
        assignment.status = AssignmentStatus.CANCELLED
        assignment.cancelled_at = timezone.now()
        assignment.save()
        return assignment
    
    def create_assignment(self, job_id: int, worker_id: int, assigned_by: int) -> JobAssignment:
        """Create a new assignment"""
        return self.create(
            job_id=job_id,
            worker_id=worker_id,
            assigned_by=assigned_by,
            status=AssignmentStatus.ACTIVE
        )
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_active_by_worker(self, worker_id: int) -> int:
        """Count active assignments for a worker"""
        return self.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).count()
