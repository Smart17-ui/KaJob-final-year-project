# apps/common/constants.py

# ============================================
# ENUMS / CONSTANTS
# ============================================

from django.db import models


# ============================================
# USER ACCOUNT STATUS
# ============================================

class UserAccountStatus:
    """User account statuses"""
    ACTIVE = 'ACTIVE'
    SUSPENDED = 'SUSPENDED'
    BANNED = 'BANNED'
    DEACTIVATED = 'DEACTIVATED'
    
    CHOICES = [
        (ACTIVE, 'Active'),
        (SUSPENDED, 'Suspended'),
        (BANNED, 'Banned'),
        (DEACTIVATED, 'Deactivated'),
    ]


# ============================================
# AVAILABILITY STATUS
# ============================================

class AvailabilityStatus:
    """Worker availability statuses"""
    AVAILABLE = 'AVAILABLE'
    BUSY = 'BUSY'
    UNAVAILABLE = 'UNAVAILABLE'
    
    CHOICES = [
        (AVAILABLE, 'Available'),
        (BUSY, 'Busy'),
        (UNAVAILABLE, 'Unavailable'),
    ]


# ============================================
# JOB STATUS
# ============================================

class JobStatus:
    """Job statuses"""
    OPEN = 'OPEN'
    ASSIGNED = 'ASSIGNED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    
    CHOICES = [
        (OPEN, 'Open'),
        (ASSIGNED, 'Assigned'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]


# ============================================
# APPLICATION STATUS
# ============================================

class ApplicationStatus:
    """Job application statuses"""
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    WITHDRAWN = 'WITHDRAWN'
    
    CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (WITHDRAWN, 'Withdrawn'),
    ]


# ============================================
# ASSIGNMENT STATUS
# ============================================

class AssignmentStatus:
    """Job assignment statuses"""
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    
    CHOICES = [
        (ACTIVE, 'Active'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]


# ============================================
# VERIFICATION STATUS
# ============================================

class VerificationStatus:
    """Identity verification statuses"""
    NOT_SUBMITTED = 'NOT_SUBMITTED'
    PENDING = 'PENDING'
    UNDER_REVIEW = 'UNDER_REVIEW'
    VERIFIED = 'VERIFIED'
    REJECTED = 'REJECTED'
    EXPIRED = 'EXPIRED'
    
    CHOICES = [
        (NOT_SUBMITTED, 'Not Submitted'),
        (PENDING, 'Pending'),
        (UNDER_REVIEW, 'Under Review'),
        (VERIFIED, 'Verified'),
        (REJECTED, 'Rejected'),
        (EXPIRED, 'Expired'),
    ]


# ============================================
# DOCUMENT TYPE
# ============================================

class DocumentType:
    """Identity document types"""
    NRC_FRONT = 'NRC_FRONT'
    NRC_BACK = 'NRC_BACK'
    PASSPORT_PHOTO = 'PASSPORT_PHOTO'
    SELFIE = 'SELFIE'
    
    CHOICES = [
        (NRC_FRONT, 'NRC Front'),
        (NRC_BACK, 'NRC Back'),
        (PASSPORT_PHOTO, 'Passport Photo'),
        (SELFIE, 'Selfie'),
    ]


# ============================================
# REPORT CATEGORY
# ============================================

class ReportCategory:
    """Report categories"""
    THEFT = 'THEFT'
    VIOLENCE = 'VIOLENCE'
    HARASSMENT = 'HARASSMENT'
    FRAUD = 'FRAUD'
    PROPERTY_DAMAGE = 'PROPERTY_DAMAGE'
    NO_SHOW = 'NO_SHOW'
    POOR_CONDUCT = 'POOR_CONDUCT'
    OTHER = 'OTHER'
    
    CHOICES = [
        (THEFT, 'Theft'),
        (VIOLENCE, 'Violence'),
        (HARASSMENT, 'Harassment'),
        (FRAUD, 'Fraud'),
        (PROPERTY_DAMAGE, 'Property Damage'),
        (NO_SHOW, 'No Show'),
        (POOR_CONDUCT, 'Poor Conduct'),
        (OTHER, 'Other'),
    ]


# ============================================
# REPORT STATUS
# ============================================

class ReportStatus:
    """Report investigation statuses"""
    PENDING = 'PENDING'
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION'
    AWAITING_USER_RESPONSE = 'AWAITING_USER_RESPONSE'
    RESOLVED = 'RESOLVED'
    ESCALATED_TO_POLICE = 'ESCALATED_TO_POLICE'
    CLOSED = 'CLOSED'
    
    CHOICES = [
        (PENDING, 'Pending'),
        (UNDER_INVESTIGATION, 'Under Investigation'),
        (AWAITING_USER_RESPONSE, 'Awaiting User Response'),
        (RESOLVED, 'Resolved'),
        (ESCALATED_TO_POLICE, 'Escalated to Police'),
        (CLOSED, 'Closed'),
    ]


# ============================================
# ADMIN DECISION
# ============================================

class AdminDecision:
    """Administrator decision types"""
    DISMISSED = 'DISMISSED'
    WARNED = 'WARNED'
    SUSPENDED = 'SUSPENDED'
    BANNED = 'BANNED'
    ESCALATED = 'ESCALATED'
    
    CHOICES = [
        (DISMISSED, 'Dismissed'),
        (WARNED, 'Warned'),
        (SUSPENDED, 'Suspended'),
        (BANNED, 'Banned'),
        (ESCALATED, 'Escalated'),
    ]


# ============================================
# DISCIPLINARY ACTION TYPE
# ============================================

class DisciplinaryActionType:
    """Disciplinary action types"""
    WARN = 'WARN'
    SUSPEND = 'SUSPEND'
    BAN = 'BAN'
    UNBAN = 'UNBAN'
    VERIFY = 'VERIFY'
    REJECT_VERIFICATION = 'REJECT_VERIFICATION'
    DISMISS_REPORT = 'DISMISS_REPORT'
    
    CHOICES = [
        (WARN, 'Warning'),
        (SUSPEND, 'Suspend'),
        (BAN, 'Ban'),
        (UNBAN, 'Unban'),
        (VERIFY, 'Verify'),
        (REJECT_VERIFICATION, 'Reject Verification'),
        (DISMISS_REPORT, 'Dismiss Report'),
    ]


# ============================================
# NOTIFICATION TYPE
# ============================================

class NotificationType:
    """Notification types"""
    JOB_POSTED = 'JOB_POSTED'
    APPLICATION_RECEIVED = 'APPLICATION_RECEIVED'
    WORKER_ASSIGNED = 'WORKER_ASSIGNED'
    JOB_COMPLETED = 'JOB_COMPLETED'
    JOB_CANCELLED = 'JOB_CANCELLED'
    REPORT_RESOLVED = 'REPORT_RESOLVED'
    VERIFICATION_APPROVED = 'VERIFICATION_APPROVED'
    VERIFICATION_REJECTED = 'VERIFICATION_REJECTED'
    ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED'
    ACCOUNT_BANNED = 'ACCOUNT_BANNED'
    WARNING_ISSUED = 'WARNING_ISSUED'
    
    CHOICES = [
        (JOB_POSTED, 'Job Posted'),
        (APPLICATION_RECEIVED, 'Application Received'),
        (WORKER_ASSIGNED, 'Worker Assigned'),
        (JOB_COMPLETED, 'Job Completed'),
        (JOB_CANCELLED, 'Job Cancelled'),
        (REPORT_RESOLVED, 'Report Resolved'),
        (VERIFICATION_APPROVED, 'Verification Approved'),
        (VERIFICATION_REJECTED, 'Verification Rejected'),
        (ACCOUNT_SUSPENDED, 'Account Suspended'),
        (ACCOUNT_BANNED, 'Account Banned'),
        (WARNING_ISSUED, 'Warning Issued'),
    ]


# ============================================
# FILE TYPE
# ============================================

class FileType:
    """Uploaded file types"""
    IMAGE = 'IMAGE'
    VIDEO = 'VIDEO'
    DOCUMENT = 'DOCUMENT'
    
    CHOICES = [
        (IMAGE, 'Image'),
        (VIDEO, 'Video'),
        (DOCUMENT, 'Document'),
    ]


# ============================================
# ROLE TYPE
# ============================================

class RoleType:
    """User role types"""
    ADMIN = 'ADMIN'
    WORKER = 'WORKER'
    CLIENT = 'CLIENT'
    
    CHOICES = [
        (ADMIN, 'Administrator'),
        (WORKER, 'Worker'),
        (CLIENT, 'Client'),
    ]


# ============================================
# PERMISSION CODENAMES
# ============================================

class PermissionCodename:
    """Permission codenames"""
    VIEW_USERS = 'can_view_users'
    CREATE_USER = 'can_create_user'
    SUSPEND_USER = 'can_suspend_user'
    BAN_USER = 'can_ban_user'
    UNBAN_USER = 'can_unban_user'
    VERIFY_USER = 'can_verify_user'
    REJECT_VERIFICATION = 'can_reject_verification'
    
    CREATE_JOB = 'can_create_job'
    VIEW_JOBS = 'can_view_jobs'
    APPLY_JOB = 'can_apply_for_job'
    ASSIGN_WORKER = 'can_assign_worker'
    COMPLETE_JOB = 'can_complete_job'
    DELETE_JOB = 'can_delete_job'
    
    CREATE_REVIEW = 'can_create_review'
    VIEW_REVIEWS = 'can_view_reviews'
    DELETE_REVIEW = 'can_delete_review'
    
    CREATE_REPORT = 'can_create_report'
    VIEW_REPORTS = 'can_view_reports'
    REVIEW_REPORTS = 'can_review_reports'
    ESCALATE_REPORT = 'can_escalate_reports'
    
    VIEW_AUDIT_LOGS = 'can_view_audit_logs'
    VIEW_DASHBOARD = 'can_view_dashboard'
    MANAGE_SYSTEM = 'can_manage_system'


# ============================================
# ALIAS FOR BACKWARD COMPATIBILITY
# ============================================

# This allows you to use both UserAccountStatus and AccountStatus
AccountStatus = UserAccountStatus
