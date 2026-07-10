from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import ApplicationStatus


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
    
    class Meta:
        db_table = 'job_applications'
        ordering = ['-applied_at']
        unique_together = [['job', 'worker']]
        verbose_name = 'Job Application'
        verbose_name_plural = 'Job Applications'
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['worker', 'status']),
        ]
    
    def __str__(self):
        return f"{self.worker.full_name} - {self.job.title}"
    
    def accept(self):
        """Accept the application"""
        self.status = ApplicationStatus.ACCEPTED
        self.save()
    
    def reject(self):
        """Reject the application"""
        self.status = ApplicationStatus.REJECTED
        self.save()
    
    def withdraw(self):
        """Withdraw the application"""
        self.status = ApplicationStatus.WITHDRAWN
        self.save()
