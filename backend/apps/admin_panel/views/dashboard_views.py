# apps/admin_panel/views/dashboard_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.admin_panel.services import AdminService
from apps.analytics.services import AnalyticsService
from apps.common.permissions import IsAdmin, IsActiveUser


admin_service = AdminService()
analytics_service = AnalyticsService()


class AdminDashboardView(APIView):
    """
    GET /api/admin/dashboard/
    Get admin dashboard data (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        summary = analytics_service.get_summary_stats()
        trend = analytics_service.get_trend_data(30)
        activity = admin_service.get_recent_activity(10)
        
        return Response({
            'summary': summary,
            'trend': trend,
            'recent_activity': activity,
        }, status=status.HTTP_200_OK)


class AdminRecentActivityView(APIView):
    """
    GET /api/admin/activity/recent/
    Get recent platform activity (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        limit = request.query_params.get('limit', 20)
        try:
            limit = int(limit)
        except ValueError:
            limit = 20
        
        activity = admin_service.get_recent_activity(limit)
        return Response({
            'count': len(activity),
            'results': activity,
        }, status=status.HTTP_200_OK)


class AdminActivityChartView(APIView):
    """
    GET /api/admin/activity/chart/
    Get activity chart data (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        data = analytics_service.get_trend_data(days)
        return Response(data, status=status.HTTP_200_OK)
