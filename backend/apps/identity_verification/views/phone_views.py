# apps/identity_verification/views/phone_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.identity_verification.services import VerificationService
from apps.common.permissions import IsActiveUser


class SendPhoneOTPView(APIView):
    """
    POST /api/verification/phone/send-otp/
    Send OTP to user's phone number via email.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        service = VerificationService()
        result = service.send_phone_otp(request.user)
        
        if result.get('status') == 'invalid_phone':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result, status=status.HTTP_200_OK)


class VerifyPhoneOTPView(APIView):
    """
    POST /api/verification/phone/verify-otp/
    Verify phone using OTP.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        otp = request.data.get('otp')
        
        if not otp:
            return Response(
                {'error': 'OTP is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = VerificationService()
        result = service.verify_phone_otp(request.user, otp)
        
        if result.get('status') == 'verified':
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
