from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import JobStatus
from django.utils import timezone


class Job(BaseModel):
    """
    Job posting by a client.
    """
    client = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='jobs_posted'
    )
    category = models.ForeignKey(
        'JobCategory',
        on_delete=models.PROTECT,
        related_name='jobs'
    )
    
    # Job Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Location
    general_location = models.CharField(max_length=255)
    exact_location = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    radius = models.IntegerField(default=5)  # in kilometers
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=JobStatus.CHOICES,
        default=JobStatus.OPEN
    )
    
    # Timestamps
    posted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-posted_at']
        verbose_name = 'Job'
        verbose_name_plural = 'Jobs'
        indexes = [
            models.Index(fields=['status', 'posted_at']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.client.full_name}"
    
    @property
    def is_open(self):
        return self.status == JobStatus.OPEN and not self.is_deleted
    
    @property
    def is_assigned(self):
        return self.status == JobStatus.ASSIGNED
    
    @property
    def is_completed(self):
        return self.status == JobStatus.COMPLETED
    
    def get_active_assignment(self):
        """Get the active assignment for this job"""
        return self.assignments.filter(status='ACTIVE').first()
    
    def complete(self):
        """Complete the job"""
        from .job_assignment import JobAssignment
        
        assignment = self.get_active_assignment()
        if assignment:
            assignment.complete()
        
        self.status = JobStatus.COMPLETED
        self.completed_at = timezone.now()
        self.save()
