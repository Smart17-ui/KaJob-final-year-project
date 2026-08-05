# infrastructure/middleware/performance_middleware.py
import time
import logging
from django.db import connection
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class PerformanceMiddleware:
    """
    Middleware to track request performance and database queries.
    """
    
    # Log slow requests exceeding this threshold (milliseconds)
    SLOW_REQUEST_THRESHOLD = 500
    
    # Skip monitoring for these paths
    SKIP_PATHS = [
        '/admin/',
        '/static/',
        '/media/',
        '/favicon.ico',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip monitoring for certain paths
        if self.should_skip(request):
            return self.get_response(request)
        
        # Start timer
        start_time = time.time()
        start_queries = len(connection.queries)
        
        # Process request
        try:
            response = self.get_response(request)
            
            # Calculate metrics
            duration = (time.time() - start_time) * 1000  # milliseconds
            query_count = len(connection.queries) - start_queries
            query_time = self.calculate_query_time(start_queries)
            
            # Log if slow
            self.log_performance(request, response, duration, query_count, query_time)
            
            # Add headers
            self.add_performance_headers(response, duration, query_count)
            
            return response
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"Performance error: {request.method} {request.path} "
                f"Duration: {duration:.2f}ms - Error: {str(e)}"
            )
            raise
    
    def should_skip(self, request):
        """Check if performance monitoring should be skipped."""
        path = request.path
        return any(path.startswith(skip_path) for skip_path in self.SKIP_PATHS)
    
    def calculate_query_time(self, start_queries):
        """Calculate total query time."""
        total_time = 0
        for query in connection.queries[start_queries:]:
            try:
                total_time += float(query.get('time', 0))
            except (ValueError, TypeError):
                pass
        return total_time
    
    def log_performance(self, request, response, duration, query_count, query_time):
        """Log performance metrics."""
        # Determine if request is slow
        is_slow = duration > self.SLOW_REQUEST_THRESHOLD
        
        # Build log message
        message = (
            f"Performance: {request.method} {request.path} "
            f"Duration: {duration:.2f}ms "
            f"Queries: {query_count} "
            f"Query Time: {query_time:.2f}ms "
            f"Status: {response.status_code}"
        )
        
        if is_slow:
            logger.warning(f"SLOW REQUEST: {message}")
        else:
            logger.debug(message)
    
    def add_performance_headers(self, response, duration, query_count):
        """Add performance headers to response."""
        response['X-Response-Time'] = f"{duration:.2f}ms"
        response['X-Query-Count'] = str(query_count)
    
    def get_cached_response(self, request):
        """Check if response is cached (optional)."""
        cache_key = f"cache_{request.path}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.debug(f"Cache hit for {request.path}")
            return cached_response
        return None
