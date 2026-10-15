from rest_framework import serializers
from apps.accounts.models import User, Profile, Role


class UserSerializer(serializers.ModelSerializer):
    """
    Full serializer for user data with roles support.
    """
    full_name = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    available_roles = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    is_worker = serializers.BooleanField(read_only=True)
    is_client = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone_number',
            'account_status',
            'is_verified',
            'roles',
            'available_roles',
            'role_display',
            'profile_photo_url',
            'is_admin',
            'is_worker',
            'is_client',
            'last_login',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'account_status',
            'is_verified',
            'last_login',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_roles(self, obj):
        return [{'id': role.id, 'name': role.name} for role in obj.roles]

    def get_available_roles(self, obj):
        return [role.name for role in obj.roles]

    def get_role_display(self, obj):
        roles = [role.name for role in obj.roles]
        if not roles:
            return "No Role"
        return ", ".join(roles)

    def get_profile_photo_url(self, obj):
        """
        Absolute URL to the user's profile photo, or None.

        Uses the request when available, otherwise falls back to
        BACKEND_URL from settings so the URL is always absolute.
        """
        from apps.common.utils.media import build_absolute_media_url

        profile = getattr(obj, 'profile', None)
        if not profile or not profile.profile_photo_path:
            return None

        return build_absolute_media_url(
            profile.profile_photo_path,
            self.context.get('request'),
        )
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    """

    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'full_name',
            'bio',
            'profile_photo_path',
            'profile_photo_url',
            'address',
            'province',
            'district',
            'latitude',
            'longitude',
            'location_updated_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
            'location_updated_at',
        ]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_profile_photo_url(self, obj):
        """
        Return an absolute URL to the profile photo,
        or None if the user has no photo.
        """
        if not obj.profile_photo_path:
            return None

        try:
            url = obj.profile_photo_path.url
        except (ValueError, AttributeError):
            return None

        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed user serializer with profile and roles.
    """
    profile = ProfileSerializer(read_only=True)
    roles = serializers.SerializerMethodField()
    available_roles = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    is_worker = serializers.BooleanField(read_only=True)
    is_client = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone_number',
            'account_status',
            'is_verified',
            'roles',
            'available_roles',
            'role_display',
            'is_admin',
            'is_worker',
            'is_client',
            'profile',
            'last_login',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'account_status',
            'is_verified',
            'last_login',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_roles(self, obj):
        return [{'id': role.id, 'name': role.name} for role in obj.roles]

    def get_available_roles(self, obj):
        return [role.name for role in obj.roles]

    def get_role_display(self, obj):
        roles = [role.name for role in obj.roles]
        if not roles:
            return "No Role"
        return ", ".join(roles)


class UserListSerializer(serializers.ModelSerializer):
    """
    Simplified user serializer for listing users.
    """
    full_name = serializers.SerializerMethodField()
    role_names = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone_number',
            'account_status',
            'is_verified',
            'role_names',
            'role_display',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'account_status',
            'is_verified',
            'created_at',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_role_names(self, obj):
        return [role.name for role in obj.roles]

    def get_role_display(self, obj):
        roles = [role.name for role in obj.roles]
        if not roles:
            return "No Role"
        return ", ".join(roles)


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for Role model.
    """
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id',
            'name',
            'description',
            'is_active',
            'user_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user_count(self, obj):
        return obj.user_roles.count() if hasattr(obj, 'user_roles') else 0


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating user profile.
    """
    bio = serializers.CharField(required=False, allow_blank=True)
    profile_photo_path = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    province = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=8,
        required=False,
        allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=11,
        decimal_places=8,
        required=False,
        allow_null=True
    )


class WorkerProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating worker profile.
    """
    bio = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=50
    )
    availability_status = serializers.ChoiceField(
        choices=[
            ('AVAILABLE', 'Available'),
            ('BUSY', 'Busy'),
            ('UNAVAILABLE', 'Unavailable'),
        ],
        required=False
    )


class WorkerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for worker profile.
    """
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()

    class Meta:
        from apps.accounts.models import WorkerProfile
        model = WorkerProfile
        fields = [
            'id',
            'user',
            'full_name',
            'email',
            'phone_number',
            'is_verified',
            'bio',
            'years_of_experience',
            'availability_status',
            'average_rating',
            'total_reviews',
            'jobs_completed',
            'skills',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'average_rating',
            'total_reviews',
            'jobs_completed',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def get_phone_number(self, obj):
        return obj.user.phone_number if obj.user else None

    def get_is_verified(self, obj):
        return obj.user.is_verified if obj.user else False


class ClientProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating client profile.
    """
    organization_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    tax_id = serializers.CharField(required=False, allow_blank=True)


class ClientProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for client profile.
    """
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()

    class Meta:
        from apps.accounts.models import ClientProfile
        model = ClientProfile
        fields = [
            'id',
            'user',
            'full_name',
            'email',
            'phone_number',
            'is_verified',
            'organization_name',
            'address',
            'tax_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
        ]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def get_phone_number(self, obj):
        return obj.user.phone_number if obj.user else None

    def get_is_verified(self, obj):
        return obj.user.is_verified if obj.user else False


# ============================================
# ROLE MANAGEMENT SERIALIZERS
# ============================================

class AddRoleSerializer(serializers.Serializer):
    """
    Serializer for adding a role to a user.
    """
    role = serializers.ChoiceField(
        choices=[
            ('WORKER', 'Worker'),
            ('CLIENT', 'Client'),
            ('ADMIN', 'Admin'),
        ],
        required=True,
        help_text="Role to add to the user"
    )


class SwitchRoleSerializer(serializers.Serializer):
    """
    Serializer for switching between roles.
    """
    role = serializers.CharField(
        max_length=20,
        required=True,
        help_text="Role to switch to (must be one of user's available roles)"
    )


class RoleResponseSerializer(serializers.Serializer):
    """
    Serializer for role response.
    """
    roles = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of available roles"
    )
    current_role = serializers.CharField(
        allow_null=True,
        help_text="Currently active role"
    )
