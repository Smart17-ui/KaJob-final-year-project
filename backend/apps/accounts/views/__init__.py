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
from .worker_views import (
    WorkerDetailView,
    WorkerSummaryView,
    WorkerApplicationsView,
    WorkerAvailabilityView,
)

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
    # Profile Views
    'UserProfileView',
    'UserProfileUpdateView',
    'WorkerProfileView',
    'WorkerProfileUpdateView',
    'ClientProfileView',
    'ClientProfileUpdateView',
    'UpdateLocationView',
    'UpdatePhoneNumberView',
    # Worker Views
    'WorkerDetailView',
    'WorkerSummaryView',
    'WorkerApplicationsView',
    'WorkerAvailabilityView',
]
