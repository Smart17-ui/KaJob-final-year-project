# apps/accounts/serializers/profile_serializer.py

from rest_framework import serializers
from apps.accounts.models import Profile, WorkerProfile, ClientProfile


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    class Meta:
        model = Profile
        fields = [
            'bio',
            'profile_photo_path',
            'address',
            'province',
            'district',
            'latitude',
            'longitude',
        ]
        extra_kwargs = {
            'bio': {'required': False},
            'profile_photo_path': {'required': False},
            'address': {'required': False},
            'province': {'required': False},
            'district': {'required': False},
            'latitude': {'required': False},
            'longitude': {'required': False},
        }


class WorkerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for worker profile.
    """
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkerProfile
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'user_phone',
            'hourly_rate',
            'availability_status',
            'rating',
            'total_jobs_completed',
            'verified',
            'about',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'rating', 'total_jobs_completed']
    
    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_user_phone(self, obj):
        return obj.user.phone_number if obj.user else None


class WorkerProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating worker profile.
    """
    class Meta:
        model = WorkerProfile
        fields = [
            'hourly_rate',
            'availability_status',
            'about',
        ]
        extra_kwargs = {
            'hourly_rate': {'required': False},
            'availability_status': {'required': False},
            'about': {'required': False},
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
            'id',
            'user',
            'user_name',
            'user_email',
            'user_phone',
            'organization_name',
            'address',
            'tax_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
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
            'organization_name',
            'address',
            'tax_id',
        ]
        extra_kwargs = {
            'organization_name': {'required': False},
            'address': {'required': False},
            'tax_id': {'required': False},
        }
