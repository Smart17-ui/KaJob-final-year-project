# apps/common/__init__.py
from .constants import (
    # User/Account
    UserAccountStatus,
    AccountStatus,  # Alias for backward compatibility
    RoleType,
    AvailabilityStatus,
    
    # Job Related
    JobStatus,
    ApplicationStatus,
    AssignmentStatus,
    
    # Verification
    VerificationStatus,
    DocumentType,
    
    # Reports
    ReportCategory,
    ReportStatus,
    AdminDecision,
    DisciplinaryActionType,
    
    # Notifications
    NotificationType,
    
    # Files
    FileType,
    
    # Permissions
    PermissionCodename,
)

from .exceptions import (
    BusinessRuleViolation,
    AuthenticationError,
    PermissionDenied,
    ResourceNotFound,
    ValidationError,
    ConflictError,
    RateLimitExceeded,
    ServiceUnavailable,
)

__all__ = [
    # Constants
    'UserAccountStatus',
    'AccountStatus',
    'RoleType',
    'AvailabilityStatus',
    'JobStatus',
    'ApplicationStatus',
    'AssignmentStatus',
    'VerificationStatus',
    'DocumentType',
    'ReportCategory',
    'ReportStatus',
    'AdminDecision',
    'DisciplinaryActionType',
    'NotificationType',
    'FileType',
    'PermissionCodename',
    
    # Exceptions
    'BusinessRuleViolation',
    'AuthenticationError',
    'PermissionDenied',
    'ResourceNotFound',
    'ValidationError',
    'ConflictError',
    'RateLimitExceeded',
    'ServiceUnavailable',
]
