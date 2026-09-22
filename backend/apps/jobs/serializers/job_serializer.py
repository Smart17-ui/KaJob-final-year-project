# apps/jobs/serializers/job_serializer.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.jobs.models import Job
from apps.common.constants import JobStatus, AssignmentStatus

User = get_user_model()


# ============================================================
# NESTED DETAIL SERIALIZERS — the counterparty on a job
# ============================================================

class JobClientDetailSerializer(serializers.ModelSerializer):
    """
    Full client details exposed to:
      - the assigned worker on the job
      - admins

    Not exposed to unrelated users.
    """
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    jobs_posted = serializers.SerializerMethodField()
    member_since = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'phone_number',
            'is_verified',
            'rating',
            'reviews_count',
            'jobs_posted',
            'member_since',
        ]

    def get_rating(self, obj):
        profile = getattr(obj, 'client_profile', None)
        if profile and profile.average_rating is not None:
            return float(profile.average_rating)
        return 0.0

    def get_reviews_count(self, obj):
        profile = getattr(obj, 'client_profile', None)
        if profile and profile.total_reviews is not None:
            return profile.total_reviews
        return 0

    def get_jobs_posted(self, obj):
        try:
            return obj.jobs_posted.count()
        except Exception:
            return 0

    def get_member_since(self, obj):
        if getattr(obj, 'created_at', None):
            return obj.created_at.isoformat()
        return None


class JobWorkerDetailSerializer(serializers.ModelSerializer):
    """
    Full worker details exposed to:
      - the client who posted the job
      - admins

    Not exposed to unrelated users.
    """
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    jobs_completed = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'phone_number',
            'is_verified',
            'rating',
            'reviews_count',
            'jobs_completed',
            'years_of_experience',
            'skills',
            'bio',
            'availability_status',
        ]

    def get_rating(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        if profile and profile.average_rating is not None:
            return float(profile.average_rating)
        return 0.0

    def get_reviews_count(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        if profile and profile.total_reviews is not None:
            return profile.total_reviews
        return 0

    def get_jobs_completed(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        if profile and profile.jobs_completed is not None:
            return profile.jobs_completed
        return 0

    def get_years_of_experience(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        return profile.years_of_experience if profile else 0

    def get_skills(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        if not profile:
            return []
        try:
            return [s.name for s in profile.skills.all()]
        except Exception:
            return []

    def get_bio(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        return profile.bio if profile else None

    def get_availability_status(self, obj):
        profile = getattr(obj, 'worker_profile', None)
        return profile.availability_status if profile else None


# ============================================================
# POLICY HELPERS
# ============================================================

def _assignment_for(job, user):
    """Return the assignment row for `user` on this job, if any."""
    if not user or not user.is_authenticated:
        return None

    return (
        job.assignments
        .filter(
            worker_id=user.id,
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
                AssignmentStatus.CANCELLED,
            ],
        )
        .order_by('-assigned_at')
        .first()
    )


def _job_has_assignment(job):
    """Return the current assignment row for the job, if any."""
    return (
        job.assignments
        .filter(
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
                AssignmentStatus.CANCELLED,
            ]
        )
        .order_by('-assigned_at')
        .select_related('worker')
        .first()
    )


def build_client_payload(job, request_user):
    """
    Decide what to expose for the 'client' field.

      - Admin                  → full details
      - Assigned worker        → full details
      - The client themselves  → None (no self-duplication)
      - Everyone else          → name only
    """
    if not request_user or not request_user.is_authenticated:
        return None

    is_admin = getattr(request_user, 'is_admin', False)
    is_client_owner = (job.client_id == request_user.id)

    if is_admin:
        return JobClientDetailSerializer(job.client).data

    if is_client_owner:
        return None

    if _assignment_for(job, request_user):
        return JobClientDetailSerializer(job.client).data

    return {
        'id': job.client.id,
        'full_name': job.client.full_name,
    }


def build_worker_payload(job, request_user):
    """
    Decide what to expose for the 'worker' field.

      - Admin                  → full details
      - Client (job owner)     → full details
      - The worker themselves  → None (no self-duplication)
      - Everyone else          → name only
    """
    if not request_user or not request_user.is_authenticated:
        return None

    assignment = _job_has_assignment(job)
    if not assignment:
        return None

    worker = assignment.worker
    is_admin = getattr(request_user, 'is_admin', False)
    is_client_owner = (job.client_id == request_user.id)

    if is_admin:
        return JobWorkerDetailSerializer(worker).data

    if is_client_owner:
        return JobWorkerDetailSerializer(worker).data

    if worker.id == request_user.id:
        return None

    return {
        'id': worker.id,
        'full_name': worker.full_name,
    }


# ============================================================
# JOB SERIALIZER — flat, for list & generic responses
# ============================================================

class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for job data — used in list & generic responses.
    Keeps a flat shape for lightweight payloads.
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
        assignment = obj.assignments.filter(
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
            ]
        ).order_by('-assigned_at').first()
        return assignment.worker.full_name if assignment else None

    def get_timeframe_display(self, obj):
        return dict(Job.TIMEFRAME_CHOICES).get(obj.timeframe)

    def get_urgency_display(self, obj):
        return dict(Job.URGENCY_CHOICES).get(obj.urgency)

    def get_job_display_date(self, obj):
        return obj.job_display_date

    def get_job_display_time(self, obj):
        return obj.job_display_time


# ============================================================
# JOB DETAIL SERIALIZER — client/admin full-access view
# ============================================================

class JobDetailSerializer(serializers.ModelSerializer):
    """
    Detail serializer used when a client or admin opens a job.

    Includes structured, policy-aware `client` and `worker` objects.
    """
    client_name = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    assigned_worker_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    urgency_display = serializers.SerializerMethodField()
    timeframe_display = serializers.SerializerMethodField()
    is_urgent = serializers.SerializerMethodField()
    job_display_date = serializers.SerializerMethodField()
    job_display_time = serializers.SerializerMethodField()
    search_radius_km = serializers.FloatField(read_only=True)

    # Nested detail objects
    client = serializers.SerializerMethodField()
    worker = serializers.SerializerMethodField()
    worker_has_reviewed_client = serializers.SerializerMethodField()
    client_has_reviewed_worker = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
            'budget',

            # Client — flat (backward-compat) + nested
            'client_name',
            'client_phone',
            'client_email',
            'client',
            'worker_has_reviewed_client',
            'client_has_reviewed_worker',

            # Worker — flat (backward-compat) + nested
            'assigned_worker_name',
            'worker',

            # Category
            'category',
            'category_name',

            # Location (full access)
            'general_location',
            'exact_location',
            'map_url',
            'directions_url',
            'place_id',
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
            'posted_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]

    # ---------- Nested objects ----------

    def get_client(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return build_client_payload(obj, user)

    def get_worker(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return build_worker_payload(obj, user)

    def get_worker_has_reviewed_client(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated or not obj.client_id:
            return False

        from apps.reviews.models import Review

        return Review.objects.filter(
            job=obj,
            reviewer_id=user.id,
            reviewee_id=obj.client_id,
        ).exists()


    def get_client_has_reviewed_worker(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
           return False

        assignment = _job_has_assignment(obj)

        if not assignment or not assignment.worker_id:
           return False

        from apps.reviews.models import Review

        return Review.objects.filter(
            job=obj,
            reviewer_id=user.id,
            reviewee_id=assignment.worker_id,
        ).exists()

    # ---------- Flat legacy fields ----------

    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None

    def get_client_phone(self, obj):
        return obj.client.phone_number if obj.client else None

    def get_client_email(self, obj):
        return obj.client.email if obj.client else None

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_assigned_worker_name(self, obj):
        assignment = obj.assignments.filter(
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
            ]
        ).order_by('-assigned_at').first()
        return assignment.worker.full_name if assignment else None

    def get_status_display(self, obj):
        return dict(JobStatus.CHOICES).get(obj.status)

    def get_urgency_display(self, obj):
        return dict(Job.URGENCY_CHOICES).get(obj.urgency)

    def get_timeframe_display(self, obj):
        return (
            dict(Job.TIMEFRAME_CHOICES).get(obj.timeframe)
            if hasattr(obj, 'timeframe')
            else None
        )

    def get_is_urgent(self, obj):
        return obj.urgency in ['IMMEDIATE', 'URGENT']

    def get_job_display_date(self, obj):
        return obj.job_display_date

    def get_job_display_time(self, obj):
        return obj.job_display_time


# ============================================================
# JOB CREATE / UPDATE
# ============================================================

class JobCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(required=True)
    budget = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=True
    )
    category_id = serializers.IntegerField(required=True)

    general_location = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    exact_location = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    latitude = serializers.DecimalField(
        max_digits=10, decimal_places=8,
        required=False, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=11, decimal_places=8,
        required=False, allow_null=True
    )
    place_id = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )

    job_date = serializers.DateField(required=False, allow_null=True)
    job_time = serializers.TimeField(required=False, allow_null=True)
    timeframe = serializers.ChoiceField(
        choices=Job.TIMEFRAME_CHOICES, required=False, default='ANYTIME'
    )
    is_flexible = serializers.BooleanField(required=False, default=True)
    duration_hours = serializers.DecimalField(
        max_digits=4, decimal_places=1,
        required=False, allow_null=True
    )
    urgency = serializers.ChoiceField(
        choices=Job.URGENCY_CHOICES, required=False, default='NORMAL'
    )

    required_skills = serializers.ListField(
        child=serializers.IntegerField(),
        required=False, allow_empty=True
    )

    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Budget must be greater than zero."
            )
        return value

    def validate_duration_hours(self, value):
        if value is not None:
            if value <= 0:
                raise serializers.ValidationError(
                    "Duration must be greater than zero."
                )
            if value > 24:
                raise serializers.ValidationError(
                    "Duration cannot exceed 24 hours."
                )
        return value

    def validate_job_date(self, value):
        if value:
            from django.utils import timezone
            if value < timezone.now().date():
                raise serializers.ValidationError(
                    "Job date cannot be in the past."
                )
        return value


class JobUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)
    budget = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    general_location = serializers.CharField(max_length=255, required=False)
    exact_location = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    latitude = serializers.DecimalField(
        max_digits=10, decimal_places=8,
        required=False, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=11, decimal_places=8,
        required=False, allow_null=True
    )

    job_date = serializers.DateField(required=False, allow_null=True)
    job_time = serializers.TimeField(required=False, allow_null=True)
    timeframe = serializers.ChoiceField(
        choices=Job.TIMEFRAME_CHOICES, required=False
    )
    is_flexible = serializers.BooleanField(required=False)
    duration_hours = serializers.DecimalField(
        max_digits=4, decimal_places=1,
        required=False, allow_null=True
    )
    urgency = serializers.ChoiceField(
        choices=Job.URGENCY_CHOICES, required=False
    )

    required_skills = serializers.ListField(
        child=serializers.IntegerField(),
        required=False, allow_empty=True
    )

    def validate_budget(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Budget must be greater than zero."
            )
        return value


# ============================================================
# JOB LIST SERIALIZER — flat, lightweight
# ============================================================

class JobListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    worker_id = serializers.SerializerMethodField()
    worker_name = serializers.SerializerMethodField()
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
            'worker_id',
            'worker_name',
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

    def _get_assigned_worker(self, obj):
        return obj.assignments.order_by('-assigned_at').select_related(
            'worker'
        ).first()

    def get_worker_id(self, obj):
        assignment = self._get_assigned_worker(obj)
        return assignment.worker.id if assignment and assignment.worker else None

    def get_worker_name(self, obj):
        assignment = self._get_assigned_worker(obj)
        return assignment.worker.full_name if assignment and assignment.worker else None


# ============================================================
# WORKER JOB DETAIL SERIALIZER — conditional disclosure
# ============================================================

class WorkerJobDetailSerializer(serializers.ModelSerializer):
    """
    Serializer used when a worker views a job.

    Adds nested `client` and `worker` objects with role-aware
    disclosure. Existing conditional-disclosure fields
    (exact_location, map_url, etc.) are preserved for backward compat.
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

    exact_location = serializers.SerializerMethodField()
    map_url = serializers.SerializerMethodField()
    directions_url = serializers.SerializerMethodField()
    place_id = serializers.SerializerMethodField()
    location_display = serializers.SerializerMethodField()
    can_view_full_details = serializers.SerializerMethodField()
    assignment_status = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    assigned_at = serializers.SerializerMethodField()

    # Nested detail objects
    client = serializers.SerializerMethodField()
    worker = serializers.SerializerMethodField()
    worker_has_reviewed_client = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            # Basic info
            'id',
            'title',
            'description',
            'budget',

            # Client — flat + nested
            'client_name',
            'client_phone',
            'client',
            'worker_has_reviewed_client',

            # Worker — nested
            'worker',

            # Category
            'category_name',

            # Status
            'status',
            'status_display',
            'posted_at',
            'created_at',
            'updated_at',

            # Location (conditional)
            'general_location',
            'exact_location',
            'map_url',
            'directions_url',
            'place_id',
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

            # Application / assignment
            'application_status',
            'assignment_status',
            'assigned_at',
            'can_view_full_details',
        ]
        read_only_fields = [
            'id',
            'posted_at',
            'created_at',
            'updated_at',
        ]

    def __init__(self, *args, **kwargs):
        self.worker_id = kwargs.get('context', {}).get('worker_id')
        super().__init__(*args, **kwargs)

    # ---------- Nested objects ----------

    def _request_user(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if user is None and self.worker_id:
            user = User.objects.filter(id=self.worker_id).first()

        return user

    def get_client(self, obj):
        return build_client_payload(obj, self._request_user())

    def get_worker(self, obj):
        return build_worker_payload(obj, self._request_user())

    def get_worker_has_reviewed_client(self, obj):
        if not self.worker_id or not obj.client_id:
            return False

        from apps.reviews.models import Review

        return Review.objects.filter(
            job=obj,
            reviewer_id=self.worker_id,
            reviewee_id=obj.client_id,
        ).exists()

    # ---------- Conditional disclosure for location / contact ----------

    def _can_view_full_details(self, obj) -> bool:
        if not self.worker_id:
            return False

        if not hasattr(self, '_cached_can_view'):
            self._cached_can_view = obj.can_view_full_details(
                self.worker_id
            )

        return self._cached_can_view

    def get_client_name(self, obj):
        if self._can_view_full_details(obj):
            return obj.client.full_name if obj.client else None
        return None

    def get_client_phone(self, obj):
        if self._can_view_full_details(obj):
            return obj.client.phone_number if obj.client else None
        return None

    def get_exact_location(self, obj):
        return (
            obj.exact_location
            if self._can_view_full_details(obj)
            else None
        )

    def get_map_url(self, obj):
        return (
            obj.map_url
            if self._can_view_full_details(obj)
            else None
        )

    def get_directions_url(self, obj):
        return (
            obj.directions_url
            if self._can_view_full_details(obj)
            else None
        )

    def get_place_id(self, obj):
        return (
            obj.place_id
            if self._can_view_full_details(obj)
            else None
        )

    def get_location_display(self, obj):
        if self._can_view_full_details(obj):
            return obj.exact_location or obj.general_location

        return obj.general_location

    def get_can_view_full_details(self, obj):
        return self._can_view_full_details(obj)

    def get_assignment_status(self, obj):
        if not self.worker_id:
            return None

        return obj.get_worker_assignment_status(self.worker_id)

    def get_application_status(self, obj):
        if not self.worker_id:
            return None

        return obj.get_worker_application_status(self.worker_id)

    def get_assigned_at(self, obj):
        if not self.worker_id:
            return None

        from apps.jobs.models import JobAssignment

        assignment = JobAssignment.objects.filter(
            job=obj,
            worker_id=self.worker_id
        ).first()

        return assignment.assigned_at if assignment else None

    # ---------- Regular fields ----------

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