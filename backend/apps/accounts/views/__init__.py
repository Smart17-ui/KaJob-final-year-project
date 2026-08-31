# apps/accounts/views/__init__.py

from .auth_views import (
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
)

from .profile_views import (
    UserProfileView,
    UserProfileUpdateView,
    WorkerProfileView,
    WorkerProfileUpdateView,
    ClientProfileView,
    ClientProfileUpdateView,
    UpdateLocationView,
    UpdatePhoneNumberView,
)

# ✅ Remove these duplicate imports - they're already in profile_views
# from .worker_views import WorkerProfileView
# from .client_views import ClientProfileView

__all__ = [
    # Auth Views
    'RegisterView',
    'LoginView',
    'RefreshTokenView',
    'LogoutView',
    'MeView',
    'ChangePasswordView',
    'ForgotPasswordView',
    'ResetPasswordView',
    'VerifyEmailView',
    'ResendVerificationView',
    'AddRoleView',
    'SwitchRoleView',
    'GetUserRolesView',
    
    # Profile Views (all from profile_views.py)
    'UserProfileView',
    'UserProfileUpdateView',
    'WorkerProfileView',
    'WorkerProfileUpdateView',
    'ClientProfileView',
    'ClientProfileUpdateView',
    'UpdateLocationView',
    'UpdatePhoneNumberView',
]
