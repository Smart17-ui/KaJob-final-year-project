# apps/jobs/models/job_application.py

from django.db import models
from django.core.exceptions import ValidationError
from django.db import transaction

from apps.common.models.mixins import BaseModel
from apps.common.constants import ApplicationStatus, AssignmentStatus, JobStatus


class JobApplication(BaseModel):
    """
    Worker application for a job.
    """
    job = models.ForeignKey(
        'Job',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    worker = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='job_applications'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.CHOICES,
        default=ApplicationStatus.PENDING
    )
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # 🆕 Track updates
    
    class Meta:
        db_table = 'job_applications'
        ordering = ['-applied_at']
        unique_together = [['job', 'worker']]
        verbose_name = 'Job Application'
        verbose_name_plural = 'Job Applications'
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['status']),  # 🆕 For faster status filtering
        ]
    
    def __str__(self):
        return f"{self.worker.full_name} - {self.job.title}"
    
    # ============================================
    # STATUS QUERY METHODS
    # ============================================
    
    def can_transition_to(self, new_status: str) -> bool:
        """
        Check if this application can transition to a new status.
        
        Uses the state machine defined in ApplicationStatus.TRANSITIONS.
        """
        return ApplicationStatus.can_transition(self.status, new_status)
    
    def get_valid_transitions(self) -> list:
        """
        Get all valid transitions from current status.
        
        Returns:
            List of status strings that can be transitioned to.
        """
        return ApplicationStatus.get_valid_transitions(self.status)
    
    def is_terminal(self) -> bool:
        """Check if this application is in a terminal state."""
        return ApplicationStatus.is_terminal(self.status)
    
    def is_active(self) -> bool:
        """Check if this application is active (pending or accepted)."""
        return ApplicationStatus.is_active(self.status)
    
    def is_pending(self) -> bool:
        """Check if this application is pending."""
        return self.status == ApplicationStatus.PENDING
    
    def is_accepted(self) -> bool:
        """Check if this application is accepted."""
        return self.status == ApplicationStatus.ACCEPTED
    
    def is_rejected(self) -> bool:
        """Check if this application is rejected."""
        return self.status == ApplicationStatus.REJECTED
    
    def is_withdrawn(self) -> bool:
        """Check if this application is withdrawn."""
        return self.status == ApplicationStatus.WITHDRAWN
    
    def is_completed(self) -> bool:
        """Check if this application is completed."""
        return self.status == ApplicationStatus.COMPLETED
    
    # ============================================
    # STATUS DISPLAY METHODS
    # ============================================
    
    def get_status_display_info(self) -> dict:
        """
        Get display information for the current status.
        
        Returns:
            dict: {
                'label': 'Pending',
                'icon': '⏳',
                'color': '#f59e0b',
                'badge_class': 'badge-warning',
                'description': 'Application is awaiting client review',
                'action_required': 'Client Review',
            }
        """
        return ApplicationStatus.get_display_info(self.status)
    
    def get_status_color(self) -> str:
        """Get the color for the current status (CSS hex)."""
        return self.get_status_display_info()['color']
    
    def get_status_icon(self) -> str:
        """Get the icon for the current status (emoji)."""
        return self.get_status_display_info()['icon']
    
    def get_status_badge_class(self) -> str:
        """Get the badge class for the current status."""
        return self.get_status_display_info()['badge_class']
    
    def get_status_description(self) -> str:
        """Get the description for the current status."""
        return self.get_status_display_info()['description']
    
    def get_action_required(self) -> str:
        """Get what action is required for this status."""
        return self.get_status_display_info()['action_required']
    
    # ============================================
    # PERMISSION METHODS
    # ============================================
    
    def can_client_accept(self, client_user) -> bool:
        """
        Check if a client can accept this application.
        
        Rules:
        - Application must be PENDING
        - Client must own the job
        - Job must be OPEN
        - Worker must not have active assignment
        """
        if self.status != ApplicationStatus.PENDING:
            return False
        if self.job.client_id != client_user.id:
            return False
        if self.job.status != JobStatus.OPEN:
            return False
        
        # Check if worker is already assigned to another job
        from apps.jobs.models import JobAssignment
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=self.worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        return not has_active_assignment
    
    def can_client_reject(self, client_user) -> bool:
        """
        Check if a client can reject this application.
        
        Rules:
        - Application must be PENDING
        - Client must own the job
        """
        if self.status != ApplicationStatus.PENDING:
            return False
        if self.job.client_id != client_user.id:
            return False
        return True
    
    def can_worker_withdraw(self, worker_user) -> bool:
        """
        Check if a worker can withdraw this application.
        
        Rules:
        - Application must be PENDING
        - Worker must own the application
        """
        if self.status != ApplicationStatus.PENDING:
            return False
        if self.worker_id != worker_user.id:
            return False
        return True
    
    def can_worker_view_details(self, worker_user) -> bool:
        """
        Check if a worker can view full job details.
        
        Only TRUE after the application is ACCEPTED.
        This implements the Conditional Disclosure feature.
        """
        if worker_user.id != self.worker_id:
            return False
        return self.status == ApplicationStatus.ACCEPTED
    
    # ============================================
    # ACTION METHODS (Atomic with Transaction)
    # ============================================
    
    @transaction.atomic
    def accept(self, client_user=None):
        """
        Accept the application and assign the worker.
        
        This is an atomic operation that:
        1. Validates the application can be accepted
        2. Creates an assignment
        3. Updates application status to ACCEPTED
        4. Updates job status to ASSIGNED
        5. Rejects all other pending applications
        6. Updates worker availability to BUSY
        
        Args:
            client_user: The client accepting the application
            
        Returns:
            dict: Result with assignment and rejected count
            
        Raises:
            ValidationError: If business rules are violated
        """
        from apps.jobs.models import JobAssignment
        from apps.accounts.models import WorkerProfile
        
        # Validate status
        if self.status != ApplicationStatus.PENDING:
            raise ValidationError(
                f"Cannot accept application with status '{self.status}'. "
                f"Only PENDING applications can be accepted."
            )
        
        # Validate job status
        if self.job.status != JobStatus.OPEN:
            raise ValidationError(
                f"Cannot accept application for a '{self.job.status}' job. "
                f"Only OPEN jobs can accept applications."
            )
        
        # Check if worker is already assigned to another job
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=self.worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if has_active_assignment:
            raise ValidationError(
                "Worker is already assigned to another job. "
                "Workers can only have one active assignment at a time."
            )
        
        # 1. Create assignment
        assignment = JobAssignment.objects.create(
            job=self.job,
            worker=self.worker,
            assigned_by=client_user if client_user else self.job.client,
            status=AssignmentStatus.ACTIVE,
        )
        
        # 2. Update application status
        self.status = ApplicationStatus.ACCEPTED
        self.save(update_fields=['status', 'updated_at'])
        
        # 3. Update job status
        self.job.status = JobStatus.ASSIGNED
        self.job.save(update_fields=['status', 'updated_at'])
        
        # 4. Reject all other pending applications for this job
        rejected_count = JobApplication.objects.filter(
            job=self.job,
            status=ApplicationStatus.PENDING
        ).exclude(id=self.id).update(
            status=ApplicationStatus.REJECTED
        )
        
        # 5. Update worker availability to BUSY
        try:
            worker_profile = WorkerProfile.objects.get(user=self.worker)
            worker_profile.availability_status = 'BUSY'
            worker_profile.save(update_fields=['availability_status', 'updated_at'])
        except WorkerProfile.DoesNotExist:
            # Worker profile might not exist yet - that's okay
            pass
        
        return {
            'success': True,
            'message': 'Application accepted and worker assigned successfully!',
            'application': self,
            'assignment': assignment,
            'rejected_count': rejected_count,
            'job_status': self.job.status,
        }
    
    @transaction.atomic
    def reject(self):
        """
        Reject the application.
        
        Returns:
            dict: Result with success message
            
        Raises:
            ValidationError: If business rules are violated
        """
        if self.status != ApplicationStatus.PENDING:
            raise ValidationError(
                f"Cannot reject application with status '{self.status}'. "
                f"Only PENDING applications can be rejected."
            )
        
        self.status = ApplicationStatus.REJECTED
        self.save(update_fields=['status', 'updated_at'])
        
        return {
            'success': True,
            'message': 'Application rejected successfully!',
            'application': self,
        }
    
    @transaction.atomic
    def withdraw(self):
        """
        Withdraw the application (worker-initiated).
        
        Returns:
            dict: Result with success message
            
        Raises:
            ValidationError: If business rules are violated
        """
        if self.status != ApplicationStatus.PENDING:
            raise ValidationError(
                f"Cannot withdraw application with status '{self.status}'. "
                f"Only PENDING applications can be withdrawn."
            )
        
        self.status = ApplicationStatus.WITHDRAWN
        self.save(update_fields=['status', 'updated_at'])
        
        return {
            'success': True,
            'message': 'Application withdrawn successfully!',
            'application': self,
        }
    
    @transaction.atomic
    def mark_completed(self):
        """
        Mark an accepted application as completed.
        
        Returns:
            dict: Result with success message
            
        Raises:
            ValidationError: If business rules are violated
        """
        if self.status != ApplicationStatus.ACCEPTED:
            raise ValidationError(
                f"Cannot mark application with status '{self.status}' as completed. "
                f"Only ACCEPTED applications can be marked as completed."
            )
        
        self.status = ApplicationStatus.COMPLETED
        self.save(update_fields=['status', 'updated_at'])
        
        return {
            'success': True,
            'message': 'Application marked as completed!',
            'application': self,
        }
    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    def get_status_history(self):
        """
        Get the status history for this application.
        (If you have an AuditLog or similar model)
        """
        # This can be implemented if you have an audit log
        # For now, returns a simple list
        return [
            {
                'status': self.status,
                'timestamp': self.updated_at.isoformat(),
            }
        ]
    
    def to_dict(self) -> dict:
        """Convert application to dictionary for API responses."""
        status_info = self.get_status_display_info()
        
        return {
            'id': self.id,
            'job_id': self.job_id,
            'worker_id': self.worker_id,
            'status': self.status,
            'status_display': status_info['label'],
            'status_icon': status_info['icon'],
            'status_color': status_info['color'],
            'status_description': status_info['description'],
            'is_terminal': self.is_terminal(),
            'is_active': self.is_active(),
            'valid_transitions': self.get_valid_transitions(),
            'applied_at': self.applied_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
