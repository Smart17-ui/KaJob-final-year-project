from django.db import models

class AdminAction(models.Model):
    """
    Tracks administrative actions taken on user accounts.
    """
    ACTION_TYPES = [
        ('WARN', 'Warning'),
        ('SUSPEND', 'Suspend'),
        ('BAN', 'Ban'),
        ('UNBAN', 'Unban'),
        ('VERIFY', 'Verify'),
        ('REJECT_VERIFICATION', 'Reject Verification'),
        ('DISMISS_REPORT', 'Dismiss Report'),
    ]

    admin = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='actions_taken',
        help_text="Admin who performed the action"
    )
    target_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='actions_received',
        help_text="User the action was taken against"
    )
    action_type = models.CharField(
        max_length=30,
        choices=ACTION_TYPES,
        help_text="Type of admin action"
    )
    reason = models.TextField(
        help_text="Reason for the action"
    )
    related_report = models.ForeignKey(
        'reports.Report',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_actions',
        help_text="Report that triggered this action"
    )
    performed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the action was performed"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the action expires (for temporary suspensions)"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes"
    )

    class Meta:
        db_table = 'admin_actions'
        ordering = ['-performed_at']
        indexes = [
            models.Index(fields=['target_user', 'performed_at']),
            models.Index(fields=['action_type', 'expires_at']),
        ]

    def __str__(self):
        return f"{self.admin.full_name} -> {self.target_user.full_name} ({self.action_type})"

    @property
    def is_active_suspension(self):
        """Check if this is an active suspension"""
        if self.action_type != 'SUSPEND':
            return False
        if self.expires_at is None:
            return True
        return self.expires_at > timezone.now()
