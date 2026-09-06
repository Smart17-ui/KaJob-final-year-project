# apps/analytics/views/analytics_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.analytics.services import AnalyticsService
from apps.analytics.serializers import (
    DailyStatsSerializer,
    WeeklyStatsSerializer,
    MonthlyStatsSerializer,
    TrendDataSerializer,
    SummaryStatsSerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser


analytics_service = AnalyticsService()


class AnalyticsDashboardView(APIView):
    """
    GET /api/analytics/dashboard/
    Get complete analytics dashboard data (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        summary = analytics_service.get_summary_stats()
        trend = analytics_service.get_trend_data()
        
        return Response({
            'summary': summary,
            'trend': trend,
        }, status=status.HTTP_200_OK)


class AnalyticsTrendView(APIView):
    """
    GET /api/analytics/trend/
    Get trend data for charts (Admin only).
    
    Query params:
    - days: Number of days (default: 30)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        days = min(days, 90)  # Limit to 90 days max
        
        data = analytics_service.get_trend_data(days)
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsSummaryView(APIView):
    """
    GET /api/analytics/summary/
    Get summary statistics (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        data = analytics_service.get_summary_stats()
        return Response(data, status=status.HTTP_200_OK)


class AnalyticsDailyView(APIView):
    """
    GET /api/analytics/daily/
    Get daily stats for a specific date (Admin only).
    
    Query params:
    - date: YYYY-MM-DD (default: today)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        date_str = request.query_params.get('date')
        
        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            date = None
        
        stats = analytics_service.get_daily_stats(date)
        
        if stats:
            return Response(DailyStatsSerializer(stats).data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'message': f'No stats found for {date or "today"}. Stats may not have been calculated yet.'},
                status=status.HTTP_404_NOT_FOUND
            )


class AnalyticsWeeklyView(APIView):
    """
    GET /api/analytics/weekly/
    Get weekly stats for a specific week (Admin only).
    
    Query params:
    - week: YYYY-MM-DD (first day of week, default: current week)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        week_str = request.query_params.get('week')
        
        if week_str:
            try:
                week_start = datetime.strptime(week_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            week_start = None
        
        stats = analytics_service.get_weekly_stats(week_start)
        
        if stats:
            return Response(WeeklyStatsSerializer(stats).data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'message': 'No stats found for this week.'},
                status=status.HTTP_404_NOT_FOUND
            )


class AnalyticsMonthlyView(APIView):
    """
    GET /api/analytics/monthly/
    Get monthly stats for a specific month (Admin only).
    
    Query params:
    - month: YYYY-MM (first day of month, default: current month)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        month_str = request.query_params.get('month')
        
        if month_str:
            try:
                month = datetime.strptime(month_str, '%Y-%m').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid month format. Use YYYY-MM.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            month = None
        
        stats = analytics_service.get_monthly_stats(month)
        
        if stats:
            return Response(MonthlyStatsSerializer(stats).data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'message': 'No stats found for this month.'},
                status=status.HTTP_404_NOT_FOUND
            )
