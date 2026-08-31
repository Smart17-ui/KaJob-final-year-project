# apps/audit/repositories/disciplinary_repository.py

from typing import Optional, List, Dict, Any
from django.db.models import Q
from django.utils import timezone
from apps.common.repositories import BaseRepository
from apps.audit.models import DisciplinaryAction
from apps.common.constants import DisciplinaryActionType


class DisciplinaryRepository(BaseRepository[DisciplinaryAction]):
    """Repository for DisciplinaryAction model operations."""
    
    def __init__(self):
        super().__init__(DisciplinaryAction)
    
    # ============================================
    # FIND BY TARGET USER
    # ============================================
    
    def get_by_target_user(self, user_id: int) -> List[DisciplinaryAction]:
        """Get all disciplinary actions for a user."""
        return self.filter(target_user_id=user_id).order_by('-performed_at')
    
    def get_active_suspensions(self, user_id: int) -> List[DisciplinaryAction]:
        """Get active suspensions for a user."""
        now = timezone.now()
        return self.filter(
            target_user_id=user_id,
            action_type=DisciplinaryActionType.SUSPEND,
            expires_at__gt=now
        ).order_by('-performed_at')
    
    def get_active_actions(self, user_id: int) -> List[DisciplinaryAction]:
        """Get all active disciplinary actions for a user."""
        now = timezone.now()
        return self.filter(
            target_user_id=user_id
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=now)
        ).order_by('-performed_at')
    
    # ============================================
    # FIND BY ADMIN
    # ============================================
    
    def get_by_admin(self, admin_id: int) -> List[DisciplinaryAction]:
        """Get all disciplinary actions performed by an admin."""
        return self.filter(admin_id=admin_id).order_by('-performed_at')
    
    # ============================================
    # FIND BY ACTION TYPE
    # ============================================
    
    def get_by_action_type(self, action_type: str) -> List[DisciplinaryAction]:
        """Get all actions of a specific type."""
        return self.filter(action_type=action_type).order_by('-performed_at')
    
    # ============================================
    # FIND BY REPORT
    # ============================================
    
    def get_by_report(self, report_id: int) -> List[DisciplinaryAction]:
        """Get disciplinary actions related to a report."""
        return self.filter(related_report_id=report_id).order_by('-performed_at')
    
    # ============================================
    # STATISTICS
    # ============================================
    
    def get_stats(self) -> Dict[str, Any]:
        """Get disciplinary action statistics."""
        from django.db.models import Count
        
        total = self.count()
        
        by_type = self.filter().values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        active_suspensions = self.filter(
            action_type=DisciplinaryActionType.SUSPEND,
            expires_at__gt=timezone.now()
        ).count()
        
        return {
            'total_actions': total,
            'by_type': list(by_type),
            'active_suspensions': active_suspensions,
        }
