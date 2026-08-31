# apps/notifications/serializers/notification_serializer.py

from rest_framework import serializers
from apps.notifications.models import Notification, NotificationPreference
from apps.common.constants import NotificationType


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    type_display = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'title',
            'message',
            'notification_type',
            'type_display',
            'related_entity_id',
            'related_entity_type',
            'redirect_url',
            'data',
            'is_read',
            'read_at',
            'created_at',
        ]
        read_only_fields = ['created_at', 'read_at']
    
    def get_type_display(self, obj):
        return dict(NotificationType.CHOICES).get(obj.notification_type)
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        
        diff = timezone.now() - obj.created_at
        
        if diff.days > 30:
            return f"{diff.days // 30} months ago"
        elif diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600} hours ago"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60} minutes ago"
        else:
            return "Just now"


class NotificationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing notifications."""
    
    type_display = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'type_display',
            'is_read',
            'redirect_url',
            'time_ago',
            'created_at',
        ]
    
    def get_type_display(self, obj):
        return dict(NotificationType.CHOICES).get(obj.notification_type)
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        
        diff = timezone.now() - obj.created_at
        
        if diff.days > 30:
            return f"{diff.days // 30} months ago"
        elif diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600} hours ago"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60} minutes ago"
        else:
            return "Just now"


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences."""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id',
            'user',
            'email_enabled',
            'in_app_enabled',
            'push_enabled',
            'preferences',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class UnreadCountSerializer(serializers.Serializer):
    """Serializer for unread notification count."""
    
    count = serializers.IntegerField()
