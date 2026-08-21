# apps/identity_verification/serializers/verification_serializer.py
import re
from rest_framework import serializers
from apps.identity_verification.models import IdentityVerification
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
        
        #Check if document number already exists
        if self._document_number_exists(value):
            raise serializers.ValidationError(
                "This document number is already registered. Please use a different one."
            )
        
        # Get document type
        document_type = self.initial_data.get('document_type', '')
        
        # Validate based on document type
        if document_type in ['NRC_FRONT', 'NRC_BACK']:
            if not self._is_valid_nrc(value):
                raise serializers.ValidationError(
                    "Invalid NRC format. Expected format: 123456/78/1 "
                    "(6 digits / 2 digits / 1 digit)"
                )
        elif document_type == 'PASSPORT_PHOTO':
            if not self._is_valid_passport(value):
                raise serializers.ValidationError(
                    "Invalid Passport format. Expected format: ZA123456 "
                    "(2 uppercase letters + 6 digits)"
                )
        elif document_type == 'SELFIE':
            # Selfie doesn't have a document number
            pass
        
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
        # Format: 6 digits / 2 digits / 1 digit
        pattern = r'^\d{6}/\d{2}/\d{1}$'
        return bool(re.match(pattern, value))
    
    def _is_valid_passport(self, value):
        """
        Validate Passport format: ZA123456
        - 2 uppercase letters
        - 6 digits
        """
        # Format: 2 letters followed by 6 digits
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
