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
    # ROLE FILTER HELPER
    # ============================================

    @staticmethod
    def _role_filter(role: Optional[str]) -> Q:
        """
        Build a Q object that matches notifications for the given role.

        Rule: show notifications targeted at the current role PLUS
        role-agnostic notifications (role IS NULL).
        If role is None, no filter (show everything).
        """
        if not role:
            return Q()
        return Q(role=role) | Q(role__isnull=True)

    # ============================================
    # FIND BY RECIPIENT
    # ============================================

    def get_by_recipient(
        self,
        user_id: int,
        limit: int = 50,
        role: Optional[str] = None,
    ) -> List[Notification]:
        """Get notifications for a user, optionally filtered by role."""
        qs = self.filter(recipient_id=user_id)
        if role:
            qs = qs.filter(self._role_filter(role))
        return qs.order_by('-created_at')[:limit]

    def get_unread_by_recipient(
        self,
        user_id: int,
        role: Optional[str] = None,
    ) -> List[Notification]:
        """Get unread notifications for a user, optionally filtered by role."""
        qs = self.filter(recipient_id=user_id, is_read=False)
        if role:
            qs = qs.filter(self._role_filter(role))
        return qs.order_by('-created_at')

    def get_unread_count(
        self,
        user_id: int,
        role: Optional[str] = None,
    ) -> int:
        """Get unread notification count, optionally filtered by role."""
        qs = self.filter(recipient_id=user_id, is_read=False)
        if role:
            qs = qs.filter(self._role_filter(role))
        return qs.count()

    # ============================================
    # MARK OPERATIONS
    # ============================================

    def mark_as_read(
        self,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        notification = self.filter(
            id=notification_id, recipient_id=user_id
        ).first()
        if notification:
            notification.mark_as_read()
        return notification

    def mark_all_as_read(
        self,
        user_id: int,
        role: Optional[str] = None,
    ) -> int:
        """Mark all notifications as read, optionally scoped to a role."""
        qs = self.filter(recipient_id=user_id, is_read=False)
        if role:
            qs = qs.filter(self._role_filter(role))
        return qs.update(is_read=True, read_at=timezone.now())

    def delete_all(
        self,
        user_id: int,
        role: Optional[str] = None,
    ) -> int:
        """Delete all notifications, optionally scoped to a role."""
        qs = self.filter(recipient_id=user_id)
        if role:
            qs = qs.filter(self._role_filter(role))
        count, _ = qs.delete()
        return count

    # ============================================
    # PREFERENCES
    # ============================================

    def get_or_create_preferences(self, user_id: int) -> NotificationPreference:
        preference, created = NotificationPreference.objects.get_or_create(
            user_id=user_id
        )
        return preference

    def update_preferences(
        self, user_id: int, data: Dict[str, Any]
    ) -> NotificationPreference:
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
