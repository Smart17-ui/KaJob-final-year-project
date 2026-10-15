# apps/matching/serializers/matching_serializer.py

from rest_framework import serializers
from apps.jobs.models import Job
from apps.accounts.models import WorkerProfile
from apps.common.utils.media import build_absolute_media_url


class JobMatchSerializer(serializers.ModelSerializer):
    """
    Serializer for matched job data.
    ONLY shows general location (no exact location).
    """
    category_name = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    client_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
            'client_name',
            'client_photo_url',
            'budget',
            'general_location',
            'category_name',
            'status',
            'urgency',
            'urgency_display',
            'job_date',
            'is_flexible',
            'duration_hours',
            'posted_at',
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_urgency_display(self, obj):
        return obj.get_urgency_display() if hasattr(obj, 'get_urgency_display') else obj.urgency

    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None

    def get_client_photo_url(self, obj):
        if not obj.client:
            return None

        profile = getattr(obj.client, 'profile', None)
        if not profile or not profile.profile_photo_path:
            return None

        return build_absolute_media_url(
            profile.profile_photo_path,
            self.context.get('request'),
        )


class WorkerMatchSerializer(serializers.ModelSerializer):
    """
    Serializer for matched worker data.
    """
    full_name = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = [
            'user',
            'full_name',
            'bio',
            'average_rating',
            'total_reviews',
            'jobs_completed',
            'skills',
            'availability_status',
        ]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_rating(self, obj):
        return obj.average_rating

    def get_skills(self, obj):
        return [skill.name for skill in obj.skills.all()]
