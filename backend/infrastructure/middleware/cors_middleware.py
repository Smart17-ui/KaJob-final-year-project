# infrastructure/middleware/cors_middleware.py
from django.conf import settings


class CORSMiddleware:
    """
    CORS (Cross-Origin Resource Sharing) Middleware.
    Allows frontend applications to communicate with the API.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        self.allowed_methods = getattr(settings, 'CORS_ALLOWED_METHODS', [
            'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'
        ])
        self.allowed_headers = getattr(settings, 'CORS_ALLOWED_HEADERS', [
            'accept', 'accept-encoding', 'authorization',
            'content-type', 'dnt', 'origin', 'user-agent',
            'x-csrftoken', 'x-request-id', 'x-requested-with'
        ])
        self.allow_credentials = getattr(settings, 'CORS_ALLOW_CREDENTIALS', True)
        self.max_age = getattr(settings, 'CORS_MAX_AGE', 86400)
    
    def __call__(self, request):
        # Handle preflight (OPTIONS) requests
        if request.method == 'OPTIONS':
            response = self.get_response(request)
            self.add_cors_headers(request, response)
            response.status_code = 200
            return response
        
        # Handle regular requests
        response = self.get_response(request)
        self.add_cors_headers(request, response)
        return response
    
    def add_cors_headers(self, request, response):
        """Add CORS headers to the response."""
        origin = request.META.get('HTTP_ORIGIN')
        
        # Check if origin is allowed
        if origin in self.allowed_origins or '*' in self.allowed_origins:
            # Allow specific origin or wildcard
            response['Access-Control-Allow-Origin'] = origin or '*'
            
            # Allow credentials
            if self.allow_credentials:
                response['Access-Control-Allow-Credentials'] = 'true'
            
            # For preflight requests
            if request.method == 'OPTIONS':
                response['Access-Control-Allow-Methods'] = ', '.join(self.allowed_methods)
                response['Access-Control-Allow-Headers'] = ', '.join(self.allowed_headers)
                response['Access-Control-Max-Age'] = str(self.max_age)
