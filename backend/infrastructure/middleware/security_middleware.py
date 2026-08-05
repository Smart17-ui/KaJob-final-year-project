# infrastructure/middleware/security_middleware.py
from django.conf import settings
from django.http import HttpResponse


class SecurityHeadersMiddleware:
    """
    Middleware to add security headers to responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        self.add_security_headers(response)
        
        return response
    
    def add_security_headers(self, response):
        """Add all security headers to the response."""
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Prevent XSS attacks
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions policy
        response['Permissions-Policy'] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=()"
        )
        
        # Strict-Transport-Security (HSTS) - only in production
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = (
                "max-age=31536000; "
                "includeSubDomains; "
                "preload"
            )
        
        # Content Security Policy (CSP) - optional, can be customized
        # response['Content-Security-Policy'] = (
        #     "default-src 'self'; "
        #     "img-src 'self' data:; "
        #     "style-src 'self' 'unsafe-inline'; "
        #     "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        #     "font-src 'self'; "
        #     "connect-src 'self'"
        # )
