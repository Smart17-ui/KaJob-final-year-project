# apps/identity_verification/repositories/verification_repository.py

from typing import Optional, List
from apps.common.repositories import BaseRepository
from apps.common.constants import VerificationStatus
from django.utils import timezone


class VerificationRepository(BaseRepository):
    """
    Repository for IdentityVerification model operations.
    """
    
    def __init__(self):
        # ✅ Lazy import to avoid circular import
        from apps.identity_verification.models import IdentityVerification
        super().__init__(IdentityVerification)
    
    # ============================================
    # FIND BY USER
    # ============================================
    
    def get_by_user_id(self, user_id: int) -> Optional[object]:
        """Get verification by user ID (most recent)"""
        return self.filter(user_id=user_id).order_by('-submitted_at').first()
    
    def get_all_by_user_id(self, user_id: int) -> List[object]:
        """Get all verifications for a user"""
        return self.filter(user_id=user_id).order_by('-submitted_at')
    
    def get_active_verification(self, user_id: int) -> Optional[object]:
        """Get active (not rejected/expired) verification for a user"""
        return self.filter(
            user_id=user_id
        ).exclude(
            verification_status__in=[VerificationStatus.REJECTED, VerificationStatus.EXPIRED]
        ).order_by('-submitted_at').first()
    
    # ============================================
    # FIND BY STATUS
    # ============================================
    
    def get_pending_verifications(self) -> List[object]:
        """Get all pending verifications for admin review"""
        return self.filter(
            verification_status__in=[VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]
        ).order_by('submitted_at')
    
    def get_verifications_by_status(self, status: str) -> List[object]:
        """Get verifications by status"""
        return self.filter(verification_status=status).order_by('-submitted_at')
    
    def get_recent_verifications(self, limit: int = 10) -> List[object]:
        """Get most recent verifications"""
        return self.filter().order_by('-submitted_at')[:limit]
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_pending(self) -> int:
        """Count pending verifications"""
        return self.filter(
            verification_status__in=[VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]
        ).count()
    
    def count_by_status(self, status: str) -> int:
        """Count verifications by status"""
        return self.filter(verification_status=status).count()
    
    # ============================================
    # CHECK OPERATIONS
    # ============================================
    
    def has_pending_verification(self, user_id: int) -> bool:
        """Check if user has a pending verification"""
        return self.filter(
            user_id=user_id,
            verification_status__in=[VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]
        ).exists()
    
    def has_verified(self, user_id: int) -> bool:
        """Check if user is verified"""
        return self.filter(
            user_id=user_id,
            verification_status=VerificationStatus.VERIFIED
        ).exists()
    
    def get_by_id(self, verification_id: int) -> Optional[object]:
        """Get verification by ID"""
        return self.filter(id=verification_id).first()
    
    def document_number_exists(self, document_number: str) -> bool:
        """Check if a document number already exists"""
        return self.filter(document_number=document_number).exists()
    
    # ============================================
    # 🆕 ADMIN VERIFICATION OPERATIONS
    # ============================================
    
    def approve_verification(self, verification: object, admin, notes: str = None) -> object:
        """
        Approve a verification request.
        Uses the approve method from the IdentityVerification model.
        """
        verification.approve(admin)
        return verification
    
    def reject_verification(self, verification: object, admin, reason: str, notes: str = None) -> object:
        """
        Reject a verification request.
        Uses the reject method from the IdentityVerification model.
        """
        verification.reject(admin, reason)
        return verification
