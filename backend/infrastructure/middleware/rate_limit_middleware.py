# infrastructure/middleware/rate_limit_middleware.py
import time
import math
import logging
import random
from collections import defaultdict
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """
    Advanced rate limiting middleware with Retry-After and fallback calculation.
    
    Features:
    - Per-endpoint rate limits
    - Retry-After header with calculated wait time
    - Exponential backoff with jitter
    - Fallback rate limiting (smooth degradation)
    - Automatic cleanup of old entries
    - Different limits for different user types
    - Cache support (Redis) for distributed rate limiting
    """
    
    # Rate limits: {path_prefix: (max_requests, time_window_seconds)}
    RATE_LIMITS = {
        # Authentication endpoints (stricter)
        '/api/auth/register/': (5, 3600),       # 5 requests per hour
        '/api/auth/login/': (10, 60),           # 10 requests per minute
        '/api/auth/refresh/': (20, 60),         # 20 requests per minute
        '/api/auth/forgot-password/': (3, 3600), # 3 requests per hour
        '/api/auth/reset-password/': (5, 3600),  # 5 requests per hour
        '/api/auth/verify-email/': (5, 3600),    # 5 requests per hour
        '/api/auth/resend-verification/': (3, 3600), # 3 requests per hour
        
        # Job endpoints
        '/api/jobs/': (50, 60),                  # 50 requests per minute
        '/api/jobs/create/': (10, 60),           # 10 requests per minute
        '/api/jobs/apply/': (10, 60),            # 10 requests per minute
        '/api/jobs/search/': (30, 60),           # 30 requests per minute
        
        # Report endpoints
        '/api/reports/': (20, 60),               # 20 requests per minute
        '/api/reports/create/': (5, 60),         # 5 requests per minute
        
        # Admin endpoints (stricter)
        '/api/admin/': (20, 60),                 # 20 requests per minute
        '/api/admin/users/': (10, 60),           # 10 requests per minute
        '/api/admin/reports/': (10, 60),         # 10 requests per minute
        '/api/admin/stats/': (5, 60),            # 5 requests per minute
        
        # Matching endpoints
        '/api/matching/': (20, 60),              # 20 requests per minute
        '/api/matching/nearby/': (20, 60),       # 20 requests per minute
        
        # Review endpoints
        '/api/reviews/': (30, 60),               # 30 requests per minute
        '/api/reviews/create/': (10, 60),        # 10 requests per minute
    }
    
    # Fallback rate limit (when Redis/DB is down)
    FALLBACK_RATE_LIMITS = {
        '/api/auth/login/': (3, 60),             # Stricter fallback
        '/api/auth/register/': (2, 3600),
        '/api/admin/': (5, 60),
        'default': (10, 60),                     # Default fallback
    }
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.requests = defaultdict(list)  # {identifier: [timestamps]}
        self.is_cache_available = True
    
    def __call__(self, request):
        # Check if rate limiting should apply
        if not self.should_rate_limit(request):
            return self.get_response(request)
        
        # Determine which rate limit to use
        rate_limit = self.get_rate_limit(request)
        if not rate_limit:
            return self.get_response(request)
        
        max_requests, time_window = rate_limit
        
        # Get client identifier
        identifier = self.get_client_identifier(request)
        
        # Check if we should use fallback
        if not self.is_cache_available:
            max_requests, time_window = self.get_fallback_rate_limit(request)
        
        # Try using cache (Redis) for distributed rate limiting
        if self.is_cache_available:
            result = self.check_rate_limit_with_cache(identifier, max_requests, time_window)
            if result and result.get('limit_exceeded'):
                return self.create_rate_limit_response(
                    request, max_requests, time_window, identifier, result
                )
            if result and result.get('count') is not None:
                # Request allowed, increment count
                self.increment_cache_counter(identifier, time_window)
        
        # Clean old requests (in-memory fallback)
        self.clean_old_requests(identifier, time_window)
        
        # Check if limit exceeded (in-memory)
        current_count = len(self.requests[identifier])
        if current_count >= max_requests:
            return self.create_rate_limit_response(request, max_requests, time_window, identifier, {
                'count': current_count,
                'limit_exceeded': True
            })
        
        # Add current request
        self.requests[identifier].append(time.time())
        
        return self.get_response(request)
    
    def should_rate_limit(self, request):
        """Determine if rate limiting should apply to this request."""
        # Only rate limit API endpoints
        if request.path.startswith('/api/'):
            return True
        
        # Don't rate limit admin UI
        if request.path.startswith('/admin/'):
            return False
        
        # Don't rate limit static/media
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return False
        
        return False
    
    def get_rate_limit(self, request):
        """Get the rate limit for a given request."""
        path = request.path
        
        # Check for specific path matches
        for prefix, limit in self.RATE_LIMITS.items():
            if path.startswith(prefix):
                return limit
        
        # Default rate limit for any API endpoint not explicitly defined
        if path.startswith('/api/'):
            return (30, 60)  # 30 requests per minute
        
        return None
    
    def get_fallback_rate_limit(self, request):
        """Get fallback rate limit when primary storage is unavailable."""
        path = request.path
        for prefix, limit in self.FALLBACK_RATE_LIMITS.items():
            if path.startswith(prefix):
                return limit
        
        return self.FALLBACK_RATE_LIMITS.get('default', (10, 60))
    
    def get_client_identifier(self, request):
        """Get a unique identifier for the client."""
        # For authenticated users, use user ID
        if hasattr(request, 'user') and request.user.is_authenticated:
            return f"user_{request.user.id}"
        
        # For anonymous users, use IP address
        ip = self.get_client_ip(request)
        return f"ip_{ip}"
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_rate_limit_with_cache(self, identifier, max_requests, time_window):
        """
        Check rate limit using cache (Redis).
        Returns dict with count and if limit exceeded.
        """
        try:
            cache_key = f"rate_limit_{identifier}"
            now = time.time()
            
            # Get current count from cache
            cached_data = cache.get(cache_key)
            if cached_data:
                count, timestamp = cached_data
                # Check if within time window
                if now - timestamp < time_window:
                    count += 1
                else:
                    count = 1
                    timestamp = now
            else:
                count = 1
                timestamp = now
            
            # Check if limit exceeded
            limit_exceeded = count > max_requests
            
            # Store in cache with expiry
            cache.set(cache_key, (count, timestamp), time_window + 60)
            
            return {
                'count': count,
                'limit_exceeded': limit_exceeded
            }
            
        except Exception as e:
            logger.warning(f"Cache error in rate limiting: {e}")
            self.is_cache_available = False
            return None
    
    def increment_cache_counter(self, identifier, time_window):
        """Increment the cache counter."""
        try:
            cache_key = f"rate_limit_{identifier}"
            cached_data = cache.get(cache_key)
            if cached_data:
                count, timestamp = cached_data
                cache.set(cache_key, (count + 1, timestamp), time_window + 60)
        except Exception as e:
            logger.warning(f"Failed to increment cache counter: {e}")
    
    def clean_old_requests(self, identifier, time_window):
        """Remove requests older than the time window."""
        now = time.time()
        window_start = now - time_window
        self.requests[identifier] = [
            timestamp for timestamp in self.requests[identifier]
            if timestamp > window_start
        ]
    
    def create_rate_limit_response(self, request, max_requests, time_window, identifier, result=None):
        """Create a rate limit exceeded response with Retry-After header."""
        count = result.get('count', len(self.requests[identifier])) if result else len(self.requests[identifier])
        
        # Calculate wait time
        wait_time = self.calculate_wait_time(identifier, time_window)
        
        # Log the rate limit violation
        logger.warning(
            f"Rate limit exceeded for {identifier} on {request.path} "
            f"({count}/{max_requests} requests in {time_window}s) "
            f"Wait time: {wait_time:.1f}s"
        )
        
        response = JsonResponse({
            'error': 'Rate limit exceeded. Please try again later.',
            'retry_after': int(wait_time),
            'max_requests': max_requests,
            'time_window': time_window,
            'remaining': max_requests - count,
        }, status=429)
        
        # Add rate limit headers
        response['Retry-After'] = str(int(wait_time))
        response['X-RateLimit-Limit'] = str(max_requests)
        response['X-RateLimit-Remaining'] = str(max_requests - count)
        response['X-RateLimit-Reset'] = str(int(time.time() + wait_time))
        
        return response
    
    def calculate_wait_time(self, identifier, time_window):
        """
        Calculate the wait time using exponential backoff with jitter.
        
        Formula: wait_time = base_wait * (2 ^ attempts) + random_jitter
        """
        # Count recent attempts
        recent_attempts = len(self.requests.get(identifier, []))
        
        # Base wait time (exponential backoff)
        base_wait = 10  # 10 seconds base
        exponential_wait = base_wait * (2 ** min(recent_attempts, 5))
        
        # Add jitter (randomness) to prevent thundering herd
        jitter = random.uniform(0, 5)
        
        # Calculate final wait time
        wait_time = exponential_wait + jitter
        
        # Cap at time_window
        wait_time = min(wait_time, time_window)
        
        # Ensure minimum wait time
        wait_time = max(wait_time, 5)
        
        return wait_time
    
    def auto_cleanup(self):
        """
        Clean up old entries to prevent memory leaks.
        Should be called periodically (e.g., via Celery beat).
        """
        now = time.time()
        for identifier in list(self.requests.keys()):
            # Remove entries older than 1 hour
            self.requests[identifier] = [
                timestamp for timestamp in self.requests[identifier]
                if timestamp > now - 3600
            ]
            if not self.requests[identifier]:
                del self.requests[identifier]
