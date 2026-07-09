from django.db import models
from django.utils import timezone
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager
from apps.common.constants import ReportStatus, AdminDecision

class Report(SoftDeleteMixin):
    """
    Manages user complaints and incident reports.
    """
    REPORT_CATEGORIES = [
        ('THEFT', 'Theft'),
        ('VIOLENCE', 'Violence'),
        ('HARASSMENT', 'Harassment'),
        ('FRAUD', 'Fraud'),
        ('PROPERTY_DAMAGE', 'Property Damage'),
        ('NO_SHOW', 'No Show'),
        ('POOR_CONDUCT', 'Poor Conduct'),
        ('OTHER', 'Other'),
    ]

    reference_number = models.CharField(
        max_length=20,
        unique=True,
        help_text="Human-readable reference number (REP-2026-0015)"
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='reports',
        help_text="Job where incident occurred"
    )
    reporter = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_filed',
        help_text="User reporting the incident"
    )
    reported_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_against',
        help_text="User being reported"
    )
    category = models.CharField(
        max_length=50,
        choices=REPORT_CATEGORIES,
        help_text="Type of report"
    )
    description = models.TextField(
        help_text="Detailed description of the incident"
    )
    status = models.CharField(
        max_length=30,
        choices=[
            (ReportStatus.PENDING, 'Pending'),
            (ReportStatus.UNDER_INVESTIGATION, 'Under Investigation'),
            (ReportStatus.AWAITING_USER_RESPONSE, 'Awaiting User Response'),
            (ReportStatus.RESOLVED, 'Resolved'),
            (ReportStatus.ESCALATED_TO_POLICE, 'Escalated to Police'),
            (ReportStatus.CLOSED, 'Closed'),
        ],
        default=ReportStatus.PENDING,
        help_text="Current report status"
    )
    admin_decision = models.CharField(
        max_length=20,
        choices=[
            (AdminDecision.DISMISSED, 'Dismissed'),
            (AdminDecision.WARNED, 'Warned'),
            (AdminDecision.SUSPENDED, 'Suspended'),
            (AdminDecision.BANNED, 'Banned'),
            (AdminDecision.ESCALATED, 'Escalated'),
        ],
        null=True,
        blank=True,
        help_text="Administrator's decision"
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal admin notes (not visible to users)"
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the report was submitted"
    )
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_reviewed',
        help_text="Admin who reviewed the report"
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the report was reviewed"
    )
    decision_made_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the admin decision was made"
    )
    police_report_generated = models.BooleanField(
        default=False,
        help_text="Whether a police report has been generated"
    )
    police_report_path = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text="Path to generated police report PDF"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'reports'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['status', 'submitted_at']),
            models.Index(fields=['reported_user', 'status']),
            models.Index(fields=['reference_number']),
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.category}"

    def generate_reference_number(self):
        """Generate a unique reference number"""
        year = timezone.now().year
        count = Report.objects.filter(submitted_at__year=year).count() + 1
        return f"REP-{year}-{count:04d}"

    def save(self, *args, **kwargs):
        """Override save to generate reference number if not set"""
        if not self.reference_number:
            self.reference_number = self.generate_reference_number()
        super().save(*args, **kwargs)

    @property
    def is_pending(self):
        """Check if report is pending"""
        return self.status in [ReportStatus.PENDING, ReportStatus.UNDER_INVESTIGATION]

    @property
    def is_resolved(self):
        """Check if report is resolved"""
        return self.status in [ReportStatus.RESOLVED, ReportStatus.CLOSED]

    @property
    def is_escalated(self):
        """Check if report was escalated to police"""
        return self.status == ReportStatus.ESCALATED_TO_POLICE
