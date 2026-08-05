# apps/identity_verification/urls.py
from django.urls import path
from apps.identity_verification.views import (
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
    # ============================================
    # USER VERIFICATION ENDPOINTS
    # ============================================
    
    path('verification/submit/', SubmitVerificationView.as_view(), name='submit'),
    path('verification/status/', VerificationStatusView.as_view(), name='status'),
    path('verification/history/', VerificationHistoryView.as_view(), name='history'),
    
    # ============================================
    # ADMIN VERIFICATION ENDPOINTS
    # ============================================
    
    path('admin/verifications/pending/', AdminPendingVerificationsView.as_view(), name='admin-pending'),
    path('admin/verifications/<int:verification_id>/', AdminVerificationDetailView.as_view(), name='admin-detail'),
    path('admin/verifications/<int:verification_id>/review/', AdminReviewVerificationView.as_view(), name='admin-review'),
    path('admin/verifications/stats/', AdminVerificationStatsView.as_view(), name='admin-stats'),
]
