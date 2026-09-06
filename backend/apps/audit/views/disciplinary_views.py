# apps/audit/views/disciplinary_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.audit.services import DisciplinaryService
from apps.audit.serializers import (
    DisciplinaryActionSerializer,
    DisciplinaryActionCreateSerializer,
    DisciplinaryActionListSerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
disciplinary_service = DisciplinaryService()


class DisciplinaryCreateView(APIView):
    """
    POST /api/audit/disciplinary/create/
    Create a new disciplinary action (Admin only).
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
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class DisciplinaryActionListView(APIView):
    """
    GET /api/audit/disciplinary/actions/
    Get all disciplinary actions (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        actions = DisciplinaryAction.objects.all().order_by('-performed_at')
        return Response({
            'count': len(actions),
            'results': DisciplinaryActionListSerializer(actions, many=True).data,
        }, status=status.HTTP_200_OK)


class DisciplinaryActionDetailView(APIView):
    """
    GET /api/audit/disciplinary/actions/{id}/
    Get a specific disciplinary action (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, action_id):
        action = get_object_or_404(DisciplinaryAction, id=action_id)
        return Response({
            'action': DisciplinaryActionSerializer(action).data,
        }, status=status.HTTP_200_OK)


class DisciplinaryUserActionsView(APIView):
    """
    GET /api/audit/disciplinary/users/{user_id}/actions/
    Get all disciplinary actions for a user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, user_id):
        actions = disciplinary_service.get_user_actions(user_id)
        return Response({
            'count': len(actions),
            'results': DisciplinaryActionListSerializer(actions, many=True).data,
        }, status=status.HTTP_200_OK)
    
