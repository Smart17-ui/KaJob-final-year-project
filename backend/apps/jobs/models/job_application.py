from django.db import models
from apps.common.constants import ApplicationStatus

class JobApplication(models.Model):
    """
    Tracks worker applications for jobs.
    """
    job = models.ForeignKey(
        'Job',
        on_delete=models.CASCADE,
        related_name='applications',
        help_text="Job being applied for"
    )
    worker = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='job_applications',
        help_text="Worker applying for the job"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            (ApplicationStatus.PENDING, 'Pending'),
            (ApplicationStatus.ACCEPTED, 'Accepted'),
            (ApplicationStatus.REJECTED, 'Rejected'),
            (ApplicationStatus.WITHDRAWN, 'Withdrawn'),
        ],
        default=ApplicationStatus.PENDING,
        help_text="Application status"
    )
    applied_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the application was submitted"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update time"
    )

    class Meta:
        db_table = 'job_applications'
        unique_together = [['job', 'worker']]
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['worker', 'status']),
        ]

    def __str__(self):
        return f"{self.worker.full_name} - {self.job.title} ({self.status})"

    @property
    def is_pending(self):
        """Check if application is pending"""
        return self.status == ApplicationStatus.PENDING

    @property
    def is_accepted(self):
        """Check if application was accepted"""
        return self.status == ApplicationStatus.ACCEPTED

    @property
    def is_rejected(self):
        """Check if application was rejected"""
        return self.status == ApplicationStatus.REJECTED
