# apps/notifications/urls.py

from django.urls import path
from apps.notifications.views import (
    NotificationListView,
    NotificationDetailView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationUnreadCountView,
    NotificationDeleteAllView,
    NotificationPreferenceView,
)

urlpatterns = [
    # List notifications
    path('', NotificationListView.as_view(), name='notifications-list'),
    
    # Notification detail
    path('<int:notification_id>/', NotificationDetailView.as_view(), name='notification-detail'),
    
    # Mark operations
    path('<int:notification_id>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    
    # Count
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    
    # Delete all
    path('delete-all/', NotificationDeleteAllView.as_view(), name='notification-delete-all'),
    
    # Preferences
    path('preferences/', NotificationPreferenceView.as_view(), name='notification-preferences'),
]
