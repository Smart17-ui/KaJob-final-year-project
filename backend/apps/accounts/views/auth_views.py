# apps/accounts/views/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle

from apps.accounts.services import AuthService, TokenService
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer,
    UserSerializer,  # ✅ Import from serializers package
)
from apps.common.permissions import IsActiveUser
from apps.common.exceptions import BusinessRuleViolation


# ============================================
# SERVICE INSTANCES
# ============================================

auth_service = AuthService()


# ============================================
# REGISTER VIEW
# ============================================

class RegisterView(APIView):
    """
    User registration endpoint.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = auth_service.register_user(serializer.validated_data)
            
            return Response({
                'message': result['message'],
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens'],
            }, status=status.HTTP_201_CREATED)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


# ============================================
# LOGIN VIEW
# ============================================

class LoginView(APIView):
    """
    User login endpoint.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = auth_service.login_user(
                serializer.validated_data['email'],
                serializer.validated_data['password'],
                request=request
            )
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens'],
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_401_UNAUTHORIZED)


# ============================================
# REFRESH TOKEN VIEW
# ============================================

class RefreshTokenView(APIView):
    """
    Refresh access token endpoint.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = auth_service.refresh_token(serializer.validated_data['refresh'])
        
        if result:
            return Response({
                'access': result['access'],
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)


# ============================================
# LOGOUT VIEW
# ============================================

class LogoutView(APIView):
    """
    Logout endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        success = auth_service.logout_user(refresh_token)
        
        if success:
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid or expired refresh token'
            }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# CURRENT USER VIEW
# ============================================

class MeView(APIView):
    """
    Get current user information.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)


# ============================================
# CHANGE PASSWORD VIEW
# ============================================

class ChangePasswordView(APIView):
    """
    Change user password endpoint.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            auth_service.change_password(
                request.user,
                serializer.validated_data['old_password'],
                serializer.validated_data['new_password']
            )
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


# ============================================
# FORGOT PASSWORD VIEW
# ============================================

class ForgotPasswordView(APIView):
    """
    Forgot password endpoint.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        auth_service.forgot_password(serializer.validated_data['email'])
        
        return Response({
            'message': 'If an account exists with this email, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)


# ============================================
# RESET PASSWORD VIEW
# ============================================

class ResetPasswordView(APIView):
    """
    Reset password endpoint.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            auth_service.reset_password(
                serializer.validated_data['token'],
                serializer.validated_data['new_password']
            )
            
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


# ============================================
# VERIFY EMAIL VIEW
# ============================================

class VerifyEmailView(APIView):
    """
    Verify email endpoint.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            auth_service.verify_email(serializer.validated_data['token'])
            
            return Response({
                'message': 'Email verified successfully'
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)


# ============================================
# RESEND VERIFICATION VIEW
# ============================================

class ResendVerificationView(APIView):
    """
    Resend verification email endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            auth_service.resend_verification_email(request.user)
            
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_400_BAD_REQUEST)
