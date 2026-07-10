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

__all__ = [
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
]
