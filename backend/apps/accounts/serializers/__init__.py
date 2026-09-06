# apps/accounts/serializers/__init__.py

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
)

# Profile Serializers
from .profile_serializer import (
    ProfileUpdateSerializer,
    WorkerProfileSerializer,
    WorkerProfileUpdateSerializer,
    ClientProfileSerializer,
    ClientProfileUpdateSerializer,
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
    
    # Profile Serializers
    'ProfileUpdateSerializer',
    'WorkerProfileSerializer',
    'WorkerProfileUpdateSerializer',
    'ClientProfileSerializer',
    'ClientProfileUpdateSerializer',
]
