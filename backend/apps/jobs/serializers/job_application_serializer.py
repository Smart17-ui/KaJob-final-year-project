# apps/jobs/serializers/job_application_serializer.py
from rest_framework import serializers
from apps.jobs.models import JobApplication
from apps.common.constants import ApplicationStatus


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for job application data.
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
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'applied_at',
            'updated_at',
        ]
    
    def get_worker_name(self, obj):
        return obj.worker.full_name if obj.worker else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_status_display(self, obj):
        return dict(ApplicationStatus.CHOICES).get(obj.status)


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
            'job_title',
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
