# apps/notifications/repositories/notification_repository.py

from typing import List, Optional, Dict, Any
from django.db.models import Q, Count
from django.utils import timezone
from apps.common.repositories import BaseRepository
from apps.notifications.models import Notification, NotificationPreference


class NotificationRepository(BaseRepository[Notification]):
    """Repository for Notification model operations."""
    
    def __init__(self):
        super().__init__(Notification)
    
    # ============================================
    # FIND BY RECIPIENT
    # ============================================
    
    def get_by_recipient(self, user_id: int, limit: int = 50) -> List[Notification]:
        """Get notifications for a user."""
        return self.filter(recipient_id=user_id).order_by('-created_at')[:limit]
    
    def get_unread_by_recipient(self, user_id: int) -> List[Notification]:
        """Get unread notifications for a user."""
        return self.filter(recipient_id=user_id, is_read=False).order_by('-created_at')
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user."""
        return self.filter(recipient_id=user_id, is_read=False).count()
    
    # ============================================
    # MARK OPERATIONS
    # ============================================
    
    def mark_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a notification as read."""
        notification = self.filter(id=notification_id, recipient_id=user_id).first()
        if notification:
            notification.mark_as_read()
        return notification
    
    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user."""
        count = self.filter(recipient_id=user_id, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count
    
    def delete_all(self, user_id: int) -> int:
        """Delete all notifications for a user."""
        count = self.filter(recipient_id=user_id).delete()
        return count
    
    # ============================================
    # PREFERENCES
    # ============================================
    
    def get_or_create_preferences(self, user_id: int) -> NotificationPreference:
        """Get or create notification preferences for a user."""
        preference, created = NotificationPreference.objects.get_or_create(
            user_id=user_id
        )
        return preference
    
    def update_preferences(self, user_id: int, data: Dict[str, Any]) -> NotificationPreference:
        """Update notification preferences for a user."""
        preference = self.get_or_create_preferences(user_id)
        
        if 'email_enabled' in data:
            preference.email_enabled = data['email_enabled']
        if 'in_app_enabled' in data:
            preference.in_app_enabled = data['in_app_enabled']
        if 'push_enabled' in data:
            preference.push_enabled = data['push_enabled']
        if 'preferences' in data:
            for key, value in data['preferences'].items():
                preference.set_preference(key, value)
        
        preference.save()
        return preference
