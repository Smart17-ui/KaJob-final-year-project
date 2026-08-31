# apps/notifications/views/notification_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.notifications.services import NotificationService
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationPreferenceSerializer,
    UnreadCountSerializer,
)
from apps.common.permissions import IsActiveUser


notification_service = NotificationService()


class NotificationListView(APIView):
    """
    GET /api/notifications/
    Get all notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        limit = request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        
        notifications = notification_service.get_user_notifications(request.user.id, limit)
        
        return Response({
            'count': len(notifications),
            'results': NotificationListSerializer(notifications, many=True).data,
        }, status=status.HTTP_200_OK)


class NotificationDetailView(APIView):
    """
    GET /api/notifications/{id}/
    Get a specific notification.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id, recipient=request.user)
        return Response({
            'notification': NotificationSerializer(notification).data,
        }, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    POST /api/notifications/{id}/read/
    Mark a notification as read.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request, notification_id):
        result = notification_service.mark_as_read(notification_id, request.user.id)
        
        if result:
            return Response({
                'message': 'Notification marked as read.',
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Notification not found.',
            }, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/mark-all-read/
    Mark all notifications as read for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        count = notification_service.mark_all_as_read(request.user.id)
        
        return Response({
            'message': f'{count} notifications marked as read.',
            'count': count,
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Get unread notification count for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        count = notification_service.get_unread_count(request.user.id)
        
        return Response({
            'count': count,
        }, status=status.HTTP_200_OK)


class NotificationDeleteAllView(APIView):
    """
    DELETE /api/notifications/delete-all/
    Delete all notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def delete(self, request):
        count = notification_service.delete_all(request.user.id)
        
        return Response({
            'message': f'{count} notifications deleted.',
            'count': count,
        }, status=status.HTTP_200_OK)


class NotificationPreferenceView(APIView):
    """
    GET /api/notifications/preferences/
    Get notification preferences for the authenticated user.
    
    PUT /api/notifications/preferences/
    Update notification preferences for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        preferences = notification_service.get_preferences(request.user.id)
        return Response(preferences, status=status.HTTP_200_OK)
    
    def put(self, request):
        preferences = notification_service.update_preferences(
            request.user.id,
            request.data
        )
        return Response(preferences, status=status.HTTP_200_OK)
