# apps/audit/views/audit_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.audit.services import AuditService
from apps.audit.serializers import (
    AuditLogSerializer,
    AuditLogListSerializer,
    AuditLogDetailSerializer,
    AuditStatsSerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser


# Service instance
audit_service = AuditService()


class AuditLogListView(APIView):
    """
    GET /api/audit/logs/
    Get all audit logs (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        limit = request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        
        logs = audit_service.get_recent_logs(limit)
        
        return Response({
            'count': len(logs),
            'results': AuditLogListSerializer(logs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditLogDetailView(APIView):
    """
    GET /api/audit/logs/{id}/
    Get a specific audit log entry (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, log_id):
        log = get_object_or_404(AuditLog, id=log_id)
        return Response({
            'log': AuditLogDetailSerializer(log).data,
        }, status=status.HTTP_200_OK)


class AuditUserLogsView(APIView):
    """
    GET /api/audit/users/{user_id}/logs/
    Get audit logs for a specific user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, user_id):
        limit = request.query_params.get('limit', 100)
        try:
            limit = int(limit)
        except ValueError:
            limit = 100
        
        logs = audit_service.get_user_logs(user_id, limit)
        
        return Response({
            'count': len(logs),
            'results': AuditLogListSerializer(logs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditEntityLogsView(APIView):
    """
    GET /api/audit/entities/{entity_type}/{entity_id}/
    Get audit logs for a specific entity (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, entity_type, entity_id):
        logs = audit_service.get_entity_history(entity_type, entity_id)
        
        return Response({
            'count': len(logs),
            'results': AuditLogListSerializer(logs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditStatsView(APIView):
    """
    GET /api/audit/stats/
    Get audit statistics (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        days = request.query_params.get('days', 7)
        try:
            days = int(days)
        except ValueError:
            days = 7
        
        stats = audit_service.get_stats(days)
        
        return Response(stats, status=status.HTTP_200_OK)
