# apps/reports/serializers/user_report_serializer.py

from rest_framework import serializers

from apps.reports.models import Report
from apps.common.constants import (
    ReportCategory,
    ReportStatus,
    ApplicationStatus,
    AssignmentStatus,
)
from apps.jobs.models import Job, JobApplication, JobAssignment


# ============================================
# REPORTABLE JOB (for the picker dropdown)
# ============================================

class OtherPartySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    role = serializers.CharField()  # "CLIENT" or "WORKER"


class ReportableJobSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    other_party = serializers.SerializerMethodField()
    has_existing_report = serializers.SerializerMethodField()

    def get_other_party(self, obj):
        request = self.context.get('request')
        if not request:
            return None

        user = request.user
        job = obj

        # If I'm the client → other party is the assigned worker
        if job.client_id == user.id:
            assignment = job.assignments.filter(
                status__in=[
                    AssignmentStatus.ACTIVE,
                    AssignmentStatus.IN_PROGRESS,
                    AssignmentStatus.COMPLETED,
                ]
            ).select_related('worker').first()
            if not assignment:
                return None
            return {
                'id': assignment.worker.id,
                'full_name': assignment.worker.full_name,
                'role': 'WORKER',
            }

        # I'm the worker → other party is the client
        return {
            'id': job.client.id,
            'full_name': job.client.full_name,
            'role': 'CLIENT',
        }

    def get_has_existing_report(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return Report.objects.filter(
            job=obj, reporter=request.user
        ).exists()


# ============================================
# CREATE REPORT
# ============================================

class CreateReportSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=True)
    category = serializers.ChoiceField(
        choices=ReportCategory.CHOICES, required=True
    )
    description = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=20,
        max_length=2000,
    )

    def validate_job_id(self, value):
        user = self.context['request'].user

        try:
            job = Job.objects.get(id=value)
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job does not exist.")

        # Must be a participant
        is_client = (job.client_id == user.id)

        is_worker = JobApplication.objects.filter(
            job=job,
            worker=user,
            status__in=[
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.COMPLETED,
            ],
        ).exists()

        has_assignment = JobAssignment.objects.filter(
            job=job,
            worker=user,
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
            ],
        ).exists()

        if not (is_client or is_worker or has_assignment):
            raise serializers.ValidationError(
                "You were not a participant on this job."
            )

        return value

    def validate(self, data):
        user = self.context['request'].user
        job = Job.objects.get(id=data['job_id'])

        # Prevent duplicate reports on the same job
        if Report.objects.filter(job=job, reporter=user).exists():
            raise serializers.ValidationError(
                "You have already reported an issue on this job."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        job = Job.objects.get(id=validated_data['job_id'])

        # Determine the reported user (the other party)
        if job.client_id == user.id:
            assignment = job.assignments.filter(
                status__in=[
                    AssignmentStatus.ACTIVE,
                    AssignmentStatus.IN_PROGRESS,
                    AssignmentStatus.COMPLETED,
                ]
            ).first()
            if not assignment:
                raise serializers.ValidationError(
                    "No assigned worker to report on this job."
                )
            reported_user = assignment.worker
        else:
            reported_user = job.client

        report = Report.objects.create(
            job=job,
            reporter=user,
            reported_user=reported_user,
            category=validated_data['category'],
            description=validated_data['description'],
            status=ReportStatus.PENDING,
        )

        return report


# ============================================
# MY REPORT — list
# ============================================

class MyReportListSerializer(serializers.ModelSerializer):
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    reported_user_name = serializers.CharField(
        source='reported_user.full_name', read_only=True
    )
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'reference_number',
            'job_id',
            'job_title',
            'reported_user_name',
            'category',
            'category_display',
            'status',
            'status_display',
            'submitted_at',
        ]

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)


# ============================================
# MY REPORT — detail
# ============================================

class MyReportDetailSerializer(serializers.ModelSerializer):
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    reported_user = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'reference_number',
            'job_id',
            'job_title',
            'reported_user',
            'category',
            'category_display',
            'description',
            'status',
            'status_display',
            'submitted_at',
        ]

    def get_reported_user(self, obj):
        return {
            'id': obj.reported_user.id,
            'full_name': obj.reported_user.full_name,
        }

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)
