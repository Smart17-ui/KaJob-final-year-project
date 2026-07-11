# apps/common/exceptions.py
from rest_framework.exceptions import APIException
from rest_framework import status


class BusinessRuleViolation(APIException):
    """
    Raised when a business rule is violated.
    
    Examples:
        - Email already exists
        - Password is too weak
        - User is not verified
        - Insufficient permissions
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Business rule violation'
    default_code = 'business_rule_violation'


class AuthenticationError(APIException):
    """
    Raised when authentication fails.
    
    Examples:
        - Invalid credentials
        - Expired token
        - Invalid token
    """
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication failed'
    default_code = 'authentication_failed'


class PermissionDenied(APIException):
    """
    Raised when user doesn't have permission to perform an action.
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Permission denied'
    default_code = 'permission_denied'


class ResourceNotFound(APIException):
    """
    Raised when a requested resource is not found.
    """
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found'
    default_code = 'resource_not_found'


class ValidationError(APIException):
    """
    Raised when data validation fails.
    """
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = 'Validation error'
    default_code = 'validation_error'


class ConflictError(APIException):
    """
    Raised when there is a conflict with the current state.
    
    Examples:
        - Duplicate entry
        - Resource already exists
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict error'
    default_code = 'conflict_error'


class RateLimitExceeded(APIException):
    """
    Raised when a rate limit is exceeded.
    """
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Rate limit exceeded'
    default_code = 'rate_limit_exceeded'


class ServiceUnavailable(APIException):
    """
    Raised when a service is temporarily unavailable.
    """
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable'
    default_code = 'service_unavailable'
