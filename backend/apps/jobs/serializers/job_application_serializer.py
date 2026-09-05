# apps/jobs/serializers/job_application_serializer.py

from rest_framework import serializers
from apps.jobs.models import JobApplication
from apps.common.constants import ApplicationStatus


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for job application data.
    """
    worker_name = serializers.SerializerMethodField()
    worker_email = serializers.SerializerMethodField()  # 🆕 Added
    worker_phone = serializers.SerializerMethodField()  # 🆕 Added
    job_title = serializers.SerializerMethodField()
    job_status = serializers.SerializerMethodField()    # 🆕 Added
    status_display = serializers.SerializerMethodField()
    can_accept = serializers.SerializerMethodField()    # 🆕 Added
    
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'job_title',
            'job_status',           # 🆕 Job status
            'worker',
            'worker_name',
            'worker_email',         # 🆕 Worker email
            'worker_phone',         # 🆕 Worker phone
            'status',
            'status_display',
            'can_accept',           # 🆕 Frontend can use this to show/hide accept button
            'applied_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'applied_at',
            'updated_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_worker_email(self, obj):
        """Get worker email (useful for contacting the worker)."""
        return obj.worker.email if obj.worker else None
    
    def get_worker_phone(self, obj):
        """Get worker phone number."""
        return obj.worker.phone_number if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_job_status(self, obj):
        """Get the current job status."""
        from apps.common.constants import JobStatus
        return {
            'status': obj.job.status,
            'display': dict(JobStatus.CHOICES).get(obj.job.status),
        }
    
    def get_status_display(self, obj):
        return dict(ApplicationStatus.CHOICES).get(obj.status)
    
    def get_can_accept(self, obj):
        """
        Check if the application can be accepted.
        Used by frontend to enable/disable accept button.
        """
        from apps.common.constants import JobStatus, AssignmentStatus
        from apps.jobs.models import JobAssignment
        
        # Can only accept if:
        # 1. Application is PENDING
        # 2. Job is OPEN
        # 3. Worker is not already assigned to another job
        if obj.status != ApplicationStatus.PENDING:
            return False
        
        if obj.job.status != JobStatus.OPEN:
            return False
        
        # Check if worker is already assigned to another job
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=obj.worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if has_active_assignment:
            return False
        
        return True


class JobApplicationCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a job application.
    """
    job_id = serializers.IntegerField(required=True)


class JobApplicationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing job applications.
    """
    worker_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'job_title',
            'worker',
            'worker_name',
            'status',
            'status_display',
            'applied_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_status_display(self, obj):
        return dict(ApplicationStatus.CHOICES).get(obj.status)


class ClientApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for client applications view.
    Includes job details and worker details.
    """
    worker_name = serializers.SerializerMethodField()
    worker_profile = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    job_location = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    can_accept = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id',
            'job',
            'job_title',
            'job_location',
            'worker',
            'worker_name',
            'worker_profile',
            'status',
            'status_display',
            'can_accept',
            'applied_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'applied_at',
            'updated_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_worker_profile(self, obj):
        """Get worker profile details for the client."""
        try:
            worker_profile = obj.worker.worker_profile
            return {
                'bio': worker_profile.bio,
                'hourly_rate': str(worker_profile.hourly_rate) if worker_profile.hourly_rate else None,
                'average_rating': worker_profile.average_rating,
                'jobs_completed': worker_profile.jobs_completed,
                'skills': [skill.name for skill in worker_profile.skills.all()],
                'availability_status': worker_profile.availability_status,
            }
        except:
            return None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_job_location(self, obj):
        return obj.job.general_location if obj.job else None
    
    def get_status_display(self, obj):
        return dict(ApplicationStatus.CHOICES).get(obj.status)
    
    def get_can_accept(self, obj):
        """Check if application can be accepted."""
        from apps.common.constants import JobStatus, AssignmentStatus
        from apps.jobs.models import JobAssignment
        
        if obj.status != ApplicationStatus.PENDING:
            return False
        
        if obj.job.status != JobStatus.OPEN:
            return False
        
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=obj.worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        return not has_active_assignment
