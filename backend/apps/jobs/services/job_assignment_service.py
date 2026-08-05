# apps/jobs/services/job_assignment_service.py
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import (
    JobRepository,
    JobApplicationRepository,
    JobAssignmentRepository,
)
from apps.jobs.serializers import JobSerializer
from apps.jobs.models import JobAssignment
from apps.accounts.repositories import WorkerProfileRepository
from apps.audit.models import AuditLog
from apps.common.constants import JobStatus, ApplicationStatus, AssignmentStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

class JobAssignmentService:
    """
    Service for job assignment operations.
    Single Responsibility: Manage worker assignments.
    """
    
    def __init__(self):
        self.job_repo = JobRepository()
        self.application_repo = JobApplicationRepository()
        self.assignment_repo = JobAssignmentRepository()
        self.worker_repo = WorkerProfileRepository()
    
    # ============================================
    # ASSIGN WORKER
    # ============================================
    
    @transaction.atomic
    def assign_worker(self, client, job_id: int, worker_id: int) -> Dict[str, Any]:
        """
        Assign a worker to a job.
        
        Args:
            client: The client user
            job_id: ID of the job
            worker_id: ID of the worker to assign
        
        Returns:
            Dict with assignment details
        """
        # Get the job
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to assign workers to this job.")
        
        # Check if job is open or assigned
        if job.status not in [JobStatus.OPEN, JobStatus.ASSIGNED]:
            raise BusinessRuleViolation(f"Cannot assign worker to a {job.status} job.")
        
        # Check if worker exists and is available
        worker_profile = self.worker_repo.get_by_user_id(worker_id)
        if not worker_profile:
            raise ResourceNotFound("Worker not found.")
        
        if not worker_profile.is_available:
            raise BusinessRuleViolation("Worker is not available.")
        
        # Check if worker has applied
        application = self.application_repo.get_by_job_and_worker(job_id, worker_id)
        if not application:
            raise BusinessRuleViolation("Worker has not applied for this job.")
        
        # Check if there's already an active assignment
        existing_assignment = self.assignment_repo.get_active_by_job_id(job_id)
        if existing_assignment:
            raise BusinessRuleViolation("A worker is already assigned to this job.")
        
        # Create assignment
        assignment = self.assignment_repo.create_assignment(job_id, worker_id, client.id)
        
        # Update job
        job = self.job_repo.assign_worker(job, worker_id)
        
        # Accept the worker's application
        self.application_repo.accept_application(application)
        
        # Reject all other applications
        self.application_repo.reject_all_other_applications(job_id, worker_id)
        
        # Update worker availability
        self.worker_repo.update_availability(worker_id, 'BUSY')
        
        # Audit log
        AuditLog.objects.create(
            user=client,
            action='WORKER_ASSIGNED',
            entity_type='JOB_ASSIGNMENT',
            entity_id=assignment.id,
            details={
                'job_id': job_id,
                'worker_id': worker_id,
                'job_title': job.title,
            }
        )
        
        return {
            'assignment': assignment,
            'job': JobSerializer(job).data,
            'message': 'Worker assigned successfully!'
        }
    
    # ============================================
    # GET ASSIGNMENTS
    # ============================================
    
    def get_assignments_by_worker(self, worker_id: int) -> List[JobAssignment]:
        """Get all assignments for a worker"""
        return self.assignment_repo.get_by_worker_id(worker_id)
    
    def get_active_assignments_by_worker(self, worker_id: int) -> List[JobAssignment]:
        """Get active assignments for a worker"""
        assignments = self.assignment_repo.get_active_by_worker_id(worker_id)
        return [assignments] if assignments else []
    
    def get_assignments_by_job(self, job_id: int) -> List[JobAssignment]:
        """Get all assignments for a job"""
        return self.assignment_repo.get_by_job_id(job_id)
    
    # ============================================
    # COMPLETE ASSIGNMENT
    # ============================================
    
    @transaction.atomic
    def complete_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """
        Complete an assignment.
        """
        assignment = self.assignment_repo.get_by_id(assignment_id)
        if not assignment:
            raise ResourceNotFound("Assignment not found.")
        
        # Check ownership
        if assignment.worker_id != worker.id:
            raise BusinessRuleViolation("You don't have permission to complete this assignment.")
        
        # Check if assignment is active
        if assignment.status != AssignmentStatus.ACTIVE:
            raise BusinessRuleViolation(f"Cannot complete an assignment with status '{assignment.status}'.")
        
        # Complete assignment
        self.assignment_repo.complete_assignment(assignment)
        
        # Update job
        job = assignment.job
        self.job_repo.complete_job(job)
        
        # Update worker availability
        self.worker_repo.update_availability(worker.id, 'AVAILABLE')
        
        # Increment jobs completed
        self.worker_repo.increment_jobs_completed(worker.id)
        
        # Audit log
        AuditLog.objects.create(
            user=worker,
            action='ASSIGNMENT_COMPLETED',
            entity_type='JOB_ASSIGNMENT',
            entity_id=assignment.id,
            details={
                'job_id': job.id,
                'job_title': job.title,
            }
        )
        
        return {
            'assignment': assignment,
            'message': 'Assignment completed successfully!'
        }
    
    @transaction.atomic
    def cancel_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """
        Cancel an assignment.
        """
        assignment = self.assignment_repo.get_by_id(assignment_id)
        if not assignment:
            raise ResourceNotFound("Assignment not found.")
        
        # Check ownership
        if assignment.worker_id != worker.id:
            raise BusinessRuleViolation("You don't have permission to cancel this assignment.")
        
        # Check if assignment is active
        if assignment.status != AssignmentStatus.ACTIVE:
            raise BusinessRuleViolation(f"Cannot cancel an assignment with status '{assignment.status}'.")
        
        # Cancel assignment
        self.assignment_repo.cancel_assignment(assignment)
        
        # Update job status back to OPEN
        job = assignment.job
        self.job_repo.update_status(job, JobStatus.OPEN)
        
        # Update worker availability
        self.worker_repo.update_availability(worker.id, 'AVAILABLE')
        
        # Audit log
        AuditLog.objects.create(
            user=worker,
            action='ASSIGNMENT_CANCELLED',
            entity_type='JOB_ASSIGNMENT',
            entity_id=assignment.id,
            details={
                'job_id': job.id,
                'job_title': job.title,
            }
        )
        
        return {
            'assignment': assignment,
            'message': 'Assignment cancelled successfully!'
        }
