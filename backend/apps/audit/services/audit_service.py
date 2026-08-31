# apps/audit/services/audit_service.py

import logging
from typing import Dict, Any, Optional, List
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.audit.models import AuditLog
from apps.audit.repositories import AuditRepository

User = get_user_model()
logger = logging.getLogger(__name__)


class AuditService:
    """
    Service for logging and retrieving audit trails.
    """
    
    def __init__(self):
        self.repository = AuditRepository()
    
    # ============================================
    # LOG ACTION
    # ============================================
    
    @transaction.atomic
    def log_action(
        self,
        user,
        action: str,
        entity_type: str = None,
        entity_id: int = None,
        details: dict = None,
        request = None,
    ) -> AuditLog:
        """
        Log an action to the audit trail.
        
        Args:
            user: The user performing the action
            action: The action (e.g., 'JOB_CREATED')
            entity_type: Type of entity (e.g., 'JOB', 'USER')
            entity_id: ID of the entity
            details: Additional details as dict
            request: Django request object (for IP and user agent)
        
        Returns:
            AuditLog: The created audit log entry
        """
        # Prepare details
        if details is None:
            details = {}
        
        # Add request info
        ip_address = None
        user_agent = ''
        
        if request:
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create log entry
        log_entry = self.repository.create(
            user=user,
            action=action,
            entity_type=entity_type or '',
            entity_id=entity_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )
        
        logger.debug(f"Audit log created: {action} by {user.id if user else 'Anonymous'}")
        return log_entry
    
    # ============================================
    # CONVENIENCE METHODS
    # ============================================
    
    def log_user_login(self, user, request):
        """Log user login."""
        return self.log_action(
            user=user,
            action='USER_LOGIN',
            entity_type='USER',
            entity_id=user.id,
            details={'login_type': 'password'},
            request=request,
        )
    
    def log_user_logout(self, user, request):
        """Log user logout."""
        return self.log_action(
            user=user,
            action='USER_LOGOUT',
            entity_type='USER',
            entity_id=user.id,
            request=request,
        )
    
    def log_user_register(self, user, request):
        """Log user registration."""
        return self.log_action(
            user=user,
            action='USER_REGISTER',
            entity_type='USER',
            entity_id=user.id,
            details={'email': user.email, 'role': user.role},
            request=request,
        )
    
    def log_job_created(self, user, job, request=None):
        """Log job creation."""
        return self.log_action(
            user=user,
            action='JOB_CREATED',
            entity_type='JOB',
            entity_id=job.id,
            details={
                'job_title': job.title,
                'budget': str(job.budget),
                'category': job.category.name if job.category else None,
                'general_location': job.general_location,
            },
            request=request,
        )
    
    def log_job_updated(self, user, job, changes, request=None):
        """Log job update."""
        return self.log_action(
            user=user,
            action='JOB_UPDATED',
            entity_type='JOB',
            entity_id=job.id,
            details={
                'job_title': job.title,
                'changes': changes,
            },
            request=request,
        )
    
    def log_job_deleted(self, user, job, request=None):
        """Log job deletion."""
        return self.log_action(
            user=user,
            action='JOB_DELETED',
            entity_type='JOB',
            entity_id=job.id,
            details={'job_title': job.title},
            request=request,
        )
    
    def log_job_assigned(self, user, job, worker, request=None):
        """Log worker assignment."""
        return self.log_action(
            user=user,
            action='WORKER_ASSIGNED',
            entity_type='JOB',
            entity_id=job.id,
            details={
                'job_title': job.title,
                'worker_id': worker.id,
                'worker_name': worker.full_name,
            },
            request=request,
        )
    
    def log_job_completed(self, user, job, request=None):
        """Log job completion."""
        return self.log_action(
            user=user,
            action='JOB_COMPLETED',
            entity_type='JOB',
            entity_id=job.id,
            details={'job_title': job.title, 'completed_by': user.full_name},
            request=request,
        )
    
    def log_application_submitted(self, user, job, request=None):
        """Log job application submission."""
        return self.log_action(
            user=user,
            action='APPLICATION_SUBMITTED',
            entity_type='APPLICATION',
            entity_id=job.id,
            details={'job_title': job.title},
            request=request,
        )
    
    def log_application_accepted(self, user, job, worker, request=None):
        """Log application accepted."""
        return self.log_action(
            user=user,
            action='APPLICATION_ACCEPTED',
            entity_type='APPLICATION',
            entity_id=job.id,
            details={
                'job_title': job.title,
                'worker_id': worker.id,
                'worker_name': worker.full_name,
            },
            request=request,
        )
    
    def log_review_submitted(self, user, review, request=None):
        """Log review submission."""
        job = review.job
        return self.log_action(
            user=user,
            action='REVIEW_SUBMITTED',
            entity_type='REVIEW',
            entity_id=review.id,
            details={
                'job_id': job.id,
                'job_title': job.title,
                'rating': review.rating,
            },
            request=request,
        )
    
    def log_admin_action(self, admin, action, entity_type, entity_id, details=None, request=None):
        """Log admin action."""
        return self.log_action(
            user=admin,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details or {},
            request=request,
        )
    
    # ============================================
    # GET AUDIT TRAILS
    # ============================================
    
    def get_user_logs(self, user_id: int, limit: int = 100) -> List[AuditLog]:
        """Get audit logs for a user."""
        return self.repository.get_by_user_id(user_id, limit)
    
    def get_entity_logs(self, entity_type: str, entity_id: int) -> List[AuditLog]:
        """Get audit logs for a specific entity."""
        return self.repository.get_by_entity(entity_type, entity_id)
    
    def get_entity_history(self, entity_type: str, entity_id: int) -> List[AuditLog]:
        """Get the full history of an entity."""
        return self.repository.get_entity_history(entity_type, entity_id)
    
    def get_recent_logs(self, limit: int = 50) -> List[AuditLog]:
        """Get most recent audit logs."""
        return self.repository.filter().order_by('-created_at')[:limit]
    
    def get_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get audit statistics."""
        return {
            'action_stats': self.repository.get_action_stats(days),
            'user_activity': self.repository.get_user_activity_stats(days),
            'daily_activity': self.repository.get_daily_activity(days),
        }
    
    # ============================================
    # HELPERS
    # ============================================
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
