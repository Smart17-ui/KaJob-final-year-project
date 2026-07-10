from django.db import models
from django.utils import timezone
from apps.common.models.mixins import BaseModel
from apps.common.constants import ReportCategory, ReportStatus, AdminDecision


class Report(BaseModel):
    """
    Incident report.
    """
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reporter = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_filed'
    )
    reported_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_against'
    )
    
    # Report Information
    reference_number = models.CharField(max_length=20, unique=True)
    category = models.CharField(
        max_length=20,
        choices=ReportCategory.CHOICES
    )
    description = models.TextField()
    
    # Status
    status = models.CharField(
        max_length=30,  # Changed from 20 to 30
        choices=ReportStatus.CHOICES,
        default=ReportStatus.PENDING
    )
    
    # Police Report
    police_report_generated = models.BooleanField(default=False)
    police_report_path = models.CharField(max_length=500, blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-submitted_at']
        verbose_name = 'Report'
        verbose_name_plural = 'Reports'
        indexes = [
            models.Index(fields=['status', 'submitted_at']),
            models.Index(fields=['reported_user', 'status']),
            models.Index(fields=['reference_number']),
        ]
    
    def __str__(self):
        return f"{self.reference_number} - {self.get_category_display()}"
    
    def save(self, *args, **kwargs):
        """Override save to generate reference number"""
        if not self.reference_number:
            self.reference_number = self.generate_reference_number()
        super().save(*args, **kwargs)
    
    def generate_reference_number(self):
        """Generate a unique reference number"""
        year = timezone.now().year
        count = Report.objects.filter(
            submitted_at__year=year
        ).count() + 1
        return f"REP-{year}-{count:04d}"
    
    @property
    def is_pending(self):
        return self.status in [ReportStatus.PENDING, ReportStatus.UNDER_INVESTIGATION]
    
    def escalate_to_police(self):
        """Escalate report to police"""
        self.status = ReportStatus.ESCALATED_TO_POLICE
        self.police_report_generated = True
        self.save()
    
    def resolve(self, decision, notes=None):
        """Resolve the report"""
        self.status = ReportStatus.RESOLVED
        self.save()
