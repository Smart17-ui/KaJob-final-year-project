# apps/audit/serializers/disciplinary_serializer.py

from rest_framework import serializers
from apps.audit.models import DisciplinaryAction
from apps.common.constants import DisciplinaryActionType


class DisciplinaryActionSerializer(serializers.ModelSerializer):
    """Full serializer for DisciplinaryAction model."""
    
    admin_name = serializers.SerializerMethodField()
    target_user_name = serializers.SerializerMethodField()
    action_type_display = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = DisciplinaryAction
        fields = [
            'id',
            'admin',
            'admin_name',
            'target_user',
            'target_user_name',
            'related_report',
            'related_investigation',
            'action_type',
            'action_type_display',
            'reason',
            'notes',
            'expires_at',
            'is_active',
            'performed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['performed_at', 'created_at', 'updated_at']
    
    def get_admin_name(self, obj):
        return obj.admin.full_name if obj.admin else None
    
    def get_target_user_name(self, obj):
        return obj.target_user.full_name if obj.target_user else None
    
    def get_action_type_display(self, obj):
        return dict(DisciplinaryActionType.CHOICES).get(obj.action_type)
    
    def get_is_active(self, obj):
        if obj.action_type == DisciplinaryActionType.SUSPEND:
            return obj.is_active_suspension
        return True


class DisciplinaryActionCreateSerializer(serializers.Serializer):
    """Serializer for creating a disciplinary action."""
    
    target_user_id = serializers.IntegerField(required=True)
    action_type = serializers.ChoiceField(
        choices=DisciplinaryActionType.CHOICES,
        required=True
    )
    reason = serializers.CharField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    related_report_id = serializers.IntegerField(required=False, allow_null=True)


class DisciplinaryActionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing disciplinary actions."""
    
    target_user_name = serializers.SerializerMethodField()
    action_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = DisciplinaryAction
        fields = [
            'id',
            'target_user_name',
            'action_type',
            'action_type_display',
            'reason',
            'expires_at',
            'performed_at',
        ]
    
    def get_target_user_name(self, obj):
        return obj.target_user.full_name if obj.target_user else None
    
    def get_action_type_display(self, obj):
        return dict(DisciplinaryActionType.CHOICES).get(obj.action_type)
