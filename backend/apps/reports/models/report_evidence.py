from django.db import models

class ReportEvidence(models.Model):
    """
    Stores evidence for reports.
    """
    FILE_TYPES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('DOCUMENT', 'Document'),
    ]

    report = models.ForeignKey(
        'Report',
        on_delete=models.CASCADE,
        related_name='evidence',
        help_text="Report this evidence belongs to"
    )
    file_path = models.CharField(
        max_length=500,
        help_text="Path to the evidence file"
    )
    file_type = models.CharField(
        max_length=20,
        choices=FILE_TYPES,
        help_text="Type of evidence file"
    )
    file_name = models.CharField(
        max_length=255,
        help_text="Original file name"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the evidence"
    )
    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='evidence_uploaded',
        help_text="User who uploaded the evidence"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the evidence was uploaded"
    )

    class Meta:
        db_table = 'report_evidence'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['report', 'uploaded_at']),
        ]

    def __str__(self):
        return f"Evidence for {self.report.reference_number}"
