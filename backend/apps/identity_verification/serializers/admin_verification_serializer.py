# apps/identity_verification/serializers/admin_verification_serializer.py
from rest_framework import serializers
from apps.identity_verification.models import IdentityVerification
from apps.common.constants import VerificationStatus, DocumentType


class AdminUserSerializer(serializers.Serializer):
    """
    Serializer for user info in admin verification views.
    """
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    account_status = serializers.CharField(allow_null=True, required=False)
    is_verified = serializers.BooleanField(required=False, default=False)  # ✅ Added default


class AdminDocumentSerializer(serializers.Serializer):
    """
    Serializer for documents in admin verification views.
    """
    id = serializers.IntegerField()
    document_type = serializers.CharField()
    document_type_display = serializers.SerializerMethodField()
    file_path = serializers.CharField()
    file_name = serializers.CharField()
    file_size = serializers.IntegerField(allow_null=True)
    mime_type = serializers.CharField(allow_null=True)
    uploaded_at = serializers.DateTimeField()
    
    def get_document_type_display(self, obj):
        return dict(DocumentType.CHOICES).get(obj['document_type'])


class AdminVerificationListSerializer(serializers.Serializer):
    """
    Serializer for listing verifications in admin view.
    """
    id = serializers.IntegerField()
    user = AdminUserSerializer()
    document_type = serializers.CharField()
    document_number = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    document_count = serializers.IntegerField()
    
    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(obj['status'])


class AdminVerificationDetailSerializer(serializers.Serializer):
    """
    Serializer for verification detail in admin view.
    """
    id = serializers.IntegerField()
    user = AdminUserSerializer()
    document_type = serializers.CharField()
    document_number = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    reviewed_at = serializers.DateTimeField(allow_null=True)
    rejection_reason = serializers.CharField(allow_null=True)
    documents = AdminDocumentSerializer(many=True)
    verification_notes = serializers.CharField(allow_null=True)
    
    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(obj['status'])


class AdminReviewSerializer(serializers.Serializer):
    """
    Serializer for admin review (approve/reject).
    """
    action = serializers.ChoiceField(
        choices=['approve', 'reject'],
        required=True,
        help_text="Action to take: approve or reject"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Rejection reason (required for reject)"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Internal admin notes"
    )
    
    def validate(self, data):
        """Validate that reason is provided when rejecting"""
        if data.get('action') == 'reject' and not data.get('reason'):
            raise serializers.ValidationError({
                'reason': 'Rejection reason is required when rejecting a verification.'
            })
        return data
