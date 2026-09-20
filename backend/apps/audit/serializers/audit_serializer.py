# apps/audit/serializers/audit_serializer.py

from rest_framework import serializers
from apps.audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """Full serializer for AuditLog model."""

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'action',
            'entity_type',
            'entity_id',
            'ip_address',
            'user_agent',
            'details',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'Unknown User'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class AuditLogListSerializer(serializers.ModelSerializer):
    """
    List serializer — includes everything the admin table needs
    (user email, entity_id, IP, etc.).
    """

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'action',
            'entity_type',
            'entity_id',
            'ip_address',
            'created_at',
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'Unknown User'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class AuditLogDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single audit log."""

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'action',
            'entity_type',
            'entity_id',
            'ip_address',
            'user_agent',
            'details',
            'created_at',
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'Unknown User'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None


class AuditStatsSerializer(serializers.Serializer):
    """Serializer for audit statistics."""

    total_actions = serializers.IntegerField()
    by_action = serializers.ListField()
    top_users = serializers.ListField()
    daily_activity = serializers.ListField()
