# apps/matching/serializers/matching_serializer.py

from rest_framework import serializers
from apps.jobs.models import Job
from apps.accounts.models import WorkerProfile


class JobMatchSerializer(serializers.ModelSerializer):
    """
    Serializer for matched job data.
    ONLY shows general location (no exact location).
    """
    category_name = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
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
