# apps/analytics/serializers/worker_analytics_serializer.py

from rest_framework import serializers


class WorkerOverviewStatsSerializer(serializers.Serializer):
    """
    Serializer for worker's overview statistics.
    """
    total_applications = serializers.IntegerField()
    accepted_applications = serializers.IntegerField()
    acceptance_rate = serializers.DecimalField(max_digits=5, decimal_places=1)


class WorkerJobStatsSerializer(serializers.Serializer):
    """
    Serializer for worker's job statistics.
    """
    total = serializers.IntegerField()
    active = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class WorkerEarningsStatsSerializer(serializers.Serializer):
    """
    Serializer for worker's earnings statistics.
    """
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_per_job = serializers.DecimalField(max_digits=10, decimal_places=2)


class WorkerPerformanceStatsSerializer(serializers.Serializer):
    """
    Serializer for worker's performance statistics.
    """
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_reviews = serializers.IntegerField()
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=1)


class WorkerAnalyticsSerializer(serializers.Serializer):
    """
    Main serializer for worker analytics dashboard.
    Combines all worker analytics into one response.
    """
    overview = WorkerOverviewStatsSerializer()
    jobs = WorkerJobStatsSerializer()
    earnings = WorkerEarningsStatsSerializer()
    performance = WorkerPerformanceStatsSerializer()
    
    # Optional fields
    recent_jobs = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    rating_distribution = serializers.DictField(
        child=serializers.IntegerField(),
        required=False
    )


class WorkerJobDetailSerializer(serializers.Serializer):
    """
    Serializer for detailed job analytics for a worker.
    """
    job_id = serializers.IntegerField()
    title = serializers.CharField()
    client_name = serializers.CharField()
    budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    assigned_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField(required=False, allow_null=True)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False, allow_null=True)


class WorkerEarningDetailSerializer(serializers.Serializer):
    """
    Serializer for detailed earning analytics for a worker.
    """
    period = serializers.CharField()  # e.g., "2026-09", "Q3 2026"
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    jobs_completed = serializers.IntegerField()
    average_per_job = serializers.DecimalField(max_digits=10, decimal_places=2)
