# infrastructure/middleware/logging_middleware.py
import logging
import time
import json
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware to log all incoming requests and response times.
    """
    
    # Skip logging for these paths (to avoid clutter)
    SKIP_PATHS = [
        '/admin/',
        '/static/',
        '/media/',
        '/favicon.ico',
        '/api/auth/refresh/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip logging for certain paths
        if self.should_skip(request):
            return self.get_response(request)
        
        # Start timer
        start_time = time.time()
        
        # Get request details
        request_id = getattr(request, 'request_id', 'N/A')
        client_ip = self.get_client_ip(request)
        user_info = self.get_user_info(request)
        request_data = self.get_request_data(request)
        
        # Log request
        logger.info(
            f"[{request_id}] Request: {request.method} {request.path} "
            f"from {client_ip} - User: {user_info}"
        )
        
        # Process request
        try:
            response = self.get_response(request)
            
            # Calculate duration
            duration = (time.time() - start_time) * 1000  # milliseconds
            
            # Log response
            self.log_response(request, response, duration, request_id)
            
            return response
            
        except Exception as e:
            # Log error
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] Request failed: {request.method} {request.path} "
                f"Error: {str(e)} Duration: {duration:.2f}ms"
            )
            raise
    
    def should_skip(self, request):
        """Check if logging should be skipped for this request."""
        path = request.path
        return any(path.startswith(skip_path) for skip_path in self.SKIP_PATHS)
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_user_info(self, request):
        """Get user information for logging."""
        if hasattr(request, 'user') and request.user.is_authenticated:
            return f"{request.user.email} (ID: {request.user.id})"
        return 'Anonymous'
    
    def get_request_data(self, request):
        """Get request data for logging (sanitized)."""
        data = {
            'method': request.method,
            'path': request.path,
            'query_params': request.GET.dict(),
        }
        return data
    
    def log_response(self, request, response, duration, request_id):
        """Log response details."""
        # Determine log level based on status code
        if response.status_code >= 500:
            level = logging.ERROR
        elif response.status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO
        
        # Build log message
        message = (
            f"[{request_id}] Response: {request.method} {request.path} "
            f"Status: {response.status_code} Duration: {duration:.2f}ms"
        )
        
        if response.status_code >= 400:
            message += f" Error: {response.reason_phrase}"
        
        logger.log(level, message)
