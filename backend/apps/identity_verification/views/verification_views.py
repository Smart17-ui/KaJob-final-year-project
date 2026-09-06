# apps/identity_verification/views/verification_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.identity_verification.services import VerificationService
from apps.identity_verification.serializers import (
    SubmitVerificationSerializer,
    VerificationStatusSerializer,
    VerificationHistorySerializer,
)
from apps.common.permissions import IsActiveUser
from apps.common.exceptions import BusinessRuleViolation


class SubmitVerificationView(APIView):
    """
    POST /api/verification/documents/submit/
    Submit identity verification documents for admin review.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        serializer = SubmitVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = VerificationService()
        
        try:
            result = service.submit_verification(
                request.user,
                serializer.validated_data
            )
            
            return Response({
                'message': result['message'],
                'verification_id': result['verification'].id,
                'status': result['verification'].verification_status,
                'document_count': len(result['documents']),
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class VerificationStatusView(APIView):
    """
    GET /api/verification/status/
    Get current verification status for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        service = VerificationService()
        result = service.get_verification_status(request.user)
        serializer = VerificationStatusSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VerificationHistoryView(APIView):
    """
    GET /api/verification/history/
    Get verification history for the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        service = VerificationService()
        history = service.get_verification_history(request.user)
        return Response({
            'count': len(history),
            'results': history
        }, status=status.HTTP_200_OK)
