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

    Reads/caches request.body BEFORE the DRF view runs, so
    request.data in the view still works.
    """

    SKIP_PATHS = [
        '/api/auth/login/',
        '/api/auth/refresh/',
        '/admin/',
        '/static/',
        '/media/',
        '/favicon.ico',
    ]

    LOG_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

    SENSITIVE_FIELDS = [
        'password', 'old_password', 'new_password', 'token',
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        method = request.method

        skip = any(
            path.startswith(skip_path)
            for skip_path in self.SKIP_PATHS
        )
        if method not in self.LOG_METHODS:
            skip = True

        # Cache the body BEFORE get_response() runs
        cached_body = b''
        if not skip:
            try:
                if not hasattr(request, '_body'):
                    request._body = request.body
                cached_body = request._body or b''
            except Exception:
                cached_body = b''

        # Run the actual view
        response = self.get_response(request)

        # Log after the view
        if (
            not skip
            and hasattr(request, 'user')
            and request.user.is_authenticated
        ):
            self.log_request(request, response, cached_body)

        return response

    def _parse_body(self, raw_body: bytes):
        """Sanitized JSON parse of the cached body."""
        if not raw_body:
            return None
        try:
            parsed = json.loads(raw_body)
        except (json.JSONDecodeError, UnicodeDecodeError, TypeError):
            return str(raw_body)[:100] + '...'

        if isinstance(parsed, dict):
            for field in self.SENSITIVE_FIELDS:
                if field in parsed:
                    parsed[field] = '***'
        return parsed

    def log_request(self, request, response, raw_body: bytes):
        """Log the request to the audit log."""
        try:
            request_body = self._parse_body(raw_body)

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
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
