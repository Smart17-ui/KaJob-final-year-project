# infrastructure/middleware/request_id_middleware.py
import uuid
import logging

logger = logging.getLogger(__name__)


class RequestIDMiddleware:
    """
    Middleware to add a unique request ID to every request/response.
    Useful for tracking requests across logs and debugging.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Generate or get request ID
        request_id = request.META.get('HTTP_X_REQUEST_ID')
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Store in request for later use
        request.request_id = request_id
        
        # Add to logger context (if using structured logging)
        logger.info(f"Request ID: {request_id} - {request.method} {request.path}")
        
        # Process request
        response = self.get_response(request)
        
        # Add request ID to response headers
        response['X-Request-ID'] = request_id
        
        return response
