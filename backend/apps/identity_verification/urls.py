# apps/identity_verification/urls.py

from django.urls import path
from apps.identity_verification.views import (
    SendPhoneOTPView,
    VerifyPhoneOTPView,
    SendEmailVerificationView,
    VerifyEmailView,
    ResendEmailVerificationView,  # Add this
    SubmitVerificationView,
    VerificationStatusView,
    VerificationHistoryView,
    AdminPendingVerificationsView,
    AdminVerificationDetailView,
    AdminReviewVerificationView,
    AdminVerificationStatsView,
)

app_name = 'identity_verification'

urlpatterns = [
    # Phone Verification
    path('verification/phone/send-otp/', SendPhoneOTPView.as_view(), name='send-phone-otp'),
    path('verification/phone/verify-otp/', VerifyPhoneOTPView.as_view(), name='verify-phone-otp'),
    
    # Email Verification
    path('verification/email/send/', SendEmailVerificationView.as_view(), name='send-email-verification'),
    path('verification/email/verify/', VerifyEmailView.as_view(), name='verify-email'),
    path('verification/email/resend/', ResendEmailVerificationView.as_view(), name='resend-email-verification'),  # Add this
    
    # Document Verification
    path('verification/documents/submit/', SubmitVerificationView.as_view(), name='submit-documents'),
    
    # Verification Status
    path('verification/status/', VerificationStatusView.as_view(), name='verification-status'),
    path('verification/history/', VerificationHistoryView.as_view(), name='verification-history'),
    
    # Admin Verification Endpoints
    path('admin/verifications/pending/', AdminPendingVerificationsView.as_view(), name='admin-pending-verifications'),
    path('admin/verifications/<int:verification_id>/', AdminVerificationDetailView.as_view(), name='admin-verification-detail'),
    path('admin/verifications/<int:verification_id>/review/', AdminReviewVerificationView.as_view(), name='admin-review-verification'),
    path('admin/verifications/stats/', AdminVerificationStatsView.as_view(), name='admin-verification-stats'),
]
