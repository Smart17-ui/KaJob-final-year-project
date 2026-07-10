from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import VerificationStatus, DocumentType
from django.utils import timezone


class IdentityVerification(BaseModel):
    """
    Tracks user identity verification.
    """
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='identity_verifications'
    )
    
    # Document Information
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.CHOICES
    )
    document_number = models.CharField(max_length=100)
    
    # Status
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.CHOICES,
        default=VerificationStatus.NOT_SUBMITTED
    )
    
    # Review Information
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verifications_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    verification_notes = models.TextField(blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'identity_verifications'
        ordering = ['-submitted_at']
        verbose_name = 'Identity Verification'
        verbose_name_plural = 'Identity Verifications'
        indexes = [
            models.Index(fields=['user', 'verification_status']),
            models.Index(fields=['verification_status', 'submitted_at']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.get_verification_status_display()}"
    
    @property
    def is_pending(self):
        return self.verification_status in [
            VerificationStatus.PENDING,
            VerificationStatus.UNDER_REVIEW
        ]
    
    @property
    def is_verified(self):
        return self.verification_status == VerificationStatus.VERIFIED
    
    def approve(self, admin):
        """Approve verification"""
        self.verification_status = VerificationStatus.VERIFIED
        self.reviewed_by = admin
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update user verification status
        self.user.is_verified = True
        self.user.save(update_fields=['is_verified'])
    
    def reject(self, admin, reason):
        """Reject verification"""
        self.verification_status = VerificationStatus.REJECTED
        self.reviewed_by = admin
        self.reviewed_at = timezone.now()
        self.rejection_reason = reason
        self.save()
        
        # Update user verification status
        self.user.is_verified = False
        self.user.save(update_fields=['is_verified'])
