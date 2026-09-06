# apps/analytics/serializers/analytics_serializer.py

from rest_framework import serializers
from apps.analytics.models import DailyStats, WeeklyStats, MonthlyStats, UserActivity


class DailyStatsSerializer(serializers.ModelSerializer):
    """Serializer for DailyStats model."""
    
    class Meta:
        model = DailyStats
        fields = '__all__'


class WeeklyStatsSerializer(serializers.ModelSerializer):
    """Serializer for WeeklyStats model."""
    
    class Meta:
        model = WeeklyStats
        fields = '__all__'


class MonthlyStatsSerializer(serializers.ModelSerializer):
    """Serializer for MonthlyStats model."""
    
    class Meta:
        model = MonthlyStats
        fields = '__all__'


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model."""
    
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserActivity
        fields = '__all__'
    
    def getUser_name(self, obj):
        return obj.user.full_name if obj.user else None


class TrendDataSerializer(serializers.Serializer):
    """Serializer for trend data."""
    
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.DictField()


class SummaryStatsSerializer(serializers.Serializer):
    """Serializer for summary statistics."""
    
    today = serializers.DictField()
    week = serializers.DictField()
    month = serializers.DictField()
