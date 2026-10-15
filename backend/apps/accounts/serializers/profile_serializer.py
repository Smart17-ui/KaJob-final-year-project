from rest_framework import serializers
from apps.accounts.models import Profile, WorkerProfile, ClientProfile


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.

    Note: profile_photo_path is intentionally NOT listed here.
    Photos are uploaded via a dedicated endpoint
    (POST /api/auth/profile/photo/) so they can be validated
    and stored as real files.
    """

    class Meta:
        model = Profile
        fields = [
            "bio",
            "address",
            "province",
            "district",
            "latitude",
            "longitude",
        ]
        extra_kwargs = {
            "bio": {"required": False},
            "address": {"required": False},
            "province": {"required": False},
            "district": {"required": False},
            "latitude": {"required": False},
            "longitude": {"required": False},
        }


class ProfilePhotoUploadSerializer(serializers.Serializer):
    """
    Serializer for uploading a profile photo.

    Accepts a single image file (JPEG/PNG/WebP) up to 5 MB.
    """

    photo = serializers.ImageField(required=True)

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_CONTENT_TYPES = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }

    def validate_photo(self, value):
        if value.size > self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                "Image is too large. Maximum size is 5 MB."
            )

        content_type = getattr(value, "content_type", "")
        if content_type and content_type not in self.ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError(
                "Unsupported image type. Please use JPEG, PNG, or WebP."
            )

        return value


class WorkerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for worker profile.
    """

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "user_phone",
            "bio",
            "years_of_experience",
            "availability_status",
            "availability_updated_at",
            "average_rating",
            "total_reviews",
            "jobs_completed",
            "skills",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "availability_updated_at",
            "average_rating",
            "total_reviews",
            "jobs_completed",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def get_user_phone(self, obj):
        return obj.user.phone_number if obj.user else None

    def get_skills(self, obj):
        return obj.get_skills_list()


class WorkerProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating worker profile.
    """

    class Meta:
        model = WorkerProfile
        fields = [
            "bio",
            "years_of_experience",
            "availability_status",
        ]
        extra_kwargs = {
            "bio": {"required": False},
            "years_of_experience": {"required": False},
            "availability_status": {"required": False},
        }


class ClientProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for client profile.
    """

    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()

    class Meta:
        model = ClientProfile
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "user_phone",
            "organization_name",
            "address",
            "tax_id",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "average_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def get_user_phone(self, obj):
        return obj.user.phone_number if obj.user else None


class ClientProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating client profile.
    """

    class Meta:
        model = ClientProfile
        fields = [
            "organization_name",
            "address",
            "tax_id",
        ]
        extra_kwargs = {
            "organization_name": {"required": False},
            "address": {"required": False},
            "tax_id": {"required": False},
        }
