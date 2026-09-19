# apps/identity_verification/views/admin_verification_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.identity_verification.services import AdminVerificationService
from apps.identity_verification.serializers import (
    AdminVerificationListSerializer,
    AdminVerificationDetailSerializer,
    AdminReviewSerializer,
)
from apps.common.permissions import IsAdmin
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.constants import VerificationStatus


# Service instance
admin_verification_service = AdminVerificationService()


class AdminPendingVerificationsView(APIView):
    """
    List verifications for admin review.

    Query param:
        ?status=PENDING | UNDER_REVIEW | VERIFIED | REJECTED | EXPIRED
    If omitted, defaults to the review queue (PENDING + UNDER_REVIEW).
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status')

        if status_filter:
            valid = [s[0] for s in VerificationStatus.CHOICES]
            if status_filter not in valid:
                return Response(
                    {'error': f'Invalid status. Must be one of: {valid}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            results = admin_verification_service.get_verifications_by_status(
                request.user, status_filter
            )
        else:
            results = admin_verification_service.get_pending_verifications(
                request.user
            )

        serializer = AdminVerificationListSerializer(results, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data,
        }, status=status.HTTP_200_OK)


class AdminVerificationDetailView(APIView):
    """
    Get detailed verification information for admin review.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, verification_id):
        try:
            detail = admin_verification_service.get_verification_detail(
                request.user,
                verification_id
            )
            serializer = AdminVerificationDetailSerializer(detail)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ResourceNotFound as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_404_NOT_FOUND)


class AdminReviewVerificationView(APIView):
    """
    Admin approve or reject a verification request.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, verification_id):
        serializer = AdminReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']

        try:
            if action == 'approve':
                result = admin_verification_service.approve_verification(
                    request.user,
                    verification_id,
                    notes=serializer.validated_data.get('notes')
                )
            else:  # reject
                result = admin_verification_service.reject_verification(
                    request.user,
                    verification_id,
                    reason=serializer.validated_data.get('reason'),
                    notes=serializer.validated_data.get('notes')
                )

            return Response({
                'message': result['message'],
                'verification_id': result['verification'].id,
                'status': result['verification'].verification_status,
            }, status=status.HTTP_200_OK)

        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


class AdminVerificationStatsView(APIView):
    """
    Get verification statistics for admin dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        stats = admin_verification_service.get_statistics(request.user)
        return Response(stats, status=status.HTTP_200_OK)
