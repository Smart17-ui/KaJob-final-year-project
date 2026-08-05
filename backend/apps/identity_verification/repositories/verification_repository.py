# apps/identity_verification/repositories/verification_repository.py
from typing import Optional, List
from django.db.models import Q
from apps.identity_verification.models import IdentityVerification
from apps.common.repositories import BaseRepository
from apps.common.constants import VerificationStatus
from django.utils import timezone


class VerificationRepository(BaseRepository[IdentityVerification]):
    """
    Repository for IdentityVerification model operations.
    """
    
    def __init__(self):
        super().__init__(IdentityVerification)
    
    # ============================================
    # FIND BY USER
    # ============================================
    
    def get_by_user_id(self, user_id: int) -> Optional[IdentityVerification]:
        """Get verification by user ID (most recent)"""
        return self.filter(user_id=user_id).order_by('-submitted_at').first()
    
    def get_all_by_user_id(self, user_id: int) -> List[IdentityVerification]:
        """Get all verifications for a user"""
        return self.filter(user_id=user_id).order_by('-submitted_at')
    
    def get_active_verification(self, user_id: int) -> Optional[IdentityVerification]:
        """Get active (not rejected/expired) verification for a user"""
        return self.filter(
            user_id=user_id
        ).exclude(
            verification_status__in=[VerificationStatus.REJECTED, VerificationStatus.EXPIRED]
        ).order_by('-submitted_at').first()
    
    # ============================================
    # FIND BY STATUS
    # ============================================
    
    def get_pending_verifications(self) -> List[IdentityVerification]:
        """Get all pending verifications for admin review"""
        return self.filter(
            verification_status__in=[VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW]
        ).order_by('submitted_at')
    
    def get_verifications_by_status(self, status: str) -> List[IdentityVerification]:
        """Get verifications by status"""
        return self.filter(verification_status=status).order_by('-submitted_at')
    
    def get_recent_verifications(self, limit: int = 10) -> List[IdentityVerification]:
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
    # UPDATE OPERATIONS
    # ============================================
    
    def update_status(
        self, 
        verification: IdentityVerification, 
        status: str,
        admin=None,
        notes: str = None
    ) -> IdentityVerification:
        """Update verification status"""
        update_data = {'verification_status': status}
        if admin:
            update_data['reviewed_by'] = admin
            update_data['reviewed_at'] = timezone.now()
        if notes:
            update_data['verification_notes'] = notes
        
        return self.update(verification, **update_data)
    
    def approve_verification(
        self, 
        verification: IdentityVerification, 
        admin,
        notes: str = None
    ) -> IdentityVerification:
        """Approve verification"""
        verification.verification_status = VerificationStatus.VERIFIED
        verification.reviewed_by = admin
        verification.reviewed_at = timezone.now()
        if notes:
            verification.verification_notes = notes
        verification.save()
        
        # Update user's verification status
        user = verification.user
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        
        return verification
    
    def reject_verification(
        self, 
        verification: IdentityVerification, 
        admin,
        reason: str,
        notes: str = None
    ) -> IdentityVerification:
        """Reject verification"""
        verification.verification_status = VerificationStatus.REJECTED
        verification.reviewed_by = admin
        verification.reviewed_at = timezone.now()
        verification.rejection_reason = reason
        if notes:
            verification.verification_notes = notes
        verification.save()
        
        # Update user's verification status
        user = verification.user
        user.is_verified = False
        user.save(update_fields=['is_verified'])
        
        return verification
    
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
