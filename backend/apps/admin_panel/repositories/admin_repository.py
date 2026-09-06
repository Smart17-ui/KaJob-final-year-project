# apps/admin_panel/repositories/admin_repository.py

from typing import Dict, Any, List
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.common.repositories import BaseRepository


class AdminRepository(BaseRepository):
    """Repository for admin panel data aggregation."""
    
    def __init__(self):
        pass
    
    def get_recent_activity(self, limit: int = 20) -> List[Dict]:
        """Get recent platform activity from audit logs."""
        from apps.audit.models import AuditLog
        
        logs = AuditLog.objects.select_related('user').order_by('-created_at')[:limit]
        
        return [
            {
                'id': log.id,
                'user': log.user.full_name if log.user else 'Unknown User',
                'user_id': log.user.id if log.user else None,
                'action': log.action,
                'entity_type': log.entity_type,
                'entity_id': log.entity_id,
                'details': log.details,
                'created_at': log.created_at.isoformat(),
                'time_ago': self._time_ago(log.created_at),
            }
            for log in logs
        ]
    
    def _time_ago(self, dt):
        """Convert datetime to human-readable 'time ago' string."""
        now = timezone.now()
        diff = now - dt
        
        if diff.days > 30:
            return f"{diff.days // 30} months ago"
        elif diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600} hours ago"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60} minutes ago"
        else:
            return "Just now"
