# apps/reports/models/report.py

from django.db import models
from django.utils import timezone
from apps.common.models.mixins import BaseModel
from apps.common.constants import ReportCategory, ReportStatus, AdminDecision


class Report(BaseModel):
    """
    Incident report.

    Two kinds:
    - Job-related  (job + reported_user set)
    - General      (job is NULL, reported_user is NULL — platform-level complaint)
    """
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True,
        help_text="Null for general complaints.",
    )
    reporter = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_filed'
    )
    reported_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reports_against',
        null=True,
        blank=True,
        help_text="Null for general complaints.",
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
        if self.job:
            return f"{self.reference_number} - {self.get_category_display()}"
        return f"{self.reference_number} - General ({self.get_category_display()})"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = self.generate_reference_number()
        super().save(*args, **kwargs)

    def generate_reference_number(self):
        """
        Generate a unique reference number.

        Uses _base_manager so soft-deleted rows still count — their
        reference_number occupies the UNIQUE index.
        """
        from django.db.models import Max

        year = timezone.now().year
        prefix = f"REP-{year}-"

        latest = (
            Report._base_manager
            .filter(reference_number__startswith=prefix)
            .aggregate(max_ref=Max('reference_number'))
            .get('max_ref')
        )

        if latest:
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
        self.status = ReportStatus.ESCALATED_TO_POLICE
        self.police_report_generated = True
        self.save()

    def resolve(self, decision, notes=None):
        self.status = ReportStatus.RESOLVED
        self.save()
