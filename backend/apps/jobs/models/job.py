from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager
from apps.common.constants import JobStatus

class Job(SoftDeleteMixin):
    """
    Represents a job posting by a client.
    """
    title = models.CharField(
        max_length=255,
        help_text="Job title/summary"
    )
    description = models.TextField(
        help_text="Detailed job description"
    )
    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Budget for the job"
    )
    general_location = models.CharField(
        max_length=255,
        help_text="General area/neighborhood"
    )
    exact_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Exact address or landmark"
    )
    client = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='jobs_posted',
        help_text="Client who posted the job"
    )
    assigned_worker = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='jobs_assigned',
        help_text="Worker assigned to this job"
    )
    category = models.ForeignKey(
        'JobCategory',
        on_delete=models.PROTECT,
        help_text="Job category"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            (JobStatus.OPEN, 'Open'),
            (JobStatus.ASSIGNED, 'Assigned'),
            (JobStatus.IN_PROGRESS, 'In Progress'),
            (JobStatus.COMPLETED, 'Completed'),
            (JobStatus.CANCELLED, 'Cancelled'),
        ],
        default=JobStatus.OPEN,
        help_text="Current job status"
    )
    radius = models.IntegerField(
        default=5,
        help_text="Distance radius for worker matching (in km)"
    )
    posted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the job was posted"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the job was completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'jobs'
        ordering = ['-posted_at']
        indexes = [
            models.Index(fields=['status', 'posted_at']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['assigned_worker', 'status']),
        ]

    def __str__(self):
        return f"{self.title} - {self.client.full_name}"

    @property
    def is_open(self):
        """Check if job is open for applications"""
        return self.status == JobStatus.OPEN and not self.is_deleted

    @property
    def is_assigned(self):
        """Check if job has been assigned"""
        return self.status == JobStatus.ASSIGNED

    @property
    def is_completed(self):
        """Check if job is completed"""
        return self.status == JobStatus.COMPLETED

    @property
    def is_in_progress(self):
        """Check if job is in progress"""
        return self.status == JobStatus.IN_PROGRESS
