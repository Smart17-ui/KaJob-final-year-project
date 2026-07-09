from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager

class Notification(SoftDeleteMixin):
    """
    In-app notifications for users.
    """
    NOTIFICATION_TYPES = [
        ('JOB_POSTED', 'Job Posted'),
        ('APPLICATION_RECEIVED', 'Application Received'),
        ('WORKER_ASSIGNED', 'Worker Assigned'),
        ('JOB_COMPLETED', 'Job Completed'),
        ('JOB_CANCELLED', 'Job Cancelled'),
        ('REPORT_RESOLVED', 'Report Resolved'),
        ('VERIFICATION_APPROVED', 'Verification Approved'),
        ('VERIFICATION_REJECTED', 'Verification Rejected'),
        ('ACCOUNT_SUSPENDED', 'Account Suspended'),
        ('ACCOUNT_BANNED', 'Account Banned'),
        ('WARNING_ISSUED', 'Warning Issued'),
    ]

    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User receiving the notification"
    )
    title = models.CharField(
        max_length=255,
        help_text="Notification title"
    )
    message = models.TextField(
        help_text="Notification message"
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the notification has been read"
    )
    related_entity_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the related entity (job, report, etc.)"
    )
    related_entity_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Type of the related entity"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the notification was read"
    )

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', 'created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient.full_name}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
