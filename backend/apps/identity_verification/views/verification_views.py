# apps/identity_verification/views/verification_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.identity_verification.services import VerificationService
from apps.identity_verification.serializers import (
    SubmitVerificationSerializer,
    VerificationStatusSerializer,
)
from apps.common.permissions import IsActiveUser  # ✅ Using existing permission
from apps.common.exceptions import BusinessRuleViolation


# Service instance
verification_service = VerificationService()


class SubmitVerificationView(APIView):
    """
    Submit identity verification documents.
    Only authenticated users can submit.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        serializer = SubmitVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = verification_service.submit_verification(
                request.user,
                serializer.validated_data
            )
            
            return Response({
                'message': result['message'],
                'verification_id': result['verification'].id,
                'status': result['verification'].verification_status,
                'documents': len(result['documents']),
            }, status=status.HTTP_201_CREATED)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


class VerificationStatusView(APIView):
    """
    Get current verification status for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        result = verification_service.get_verification_status(request.user)
        serializer = VerificationStatusSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VerificationHistoryView(APIView):
    """
    Get verification history for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        history = verification_service.get_verification_history(request.user)
        return Response({
            'count': len(history),
            'results': history
        }, status=status.HTTP_200_OK)
