# apps/admin_panel/serializers/dashboard_serializer.py

from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_workers = serializers.IntegerField()
    total_clients = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    open_jobs = serializers.IntegerField()
    completed_jobs = serializers.IntegerField()
    total_reviews = serializers.IntegerField()
    avg_rating = serializers.FloatField()
    pending_verifications = serializers.IntegerField()


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user = serializers.CharField()
    user_id = serializers.IntegerField(allow_null=True)
    action = serializers.CharField()
    entity_type = serializers.CharField()
    entity_id = serializers.IntegerField(allow_null=True)
    details = serializers.DictField()
    created_at = serializers.CharField()
    time_ago = serializers.CharField()


class ActivityChartSerializer(serializers.Serializer):
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.DictField()
