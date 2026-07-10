from django.db import models
from django.utils import timezone
from apps.common.models.mixins import BaseModel
from apps.common.constants import NotificationType


class Notification(BaseModel):
    """
    In-app notifications.
    """
    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    
    # Notification Content
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.CHOICES
    )
    
    # Related Entity (for click-through)
    related_entity_id = models.BigIntegerField(null=True, blank=True)
    related_entity_type = models.CharField(max_length=50, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.full_name}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
