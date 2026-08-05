# apps/jobs/serializers/job_assignment_serializer.py
from rest_framework import serializers
from apps.jobs.models import JobAssignment
from apps.common.constants import AssignmentStatus


class JobAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for job assignment data.
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
        ]
        read_only_fields = [
            'id',
            'assigned_at',
            'completed_at',
            'cancelled_at',
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
