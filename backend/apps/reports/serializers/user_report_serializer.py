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
    role = serializers.CharField()


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
# CREATE REPORT (job-specific OR general)
# ============================================

class CreateReportSerializer(serializers.Serializer):
    """
    Supports two forms:

    1. Job-specific complaint:
         { "job_id": 4, "category": "FRAUD", "description": "..." }

    2. General complaint (no job):
         { "category": "OTHER", "description": "..." }
    """
    job_id = serializers.IntegerField(required=False, allow_null=True)
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
        if value is None:
            return None

        user = self.context['request'].user

        try:
            job = Job.objects.get(id=value)
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job does not exist.")

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
        job_id = data.get('job_id')

        if job_id is not None:
            # Job-specific: prevent duplicate reports on the same job
            if Report.objects.filter(
                job_id=job_id, reporter=user
            ).exists():
                raise serializers.ValidationError(
                    "You have already reported an issue on this job."
                )
        else:
            # General complaint: prevent duplicate general reports
            # of the same category
            if Report.objects.filter(
                reporter=user,
                job__isnull=True,
                category=data['category'],
                status__in=[
                    ReportStatus.PENDING,
                    ReportStatus.UNDER_INVESTIGATION,
                ],
            ).exists():
                raise serializers.ValidationError(
                    "You already have an open general report in "
                    "this category."
                )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        job_id = validated_data.get('job_id')

        # ── General complaint ───────────────────────────
        if job_id is None:
            return Report.objects.create(
                job=None,
                reporter=user,
                reported_user=None,
                category=validated_data['category'],
                description=validated_data['description'],
                status=ReportStatus.PENDING,
            )

        # ── Job-specific ────────────────────────────────
        job = Job.objects.get(id=job_id)

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

        return Report.objects.create(
            job=job,
            reporter=user,
            reported_user=reported_user,
            category=validated_data['category'],
            description=validated_data['description'],
            status=ReportStatus.PENDING,
        )


# ============================================
# MY REPORT — list
# ============================================

class MyReportListSerializer(serializers.ModelSerializer):
    job_id = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    reported_user_name = serializers.SerializerMethodField()
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

    def get_job_id(self, obj):
        return obj.job_id

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None

    def get_reported_user_name(self, obj):
        return obj.reported_user.full_name if obj.reported_user else None

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)


# ============================================
# MY REPORT — detail
# ============================================

class MyReportDetailSerializer(serializers.ModelSerializer):
    job_id = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
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

    def get_job_id(self, obj):
        return obj.job_id

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None

    def get_reported_user(self, obj):
        if not obj.reported_user:
            return None
        return {
            'id': obj.reported_user.id,
            'full_name': obj.reported_user.full_name,
        }

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)
