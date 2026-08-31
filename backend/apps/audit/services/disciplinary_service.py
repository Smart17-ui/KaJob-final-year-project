# apps/audit/services/disciplinary_service.py

import logging
from typing import Dict, Any, Optional, List
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.audit.models import DisciplinaryAction
from apps.audit.repositories import DisciplinaryRepository
from apps.common.constants import DisciplinaryActionType
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from datetime import datetime

User = get_user_model()
logger = logging.getLogger(__name__)


class DisciplinaryService:
    """
    Service for managing disciplinary actions.
    """
    
    def __init__(self):
        self.repository = DisciplinaryRepository()
    
    # ============================================
    # CREATE ACTION
    # ============================================
    
    @transaction.atomic
    def create_action(
        self,
        admin,
        target_user_id: int,
        action_type: str,
        reason: str,
        notes: str = '',
        expires_at: Optional[datetime] = None,
        related_report_id: Optional[int] = None,
        related_investigation_id: Optional[int] = None,
    ) -> DisciplinaryAction:
        """
        Create a new disciplinary action.
        """
        # Validate target user exists
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            raise ResourceNotFound("Target user not found.")
        
        # Check if admin is trying to act on themselves
        if admin.id == target_user_id:
            raise BusinessRuleViolation("Admin cannot take action on themselves.")
        
        # Check if target user is an admin
        if target_user.is_admin:
            raise BusinessRuleViolation("Cannot take disciplinary action on an admin.")
        
        # Check if action is a suspension and validate expires_at
        if action_type == DisciplinaryActionType.SUSPEND:
            if expires_at is None:
                raise BusinessRuleViolation("Suspension must have an expiry date.")
            if expires_at <= timezone.now():
                raise BusinessRuleViolation("Expiry date must be in the future.")
        
        # Check if user already has an active suspension
        if action_type == DisciplinaryActionType.SUSPEND:
            active_suspensions = self.repository.get_active_suspensions(target_user_id)
            if active_suspensions.exists():
                raise BusinessRuleViolation("User already has an active suspension.")
        
        # Create the action
        action = self.repository.create(
            admin=admin,
            target_user=target_user,
            action_type=action_type,
            reason=reason,
            notes=notes,
            expires_at=expires_at,
            related_report_id=related_report_id,
            related_investigation_id=related_investigation_id,
        )
        
        # Log to audit
        from apps.audit.services import AuditService
        audit_service = AuditService()
        audit_service.log_admin_action(
            admin=admin,
            action=f'DISCIPLINARY_{action_type}',
            entity_type='USER',
            entity_id=target_user_id,
            details={
                'action_type': action_type,
                'reason': reason,
                'expires_at': expires_at.isoformat() if expires_at else None,
            }
        )
        
        logger.info(f"Disciplinary action {action_type} applied to user {target_user_id} by admin {admin.id}")
        return action
    
    # ============================================
    # GET ACTIONS
    # ============================================
    
    def get_user_actions(self, user_id: int) -> List[DisciplinaryAction]:
        """Get all disciplinary actions for a user."""
        return self.repository.get_by_target_user(user_id)
    
    def get_active_actions(self, user_id: int) -> List[DisciplinaryAction]:
        """Get active disciplinary actions for a user."""
        return self.repository.get_active_actions(user_id)
    
    def is_user_suspended(self, user_id: int) -> bool:
        """Check if a user is currently suspended."""
        active_suspensions = self.repository.get_active_suspensions(user_id)
        return active_suspensions.exists()
    
    def get_action_stats(self) -> Dict[str, Any]:
        """Get disciplinary action statistics."""
        return self.repository.get_stats()
