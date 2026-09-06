# apps/jobs/serializers/job_assignment_serializer.py

from rest_framework import serializers
from apps.jobs.models import JobAssignment
from apps.common.constants import AssignmentStatus


class JobAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for job assignment data - Full details.
    """
    worker_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = JobAssignment
        fields = [
            'id',
            'job',
            'job_title',
            'worker',
            'worker_name',
            'assigned_by',
            'assigned_by_name',
            'status',
            'status_display',
            'assigned_at',
            'completed_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'assigned_at',
            'completed_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_assigned_by_name(self, obj):
        return obj.assigned_by.full_name if obj.assigned_by else None
    
    def get_status_display(self, obj):
        return dict(AssignmentStatus.CHOICES).get(obj.status)


class JobAssignmentCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a job assignment.
    """
    job_id = serializers.IntegerField(required=True)
    worker_id = serializers.IntegerField(required=True)
    
    def validate(self, data):
        from apps.jobs.models import Job
        from apps.accounts.models import User
        from apps.common.constants import JobStatus
        
        job_id = data.get('job_id')
        worker_id = data.get('worker_id')
        
        # Validate job exists and is OPEN
        try:
            job = Job.objects.get(id=job_id)
            if job.status != JobStatus.OPEN:
                raise serializers.ValidationError(
                    f"Cannot assign worker to a job with status '{job.status}'."
                )
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job not found.")
        
        # Validate worker exists and has WORKER role
        try:
            worker = User.objects.get(id=worker_id)
            if not worker.is_worker:
                raise serializers.ValidationError("User is not a worker.")
        except User.DoesNotExist:
            raise serializers.ValidationError("Worker not found.")
        
        # Check if worker is already assigned to another active job
        existing_active = JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if existing_active:
            raise serializers.ValidationError(
                "Worker is already assigned to another active job."
            )
        
        return data


# ============================================================
# 🆕 JOB ASSIGNMENT LIST SERIALIZER (For List Views)
# ============================================================

class JobAssignmentListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing job assignments.
    """
    worker_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = JobAssignment
        fields = [
            'id',
            'job',
            'job_title',
            'worker',
            'worker_name',
            'status',
            'status_display',
            'assigned_at',
        ]
        read_only_fields = [
            'id',
            'assigned_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_status_display(self, obj):
        return dict(AssignmentStatus.CHOICES).get(obj.status)


# ============================================================
# 🆕 JOB ASSIGNMENT DETAIL SERIALIZER (For Detail Views)
# ============================================================

class JobAssignmentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for job assignment with full info.
    """
    worker_name = serializers.SerializerMethodField()
    worker_email = serializers.SerializerMethodField()
    worker_phone = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    job_status = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = JobAssignment
        fields = [
            'id',
            'job',
            'job_title',
            'job_status',
            'worker',
            'worker_name',
            'worker_email',
            'worker_phone',
            'assigned_by',
            'assigned_by_name',
            'status',
            'status_display',
            'assigned_at',
            'completed_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'assigned_at',
            'completed_at',
            'cancelled_at',
            'created_at',
            'updated_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_worker_email(self, obj):
        return obj.worker.email if obj.worker else None
    
    def get_worker_phone(self, obj):
        return obj.worker.phone_number if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_job_status(self, obj):
        from apps.common.constants import JobStatus
        return {
            'status': obj.job.status,
            'display': dict(JobStatus.CHOICES).get(obj.job.status),
        }
    
    def get_assigned_by_name(self, obj):
        return obj.assigned_by.full_name if obj.assigned_by else None
    
    def get_status_display(self, obj):
        return dict(AssignmentStatus.CHOICES).get(obj.status)


# ============================================================
# 🆕 JOB ASSIGNMENT UPDATE SERIALIZER
# ============================================================

class JobAssignmentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a job assignment (e.g., marking complete/cancel).
    """
    class Meta:
        model = JobAssignment
        fields = [
            'status',
            'completed_at',
            'cancelled_at',
        ]
    
    def validate_status(self, value):
        """Validate status transition."""
        if self.instance:
            current_status = self.instance.status
            
            # Define allowed transitions
            allowed_transitions = {
                AssignmentStatus.ACTIVE: [
                    AssignmentStatus.IN_PROGRESS,
                    AssignmentStatus.COMPLETED,
                    AssignmentStatus.CANCELLED,
                ],
                AssignmentStatus.IN_PROGRESS: [
                    AssignmentStatus.COMPLETED,
                    AssignmentStatus.CANCELLED,
                ],
                AssignmentStatus.COMPLETED: [],  # Terminal
                AssignmentStatus.CANCELLED: [],  # Terminal
            }
            
            if value not in allowed_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{current_status}' to '{value}'."
                )
        
        return value
    
    def update(self, instance, validated_data):
        """Update the assignment with validation."""
        new_status = validated_data.get('status')
        
        # Set timestamps based on status
        if new_status == AssignmentStatus.COMPLETED:
            from django.utils import timezone
            validated_data['completed_at'] = timezone.now()
        elif new_status == AssignmentStatus.CANCELLED:
            from django.utils import timezone
            validated_data['cancelled_at'] = timezone.now()
        
        return super().update(instance, validated_data)


# ============================================================
# 🆕 JOB ASSIGNMENT STATUS INFO SERIALIZER
# ============================================================

class JobAssignmentStatusInfoSerializer(serializers.Serializer):
    """
    Serializer for job assignment status information.
    """
    status = serializers.CharField()
    display = serializers.CharField()
    color = serializers.CharField()
    icon = serializers.CharField()
    description = serializers.CharField()
    is_terminal = serializers.BooleanField()
    
    def to_representation(self, instance):
        # If instance is a status string
        if isinstance(instance, str):
            status_display = {
                AssignmentStatus.ACTIVE: {
                    'display': 'Active',
                    'color': '#10b981',
                    'icon': '🔄',
                    'description': 'Worker is actively assigned to this job',
                    'is_terminal': False,
                },
                AssignmentStatus.IN_PROGRESS: {
                    'display': 'In Progress',
                    'color': '#f59e0b',
                    'icon': '⚙️',
                    'description': 'Worker is currently working on the job',
                    'is_terminal': False,
                },
                AssignmentStatus.COMPLETED: {
                    'display': 'Completed',
                    'color': '#8b5cf6',
                    'icon': '✅',
                    'description': 'Worker has completed the job',
                    'is_terminal': True,
                },
                AssignmentStatus.CANCELLED: {
                    'display': 'Cancelled',
                    'color': '#ef4444',
                    'icon': '❌',
                    'description': 'Assignment has been cancelled',
                    'is_terminal': True,
                },
            }
            
            info = status_display.get(instance, {
                'display': instance.title(),
                'color': '#6b7280',
                'icon': '📌',
                'description': 'Unknown status',
                'is_terminal': True,
            })
            
            return {
                'status': instance,
                **info
            }
        
        return super().to_representation(instance)
