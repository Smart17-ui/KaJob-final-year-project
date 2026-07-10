from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import AssignmentStatus
from django.utils import timezone


class JobAssignment(BaseModel):
    """
    Worker assignment to a job.
    """
    job = models.ForeignKey(
        'Job',
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    worker = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='job_assignments'
    )
    assigned_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='assignments_made'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=AssignmentStatus.CHOICES,
        default=AssignmentStatus.ACTIVE
    )
    
    # Timestamps
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'job_assignments'
        ordering = ['-assigned_at']
        verbose_name = 'Job Assignment'
        verbose_name_plural = 'Job Assignments'
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['worker', 'status']),
        ]
    
    def __str__(self):
        return f"{self.worker.full_name} - {self.job.title}"
    
    def complete(self):
        """Complete the assignment"""
        self.status = AssignmentStatus.COMPLETED
        self.completed_at = timezone.now()
        self.save()
        
        # Update worker availability
        from apps.accounts.models import WorkerProfile
        worker_profile = WorkerProfile.objects.get(user=self.worker)
        worker_profile.update_availability('AVAILABLE')
        worker_profile.increment_jobs_completed()
    
    def cancel(self):
        """Cancel the assignment"""
        self.status = AssignmentStatus.CANCELLED
        self.cancelled_at = timezone.now()
        self.save()
        
        # Update worker availability
        from apps.accounts.models import WorkerProfile
        worker_profile = WorkerProfile.objects.get(user=self.worker)
        worker_profile.update_availability('AVAILABLE')
