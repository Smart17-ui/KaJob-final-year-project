# apps/jobs/serializers/job_serializer.py

from rest_framework import serializers
from apps.jobs.models import Job
from apps.common.constants import JobStatus


class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for job data - FULL DETAILS for clients and admins.
    Shows ALL fields including exact_location, client_name, etc.
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
    search_radius_km = serializers.FloatField(read_only=True)
    
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
            'map_url',
            'directions_url',
            'place_id',
            'latitude',
            'longitude',
            'search_radius_km',
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
    
    Note: general_location can be auto-filled from GPS coordinates.
    map_url and directions_url are auto-generated from GPS coordinates.
    """
    # Basic fields
    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    category_id = serializers.IntegerField(required=True)
    
    # Location fields
    general_location = serializers.CharField(
        max_length=255, 
        required=False, 
        allow_blank=True,
        help_text="Human-readable address (auto-filled from GPS if not provided)"
    )
    exact_location = serializers.CharField(
        max_length=255, 
        required=False, 
        allow_blank=True,
        help_text="Specific address/landmark (hidden from workers until assigned)"
    )
    latitude = serializers.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        required=False, 
        allow_null=True,
        help_text="GPS latitude (auto-detected from device)"
    )
    longitude = serializers.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        required=False, 
        allow_null=True,
        help_text="GPS longitude (auto-detected from device)"
    )
    
    # Map fields (auto-generated, not required from client)
    place_id = serializers.CharField(
        max_length=255, 
        required=False, 
        allow_blank=True,
        help_text="Google Maps Place ID (auto-generated)"
    )
    
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
    search_radius_km = serializers.FloatField(read_only=True)
    
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
            'search_radius_km',
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


# ============================================================
# 🆕 WORKER JOB DETAIL SERIALIZER (Conditional Disclosure)
# ============================================================

class WorkerJobDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for workers viewing job details.
    
    🔑 CONDITIONAL DISCLOSURE:
    - If worker is ASSIGNED: Shows exact_location, map_url, directions_url, 
      place_id, client_name, client_phone
    - If worker is NOT assigned: Shows ONLY general_location
    
    This protects client privacy until the job is officially assigned.
    
    How it works:
    1. The serializer receives worker_id in context
    2. It checks if the worker has an active assignment
    3. If assigned: All details are shown
    4. If not assigned: Sensitive fields are null
    
    Used by: JobDetailForWorkerView (GET /api/jobs/{job_id}/worker/)
    """
    client_name = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    timeframe_display = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    job_display_date = serializers.SerializerMethodField()
    job_display_time = serializers.SerializerMethodField()
    is_urgent = serializers.BooleanField(read_only=True)
    search_radius_km = serializers.FloatField(read_only=True)
    
    # Conditional fields (only visible when assigned)
    exact_location = serializers.SerializerMethodField()
    map_url = serializers.SerializerMethodField()          # 🆕
    directions_url = serializers.SerializerMethodField()   # 🆕
    place_id = serializers.SerializerMethodField()         # 🆕
    location_display = serializers.SerializerMethodField()
    can_view_full_details = serializers.SerializerMethodField()
    assignment_status = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    assigned_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            # Basic info (always visible)
            'id',
            'title',
            'description',
            'budget',
            'client_name',
            'client_phone',
            'category_name',
            'status',
            'status_display',
            'posted_at',
            'created_at',
            'updated_at',
            
            # Location (conditional)
            'general_location',
            'exact_location',
            'map_url',              # 🆕 Hidden until assigned
            'directions_url',       # 🆕 Hidden until assigned
            'place_id',             # 🆕 Hidden until assigned
            'location_display',
            'latitude',
            'longitude',
            'search_radius_km',
            
            # Timing
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
            
            # Application & Assignment
            'application_status',
            'assignment_status',
            'assigned_at',
            'can_view_full_details',
        ]
        read_only_fields = [
            'id', 'client', 'posted_at', 'created_at', 'updated_at'
        ]
    
    def __init__(self, *args, **kwargs):
        # Extract worker_id from context
        self.worker_id = kwargs.get('context', {}).get('worker_id')
        super().__init__(*args, **kwargs)
    
    # ============================================================
    # REGULAR GETTERS
    # ============================================================
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_status_display(self, obj):
        return dict(Job.STATUS_CHOICES).get(obj.status)
    
    def get_timeframe_display(self, obj):
        return dict(Job.TIMEFRAME_CHOICES).get(obj.timeframe)
    
    def get_urgency_display(self, obj):
        return dict(Job.URGENCY_CHOICES).get(obj.urgency)
    
    def get_job_display_date(self, obj):
        return obj.job_display_date
    
    def get_job_display_time(self, obj):
        return obj.job_display_time
    
    # ============================================================
    # CONDITIONAL GETTERS (The Magic!)
    # ============================================================
    
    def get_client_name(self, obj):
        """
        🔒 Only show client name if worker is assigned.
        
        Why: Protects client identity until job is confirmed.
        """
        if self._can_view_full_details(obj):
            return obj.client.full_name if obj.client else None
        return None
    
    def get_client_phone(self, obj):
        """
        🔒 Only show client phone if worker is assigned.
        
        Why: Prevents workers from contacting clients without commitment.
        """
        if self._can_view_full_details(obj):
            return obj.client.phone_number if obj.client else None
        return None
    
    def get_exact_location(self, obj):
        """
        🔒 Only show exact location if worker is assigned.
        
        Why: Protects client's exact address until job is confirmed.
        """
        if self._can_view_full_details(obj):
            return obj.exact_location
        return None
    
    def get_map_url(self, obj):
        """
        🗺️ Only show map URL if worker is assigned.
        
        Why: Prevents workers from seeing exact location until commitment.
        """
        if self._can_view_full_details(obj):
            return obj.map_url
        return None
    
    def get_directions_url(self, obj):
        """
        🚗 Only show directions URL if worker is assigned.
        
        Why: Directions reveal exact location - hidden until commitment.
        """
        if self._can_view_full_details(obj):
            return obj.directions_url
        return None
    
    def get_place_id(self, obj):
        """
        📍 Only show place ID if worker is assigned.
        
        Why: Place ID can be used to find exact location - hidden until commitment.
        """
        if self._can_view_full_details(obj):
            return obj.place_id
        return None
    
    def get_location_display(self, obj):
        """
        📍 Returns the appropriate location based on assignment status.
        
        - If assigned: shows exact_location (or general_location as fallback)
        - If not assigned: shows only general_location
        """
        if self._can_view_full_details(obj):
            return obj.exact_location or obj.general_location
        return obj.general_location
    
    def get_can_view_full_details(self, obj):
        """
        🚦 Boolean flag indicating if worker can see full details.
        
        Frontend can use this to show/hide UI elements.
        """
        return self._can_view_full_details(obj)
    
    def get_assignment_status(self, obj):
        """
        📊 Get the worker's assignment status for this job.
        
        Possible values: 'ACTIVE', 'COMPLETED', 'CANCELLED', None
        """
        if not self.worker_id:
            return None
        return obj.get_worker_assignment_status(self.worker_id)
    
    def get_application_status(self, obj):
        """
        📊 Get the worker's application status for this job.
        
        Possible values: 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', None
        """
        if not self.worker_id:
            return None
        return obj.get_worker_application_status(self.worker_id)
    
    def get_assigned_at(self, obj):
        """
        📅 Get when the worker was assigned to this job.
        """
        if not self.worker_id:
            return None
        
        from apps.jobs.models import JobAssignment
        assignment = JobAssignment.objects.filter(
            job=obj,
            worker_id=self.worker_id
        ).first()
        return assignment.assigned_at if assignment else None
    
    # ============================================================
    # PRIVATE HELPER (Cached for Performance)
    # ============================================================
    
    def _can_view_full_details(self, obj) -> bool:
        """
        🔑 KEY METHOD: Check if the current worker is assigned to this job.
        
        This is called by all conditional getters.
        Results are cached to avoid multiple DB queries.
        
        Returns:
            True: Worker has an ACTIVE assignment → Show all details
            False: Worker is NOT assigned → Hide sensitive details
        """
        if not self.worker_id:
            return False
        
        # Cache the result to avoid multiple queries
        if not hasattr(self, '_cached_can_view'):
            self._cached_can_view = obj.can_view_full_details(self.worker_id)
        
        return self._cached_can_view
