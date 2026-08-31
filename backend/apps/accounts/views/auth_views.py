# apps/accounts/views/auth_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle

from apps.accounts.services import AuthService
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyEmailSerializer,
    UserSerializer,
    # 🆕 Import role serializers
    AddRoleSerializer,
    SwitchRoleSerializer,
    RoleResponseSerializer,
)
from apps.common.permissions import IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation


# Service instance
auth_service = AuthService()


# ============================================
# EXISTING VIEWS (Keep as-is)
# ============================================

class RegisterView(APIView):
    """
    User registration endpoint.
    Supports Role Player Pattern - one user can have multiple roles.
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


class LoginView(APIView):
    """
    User login endpoint with role selection.
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
                role=serializer.validated_data.get('role'),
                request=request
            )
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens'],
                'selected_role': result['selected_role'],
                'available_roles': result['available_roles'],
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=e.status_code if hasattr(e, 'status_code') else status.HTTP_401_UNAUTHORIZED)


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


class MeView(APIView):
    """
    Get current user information with roles.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)


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


# ============================================
# 🆕 ROLE MANAGEMENT VIEWS
# ============================================

class AddRoleView(APIView):
    """
    POST /api/auth/add-role/
    Add a new role to an existing user.
    
    ✅ NO RE-REGISTRATION NEEDED!
    ✅ Verification status carries over!
    
    Request Body:
        {
            "role": "WORKER"  # or "CLIENT" or "ADMIN"
        }
    
    Response:
        {
            "message": "WORKER role added successfully!",
            "user": {...},
            "tokens": {...},
            "is_verified": true,
            "available_roles": ["WORKER", "CLIENT"]
        }
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        serializer = AddRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role_name = serializer.validated_data['role']
        
        try:
            result = auth_service.add_role_to_user(request.user, role_name)
            
            return Response({
                'message': result['message'],
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens'],
                'is_verified': result['is_verified'],
                'available_roles': result['available_roles'],
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class SwitchRoleView(APIView):
    """
    POST /api/auth/switch-role/
    Switch between roles.
    
    Request Body:
        {
            "role": "WORKER"  # or "CLIENT" or "ADMIN"
        }
    
    Response:
        {
            "message": "Switched to WORKER role.",
            "user": {...},
            "tokens": {...},
            "current_role": "WORKER",
            "available_roles": ["WORKER", "CLIENT"]
        }
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request):
        serializer = SwitchRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role_name = serializer.validated_data['role']
        
        try:
            result = auth_service.switch_role(request.user, role_name)
            
            return Response({
                'message': f'Switched to {role_name} role.',
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens'],
                'current_role': result['current_role'],
                'available_roles': result['available_roles'],
            }, status=status.HTTP_200_OK)
            
        except BusinessRuleViolation as e:
            return Response({
                'error': str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class GetUserRolesView(APIView):
    """
    GET /api/auth/roles/
    Get all roles for the authenticated user.
    
    Response:
        {
            "roles": ["WORKER", "CLIENT"],
            "current_role": "WORKER"
        }
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        roles = auth_service.get_user_roles(request.user)
        
        # Get current role from token or use first role
        current_role = None
        if hasattr(request, 'auth') and hasattr(request.auth, 'payload'):
            current_role = request.auth.payload.get('current_role')
        
        if not current_role and roles:
            current_role = roles[0]
        
        return Response({
            'roles': roles,
            'current_role': current_role,
        }, status=status.HTTP_200_OK)
