# apps/admin_panel/views/user_management_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.admin_panel.services import AdminService
from apps.admin_panel.serializers import AdminUserSerializer, AdminUserListSerializer
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


admin_service = AdminService()


class AdminUserListView(APIView):
    """
    GET /api/users/
    Get all users with optional filters (Admin only).

    Reads `status` and `role` query params.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request):
        filters = {
            'role': request.query_params.get('role'),
            'status': request.query_params.get('status'),
            'is_verified': request.query_params.get('is_verified'),
            'search': request.query_params.get('search'),
        }
        # Remove empty/None filters
        filters = {k: v for k, v in filters.items() if v is not None and v != ''}

        users = admin_service.get_all_users(filters)

        return Response({
            'count': len(users),
            'results': AdminUserListSerializer(users, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """
    GET /api/users/{id}/
    Get user details (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, user_id):
        try:
            user = admin_service.get_user_detail(user_id)
            return Response({
                'user': AdminUserSerializer(user).data,
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminUserSuspendView(APIView):
    """
    POST /api/users/{id}/suspend/
    Suspend a user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def post(self, request, user_id):
        reason = request.data.get('reason', 'No reason provided')

        try:
            result = admin_service.suspend_user(request.user, user_id, reason)
            return Response({
                'user': AdminUserSerializer(result['user']).data,
                'message': result['message'],
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminUserActivateView(APIView):
    """
    POST /api/users/{id}/activate/
    Activate a suspended user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def post(self, request, user_id):
        try:
            result = admin_service.activate_user(request.user, user_id)
            return Response({
                'user': AdminUserSerializer(result['user']).data,
                'message': result['message'],
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
