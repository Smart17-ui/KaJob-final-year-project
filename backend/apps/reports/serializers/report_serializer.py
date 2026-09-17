# apps/reports/serializers/report_serializer.py

from rest_framework import serializers

from apps.reports.models import Report, Investigation
from apps.common.constants import ReportCategory, ReportStatus, AdminDecision


# ============================================
# USER (minimal)
# ============================================

class ReportUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()
    phone_number = serializers.CharField(allow_blank=True)
    account_status = serializers.CharField()
    is_verified = serializers.BooleanField()


# ============================================
# JOB (minimal)
# ============================================

class ReportJobSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    budget = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True
    )


# ============================================
# INVESTIGATION
# ============================================

class InvestigationSerializer(serializers.ModelSerializer):
    admin = ReportUserSerializer(read_only=True)
    decision_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Investigation
        fields = [
            'id', 'report', 'admin',
            'status', 'status_display',
            'decision', 'decision_display',
            'decision_notes', 'internal_notes',
            'started_at', 'completed_at',
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']

    def get_decision_display(self, obj):
        if not obj.decision:
            return None
        return dict(AdminDecision.CHOICES).get(obj.decision)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)


# ============================================
# REPORT (full)
# ============================================

class ReportSerializer(serializers.ModelSerializer):
    reporter = ReportUserSerializer(read_only=True)
    reported_user = ReportUserSerializer(read_only=True)
    job = ReportJobSerializer(read_only=True)
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'reference_number',
            'job', 'reporter', 'reported_user',
            'category', 'category_display',
            'description',
            'status', 'status_display',
            'police_report_generated', 'police_report_path',
            'submitted_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'reporter', 'reported_user',
            'status', 'police_report_generated', 'police_report_path',
            'submitted_at',
        ]

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)


# ============================================
# REPORT LIST (admin)
# ============================================

class ReportListSerializer(serializers.ModelSerializer):
    reporter = ReportUserSerializer(read_only=True)
    reported_user = ReportUserSerializer(read_only=True)
    job_id = serializers.IntegerField(source='job.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'reference_number',
            'job_id', 'job_title',
            'reporter', 'reported_user',
            'category', 'category_display',
            'status', 'status_display',
            'submitted_at',
        ]

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)


# ============================================
# REPORT DETAIL (admin)
# ============================================

class ReportDetailSerializer(serializers.ModelSerializer):
    reporter = ReportUserSerializer(read_only=True)
    reported_user = ReportUserSerializer(read_only=True)
    job = ReportJobSerializer(read_only=True)
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    investigation = InvestigationSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'reference_number',
            'job', 'reporter', 'reported_user',
            'category', 'category_display',
            'description',
            'status', 'status_display',
            'police_report_generated', 'police_report_path',
            'submitted_at',
            'investigation',
        ]

    def get_category_display(self, obj):
        return dict(ReportCategory.CHOICES).get(obj.category)

    def get_status_display(self, obj):
        return dict(ReportStatus.CHOICES).get(obj.status)
