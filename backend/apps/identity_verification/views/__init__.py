# apps/identity_verification/views/__init__.py

# Phone Verification Views
from .phone_views import SendPhoneOTPView, VerifyPhoneOTPView

# Email Verification Views
from .email_views import SendEmailVerificationView, VerifyEmailView, ResendEmailVerificationView

# Verification Views
from .verification_views import SubmitVerificationView, VerificationStatusView, VerificationHistoryView

# Admin Verification Views
from .admin_verification_views import (
    AdminPendingVerificationsView,
    AdminVerificationDetailView,
    AdminReviewVerificationView,
    AdminVerificationStatsView,
)

# 🆕 Document Upload
from .verification_document import VerificationDocumentUploadView

__all__ = [
    # Phone
    'SendPhoneOTPView',
    'VerifyPhoneOTPView',
    # Email
    'SendEmailVerificationView',
    'VerifyEmailView',
    'ResendEmailVerificationView',
    # User
    'SubmitVerificationView',
    'VerificationStatusView',
    'VerificationHistoryView',
    # Admin
    'AdminPendingVerificationsView',
    'AdminVerificationDetailView',
    'AdminReviewVerificationView',
    'AdminVerificationStatsView',
    # 🆕 Upload
    'VerificationDocumentUploadView',
]
