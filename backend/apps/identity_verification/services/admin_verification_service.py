# apps/identity_verification/services/admin_verification_service.py
import logging
from unittest import result
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.identity_verification.repositories import VerificationRepository
from apps.identity_verification.models import IdentityVerification
from apps.audit.models import AuditLog
from apps.common.constants import VerificationStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.services import EmailService

logger = logging.getLogger(__name__)


class AdminVerificationService:
    """
    Service for admin verification operations.
    Single Responsibility: Manage admin review of verifications.
    """
    
    def __init__(self):
        self.verification_repo = VerificationRepository()
        self.email_service = EmailService()
    
    # ============================================
    # GET PENDING VERIFICATIONS
    # ============================================
    
    def get_pending_verifications(self, admin) -> List[Dict[str, Any]]:
        """
        Get all pending verifications for admin review.
        """
        pending = self.verification_repo.get_pending_verifications()
    
        result = []
        for verification in pending:
            result.append({
                'id': verification.id,
                'user': {
                    'id': verification.user.id,
                    'full_name': verification.user.full_name,
                    'email': verification.user.email,
                    'phone_number': verification.user.phone_number,
                    'account_status': verification.user.account_status,
                    'is_verified': verification.user.is_verified,  # ✅ Added this
                },
                'document_type': verification.document_type,
                'document_number': verification.document_number,
                'status': verification.verification_status,
                'submitted_at': verification.submitted_at,
                'document_count': verification.documents.count(),
            })
    
        return  result
    
    # ============================================
    # GET VERIFICATION DETAIL
    # ============================================
    
    def get_verification_detail(self, admin, verification_id: int) -> Dict[str, Any]:
        """
        Get detailed verification information for admin review.
        """
        verification = self.verification_repo.get_by_id(verification_id)
        if not verification:
            raise ResourceNotFound("Verification not found.")
        
        # Get all documents
        documents = []
        for doc in verification.documents.all():
            documents.append({
                'id': doc.id,
                'document_type': doc.document_type,
                'file_path': doc.file_path,
                'file_name': doc.file_name,
                'file_size': doc.file_size,
                'mime_type': doc.mime_type,
                'uploaded_at': doc.uploaded_at,
            })
        
        return {
            'id': verification.id,
            'user': {
                'id': verification.user.id,
                'full_name': verification.user.full_name,
                'email': verification.user.email,
                'phone_number': verification.user.phone_number,
                'account_status': verification.user.account_status,
                'is_verified': verification.user.is_verified,
            },
            'document_type': verification.document_type,
            'document_number': verification.document_number,
            'status': verification.verification_status,
            'submitted_at': verification.submitted_at,
            'reviewed_at': verification.reviewed_at,
            'rejection_reason': verification.rejection_reason,
            'documents': documents,
            'verification_notes': verification.verification_notes,
        }
    
    # ============================================
    # REVIEW VERIFICATION
    # ============================================
    
    @transaction.atomic
    def approve_verification(self, admin, verification_id: int, notes: str = None) -> Dict[str, Any]:
        """
        Approve a verification request.
        """
        verification = self.verification_repo.get_by_id(verification_id)
        if not verification:
            raise ResourceNotFound("Verification not found.")
        
        if verification.verification_status not in [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]:
            raise BusinessRuleViolation(
                f"Cannot approve verification with status '{verification.verification_status}'."
            )
        
        # Approve verification
        verification = self.verification_repo.approve_verification(verification, admin, notes)
        
        # Audit log
        AuditLog.objects.create(
            user=admin,
            action='VERIFICATION_APPROVED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'user_id': verification.user.id,
                'user_email': verification.user.email,
                'notes': notes,
            }
        )
        
        # ✅ Simple logging instead of notifications (for now)
        logger.info(f"Verification approved for user {verification.user.email} (ID: {verification.id})")
        
        # Send email notification
        self.email_service.send_verification_approved_email(verification.user)
        
        return {
            'verification': verification,
            'message': f'Verification for {verification.user.full_name} has been approved.',
        }
    
    @transaction.atomic
    def reject_verification(
        self, 
        admin, 
        verification_id: int, 
        reason: str, 
        notes: str = None
    ) -> Dict[str, Any]:
        """
        Reject a verification request.
        """
        if not reason:
            raise BusinessRuleViolation("Rejection reason is required.")
        
        verification = self.verification_repo.get_by_id(verification_id)
        if not verification:
            raise ResourceNotFound("Verification not found.")
        
        if verification.verification_status not in [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]:
            raise BusinessRuleViolation(
                f"Cannot reject verification with status '{verification.verification_status}'."
            )
        
        # Reject verification
        verification = self.verification_repo.reject_verification(verification, admin, reason, notes)
        
        # Audit log
        AuditLog.objects.create(
            user=admin,
            action='VERIFICATION_REJECTED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'user_id': verification.user.id,
                'user_email': verification.user.email,
                'reason': reason,
                'notes': notes,
            }
        )
        
        # ✅ Simple logging instead of notifications (for now)
        logger.info(f"Verification rejected for user {verification.user.email} (ID: {verification.id})")
        
        # Send email notification
        self.email_service.send_verification_rejected_email(verification.user, reason)
        
        return {
            'verification': verification,
            'message': f'Verification for {verification.user.full_name} has been rejected.',
        }
    
    # ============================================
    # GET STATISTICS
    # ============================================
    
    def get_statistics(self, admin) -> Dict[str, Any]:
        """
        Get verification statistics for admin dashboard.
        """
        return {
            'pending': self.verification_repo.count_pending(),
            'verified': self.verification_repo.count_by_status(VerificationStatus.VERIFIED),
            'rejected': self.verification_repo.count_by_status(VerificationStatus.REJECTED),
            'total': self.verification_repo.count(),
        }
