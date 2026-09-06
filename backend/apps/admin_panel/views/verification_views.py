# apps/admin_panel/views/verification_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.admin_panel.services import AdminService
from apps.admin_panel.serializers import AdminVerificationSerializer, AdminVerificationDetailSerializer
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.identity_verification.models import IdentityVerification


admin_service = AdminService()


class AdminVerificationListView(APIView):
    """
    GET /api/admin/verifications/
    Get verifications with optional status filter (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        status_filter = request.query_params.get('status')
        verifications = admin_service.get_verifications(status_filter)
        
        return Response({
            'count': len(verifications),
            'results': AdminVerificationSerializer(verifications, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminVerificationDetailView(APIView):
    """
    GET /api/admin/verifications/{id}/
    Get verification details with documents (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, verification_id):
        try:
            verification = admin_service.get_verification_detail(verification_id)
            return Response({
                'verification': AdminVerificationDetailSerializer(verification).data,
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminVerificationApproveView(APIView):
    """
    POST /api/admin/verifications/{id}/approve/
    Approve a verification (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, verification_id):
        notes = request.data.get('notes', '')
        
        try:
            result = admin_service.approve_verification(request.user, verification_id, notes)
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminVerificationRejectView(APIView):
    """
    POST /api/admin/verifications/{id}/reject/
    Reject a verification (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, verification_id):
        reason = request.data.get('reason', 'No reason provided')
        notes = request.data.get('notes', '')
        
        if not reason:
            return Response(
                {'error': 'Reason is required for rejection.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = admin_service.reject_verification(request.user, verification_id, reason, notes)
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminVerificationStatsView(APIView):
    """
    GET /api/admin/verifications/stats/
    Get verification statistics (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        stats = admin_service.get_verification_stats()
        return Response(stats, status=status.HTTP_200_OK)


class AdminVerificationDocumentView(APIView):
    """
    GET /api/admin/verifications/{id}/documents/
    Get verification documents (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, verification_id):
        try:
            documents = admin_service.get_verification_documents(verification_id)
            verification = admin_service.get_verification_detail(verification_id)
            
            return Response({
                'verification_id': verification.id,
                'user_name': verification.user.full_name,
                'document_count': len(documents),
                'documents': documents,
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
