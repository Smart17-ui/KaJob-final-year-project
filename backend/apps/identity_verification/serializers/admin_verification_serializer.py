# apps/identity_verification/serializers/admin_serializer.py

from rest_framework import serializers
from apps.common.constants import VerificationStatus


class AdminUserSerializer(serializers.Serializer):
    """Serializer for user in admin verification."""

    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField()
    account_status = serializers.CharField()
    is_verified = serializers.BooleanField()


class AdminDocumentSerializer(serializers.Serializer):
    """Serializer for documents in admin verification detail."""

    id = serializers.IntegerField()
    document_type = serializers.CharField()
    document_type_display = serializers.CharField()
    file_url = serializers.SerializerMethodField()
    file_name = serializers.CharField()
    file_size = serializers.IntegerField(allow_null=True)
    mime_type = serializers.CharField(allow_blank=True)
    uploaded_at = serializers.DateTimeField()

    def get_file_url(self, obj):
        """
        `obj` may be a dict or a VerificationDocument.
        Handle both.
        """
        # Dict case (annotation-style usage)
        if isinstance(obj, dict):
            doc = obj.get('document')
            request = self.context.get('request')
            if doc and doc.file:
                url = doc.file.url
                return request.build_absolute_uri(url) if request else url
            return obj.get('file_url')

        # Model instance case
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return None


class AdminVerificationListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user = AdminUserSerializer()
    document_type = serializers.CharField()
    document_number = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    document_count = serializers.IntegerField()

    def get_status_display(self, obj):
        status = obj.get('status')
        if status:
            return dict(VerificationStatus.CHOICES).get(status)
        return None


class AdminVerificationDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user = AdminUserSerializer()
    document_type = serializers.CharField()
    document_type_display = serializers.CharField()
    document_number = serializers.CharField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    reviewed_at = serializers.DateTimeField(allow_null=True)
    rejection_reason = serializers.CharField(allow_blank=True)
    documents = AdminDocumentSerializer(many=True)
    verification_notes = serializers.CharField(allow_blank=True)

    def get_status_display(self, obj):
        status = obj.get('status')
        if status:
            return dict(VerificationStatus.CHOICES).get(status)
        return None


class AdminReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=['approve', 'reject'],
        required=True,
        help_text="Action to take: approve or reject",
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Rejection reason (required if action is reject)",
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Additional notes for the review",
    )

    def validate(self, data):
        if data.get('action') == 'reject' and not data.get('reason'):
            raise serializers.ValidationError({
                'reason': 'Rejection reason is required when rejecting a verification.'
            })
        return data
