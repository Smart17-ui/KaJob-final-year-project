# User Serializers
from .user_serializer import (
    UserSerializer,
    ProfileSerializer,
    UserDetailSerializer,
    UserListSerializer,
    RoleSerializer,
    AddRoleSerializer,
    SwitchRoleSerializer,
    RoleResponseSerializer,
)

# Auth Serializers
from .auth_serializer import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
    AuthResponseSerializer,
    LogoutResponseSerializer,
    TokenResponseSerializer,
    UpdatePhoneSerializer,
    UpdateEmailSerializer,
    # Account Management (NEW)
    UpdateNameSerializer,
    DeactivateAccountSerializer,
    DeleteAccountSerializer,
)

# Profile Serializers
from .profile_serializer import (
    ProfileUpdateSerializer,
    ProfilePhotoUploadSerializer,   # ← new
    WorkerProfileSerializer,
    WorkerProfileUpdateSerializer,
    ClientProfileSerializer,
    ClientProfileUpdateSerializer,
)

# Worker Skill Serializers
from .worker_skill_serializer import (
    SkillSerializer,
    WorkerSkillSerializer,
    WorkerSkillCreateSerializer,
    WorkerSkillUpdateSerializer,
)

__all__ = [
    # User Serializers
    'UserSerializer',
    'ProfileSerializer',
    'UserDetailSerializer',
    'UserListSerializer',
    'RoleSerializer',

    # Role Management Serializers
    'AddRoleSerializer',
    'SwitchRoleSerializer',
    'RoleResponseSerializer',

    # Auth Serializers
    'RegisterSerializer',
    'LoginSerializer',
    'RefreshTokenSerializer',
    'ChangePasswordSerializer',
    'ForgotPasswordSerializer',
    'ResetPasswordSerializer',
    'VerifyEmailSerializer',
    'ResendVerificationSerializer',
    'AuthResponseSerializer',
    'LogoutResponseSerializer',
    'TokenResponseSerializer',
    'UpdatePhoneSerializer',
    'UpdateEmailSerializer',

    # Account Management Serializers (NEW)
    'UpdateNameSerializer',
    'DeactivateAccountSerializer',
    'DeleteAccountSerializer',

    # Profile Serializers
    'ProfileUpdateSerializer',
    'ProfilePhotoUploadSerializer',   # ← new
    'WorkerProfileSerializer',
    'WorkerProfileUpdateSerializer',
    'ClientProfileSerializer',
    'ClientProfileUpdateSerializer',

    # Worker Skill Serializers
    'SkillSerializer',
    'WorkerSkillSerializer',
    'WorkerSkillCreateSerializer',
    'WorkerSkillUpdateSerializer',
]
