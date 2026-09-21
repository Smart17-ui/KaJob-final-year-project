# apps/notifications/views/notification_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.notifications.models import Notification
from apps.notifications.services import NotificationService
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationPreferenceSerializer,
    UnreadCountSerializer,
)
from apps.common.permissions import IsActiveUser


notification_service = NotificationService()


def _current_role(request):
    """
    Extract the user's currently-selected role from the JWT.

    The login response includes a `current_role` claim. If it's absent
    (older tokens, admin users, etc.) we fall back to None — which
    means "show everything".
    """
    try:
        # DRF wraps the JWT in request.auth (a Token object)
        token = request.auth
        if token is None:
            return None
        role = token.get('current_role')
        if role in ('CLIENT', 'WORKER', 'ADMIN'):
            return role
    except Exception:
        pass
    return None


class NotificationListView(APIView):
    """
    GET /api/notifications/
    Get all notifications for the authenticated user,
    filtered by the user's currently-selected role.

    Optional query param: ?role=CLIENT|WORKER|ADMIN to override.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        limit = request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50

        role = request.query_params.get('role') or _current_role(request)

        notifications = notification_service.get_user_notifications(
            request.user.id, limit, role
        )

        return Response({
            'count': len(notifications),
            'role': role,
            'results': NotificationListSerializer(notifications, many=True).data,
        }, status=status.HTTP_200_OK)


class NotificationDetailView(APIView):
    """
    GET /api/notifications/{id}/
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request, notification_id):
        notification = get_object_or_404(
            Notification, id=notification_id, recipient=request.user
        )
        return Response({
            'notification': NotificationSerializer(notification).data,
        }, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    POST /api/notifications/{id}/read/
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request, notification_id):
        result = notification_service.mark_as_read(
            notification_id, request.user.id
        )
        if result:
            return Response(
                {'message': 'Notification marked as read.'},
                status=status.HTTP_200_OK,
            )
        return Response(
            {'error': 'Notification not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/mark-all-read/
    Mark all notifications as read, scoped to the current role.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request):
        role = request.query_params.get('role') or _current_role(request)
        count = notification_service.mark_all_as_read(request.user.id, role)

        return Response({
            'message': f'{count} notifications marked as read.',
            'count': count,
            'role': role,
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Unread count, scoped to the current role.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        role = request.query_params.get('role') or _current_role(request)
        count = notification_service.get_unread_count(request.user.id, role)

        return Response({
            'count': count,
            'role': role,
        }, status=status.HTTP_200_OK)


class NotificationDeleteAllView(APIView):
    """
    DELETE /api/notifications/delete-all/
    Delete all notifications, scoped to the current role.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def delete(self, request):
        role = request.query_params.get('role') or _current_role(request)
        count = notification_service.delete_all(request.user.id, role)

        return Response({
            'message': f'{count} notifications deleted.',
            'count': count,
            'role': role,
        }, status=status.HTTP_200_OK)


class NotificationPreferenceView(APIView):
    """
    GET /api/notifications/preferences/
    PUT /api/notifications/preferences/
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        preferences = notification_service.get_preferences(request.user.id)
        return Response(preferences, status=status.HTTP_200_OK)

    def put(self, request):
        preferences = notification_service.update_preferences(
            request.user.id, request.data
        )
        return Response(preferences, status=status.HTTP_200_OK)
