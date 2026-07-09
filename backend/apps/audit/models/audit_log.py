from django.db import models

class AuditLog(models.Model):
    """
    System-wide audit trail for all significant actions.
    Insert-only log for compliance and security.
    """
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text="User who performed the action (nullable for system actions)"
    )
    action = models.CharField(
        max_length=100,
        help_text="Action performed (e.g., USER_REGISTERED, JOB_POSTED)"
    )
    entity_type = models.CharField(
        max_length=50,
        help_text="Type of entity affected (e.g., USER, JOB, REPORT)"
    )
    entity_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the affected entity"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the user"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional details (before/after values, metadata)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the action was logged"
    )

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id', 'created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.action} - {self.entity_type} ({self.created_at})"
