# infrastructure/middleware/audit_middleware.py
import json
import logging
from django.utils import timezone
from django.conf import settings
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)


class AuditMiddleware:
    """
    Middleware to log all API requests for audit purposes.
    """
    
    # Skip logging for these paths (to avoid clutter)
    SKIP_PATHS = [
        '/api/auth/login/',
        '/api/auth/refresh/',
        '/admin/',
        '/static/',
        '/media/',
        '/favicon.ico',
    ]
    
    # Only log these methods
    LOG_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Get request details
        path = request.path
        method = request.method
        
        # Skip logging for certain paths
        skip = any(path.startswith(skip_path) for skip_path in self.SKIP_PATHS)
        
        # Skip logging for GET requests (unless specific)
        if method not in self.LOG_METHODS:
            skip = True
        
        # Process the request
        response = self.get_response(request)
        
        # Only log if not skipped and user is authenticated
        if not skip and hasattr(request, 'user') and request.user.is_authenticated:
            self.log_request(request, response)
        
        return response
    
    def log_request(self, request, response):
        """Log the request to the audit log."""
        try:
            # Get request body (sanitized)
            request_body = None
            if request.body:
                try:
                    request_body = json.loads(request.body)
                    # Sanitize sensitive fields
                    if isinstance(request_body, dict):
                        for sensitive_field in ['password', 'old_password', 'new_password', 'token']:
                            if sensitive_field in request_body:
                                request_body[sensitive_field] = '***'
                except (json.JSONDecodeError, UnicodeDecodeError):
                    request_body = str(request.body)[:100] + '...'
            
            # Create audit log
            AuditLog.objects.create(
                user=request.user,
                action=f"{request.method}_{request.path}",
                entity_type='API_REQUEST',
                entity_id=None,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'query_params': request.GET.dict(),
                    'request_body': request_body,
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'referer': request.META.get('HTTP_REFERER', ''),
                }
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
