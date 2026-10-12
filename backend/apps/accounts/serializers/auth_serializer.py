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
        from apps.accounts.models import User

        normalized = value.strip().lower()

        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return normalized

    def validate_phone_number(self, value):
        from apps.identity_verification.services import VerificationService

        verification_service = VerificationService()
        result = verification_service.validate_phone_number(value)

        if not result['is_valid']:
            raise serializers.ValidationError(result['error'])

        return result['normalized']


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate_email(self, value):
        return value.lower().strip()


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password]
    )


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        validators=[validate_password]
    )


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)

    def validate_email(self, value):
        if value:
            return value.lower().strip()
        return value


class UpdatePhoneSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20, required=True)

    def validate_phone_number(self, value):
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
    user = serializers.DictField()
    tokens = serializers.DictField()
    message = serializers.CharField()
    next_step = serializers.CharField(required=False, allow_null=True)
    available_roles = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    detected_role = serializers.CharField(required=False, allow_null=True)
    redirect_to = serializers.CharField(required=False, allow_null=True)


class LogoutResponseSerializer(serializers.Serializer):
    message = serializers.CharField()


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()


class UpdateEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        from apps.accounts.models import User

        normalized = value.strip().lower()
        current_user = self.context.get('request').user if self.context.get('request') else None

        qs = User.objects.filter(email__iexact=normalized)
        if current_user:
            qs = qs.exclude(id=current_user.id)

        if qs.exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return normalized


# ============================================
# ACCOUNT MANAGEMENT SERIALIZERS (NEW)
# ============================================

class UpdateNameSerializer(serializers.Serializer):
    """
    Serializer for updating first_name and last_name.

    Used by: UpdateNameView (PUT /api/auth/profile/name/)
    """
    first_name = serializers.CharField(max_length=100, required=True)
    last_name = serializers.CharField(max_length=100, required=True)

    def validate_first_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError("First name cannot be empty.")
        return value

    def validate_last_name(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError("Last name cannot be empty.")
        return value


class DeactivateAccountSerializer(serializers.Serializer):
    """
    Serializer for self-deactivating an account.

    Requires password + reason.

    Used by: DeactivateAccountView (POST /api/auth/deactivate/)
    """
    password = serializers.CharField(write_only=True, required=True)
    reason = serializers.CharField(required=True, min_length=3, max_length=1000)

    def validate_reason(self, value):
        value = (value or '').strip()
        if len(value) < 3:
            raise serializers.ValidationError(
                "Please provide a reason (at least 3 characters)."
            )
        return value


class DeleteAccountSerializer(serializers.Serializer):
    """
    Serializer for permanently soft-deleting an account.

    Requires password + typed confirmation 'DELETE'.

    Used by: DeleteAccountView (DELETE /api/auth/account/)
    """
    password = serializers.CharField(write_only=True, required=True)
    confirmation = serializers.CharField(required=True)

    def validate_confirmation(self, value):
        if value != 'DELETE':
            raise serializers.ValidationError(
                "You must type DELETE (all caps) to confirm."
            )
        return value
