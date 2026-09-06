# apps/identity_verification/views/email_views.py

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.conf import settings
from django.utils import timezone

from apps.identity_verification.services import VerificationService
from apps.common.permissions import IsActiveUser

logger = logging.getLogger(__name__)


class SendEmailVerificationView(APIView):
    """
    POST /api/verification/email/send/
    Send email verification link to user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        service = VerificationService()
        result = service.send_email_verification(request.user)
        
        if result.get('status') == 'phone_not_verified':
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        if result.get('status') == 'error':
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(result, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    """
    GET /api/verification/email/verify/
    Verify email using token.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        token = request.query_params.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = VerificationService()
        result = service.verify_email_token(token)
        
        if result.get('status') == 'verified':
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailVerificationView(APIView):
    """
    POST /api/verification/email/resend/
    Resend email verification link.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        service = VerificationService()
        
        # Check if phone is verified first
        if not getattr(request.user, 'phone_verified', False):
            return Response(
                {'error': 'Please verify your phone number first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if getattr(request.user, 'email_verified', False):
            return Response(
                {'message': 'Email is already verified.'},
                status=status.HTTP_200_OK
            )
        
        # Generate new token
        import uuid
        token = str(uuid.uuid4())
        user = request.user
        user.email_verification_token = token
        user.email_verification_sent_at = timezone.now()
        user.save(update_fields=['email_verification_token', 'email_verification_sent_at'])
        
        # Send email
        try:
            from apps.notifications.services import EmailService
            email_service = EmailService()
            
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            verification_url = f"{frontend_url}/verify-email?token={token}"
            
            context = {
                'user': user,
                'full_name': user.full_name,
                'verification_url': verification_url,
                'frontend_url': frontend_url,
                'expiry_hours': 24,
            }
            
            success = email_service.send_email(
                to_email=user.email,
                subject='Verify Your Email Address',
                template_name='email_verification',
                context=context,
            )
            
            if success:
                logger.info(f"Email verification resent to {user.email}")
                return Response({
                    'status': 'email_sent',
                    'message': 'Verification email sent to your email address.',
                    'email': user.email,
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Failed to send verification email. Please try again.',
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error sending email verification: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to send verification email: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
