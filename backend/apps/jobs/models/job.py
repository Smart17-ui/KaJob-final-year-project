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
        help_text="Specific address/landmark"
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
    radius = models.IntegerField(
        default=5,
        help_text="Search radius in kilometers"
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
    # PAYMENT (Future Ready)
    # ============================================
    
    PAYMENT_CASH = 'CASH'
    PAYMENT_ONLINE = 'ONLINE'
    PAYMENT_ESCROW = 'ESCROW'
    
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_CASH, 'Cash'),
        (PAYMENT_ONLINE, 'Online'),
        (PAYMENT_ESCROW, 'Escrow'),
    ]
    
    PAYMENT_STATUS_PENDING = 'PENDING'
    PAYMENT_STATUS_PAID = 'PAID'
    PAYMENT_STATUS_ESCROW = 'ESCROW'
    PAYMENT_STATUS_RELEASED = 'RELEASED'
    PAYMENT_STATUS_REFUNDED = 'REFUNDED'
    
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, 'Pending'),
        (PAYMENT_STATUS_PAID, 'Paid'),
        (PAYMENT_STATUS_ESCROW, 'In Escrow'),
        (PAYMENT_STATUS_RELEASED, 'Released to Worker'),
        (PAYMENT_STATUS_REFUNDED, 'Refunded'),
    ]
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_CASH,
        help_text="How the job is/was paid for"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_PENDING,
        help_text="Current payment status"
    )
    payment_reference = models.CharField(
        max_length=255,
        blank=True,
        help_text="Reference ID from payment gateway (future use)"
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual amount paid (may differ from budget)"
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    escrow_release_date = models.DateTimeField(null=True, blank=True)
    
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
    def is_paid(self):
        return self.payment_status in [
            self.PAYMENT_STATUS_PAID,
            self.PAYMENT_STATUS_RELEASED,
        ]
    
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
