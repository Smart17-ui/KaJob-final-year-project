# apps/identity_verification/serializers/verification_serializer.py
from rest_framework import serializers
from apps.identity_verification.models import IdentityVerification, VerificationDocument
from apps.common.constants import DocumentType, VerificationStatus


class DocumentUploadSerializer(serializers.Serializer):
    """
    Serializer for individual document upload.
    """
    document_type = serializers.ChoiceField(choices=DocumentType.CHOICES, required=True)
    file_path = serializers.CharField(max_length=500, required=True)
    file_name = serializers.CharField(max_length=255, required=True)
    file_size = serializers.IntegerField(required=False, allow_null=True)
    mime_type = serializers.CharField(max_length=100, required=False, allow_blank=True)


class SubmitVerificationSerializer(serializers.Serializer):
    """
    Serializer for submitting identity verification.
    """
    document_type = serializers.ChoiceField(choices=DocumentType.CHOICES, required=True)
    document_number = serializers.CharField(max_length=100, required=True)
    documents = serializers.ListField(
        child=DocumentUploadSerializer(),
        required=True,
        min_length=1,
        max_length=5,
        help_text="At least one document is required"
    )
    
    def validate_document_number(self, value):
        """Validate document number format"""
        # Add custom validation if needed
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Document number is too short.")
        return value.strip()


class VerificationDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for verification documents.
    """
    document_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = VerificationDocument
        fields = [
            'id',
            'document_type',
            'document_type_display',
            'file_path',
            'file_name',
            'file_size',
            'mime_type',
            'uploaded_at',
        ]
    
    def get_document_type_display(self, obj):
        return obj.get_document_type_display()


class VerificationStatusSerializer(serializers.Serializer):
    """
    Serializer for verification status response.
    """
    has_submitted = serializers.BooleanField()
    verification_id = serializers.IntegerField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=VerificationStatus.CHOICES, required=False, allow_null=True)
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField(required=False, allow_null=True)
    reviewed_at = serializers.DateTimeField(required=False, allow_null=True)
    rejection_reason = serializers.CharField(required=False, allow_null=True)
    document_types = serializers.ListField(child=serializers.CharField())
    message = serializers.CharField()
    
    def get_status_display(self, obj):
        if obj.get('status'):
            return dict(VerificationStatus.CHOICES).get(obj['status'])
        return None


class VerificationHistorySerializer(serializers.Serializer):
    """
    Serializer for verification history.
    """
    id = serializers.IntegerField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    reviewed_at = serializers.DateTimeField(allow_null=True)
    rejection_reason = serializers.CharField(allow_null=True)
    document_count = serializers.IntegerField()
    
    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(obj['status'])
