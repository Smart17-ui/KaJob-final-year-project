# apps/accounts/serializers/user_serializer.py
from rest_framework import serializers
from apps.accounts.models import User, Profile


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data.
    """
    full_name = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
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
        """Get user's full name"""
        return obj.full_name
    
    def get_roles(self, obj):
        """Get user's roles as a list of role names"""
        return [role.name for role in obj.roles]


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'full_name',
            'bio',
            'profile_photo_path',
            'address',
            'province',
            'district',
            'latitude',
            'longitude',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Get user's full name from profile"""
        return obj.user.full_name if obj.user else None


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed user serializer with profile and roles.
    """
    profile = ProfileSerializer(read_only=True)
    roles = serializers.SerializerMethodField()
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
        return [role.name for role in obj.roles]


class UserListSerializer(serializers.ModelSerializer):
    """
    Simplified user serializer for listing users.
    """
    full_name = serializers.SerializerMethodField()
    role_names = serializers.SerializerMethodField()
    
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
