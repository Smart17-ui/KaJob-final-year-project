# infrastructure/middleware/auth_middleware.py
import logging
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from apps.accounts.models import User
from apps.common.constants import UserAccountStatus
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)


class JWTAuthenticationMiddleware:
    """
    Middleware to validate JWT tokens and attach user to request.
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = [
        '/api/auth/register/',
        '/api/auth/login/',
        '/api/auth/refresh/',
        '/api/auth/forgot-password/',
        '/api/auth/reset-password/',
        '/api/auth/verify-email/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip authentication for public paths
        if self.is_public_path(request.path):
            return self.get_response(request)
        
        # Extract and validate token
        token = self.get_token_from_request(request)
        if token:
            user = self.validate_token_and_get_user(token)
            if user:
                request.user = user
        
        # Process request
        response = self.get_response(request)
        return response
    
    def is_public_path(self, path):
        """Check if the path is public (no authentication required)."""
        return any(path.startswith(public_path) for public_path in self.PUBLIC_PATHS)
    
    def get_token_from_request(self, request):
        """Extract JWT token from Authorization header."""
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # Also check for token in query string (for WebSocket connections)
        if hasattr(request, 'GET'):
            return request.GET.get('token')
        
        return None
    
    def validate_token_and_get_user(self, token):
        """
        Validate JWT token and return user if valid.
        """
        try:
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            
            if not user_id:
                logger.warning(f"Token missing user_id: {token[:20]}...")
                return None
            
            # Get user
            try:
                user = User.objects.get(id=user_id)
                if user.account_status == UserAccountStatus.ACTIVE and not user.is_deleted:
                    return user
                else:
                    logger.warning(f"User {user_id} is not active or deleted")
                    return None
            except User.DoesNotExist:
                logger.warning(f"User {user_id} not found")
                return None
                
        except InvalidToken as e:
            logger.warning(f"Invalid token: {e}")
            return None
        except TokenError as e:
            logger.warning(f"Token error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error validating token: {e}")
            return None
