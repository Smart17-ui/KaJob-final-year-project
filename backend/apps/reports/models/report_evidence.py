from django.db import models
from apps.common.constants import FileType


class ReportEvidence(models.Model):
    """
    Evidence for reports.
    """
    report = models.ForeignKey(
        'Report',
        on_delete=models.CASCADE,
        related_name='evidence'
    )
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='evidence_uploaded'
    )
    
    # Evidence Information
    file_path = models.CharField(max_length=500)
    file_type = models.CharField(max_length=20, choices=FileType.CHOICES)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_evidence'
        ordering = ['-uploaded_at']
        verbose_name = 'Report Evidence'
        verbose_name_plural = 'Report Evidences'
        indexes = [
            models.Index(fields=['report', 'uploaded_at']),
        ]
    
    def __str__(self):
        return f"Evidence for {self.report.reference_number}"
