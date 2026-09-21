# apps/reports/models/report.py

from django.db import models
from django.db.models import Max
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
        max_length=30,
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
        """Override save to generate reference number."""
        if not self.reference_number:
            self.reference_number = self.generate_reference_number()
        super().save(*args, **kwargs)

    def generate_reference_number(self):
        """
        Generate a unique reference number.

        Uses _base_manager (not the soft-delete-filtered default manager)
        so that soft-deleted reports are still counted. Their
        reference_number still occupies the UNIQUE index in the database,
        so MAX() must consider them to avoid duplicate-key violations.
        """
        year = timezone.now().year
        prefix = f"REP-{year}-"

        latest = (
            Report._base_manager
            .filter(reference_number__startswith=prefix)
            .aggregate(max_ref=Max('reference_number'))
            .get('max_ref')
        )

        if latest:
            # latest looks like "REP-2026-0009" — extract the numeric tail
            try:
                last_number = int(latest.rsplit('-', 1)[-1])
            except (ValueError, IndexError):
                last_number = 0
        else:
            last_number = 0

        return f"REP-{year}-{last_number + 1:04d}"

    @property
    def is_pending(self):
        return self.status in [
            ReportStatus.PENDING,
            ReportStatus.UNDER_INVESTIGATION,
        ]

    def escalate_to_police(self):
        """Escalate report to police."""
        self.status = ReportStatus.ESCALATED_TO_POLICE
        self.police_report_generated = True
        self.save()

    def resolve(self, decision, notes=None):
        """Resolve the report."""
        self.status = ReportStatus.RESOLVED
        self.save()
