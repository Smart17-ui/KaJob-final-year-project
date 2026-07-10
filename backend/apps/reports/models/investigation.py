from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import ReportStatus, AdminDecision


class Investigation(BaseModel):
    """
    Admin investigation of a report.
    """
    report = models.OneToOneField(
        'Report',
        on_delete=models.CASCADE,
        related_name='investigation'
    )
    admin = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='investigations'
    )
    
    # Investigation Information
    status = models.CharField(
        max_length=30,  # Changed from 20 to 30
        choices=ReportStatus.CHOICES,
        default=ReportStatus.UNDER_INVESTIGATION
    )
    decision = models.CharField(
        max_length=20,
        choices=AdminDecision.CHOICES,
        null=True,
        blank=True
    )
    decision_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'investigations'
        ordering = ['-started_at']
        verbose_name = 'Investigation'
        verbose_name_plural = 'Investigations'
        indexes = [
            models.Index(fields=['report', 'status']),
            models.Index(fields=['admin', 'status']),
        ]
    
    def __str__(self):
        return f"Investigation: {self.report.reference_number}"
    
    def complete(self, decision, notes=None):
        """Complete the investigation"""
        from django.utils import timezone
        
        self.status = ReportStatus.RESOLVED
        self.decision = decision
        self.decision_notes = notes
        self.completed_at = timezone.now()
        self.save()
        
        # Update report status
        self.report.status = ReportStatus.RESOLVED
        self.report.save()
