# apps/jobs/models/job.py

from django.db import models
from django.utils import timezone
from apps.common.models.mixins import BaseModel
from apps.common.constants import JobStatus


class Job(BaseModel):
    """
    Job posting by a client.
    """
    # Job statuses
    OPEN = 'OPEN'
    ASSIGNED = 'ASSIGNED'
    IN_PROGRESS = 'IN_PROGRESS'
    AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    
    STATUS_CHOICES = [
        (OPEN, 'Open'),
        (ASSIGNED, 'Assigned'),
        (IN_PROGRESS, 'In Progress'),
        (AWAITING_CONFIRMATION, 'Awaiting Confirmation'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]
    
    # Timeframe choices
    TIMEFRAME_CHOICES = [
        ('MORNING', 'Morning (6AM - 12PM)'),
        ('AFTERNOON', 'Afternoon (12PM - 5PM)'),
        ('EVENING', 'Evening (5PM - 9PM)'),
        ('ANYTIME', 'Anytime'),
    ]
    
    # Urgency choices
    URGENCY_CHOICES = [
        ('IMMEDIATE', 'Immediate (Today)'),
        ('URGENT', 'Urgent (Within 3 days)'),
        ('NORMAL', 'Normal (Within a week)'),
        ('FLEXIBLE', 'Flexible (Any time)'),
    ]
    
    # ============================================
    # BASIC JOB INFORMATION
    # ============================================
    
    client = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='jobs_posted'
    )
    category = models.ForeignKey(
        'JobCategory',
        on_delete=models.PROTECT,
        related_name='jobs'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    
    # ============================================
    # LOCATION (Manual + Auto from GPS)
    # ============================================
    
    general_location = models.CharField(
        max_length=255,
        help_text="Human-readable address (manual entry for display)"
    )
    exact_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Specific address/landmark - HIDDEN from workers until assigned"
    )
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Auto-detected from device GPS"
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Auto-detected from device GPS"
    )
    
    # ============================================
    # 🆕 MAP & DIRECTIONS (Hidden until assigned)
    # ============================================
    
    map_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Google Maps/OpenStreetMap URL - HIDDEN from workers until assigned"
    )
    directions_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Directions URL from client location - HIDDEN from workers until assigned"
    )
    place_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Google Maps Place ID for the exact location - HIDDEN from workers until assigned"
    )
    
    # ============================================
    # JOB TIMING / SCHEDULING
    # ============================================
    
    job_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when the job needs to be done"
    )
    
    job_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Time when the job should start"
    )
    
    timeframe = models.CharField(
        max_length=20,
        choices=TIMEFRAME_CHOICES,
        default='ANYTIME',
        help_text="Preferred time of day"
    )
    
    is_flexible = models.BooleanField(
        default=True,
        help_text="Can the worker choose the exact time?"
    )
    
    duration_hours = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Estimated duration in hours (e.g., 2.5)"
    )
    
    urgency = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default='NORMAL',
        help_text="How urgent is the job?"
    )
    
    # ============================================
    # SKILLS (Optional)
    # ============================================
    
    required_skills = models.ManyToManyField(
        'accounts.Skill',
        blank=True,
        related_name='jobs',
        help_text="Skills required for this job (optional)"
    )
    
    # ============================================
    # STATUS & TRACKING
    # ============================================
    
    status = models.CharField(
        max_length=25,
        choices=STATUS_CHOICES,
        default=OPEN
    )
    
    posted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Completion tracking
    worker_marked_complete = models.BooleanField(default=False)
    worker_marked_complete_at = models.DateTimeField(null=True, blank=True)
    client_confirmed_complete = models.BooleanField(default=False)
    client_confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # ============================================
    # AUTO-CONFIRM (10-minute grace period)
    # ============================================
    
    auto_confirm_at = models.DateTimeField(null=True, blank=True)
    auto_confirm_grace_minutes = models.IntegerField(default=10)
    
    # ============================================
    # DISPUTE TRACKING
    # ============================================
    
    is_disputed = models.BooleanField(default=False)
    dispute_reason = models.TextField(blank=True)
    dispute_raised_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disputes_raised'
    )
    dispute_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('INVESTIGATING', 'Investigating'),
            ('RESOLVED_WORKER', 'Resolved - Worker at fault'),
            ('RESOLVED_CLIENT', 'Resolved - Client at fault'),
            ('DISMISSED', 'Dismissed'),
        ],
        default='PENDING'
    )
    dispute_resolution_notes = models.TextField(blank=True)
    dispute_resolved_at = models.DateTimeField(null=True, blank=True)
    
    # ============================================
    # PROPERTIES
    # ============================================
    
    class Meta:
        db_table = 'jobs'
        ordering = ['-posted_at']
        indexes = [
            models.Index(fields=['status', 'posted_at']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['urgency']),
            models.Index(fields=['job_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.client.full_name}"
    
    @property
    def is_open(self):
        return self.status == self.OPEN and not self.is_deleted
    
    @property
    def is_assigned(self):
        return self.status == self.ASSIGNED
    
    @property
    def is_in_progress(self):
        return self.status == self.IN_PROGRESS
    
    @property
    def is_awaiting_confirmation(self):
        return self.status == self.AWAITING_CONFIRMATION
    
    @property
    def is_completed(self):
        return self.status == self.COMPLETED
    
    @property
    def is_urgent(self):
        return self.urgency in ['IMMEDIATE', 'URGENT']
    
    @property
    def job_display_date(self):
        if self.job_date:
            return self.job_date.strftime('%B %d, %Y')
        return 'Flexible'
    
    @property
    def job_display_time(self):
        if self.job_time:
            return self.job_time.strftime('%I:%M %p')
        if self.timeframe != 'ANYTIME':
            return self.get_timeframe_display()
        return 'Flexible'
    
    @property
    def search_radius_km(self) -> float:
        """Fixed search radius of 1km for all jobs."""
        return 1.0
    
    def can_apply(self):
        return self.status in [self.OPEN]
    
    def can_assign(self):
        return self.status in [self.OPEN, self.ASSIGNED]
    
    def can_start(self):
        return self.status == self.ASSIGNED
    
    def can_mark_complete(self):
        return self.status in [self.ASSIGNED, self.IN_PROGRESS]
    
    def can_client_confirm(self):
        return self.status == self.AWAITING_CONFIRMATION
    
    # ============================================
    # 🆕 HELPER METHODS FOR CONDITIONAL DISCLOSURE
    # ============================================
    
    def is_accepted_by_worker(self, worker_id: int) -> bool:
        """
        Check if a specific worker has been assigned/accepted this job.
        
        Returns True if worker has an active assignment.
        Used by: can_view_full_details(), serializers, views
        
        Explanation:
        - Workers can only see full details if they have been assigned
        - This checks if there's an active JobAssignment for this worker
        - Active statuses: ACTIVE, IN_PROGRESS
        """
        from apps.jobs.models import JobAssignment
        from apps.common.constants import AssignmentStatus
        
        return JobAssignment.objects.filter(
            job=self,
            worker_id=worker_id,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
        ).exists()
    
    def get_worker_assignment_status(self, worker_id: int) -> str:
        """
        Get the assignment status for a specific worker.
        
        Returns:
            - Assignment status string (e.g., 'ACTIVE', 'COMPLETED')
            - None if worker is not assigned
        
        Used by: serializers to show assignment status to workers
        """
        from apps.jobs.models import JobAssignment
        
        assignment = JobAssignment.objects.filter(
            job=self,
            worker_id=worker_id
        ).first()
        return assignment.status if assignment else None
    
    def get_worker_application_status(self, worker_id: int) -> str:
        """
        Get the application status for a specific worker.
        
        Returns:
            - Application status string (e.g., 'PENDING', 'ACCEPTED')
            - None if worker has not applied
        
        Used by: serializers to show application status to workers
        """
        from apps.jobs.models import JobApplication
        from apps.common.constants import ApplicationStatus
        
        application = JobApplication.objects.filter(
            job=self,
            worker_id=worker_id
        ).first()
        return application.status if application else None
    
    def can_view_full_details(self, worker_id: int) -> bool:
        """
        🔑 KEY METHOD: Check if a worker can view full job details.
        
        What it controls:
        - exact_location (specific address)
        - map_url (Google Maps link)
        - directions_url (Directions link)
        - place_id (Google Maps Place ID)
        - client_name
        - client_phone
        
        The rule:
        - Only workers with ACTIVE assignments can view full details
        - This protects client privacy until the job is officially assigned
        
        Used by: WorkerJobDetailSerializer to conditionally show/hide fields
        """
        if not worker_id:
            return False
        return self.is_accepted_by_worker(worker_id)
    
    def get_visible_location(self, worker_id: int = None) -> str:
        """
        Returns the appropriate location based on worker's assignment status.
        
        Returns:
            - If assigned: exact_location (or general_location as fallback)
            - If not assigned: general_location only
        
        Used by: serializers to show the correct location to workers
        """
        if worker_id and self.can_view_full_details(worker_id):
            return self.exact_location or self.general_location
        return self.general_location
    
    def get_visible_contact(self, worker_id: int = None) -> dict:
        """
        Returns client contact info only if worker is assigned.
        
        Returns:
            {
                'client_name': str or None,
                'client_phone': str or None
            }
        
        Used by: serializers to conditionally show contact details
        """
        if worker_id and self.can_view_full_details(worker_id):
            return {
                'client_name': self.client.full_name if self.client else None,
                'client_phone': self.client.phone_number if self.client else None,
            }
        return {
            'client_name': None,
            'client_phone': None,
        }
    
    def get_visible_map_urls(self, worker_id: int = None) -> dict:
        """
        🆕 Returns map URLs only if worker is assigned.
        
        Returns:
            {
                'map_url': str or None,
                'directions_url': str or None,
                'place_id': str or None
            }
        
        Used by: serializers to conditionally show map and directions
        """
        if worker_id and self.can_view_full_details(worker_id):
            return {
                'map_url': self.map_url,
                'directions_url': self.directions_url,
                'place_id': self.place_id,
            }
        return {
            'map_url': None,
            'directions_url': None,
            'place_id': None,
        }
    
    def is_within_radius(self, worker_id: int, radius_km: float = 1.0) -> bool:
        """
        Check if a worker is within the job's search radius.
        
        Args:
            worker_id: The worker's user ID
            radius_km: Search radius in kilometers (default: 1km)
        
        Returns:
            True if worker is within radius, False otherwise
        
        Used by: MatchingService to filter jobs
        """
        from apps.accounts.models import WorkerProfile
        from apps.matching.services.distance_service import DistanceService
        
        try:
            # Get worker's location
            worker_profile = WorkerProfile.objects.get(user_id=worker_id)
            location = worker_profile.current_location
            
            if not location:
                return False
            
            lat = location.get('latitude')
            lng = location.get('longitude')
            
            if lat is None or lng is None:
                return False
            
            # Check if job has location
            if self.latitude is None or self.longitude is None:
                return False
            
            # Calculate distance
            distance = DistanceService.calculate_distance(
                float(self.latitude),
                float(self.longitude),
                float(lat),
                float(lng)
            )
            
            if distance is None:
                return False
            
            # Must be within the search radius
            return distance <= radius_km
            
        except WorkerProfile.DoesNotExist:
            return False
