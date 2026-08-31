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
        
        # Check if user is the job owner
        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to assign workers to this job."
            )
        
        # Check if job is open
        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(
                f"Cannot assign worker to a job with status '{job.status}'."
            )
        
        # Check if worker has applied for this job
        application = JobApplication.objects.filter(
            job_id=job_id,
            worker_id=worker_id,
            status=ApplicationStatus.PENDING
        ).first()
        
        if not application:
            raise BusinessRuleViolation(
                "Worker has not applied for this job."
            )
        
        # Check if worker is already assigned to another active job
        existing_active = JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if existing_active:
            raise BusinessRuleViolation(
                "Worker is already assigned to another job."
            )
        
        # Create assignment
        assignment = JobAssignment.objects.create(
            job=job,
            worker_id=worker_id,
            assigned_by=client,
            status=AssignmentStatus.ACTIVE
        )
        
        # Update job status
        job.status = JobStatus.ASSIGNED
        job.save()
        
        # Accept this application
        application.status = ApplicationStatus.ACCEPTED
        application.save()
        
        # Reject all other pending applications
        rejected_count = JobApplication.objects.filter(
            job_id=job_id,
            status=ApplicationStatus.PENDING
        ).exclude(id=application.id).update(
            status=ApplicationStatus.REJECTED
        )
        
        # Update worker availability
        try:
            worker_profile = WorkerProfile.objects.get(user_id=worker_id)
            worker_profile.availability_status = 'BUSY'
            worker_profile.save()
        except WorkerProfile.DoesNotExist:
            pass
        
        logger.info(
            f"Worker {worker_id} assigned to job {job_id} by client {client.id}"
        )
        
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
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")
        
        # Check if worker is assigned to this job
        assignment = JobAssignment.objects.filter(
            job=job,
            worker_id=worker.id,
            status=AssignmentStatus.ACTIVE
        ).first()
        
        if not assignment:
            raise BusinessRuleViolation(
                "You are not assigned to this job."
            )
        
        # Check if job can be marked complete
        if job.status not in [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS]:
            raise BusinessRuleViolation(
                f"Cannot mark a job with status '{job.status}' as complete."
            )
        
        # Mark as complete (pending confirmation)
        job.status = JobStatus.AWAITING_CONFIRMATION
        job.worker_marked_complete = True
        job.worker_marked_complete_at = timezone.now()
        job.save()
        
        # Update worker availability
        try:
            worker_profile = WorkerProfile.objects.get(user=worker)
            worker_profile.availability_status = 'AVAILABLE'
            worker_profile.save()
        except WorkerProfile.DoesNotExist:
            pass
        
        logger.info(f"Worker {worker.id} marked job {job_id} as complete")
        
        return {
            'message': 'Job marked as complete. Client has 10 minutes to confirm.',
            'job': {
                'id': job.id,
                'status': job.status,
                'status_display': dict(JobStatus.CHOICES).get(job.status),
            }
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
        
        # Check if user is the job owner
        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to confirm this job."
            )
        
        # Check if job is awaiting confirmation
        if job.status != JobStatus.AWAITING_CONFIRMATION:
            raise BusinessRuleViolation(
                f"Cannot confirm a job with status '{job.status}'."
            )
        
        # Confirm completion
        job.status = JobStatus.COMPLETED
        job.client_confirmed_complete = True
        job.client_confirmed_at = timezone.now()
        job.completed_at = timezone.now()
        job.save()
        
        # Update assignment
        assignment = job.assignments.filter(status=AssignmentStatus.ACTIVE).first()
        if assignment:
            assignment.status = AssignmentStatus.COMPLETED
            assignment.completed_at = timezone.now()
            assignment.save()
        
        logger.info(f"Client {client.id} confirmed job {job_id} as complete")
        
        return {
            'message': 'Job confirmed successfully!',
            'job': {
                'id': job.id,
                'status': job.status,
                'status_display': dict(JobStatus.CHOICES).get(job.status),
                'completed_at': job.completed_at,
            }
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
        
        # Update job status back to OPEN
        job = assignment.job
        job.status = JobStatus.OPEN
        job.save()
        
        return {
            'message': 'Assignment cancelled successfully!',
            'assignment': assignment,
        }
