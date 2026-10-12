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
    # Account Management (NEW)
    UpdateNameView,
    DeactivateAccountView,
    DeleteAccountView,
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
    UpdateEmailView,
)
from .worker_views import (
    WorkerDetailView,
    WorkerSummaryView,
    WorkerApplicationsView,
    WorkerAvailabilityView,
)
from .worker_skill_views import (
    SkillListView,
    MySkillsView,
    MySkillDetailView,
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
    # Account Management Views (NEW)
    'UpdateNameView',
    'DeactivateAccountView',
    'DeleteAccountView',
    # Profile Views
    'UserProfileView',
    'UserProfileUpdateView',
    'WorkerProfileView',
    'WorkerProfileUpdateView',
    'ClientProfileView',
    'ClientProfileUpdateView',
    'UpdateLocationView',
    'UpdatePhoneNumberView',
    'UpdateEmailView',
    # Worker Views
    'WorkerDetailView',
    'WorkerSummaryView',
    'WorkerApplicationsView',
    'WorkerAvailabilityView',
    # Worker Skill Views
    'SkillListView',
    'MySkillsView',
    'MySkillDetailView',
]
