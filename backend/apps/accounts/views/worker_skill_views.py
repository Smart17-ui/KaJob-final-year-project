# apps/accounts/views/worker_skill_views.py

import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.accounts.models import Skill
from apps.accounts.serializers.worker_skill_serializer import (
    SkillSerializer,
    WorkerSkillSerializer,
    WorkerSkillCreateSerializer,
    WorkerSkillUpdateSerializer,
)
from apps.accounts.services.worker_skill_service import WorkerSkillService
from apps.common.permissions import IsActiveUser, IsWorker
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)
service = WorkerSkillService()


# ============================================================
# MASTER SKILL LIST (public within auth)
# ============================================================

class SkillListView(APIView):
    """
    GET /api/accounts/skills/

    Returns the full master list of skills.
    Used by the frontend to populate the "add a skill" dropdown.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        skills = Skill.objects.all().order_by('name')
        serializer = SkillSerializer(skills, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data,
        }, status=status.HTTP_200_OK)


# ============================================================
# MY SKILLS — LIST + CREATE
# ============================================================

class MySkillsView(APIView):
    """
    GET  /api/accounts/workers/me/skills/   — list my skills
    POST /api/accounts/workers/me/skills/   — add a skill
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]

    def get(self, request):
        worker_skills = service.list_my_skills(request.user)
        serializer = WorkerSkillSerializer(worker_skills, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = WorkerSkillCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            ws = service.add_skill(
                user=request.user,
                skill_id=serializer.validated_data['skill_id'],
                proficiency=serializer.validated_data.get(
                    'proficiency', 'INTERMEDIATE'
                ),
                years_experience=serializer.validated_data.get(
                    'years_experience', 0
                ),
            )
            return Response({
                'message': 'Skill added successfully.',
                'skill': WorkerSkillSerializer(ws).data,
            }, status=status.HTTP_201_CREATED)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# MY SKILL — UPDATE + DELETE
# ============================================================

class MySkillDetailView(APIView):
    """
    PUT    /api/accounts/workers/me/skills/{id}/   — update
    DELETE /api/accounts/workers/me/skills/{id}/   — remove
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]

    def put(self, request, worker_skill_id):
        serializer = WorkerSkillUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            ws = service.update_skill(
                user=request.user,
                worker_skill_id=worker_skill_id,
                proficiency=serializer.validated_data.get('proficiency'),
                years_experience=serializer.validated_data.get(
                    'years_experience'
                ),
            )
            return Response({
                'message': 'Skill updated successfully.',
                'skill': WorkerSkillSerializer(ws).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, worker_skill_id):
        try:
            result = service.remove_skill(
                user=request.user,
                worker_skill_id=worker_skill_id,
            )
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
