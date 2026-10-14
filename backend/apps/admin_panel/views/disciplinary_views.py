# apps/admin_panel/views/disciplinary_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.audit.models import DisciplinaryAction
from apps.audit.services import DisciplinaryService
from apps.audit.serializers import (
    DisciplinaryActionSerializer,
    DisciplinaryActionCreateSerializer,
    DisciplinaryActionListSerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser, CanUnbanUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.utilities import paginate_request


disciplinary_service = DisciplinaryService()


class DisciplinaryCreateView(APIView):
    """
    POST /api/admin/disciplinary/create/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def post(self, request):
        serializer = DisciplinaryActionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            action = disciplinary_service.create_action(
                admin=request.user,
                target_user_id=serializer.validated_data['target_user_id'],
                action_type=serializer.validated_data['action_type'],
                reason=serializer.validated_data['reason'],
                notes=serializer.validated_data.get('notes', ''),
                expires_at=serializer.validated_data.get('expires_at'),
                related_report_id=serializer.validated_data.get('related_report_id'),
            )
            return Response({
                'message': 'Disciplinary action created successfully.',
                'action': DisciplinaryActionSerializer(action).data,
            }, status=status.HTTP_201_CREATED)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DisciplinaryActionListView(APIView):
    """
    GET /api/admin/disciplinary/actions/?action_type=BAN&user_id=5&page=1&page_size=20
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request):
        qs = DisciplinaryAction.objects.all().order_by('-performed_at')

        action_type = request.query_params.get('action_type')
        if action_type:
            qs = qs.filter(action_type=action_type)

        user_id = request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(target_user_id=user_id)

        page, size = paginate_request(request)
        total = qs.count()
        start = (page - 1) * size
        page_qs = qs[start:start + size]

        return Response({
            'count': total,
            'page': page,
            'page_size': size,
            'results': DisciplinaryActionListSerializer(page_qs, many=True).data,
        }, status=status.HTTP_200_OK)


class DisciplinaryActionDetailView(APIView):
    """
    GET /api/admin/disciplinary/actions/{id}/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, action_id):
        action = get_object_or_404(DisciplinaryAction, id=action_id)
        return Response({
            'action': DisciplinaryActionSerializer(action).data,
        }, status=status.HTTP_200_OK)


class DisciplinaryUserActionsView(APIView):
    """
    GET /api/admin/disciplinary/users/{user_id}/actions/?page=1&page_size=20
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, user_id):
        qs = DisciplinaryAction.objects.filter(
            target_user_id=user_id
        ).order_by('-performed_at')

        page, size = paginate_request(request)
        total = qs.count()
        start = (page - 1) * size
        page_qs = qs[start:start + size]

        return Response({
            'count': total,
            'page': page,
            'page_size': size,
            'results': DisciplinaryActionListSerializer(page_qs, many=True).data,
        }, status=status.HTTP_200_OK)


class DisciplinaryRevokeView(APIView):
    """
    POST /api/admin/disciplinary/actions/{id}/revoke/
    Body: { "reason": "optional explanation" }
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin, CanUnbanUser]

    def post(self, request, action_id):
        reason = request.data.get('reason', '').strip()

        try:
            unban = disciplinary_service.revoke_action(
                action_id=action_id,
                admin=request.user,
                reason=reason,
            )
            return Response({
                'message': 'Disciplinary action revoked.',
                'action': DisciplinaryActionSerializer(unban).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DisciplinaryUserStatusView(APIView):
    """
    GET /api/admin/disciplinary/users/{user_id}/status/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, user_id):
        try:
            data = disciplinary_service.get_user_status(user_id)
        except ResourceNotFound as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

        recent = data.pop('recent_actions', [])
        data['recent_actions'] = DisciplinaryActionListSerializer(recent, many=True).data
        return Response(data, status=status.HTTP_200_OK)
