# apps/identity_verification/serializers/verification_serializer.py

import os
import re
from rest_framework import serializers

from apps.identity_verification.models import (
    IdentityVerification,
    VerificationDocument,
)
from apps.common.constants import DocumentType, VerificationStatus


# ============================================
# FILE VALIDATION CONSTANTS
# ============================================

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ============================================
# FILE UPLOAD (multipart)
# ============================================

class DocumentUploadSerializer(serializers.Serializer):
    """
    Serializer for a single file upload (multipart/form-data).
    """
    document_type = serializers.ChoiceField(
        choices=DocumentType.CHOICES,
        required=True,
    )
    file = serializers.FileField(required=True)

    def validate_file(self, value):
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File too large. Max size is {MAX_FILE_SIZE // (1024 * 1024)} MB."
            )

        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "Unsupported extension. Allowed: PDF, JPG, JPEG, PNG."
            )

        content_type = getattr(value, "content_type", None)
        if content_type and content_type not in ALLOWED_MIME_TYPES:
            raise serializers.ValidationError(
                "Unsupported file type. Allowed: PDF, JPG, PNG."
            )

        return value


# ============================================
# DOCUMENT (read + write)
# ============================================

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for verification documents.
    Used for listing and creating real file uploads.
    """
    document_type_display = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = VerificationDocument
        fields = [
            'id',
            'document_type',
            'verification',
            'document_type_display',
            'file',
            'file_url',
            'file_name',
            'file_size',
            'mime_type',
            'uploaded_at',
        ]
        read_only_fields = [
            'id',
            'file_url',
            'file_name',
            'file_size',
            'mime_type',
            'uploaded_at',
        ]
        extra_kwargs = {
            'file': {'required': True},
        }

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not obj.file:
            return None
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url

    def validate_file(self, value):
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"File too large. Max size is {MAX_FILE_SIZE // (1024 * 1024)} MB."
            )
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "Unsupported extension. Allowed: PDF, JPG, JPEG, PNG."
            )
        return value

    def create(self, validated_data):
        uploaded_file = validated_data['file']
        validated_data['file_name'] = uploaded_file.name
        validated_data['file_size'] = uploaded_file.size
        validated_data['mime_type'] = getattr(uploaded_file, 'content_type', '')
        return super().create(validated_data)


# ============================================
# SUBMIT VERIFICATION
# (kept for compatibility — but see the view
#  for the multipart version)
# ============================================

class SubmitVerificationSerializer(serializers.Serializer):
    """
    Serializer for submitting identity verification with validation.
    Note: With the new upload flow, this is mostly used for
    validation of document_number. Files are uploaded separately.
    """
    document_type = serializers.ChoiceField(
        choices=DocumentType.CHOICES, required=True
    )
    document_number = serializers.CharField(max_length=100, required=True)

    def validate_document_number(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Document number is required.")

        document_type = self.initial_data.get('document_type', '')

        if document_type in ['NRC', 'NRC_FRONT', 'NRC_BACK']:
            if not self._is_valid_nrc(value):
                raise serializers.ValidationError(
                    "Invalid NRC format. Expected: 123456/78/1"
                )
        elif document_type in ['PASSPORT', 'PASSPORT_PHOTO']:
            if not self._is_valid_passport(value):
                raise serializers.ValidationError(
                    "Invalid Passport format. Expected: ZA123456"
                )
        elif document_type == 'SELFIE':
            pass

        if self._document_number_exists(value):
            raise serializers.ValidationError(
                "This document number is already registered."
            )

        return value

    def _is_valid_nrc(self, value):
        return bool(re.match(r'^\d{6}/\d{2}/\d{1}$', value))

    def _is_valid_passport(self, value):
        return bool(re.match(r'^[A-Z]{2}\d{6}$', value))

    def _document_number_exists(self, document_number):
        return IdentityVerification.objects.filter(
            document_number=document_number,
            deleted_at__isnull=True,
        ).exists()


# ============================================
# STATUS
# ============================================

class VerificationStatusSerializer(serializers.Serializer):
    has_submitted = serializers.BooleanField()
    verification_id = serializers.IntegerField(required=False, allow_null=True)
    verification_status = serializers.CharField(required=False, allow_null=True)
    status_display = serializers.SerializerMethodField()
    phone_verified = serializers.BooleanField(default=False)
    email_verified = serializers.BooleanField(default=False)
    fully_verified = serializers.BooleanField(default=False)
    phone_number = serializers.CharField(allow_blank=True)
    email = serializers.EmailField()
    document_type = serializers.CharField(allow_blank=True)
    document_number = serializers.CharField(allow_blank=True)
    submitted_at = serializers.DateTimeField(required=False, allow_null=True)
    reviewed_at = serializers.DateTimeField(required=False, allow_null=True)
    rejection_reason = serializers.CharField(allow_blank=True)
    message = serializers.CharField()
    next_step = serializers.CharField()

    def get_status_display(self, obj):
        status = obj.get('verification_status')
        if status:
            return dict(VerificationStatus.CHOICES).get(status)
        return None


# ============================================
# HISTORY
# ============================================

class VerificationHistorySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
    status_display = serializers.SerializerMethodField()
    submitted_at = serializers.DateTimeField()
    reviewed_at = serializers.DateTimeField(allow_null=True)
    rejection_reason = serializers.CharField(allow_null=True)
    document_count = serializers.IntegerField()

    def get_status_display(self, obj):
        status = obj.get('status')
        if status:
            return dict(VerificationStatus.CHOICES).get(status)
        return None
