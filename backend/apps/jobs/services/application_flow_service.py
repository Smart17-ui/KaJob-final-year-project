# apps/jobs/services/application_flow_service.py

from typing import List, Dict, Any, Optional
from django.db import transaction
from django.core.exceptions import ValidationError

from apps.common.constants import ApplicationStatus, AssignmentStatus, JobStatus
from apps.jobs.models import JobApplication, JobAssignment, Job
from apps.accounts.models import User, WorkerProfile


class ApplicationFlowService:
    """
    Service that defines and manages the application status flow.
    
    This service ensures that application status transitions are valid
    and that business rules are enforced at each step.
    """
    
    # ============================================
    # STATUS TRANSITIONS (State Machine)
    # ============================================
    
    # Allowed transitions from each status
    TRANSITIONS = {
        ApplicationStatus.PENDING: [
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
        ],
        ApplicationStatus.ACCEPTED: [
            ApplicationStatus.COMPLETED,  # When job is done
        ],
        ApplicationStatus.REJECTED: [],    # Terminal - no transitions
        ApplicationStatus.WITHDRAWN: [],   # Terminal - no transitions
        ApplicationStatus.COMPLETED: [],   # Terminal - no transitions
    }
    
    # Statuses that are terminal (cannot change)
    TERMINAL_STATUSES = [
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.COMPLETED,
    ]
    
    # Statuses that are active (work in progress)
    ACTIVE_STATUSES = [
        ApplicationStatus.PENDING,
        ApplicationStatus.ACCEPTED,
    ]
    
    # ============================================
    # VALIDATION METHODS
    # ============================================
    
    @classmethod
    def can_transition(cls, current_status: str, new_status: str) -> bool:
        """
        Check if a status transition is allowed.
        
        Args:
            current_status: Current application status
            new_status: Desired new status
            
        Returns:
            bool: True if transition is allowed
        """
        allowed_transitions = cls.TRANSITIONS.get(current_status, [])
        return new_status in allowed_transitions
    
    @classmethod
    def get_valid_transitions(cls, current_status: str) -> List[str]:
        """
        Get all valid next states for a given status.
        
        Args:
            current_status: Current application status
            
        Returns:
            List[str]: List of allowed next statuses
        """
        return cls.TRANSITIONS.get(current_status, [])
    
    @classmethod
    def is_terminal(cls, status: str) -> bool:
        """Check if a status is terminal (cannot change)."""
        return status in cls.TERMINAL_STATUSES
    
    @classmethod
    def is_active(cls, status: str) -> bool:
        """Check if a status is active (work in progress)."""
        return status in cls.ACTIVE_STATUSES
    
    # ============================================
    # ACTION METHODS
    # ============================================
    
    @classmethod
    @transaction.atomic
    def accept_application(cls, application: JobApplication, client: User) -> Dict[str, Any]:
        """
        Accept a pending application.
        
        This does the following atomically:
        1. Validates the application is PENDING
        2. Validates the job is OPEN
        3. Validates the worker is available
        4. Changes application status to ACCEPTED
        5. Creates an assignment for the worker
        6. Changes job status to ASSIGNED
        7. Rejects all other pending applications
        8. Updates worker availability to BUSY
        
        Args:
            application: The application to accept
            client: The client accepting the application
            
        Returns:
            Dict with result information
            
        Raises:
            ValidationError: If business rules are violated
        """
        # Validate client owns the job
        if application.job.client_id != client.id:
            raise ValidationError("You don't have permission to accept this application.")
        
        # Validate application status
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError(f"Cannot accept application with status '{application.status}'.")
        
        # Validate job status
        if application.job.status != JobStatus.OPEN:
            raise ValidationError(f"Cannot accept application for a '{application.job.status}' job.")
        
        # Validate worker availability
        worker = application.worker
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=worker.id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if has_active_assignment:
            raise ValidationError("Worker is already assigned to another job.")
        
        # Get the job
        job = application.job
        
        # 1. Create assignment
        assignment = JobAssignment.objects.create(
            job=job,
            worker=worker,
            assigned_by=client,
            status=AssignmentStatus.ACTIVE,
        )
        
        # 2. Update application status
        application.status = ApplicationStatus.ACCEPTED
        application.save()
        
        # 3. Update job status
        job.status = JobStatus.ASSIGNED
        job.save()
        
        # 4. Reject all other pending applications
        rejected_count = JobApplication.objects.filter(
            job=job,
            status=ApplicationStatus.PENDING
        ).exclude(id=application.id).update(
            status=ApplicationStatus.REJECTED
        )
        
        # 5. Update worker availability
        try:
            worker_profile = WorkerProfile.objects.get(user=worker)
            worker_profile.availability_status = 'BUSY'
            worker_profile.save()
        except WorkerProfile.DoesNotExist:
            pass
        
        return {
            'success': True,
            'message': 'Application accepted and worker assigned successfully!',
            'application': application,
            'assignment': assignment,
            'job': job,
            'rejected_count': rejected_count,
        }
    
    @classmethod
    @transaction.atomic
    def reject_application(cls, application: JobApplication, client: User) -> Dict[str, Any]:
        """
        Reject a pending application.
        
        Args:
            application: The application to reject
            client: The client rejecting the application
            
        Returns:
            Dict with result information
            
        Raises:
            ValidationError: If business rules are violated
        """
        # Validate client owns the job
        if application.job.client_id != client.id:
            raise ValidationError("You don't have permission to reject this application.")
        
        # Validate application status
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError(f"Cannot reject application with status '{application.status}'.")
        
        # Reject the application
        application.status = ApplicationStatus.REJECTED
        application.save()
        
        return {
            'success': True,
            'message': 'Application rejected successfully!',
            'application': application,
        }
    
    @classmethod
    @transaction.atomic
    def withdraw_application(cls, application: JobApplication, worker: User) -> Dict[str, Any]:
        """
        Worker withdraws their application.
        
        Args:
            application: The application to withdraw
            worker: The worker withdrawing the application
            
        Returns:
            Dict with result information
            
        Raises:
            ValidationError: If business rules are violated
        """
        # Validate worker owns the application
        if application.worker_id != worker.id:
            raise ValidationError("You don't have permission to withdraw this application.")
        
        # Validate application status
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError(f"Cannot withdraw application with status '{application.status}'.")
        
        # Withdraw the application
        application.status = ApplicationStatus.WITHDRAWN
        application.save()
        
        return {
            'success': True,
            'message': 'Application withdrawn successfully!',
            'application': application,
        }
    
    @classmethod
    @transaction.atomic
    def mark_completed(cls, application: JobApplication) -> Dict[str, Any]:
        """
        Mark an accepted application as completed.
        
        Args:
            application: The application to mark as completed
            
        Returns:
            Dict with result information
            
        Raises:
            ValidationError: If business rules are violated
        """
        # Validate application status
        if application.status != ApplicationStatus.ACCEPTED:
            raise ValidationError(f"Cannot mark application with status '{application.status}' as completed.")
        
        # Mark as completed
        application.status = ApplicationStatus.COMPLETED
        application.save()
        
        return {
            'success': True,
            'message': 'Application marked as completed!',
            'application': application,
        }
    
    # ============================================
    # QUERY METHODS
    # ============================================
    
    @classmethod
    def get_application_status_summary(cls, job_id: int) -> Dict[str, Any]:
        """
        Get a summary of all application statuses for a job.
        
        Args:
            job_id: The job ID
            
        Returns:
            Dict with status counts
        """
        from django.db.models import Count
        
        status_counts = JobApplication.objects.filter(
            job_id=job_id
        ).values('status').annotate(count=Count('status'))
        
        summary = {
            'total': 0,
            'pending': 0,
            'accepted': 0,
            'rejected': 0,
            'withdrawn': 0,
            'completed': 0,
        }
        
        for item in status_counts:
            status = item['status']
            count = item['count']
            summary['total'] += count
            
            if status == ApplicationStatus.PENDING:
                summary['pending'] = count
            elif status == ApplicationStatus.ACCEPTED:
                summary['accepted'] = count
            elif status == ApplicationStatus.REJECTED:
                summary['rejected'] = count
            elif status == ApplicationStatus.WITHDRAWN:
                summary['withdrawn'] = count
            elif status == ApplicationStatus.COMPLETED:
                summary['completed'] = count
        
        return summary
    
    @classmethod
    def can_apply(cls, worker: User, job: Job) -> tuple[bool, Optional[str]]:
        """
        Check if a worker can apply for a job.
        
        Returns:
            tuple: (can_apply, reason)
        """
        # 1. Worker must be verified
        if not worker.is_verified:
            return False, "You must be verified to apply for jobs."
        
        # 2. Worker cannot apply to their own job
        if job.client_id == worker.id:
            return False, "You cannot apply to a job you created."
        
        # 3. Job must be OPEN
        if job.status != JobStatus.OPEN:
            return False, f"This job is {job.status.lower()}."
        
        # 4. Worker must not already have a pending application
        has_pending = JobApplication.objects.filter(
            worker_id=worker.id,
            job=job,
            status=ApplicationStatus.PENDING
        ).exists()
        
        if has_pending:
            return False, "You have already applied for this job."
        
        # 5. Worker must not already be assigned to another active job
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=worker.id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if has_active_assignment:
            return False, "You are already assigned to another job."
        
        return True, None


# ============================================
# APPLICATION STATUS ENUM EXTENSION
# ============================================

class ApplicationStatusDisplay:
    """
    Display information for each status.
    """
    
    STATUS_DISPLAY = {
        ApplicationStatus.PENDING: {
            'display': 'Pending',
            'icon': '⏳',
            'color': 'yellow',
            'badge_class': 'badge-warning',
            'description': 'Application is awaiting client review',
        },
        ApplicationStatus.ACCEPTED: {
            'display': 'Accepted',
            'icon': '✅',
            'color': 'green',
            'badge_class': 'badge-success',
            'description': 'Application accepted and worker assigned',
        },
        ApplicationStatus.REJECTED: {
            'display': 'Rejected',
            'icon': '❌',
            'color': 'red',
            'badge_class': 'badge-danger',
            'description': 'Application was rejected by the client',
        },
        ApplicationStatus.WITHDRAWN: {
            'display': 'Withdrawn',
            'icon': '↩️',
            'color': 'gray',
            'badge_class': 'badge-secondary',
            'description': 'Worker withdrew the application',
        },
        ApplicationStatus.COMPLETED: {
            'display': 'Completed',
            'icon': '🎉',
            'color': 'purple',
            'badge_class': 'badge-info',
            'description': 'Worker completed the job successfully',
        },
    }
    
    @classmethod
    def get_status_info(cls, status: str) -> Dict[str, Any]:
        """Get display information for a status."""
        return cls.STATUS_DISPLAY.get(status, {
            'display': status.title(),
            'icon': '📌',
            'color': 'gray',
            'badge_class': 'badge-secondary',
            'description': 'Unknown status',
        })
