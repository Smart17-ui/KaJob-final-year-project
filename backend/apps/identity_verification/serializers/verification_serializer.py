# apps/identity_verification/serializers/verification_serializer.py

import re
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


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for verification documents."""
    
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
        read_only_fields = ['id', 'uploaded_at']
    
    def get_document_type_display(self, obj):
        return obj.get_document_type_display()


class SubmitVerificationSerializer(serializers.Serializer):
    """
    Serializer for submitting identity verification with validation.
    
    ✅ Validates NRC format: 123456/78/1
    ✅ Validates Passport format: ZA123456
    ✅ Checks for duplicate document numbers
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
        """
        Validate document number format.
        
        NRC: 123456/78/1 (6 digits / 2 digits / 1 digit)
        Passport: ZA123456 (2 letters + 6 digits)
        Unique check (no duplicates)
        """
        # Remove whitespace
        value = value.strip()
        
        if not value:
            raise serializers.ValidationError("Document number is required.")
        
        # Get document type
        document_type = self.initial_data.get('document_type', '')
        
        # Validate based on document type
        if document_type in ['NRC', 'NRC_FRONT', 'NRC_BACK']:
            if not self._is_valid_nrc(value):
                raise serializers.ValidationError(
                    "Invalid NRC format. Expected format: 123456/78/1 "
                    "(6 digits / 2 digits / 1 digit)"
                )
        elif document_type in ['PASSPORT', 'PASSPORT_PHOTO']:
            if not self._is_valid_passport(value):
                raise serializers.ValidationError(
                    "Invalid Passport format. Expected format: ZA123456 "
                    "(2 uppercase letters + 6 digits)"
                )
        elif document_type == 'SELFIE':
            # Selfie doesn't have a document number
            pass
        
        # Check if document number already exists
        if self._document_number_exists(value):
            raise serializers.ValidationError(
                "This document number is already registered. Please use a different one."
            )
        
        return value
    
    def _is_valid_nrc(self, value):
        """
        Validate NRC format: 123456/78/1
        - 6 digits
        - slash
        - 2 digits
        - slash
        - 1 digit
        """
        pattern = r'^\d{6}/\d{2}/\d{1}$'
        return bool(re.match(pattern, value))
    
    def _is_valid_passport(self, value):
        """
        Validate Passport format: ZA123456
        - 2 uppercase letters
        - 6 digits
        """
        pattern = r'^[A-Z]{2}\d{6}$'
        return bool(re.match(pattern, value))
    
    def _document_number_exists(self, document_number):
        """
        Check if document number already exists in the system.
        """
        from apps.identity_verification.models import IdentityVerification
        
        return IdentityVerification.objects.filter(
            document_number=document_number,
            deleted_at__isnull=True
        ).exists()


class VerificationStatusSerializer(serializers.Serializer):
    """
    Serializer for verification status response.
    """
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
        status = obj.get('status')
        if status:
            return dict(VerificationStatus.CHOICES).get(status)
        return None
