# apps/jobs/serializers/job_serializer.py
from rest_framework import serializers
from apps.jobs.models import Job
from apps.common.constants import JobStatus


class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for job data.
    """
    client_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    assigned_worker_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
            'budget',
            'client',
            'client_name',
            'category',
            'category_name',
            # ✅ Remove 'assigned_worker' - it doesn't exist in Job model
            # 'assigned_worker',  # ❌ REMOVE THIS
            'assigned_worker_name',  # ✅ Keep this - it's a method field
            'general_location',
            'exact_location',
            'latitude',
            'longitude',
            'radius',
            'status',
            'status_display',
            'posted_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'client',
            'posted_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]
    
    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_status_display(self, obj):
        return dict(JobStatus.CHOICES).get(obj.status)
    
    def get_assigned_worker_name(self, obj):
        """Get the assigned worker name from the active assignment"""
        # Get the active assignment for this job
        assignment = obj.assignments.filter(status='ACTIVE').first()
        if assignment:
            return assignment.worker.full_name
        return None


class JobCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a job.
    """
    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    category_id = serializers.IntegerField(required=True)
    general_location = serializers.CharField(max_length=255, required=True)
    exact_location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    radius = serializers.IntegerField(required=False, default=5)
    
    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget must be greater than zero.")
        return value
    
    def validate_radius(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Radius must be between 1 and 100 kilometers.")
        return value


class JobUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating a job.
    """
    title = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    general_location = serializers.CharField(max_length=255, required=False)
    exact_location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    radius = serializers.IntegerField(required=False)
    
    def validate_budget(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Budget must be greater than zero.")
        return value
    
    def validate_radius(self, value):
        if value is not None and (value < 1 or value > 100):
            raise serializers.ValidationError("Radius must be between 1 and 100 kilometers.")
        return value


class JobListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing jobs.
    """
    client_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'budget',
            'client_name',
            'category_name',
            'general_location',
            'status',
            'status_display',
            'posted_at',
        ]
    
    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_status_display(self, obj):
        return dict(JobStatus.CHOICES).get(obj.status)
