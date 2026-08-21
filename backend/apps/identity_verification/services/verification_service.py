# apps/identity_verification/services/verification_service.py
import logging
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.identity_verification.repositories import (
    VerificationRepository,
    DocumentRepository,
)
from apps.identity_verification.models import IdentityVerification
from apps.audit.models import AuditLog
from apps.common.constants import VerificationStatus, DocumentType
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.services import EmailService

logger = logging.getLogger(__name__)


class VerificationService:
    """
    Service for identity verification operations.
    Single Responsibility: Manage user identity verification.
    
    Users submit documents once
    Admin approves/rejects
    is_verified is account-level (not role-level)
    No duplicate NRC numbers allowed
    """
    
    def __init__(self):
        self.verification_repo = VerificationRepository()
        self.document_repo = DocumentRepository()
        self.email_service = EmailService()
    
    # ============================================
    # SUBMIT VERIFICATION
    # ============================================
    
    @transaction.atomic
    def submit_verification(self, user, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit identity verification documents.
        
        User must not already be verified
        No pending verification allowed
        Document validation done in serializer
        Unique document number enforced
        """
        # Check if user already has a pending verification
        if self.verification_repo.has_pending_verification(user.id):
            raise BusinessRuleViolation(
                "You already have a pending verification request. "
                "Please wait for admin review."
            )
        
        # Check if user is already verified
        if user.is_verified:
            raise BusinessRuleViolation("Your identity is already verified.")
        
        # Create verification record (validation already done in serializer)
        verification = self.verification_repo.create(
            user=user,
            document_type=data['document_type'],
            document_number=data['document_number'],
            verification_status=VerificationStatus.PENDING,
        )
        
        # Create documents
        documents = []
        for doc_data in data.get('documents', []):
            document = self.document_repo.create(
                verification=verification,
                document_type=doc_data['document_type'],
                file_path=doc_data['file_path'],
                file_name=doc_data['file_name'],
                file_size=doc_data.get('file_size'),
                mime_type=doc_data.get('mime_type'),
            )
            documents.append(document)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='VERIFICATION_SUBMITTED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'document_type': data['document_type'],
                'document_count': len(documents),
            }
        )
        
        logger.info(f"Verification submitted for user {user.email} (ID: {verification.id})")
        
        # Send email notification (optional)
        # self.email_service.send_verification_submitted_email(user)
        
        return {
            'verification': verification,
            'documents': documents,
            'message': 'Verification submitted successfully. Please wait for admin review.'
        }
    
    # ============================================
    # GET VERIFICATION STATUS
    # ============================================
    
    def get_verification_status(self, user) -> Dict[str, Any]:
        """
        Get verification status for a user.
        """
        verification = self.verification_repo.get_by_user_id(user.id)
        
        if not verification:
            return {
                'has_submitted': False,
                'status': None,
                'message': 'You have not submitted any verification documents.',
            }
        
        return {
            'has_submitted': True,
            'verification_id': verification.id,
            'status': verification.verification_status,
            'submitted_at': verification.submitted_at,
            'reviewed_at': verification.reviewed_at,
            'rejection_reason': verification.rejection_reason,
            'document_types': [doc.document_type for doc in verification.documents.all()],
            'message': self._get_status_message(verification),
        }
    
    # ============================================
    # GET VERIFICATION HISTORY
    # ============================================
    
    def get_verification_history(self, user) -> List[Dict[str, Any]]:
        """
        Get verification history for a user.
        """
        verifications = self.verification_repo.get_all_by_user_id(user.id)
        
        history = []
        for verification in verifications:
            history.append({
                'id': verification.id,
                'status': verification.verification_status,
                'submitted_at': verification.submitted_at,
                'reviewed_at': verification.reviewed_at,
                'rejection_reason': verification.rejection_reason,
                'document_count': verification.documents.count(),
            })
        
        return history
    
    # ============================================
    # PRIVATE METHODS
    # ============================================
    
    def _get_status_message(self, verification: IdentityVerification) -> str:
        """Get user-friendly status message"""
        status_messages = {
            VerificationStatus.PENDING: 'Your verification is pending review.',
            VerificationStatus.UNDER_REVIEW: 'Your verification is under review.',
            VerificationStatus.VERIFIED: 'Your identity has been verified successfully!',
            VerificationStatus.REJECTED: f'Your verification was rejected. Reason: {verification.rejection_reason}',
            VerificationStatus.EXPIRED: 'Your verification has expired. Please submit again.',
        }
        return status_messages.get(verification.verification_status, 'Unknown status.')
