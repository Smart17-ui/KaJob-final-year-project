# apps/identity_verification/views/__init__.py

# Phone Verification Views
from .phone_views import SendPhoneOTPView, VerifyPhoneOTPView

# Email Verification Views
from .email_views import SendEmailVerificationView, VerifyEmailView, ResendEmailVerificationView  # Add this

# Verification Views
from .verification_views import SubmitVerificationView, VerificationStatusView, VerificationHistoryView

# Admin Verification Views
from .admin_verification_views import (
    AdminPendingVerificationsView,
    AdminVerificationDetailView,
    AdminReviewVerificationView,
    AdminVerificationStatsView,
)

__all__ = [
    # Phone Verification
    'SendPhoneOTPView',
    'VerifyPhoneOTPView',
    # Email Verification
    'SendEmailVerificationView',
    'VerifyEmailView',
    'ResendEmailVerificationView',  # Add this
    # User Verification
    'SubmitVerificationView',
    'VerificationStatusView',
    'VerificationHistoryView',
    # Admin Verification
    'AdminPendingVerificationsView',
    'AdminVerificationDetailView',
    'AdminReviewVerificationView',
    'AdminVerificationStatsView',
]
