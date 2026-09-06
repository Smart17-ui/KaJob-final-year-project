# apps/accounts/serializers/auth_serializer.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.common.constants import RoleType


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    
    Used by: RegisterView (POST /api/auth/register/)
    """
    first_name = serializers.CharField(max_length=100, required=True)
    last_name = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password]
    )
    role = serializers.ChoiceField(
        choices=[RoleType.WORKER, RoleType.CLIENT],
        required=True
    )
    
    def validate_email(self, value):
        """Normalize email to lowercase."""
        return value.lower().strip()
    
    def validate_phone_number(self, value):
        """
        Validate and normalize phone number.
        
        Supports:
        - Zambia: 0971234567, +260971234567
        - International: +[country_code][number]
        """
        from apps.identity_verification.services import VerificationService
        
        verification_service = VerificationService()
        result = verification_service.validate_phone_number(value)
        
        if not result['is_valid']:
            raise serializers.ValidationError(result['error'])
        
        # Return normalized phone number
        return result['normalized']


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login with role selection.
    
    Used by: LoginView (POST /api/auth/login/)
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[RoleType.WORKER, RoleType.CLIENT],
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Optional: Specify role to login as (WORKER or CLIENT)"
    )
    
    def validate_email(self, value):
        """Normalize email to lowercase for case-insensitive login."""
        return value.lower().strip()


class RefreshTokenSerializer(serializers.Serializer):
    """
    Serializer for refreshing JWT token.
    
    Used by: RefreshTokenView (POST /api/auth/refresh/)
    """
    refresh = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    
    Used by: ChangePasswordView (POST /api/auth/change-password/)
    """
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password]
    )


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for forgot password.
    
    Used by: ForgotPasswordView (POST /api/auth/forgot-password/)
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Normalize email to lowercase."""
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password.
    
    Used by: ResetPasswordView (POST /api/auth/reset-password/)
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password]
    )


class VerifyEmailSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    
    Used by: VerifyEmailView (POST /api/auth/verify-email/)
    """
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """
    Serializer for resending verification email.
    
    Used by: ResendVerificationView (POST /api/auth/resend-verification/)
    """
    email = serializers.EmailField(required=False)
    
    def validate_email(self, value):
        """Normalize email to lowercase if provided."""
        if value:
            return value.lower().strip()
        return value


class UpdatePhoneSerializer(serializers.Serializer):
    """
    Serializer for updating phone number.
    
    Used by: UpdatePhoneNumberView (PUT /api/auth/profile/phone/)
    """
    phone_number = serializers.CharField(max_length=20, required=True)
    
    def validate_phone_number(self, value):
        """
        Validate and normalize phone number.
        """
        from apps.identity_verification.services import VerificationService
        
        verification_service = VerificationService()
        result = verification_service.validate_phone_number(value)
        
        if not result['is_valid']:
            raise serializers.ValidationError(result['error'])
        
        return result['normalized']


# ============================================
# AUTH RESPONSE SERIALIZERS
# ============================================

class AuthResponseSerializer(serializers.Serializer):
    """
    Serializer for authentication responses.
    """
    user = serializers.DictField()
    tokens = serializers.DictField()
    message = serializers.CharField()
    next_step = serializers.CharField(required=False, allow_null=True)
    available_roles = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    selected_role = serializers.CharField(required=False, allow_null=True)


class LogoutResponseSerializer(serializers.Serializer):
    """
    Serializer for logout response.
    """
    message = serializers.CharField()


class TokenResponseSerializer(serializers.Serializer):
    """
    Serializer for token refresh response.
    """
    access = serializers.CharField()

class UpdatePhoneSerializer(serializers.Serializer):
    """
    Serializer for updating phone number.
    
    Used by: UpdatePhoneNumberView (PUT /api/auth/profile/phone/)
    """
    phone_number = serializers.CharField(max_length=20, required=True)
    
    def validate_phone_number(self, value):
        """
        Validate and normalize phone number.
        """
        from apps.identity_verification.services import VerificationService
        
        verification_service = VerificationService()
        result = verification_service.validate_phone_number(value)
        
        if not result['is_valid']:
            raise serializers.ValidationError(result['error'])
        
        return result['normalized']
