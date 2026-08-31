# apps/accounts/urls.py

from django.urls import path
from apps.accounts.views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    LogoutView,
    MeView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    VerifyEmailView,
    ResendVerificationView,
    AddRoleView,
    SwitchRoleView,
    GetUserRolesView,
    UserProfileView,
    UserProfileUpdateView,
    WorkerProfileView,
    WorkerProfileUpdateView,
    ClientProfileView,
    ClientProfileUpdateView,
    UpdateLocationView,
    UpdatePhoneNumberView,
)

app_name = 'accounts'

urlpatterns = [
    # ============================================
    # AUTHENTICATION
    # ============================================
    
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    
    # ============================================
    # PASSWORD MANAGEMENT
    # ============================================
    
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # ============================================
    # EMAIL VERIFICATION
    # ============================================
    
    path('auth/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('auth/resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    
    # ============================================
    # ROLE MANAGEMENT
    # ============================================
    
    path('auth/add-role/', AddRoleView.as_view(), name='add-role'),
    path('auth/switch-role/', SwitchRoleView.as_view(), name='switch-role'),
    path('auth/roles/', GetUserRolesView.as_view(), name='user-roles'),
    
    # ============================================
    # PROFILES
    # ============================================
    
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('profile/location/', UpdateLocationView.as_view(), name='update-location'),
    path('profile/phone/', UpdatePhoneNumberView.as_view(), name='update-phone'),
    path('profile/worker/', WorkerProfileView.as_view(), name='worker-profile'),
    path('profile/worker/update/', WorkerProfileUpdateView.as_view(), name='worker-profile-update'),
    path('profile/client/', ClientProfileView.as_view(), name='client-profile'),
    path('profile/client/update/', ClientProfileUpdateView.as_view(), name='client-profile-update'),
]
