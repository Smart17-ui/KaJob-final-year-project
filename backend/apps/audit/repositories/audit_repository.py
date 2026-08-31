# apps/audit/repositories/audit_repository.py

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from django.db.models import Q, Count
from django.utils import timezone
from apps.common.repositories import BaseRepository
from apps.audit.models import AuditLog


class AuditRepository(BaseRepository[AuditLog]):
    """Repository for AuditLog model operations."""
    
    def __init__(self):
        super().__init__(AuditLog)
    
    # ============================================
    # FIND BY USER
    # ============================================
    
    def get_by_user_id(self, user_id: int, limit: int = 100) -> List[AuditLog]:
        """Get audit logs for a specific user."""
        return self.filter(user_id=user_id)[:limit]
    
    def get_by_user_and_action(self, user_id: int, action: str) -> List[AuditLog]:
        """Get audit logs for a user and specific action."""
        return self.filter(
            user_id=user_id,
            action=action
        ).order_by('-created_at')
    
    # ============================================
    # FIND BY ENTITY
    # ============================================
    
    def get_by_entity(self, entity_type: str, entity_id: int) -> List[AuditLog]:
        """Get all audit logs for a specific entity."""
        return self.filter(
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by('-created_at')
    
    def get_entity_history(self, entity_type: str, entity_id: int) -> List[AuditLog]:
        """Get the full history of an entity."""
        return self.filter(
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by('created_at')
    
    # ============================================
    # FIND BY ACTION
    # ============================================
    
    def get_by_action(self, action: str, limit: int = 100) -> List[AuditLog]:
        """Get audit logs by action."""
        return self.filter(action=action).order_by('-created_at')[:limit]
    
    # ============================================
    # FIND BY DATE RANGE
    # ============================================
    
    def get_by_date_range(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[AuditLog]:
        """Get audit logs within a date range."""
        return self.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).order_by('-created_at')
    
    def get_today_logs(self) -> List[AuditLog]:
        """Get today's audit logs."""
        today = timezone.now().date()
        return self.filter(created_at__date=today).order_by('-created_at')
    
    # ============================================
    # STATISTICS
    # ============================================
    
    def get_action_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get action statistics for the last N days."""
        start_date = timezone.now() - timedelta(days=days)
        
        stats = self.filter(
            created_at__gte=start_date
        ).values('action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return {
            'total': sum(item['count'] for item in stats),
            'by_action': list(stats),
        }
    
    def get_user_activity_stats(self, days: int = 7) -> Dict[str, Any]:
        """Get user activity statistics."""
        start_date = timezone.now() - timedelta(days=days)
        
        from apps.accounts.models import User
        
        stats = self.filter(
            created_at__gte=start_date
        ).values('user_id').annotate(
            action_count=Count('id')
        ).order_by('-action_count')[:10]
        
        # Get user names
        result = []
        for item in stats:
            user_id = item['user_id']
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    result.append({
                        'user_id': user_id,
                        'user_name': user.full_name,
                        'action_count': item['action_count'],
                    })
                except User.DoesNotExist:
                    pass
        
        return {
            'total_active_users': len(stats),
            'top_users': result,
        }
    
    def get_daily_activity(self, days: int = 7) -> List[Dict]:
        """Get daily activity counts."""
        start_date = timezone.now() - timedelta(days=days)
        
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM audit_logs
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) DESC
            """, [start_date])
            
            rows = cursor.fetchall()
            return [{'date': row[0], 'count': row[1]} for row in rows]
