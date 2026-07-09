from django.db import models
from apps.common.models.mixins import SoftDeleteMixin, SoftDeleteManager

class IdentityVerification(SoftDeleteMixin):
    """
    Manages user identity verification process.
    Stores documents and tracks verification status.
    """
    DOCUMENT_TYPES = [
        ('NRC', 'National Registration Card'),
        ('PASSPORT', 'Passport'),
        ('DRIVERS_LICENSE', 'Driver\'s License'),
    ]

    VERIFICATION_STATUSES = [
        ('NOT_SUBMITTED', 'Not Submitted'),
        ('PENDING', 'Pending'),
        ('UNDER_REVIEW', 'Under Review'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]

    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='identity_verifications',
        help_text="User requesting verification"
    )
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        help_text="Type of identification document"
    )
    document_number = models.CharField(
        max_length=100,
        help_text="Document identification number"
    )
    front_document_path = models.CharField(
        max_length=500,
        help_text="Path to front document image"
    )
    back_document_path = models.CharField(
        max_length=500,
        blank=True,
        help_text="Path to back document image (optional)"
    )
    selfie_photo_path = models.CharField(
        max_length=500,
        blank=True,
        help_text="Path to user's selfie photo (optional)"
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUSES,
        default='NOT_SUBMITTED',
        help_text="Current verification status"
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When documents were submitted"
    )
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verifications_reviewed',
        help_text="Admin who reviewed this verification"
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the verification was reviewed"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason for rejection (if rejected)"
    )
    verification_notes = models.TextField(
        blank=True,
        help_text="Internal admin notes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'identity_verifications'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'verification_status']),
            models.Index(fields=['verification_status', 'submitted_at']),
        ]

    def __str__(self):
        return f"{self.user.full_name} - {self.verification_status}"

    @property
    def is_pending(self):
        """Check if verification is pending"""
        return self.verification_status in ['PENDING', 'UNDER_REVIEW']

    @property
    def is_verified(self):
        """Check if user is verified"""
        return self.verification_status == 'VERIFIED'

    @property
    def is_rejected(self):
        """Check if verification was rejected"""
        return self.verification_status == 'REJECTED'
