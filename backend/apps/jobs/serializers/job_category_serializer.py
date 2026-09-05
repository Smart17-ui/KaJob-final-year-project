# apps/jobs/serializers/job_category_serializer.py

from rest_framework import serializers
from apps.jobs.models import JobCategory


class JobCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for JobCategory model.
    """
    job_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobCategory
        fields = [
            'id',
            'name',
            'description',
            'icon',
            'job_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
    
    def get_job_count(self, obj):
        """Get the number of jobs in this category."""
        return obj.jobs.count() if hasattr(obj, 'jobs') else 0


class JobCategoryCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new JobCategory.
    """
    class Meta:
        model = JobCategory
        fields = [
            'name',
            'description',
            'icon',
        ]
    
    def validate_name(self, value):
        """Validate that the category name is unique."""
        if JobCategory.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                f"A category with the name '{value}' already exists."
            )
        return value


class JobCategoryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing job categories.
    """
    job_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobCategory
        fields = [
            'id',
            'name',
            'icon',
            'job_count',
        ]
    
    def get_job_count(self, obj):
        """Get the number of jobs in this category."""
        return obj.jobs.count() if hasattr(obj, 'jobs') else 0


class JobCategoryUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a JobCategory.
    """
    class Meta:
        model = JobCategory
        fields = [
            'name',
            'description',
            'icon',
        ]
    
    def validate_name(self, value):
        """Validate that the category name is unique (excluding self)."""
        instance = self.instance
        if instance and JobCategory.objects.filter(
            name__iexact=value
        ).exclude(id=instance.id).exists():
            raise serializers.ValidationError(
                f"A category with the name '{value}' already exists."
            )
        return value


class JobCategoryDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for JobCategory with additional info.
    """
    job_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobCategory
        fields = [
            'id',
            'name',
            'description',
            'icon',
            'job_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
    
    def get_job_count(self, obj):
        """Get the number of jobs in this category."""
        return obj.jobs.count() if hasattr(obj, 'jobs') else 0
