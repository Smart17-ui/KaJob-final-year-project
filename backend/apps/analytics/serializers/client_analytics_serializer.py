# apps/analytics/serializers/client_analytics_serializer.py

from rest_framework import serializers


class ClientJobStatsSerializer(serializers.Serializer):
    """
    Serializer for client's job statistics.
    """
    total = serializers.IntegerField()
    open = serializers.IntegerField()
    assigned = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class ClientApplicationStatsSerializer(serializers.Serializer):
    """
    Serializer for client's application statistics.
    """
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    accepted = serializers.IntegerField()
    rejected = serializers.IntegerField()


class ClientSpendingStatsSerializer(serializers.Serializer):
    """
    Serializer for client's spending statistics.
    """
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    completed = serializers.DecimalField(max_digits=10, decimal_places=2)
    in_progress = serializers.DecimalField(max_digits=10, decimal_places=2)


class ClientWorkerStatsSerializer(serializers.Serializer):
    """
    Serializer for client's worker statistics.
    """
    total_hired = serializers.IntegerField()
    active = serializers.IntegerField()
    completed = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_reviews = serializers.IntegerField()


class ClientAnalyticsSerializer(serializers.Serializer):
    """
    Main serializer for client analytics dashboard.
    Combines all client analytics into one response.
    """
    jobs = ClientJobStatsSerializer()
    applications = ClientApplicationStatsSerializer()
    spending = ClientSpendingStatsSerializer()
    workers = ClientWorkerStatsSerializer()
    
    # Optional fields
    top_categories = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    recent_activity = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )


class ClientJobDetailSerializer(serializers.Serializer):
    """
    Serializer for detailed job analytics for a client.
    """
    job_id = serializers.IntegerField()
    title = serializers.CharField()
    status = serializers.CharField()
    budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    applications_count = serializers.IntegerField()
    posted_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField(required=False, allow_null=True)


class ClientApplicationDetailSerializer(serializers.Serializer):
    """
    Serializer for detailed application analytics for a client.
    """
    application_id = serializers.IntegerField()
    job_title = serializers.CharField()
    worker_name = serializers.CharField()
    worker_rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False, allow_null=True)
    status = serializers.CharField()
    applied_at = serializers.DateTimeField()
