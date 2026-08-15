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
    timeframe_display = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    job_display_date = serializers.SerializerMethodField()
    job_display_time = serializers.SerializerMethodField()
    is_urgent = serializers.BooleanField(read_only=True)
    
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
            'assigned_worker_name',
            'general_location',
            'exact_location',
            'latitude',
            'longitude',
            'radius',
            # Timing fields
            'job_date',
            'job_time',
            'timeframe',
            'timeframe_display',
            'is_flexible',
            'duration_hours',
            'urgency',
            'urgency_display',
            'job_display_date',
            'job_display_time',
            'is_urgent',
            # Status
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
        assignment = obj.assignments.filter(status='ACTIVE').first()
        if assignment:
            return assignment.worker.full_name
        return None
    
    def get_timeframe_display(self, obj):
        return dict(Job.TIMEFRAME_CHOICES).get(obj.timeframe)
    
    def get_urgency_display(self, obj):
        return dict(Job.URGENCY_CHOICES).get(obj.urgency)
    
    def get_job_display_date(self, obj):
        return obj.job_display_date
    
    def get_job_display_time(self, obj):
        return obj.job_display_time


class JobCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a job.
    """
    # Basic fields
    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    category_id = serializers.IntegerField(required=True)
    
    # Location fields
    general_location = serializers.CharField(max_length=255, required=True)
    exact_location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8, required=False, allow_null=True)
    radius = serializers.IntegerField(required=False, default=5)
    
    # Timing fields (optional)
    job_date = serializers.DateField(required=False, allow_null=True)
    job_time = serializers.TimeField(required=False, allow_null=True)
    timeframe = serializers.ChoiceField(
        choices=Job.TIMEFRAME_CHOICES,
        required=False,
        default='ANYTIME'
    )
    is_flexible = serializers.BooleanField(required=False, default=True)
    duration_hours = serializers.DecimalField(
        max_digits=4,
        decimal_places=1,
        required=False,
        allow_null=True
    )
    urgency = serializers.ChoiceField(
        choices=Job.URGENCY_CHOICES,
        required=False,
        default='NORMAL'
    )
    
    # Skills (optional)
    required_skills = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        help_text="List of skill IDs (optional)"
    )
    
    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget must be greater than zero.")
        return value
    
    def validate_radius(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Radius must be between 1 and 100 kilometers.")
        return value
    
    def validate_duration_hours(self, value):
        if value is not None:
            if value <= 0:
                raise serializers.ValidationError("Duration must be greater than zero.")
            if value > 24:
                raise serializers.ValidationError("Duration cannot exceed 24 hours.")
        return value
    
    def validate_job_date(self, value):
        if value:
            from django.utils import timezone
            if value < timezone.now().date():
                raise serializers.ValidationError("Job date cannot be in the past.")
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
    
    # Timing fields
    job_date = serializers.DateField(required=False, allow_null=True)
    job_time = serializers.TimeField(required=False, allow_null=True)
    timeframe = serializers.ChoiceField(choices=Job.TIMEFRAME_CHOICES, required=False)
    is_flexible = serializers.BooleanField(required=False)
    duration_hours = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True)
    urgency = serializers.ChoiceField(choices=Job.URGENCY_CHOICES, required=False)
    
    # Skills
    required_skills = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    
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
    is_urgent = serializers.BooleanField(read_only=True)
    job_display_date = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    
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
            'is_urgent',
            'urgency_display',
            'job_display_date',
            'duration_hours',
        ]
    
    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_status_display(self, obj):
        return dict(JobStatus.CHOICES).get(obj.status)
    
    def get_job_display_date(self, obj):
        return obj.job_display_date
    
    def get_urgency_display(self, obj):
        return dict(Job.URGENCY_CHOICES).get(obj.urgency)
