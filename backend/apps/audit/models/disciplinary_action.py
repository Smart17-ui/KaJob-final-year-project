from django.db import models
from django.utils import timezone
from apps.common.models.mixins import BaseModel
from apps.common.constants import DisciplinaryActionType


class DisciplinaryAction(BaseModel):
    """
    Administrative actions taken against users.
    """
    admin = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='actions_taken'
    )
    target_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='actions_received'
    )
    related_report = models.ForeignKey(
        'reports.Report',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disciplinary_actions'
    )
    related_investigation = models.ForeignKey(
        'reports.Investigation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disciplinary_actions'
    )
    
    # Action Information
    action_type = models.CharField(
        max_length=20,
        choices=DisciplinaryActionType.CHOICES
    )
    reason = models.TextField()
    notes = models.TextField(blank=True)
    
    # Duration (for suspensions)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    performed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'disciplinary_actions'
        ordering = ['-performed_at']
        verbose_name = 'Disciplinary Action'
        verbose_name_plural = 'Disciplinary Actions'
        indexes = [
            models.Index(fields=['target_user', 'action_type']),
            models.Index(fields=['admin', 'performed_at']),
        ]
    
    def __str__(self):
        return f"{self.admin.full_name} -> {self.target_user.full_name} ({self.get_action_type_display()})"
    
    @property
    def is_active_suspension(self):
        """Check if this is an active suspension"""
        if self.action_type != DisciplinaryActionType.SUSPEND:
            return False
        if self.expires_at is None:
            return True
        return self.expires_at > timezone.now()
    
    def is_expired(self):
        """Check if the action has expired"""
        if self.expires_at is None:
            return False
        return self.expires_at <= timezone.now()
