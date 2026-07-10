from django.db import models


class AuditLog(models.Model):
    """
    System audit trail (immutable).
    """
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    # Audit Information
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.BigIntegerField(null=True, blank=True)
    
    # Additional Information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['entity_type', 'entity_id', 'created_at']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.entity_type} ({self.created_at})"
