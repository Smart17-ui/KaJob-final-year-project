from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.common.constants import RoleType


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration.
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
        """Normalize email to lowercase"""
        return value.lower().strip()


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate_email(self, value):
        """Normalize email to lowercase for case-insensitive login"""
        return value.lower().strip()


class RefreshTokenSerializer(serializers.Serializer):
    """
    Serializer for refreshing JWT token.
    """
    refresh = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password.
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
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Normalize email to lowercase"""
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password.
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
    """
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """
    Serializer for resending verification email.
    """
    email = serializers.EmailField(required=False)
    
    def validate_email(self, value):
        """Normalize email to lowercase if provided"""
        if value:
            return value.lower().strip()
        return value
