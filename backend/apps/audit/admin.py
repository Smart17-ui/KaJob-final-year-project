from django.contrib import admin
from .models import DisciplinaryAction, AuditLog


# ============================================
# DISCIPLINARY ACTION ADMIN
# ============================================

@admin.register(DisciplinaryAction)
class DisciplinaryActionAdmin(admin.ModelAdmin):
    """Admin configuration for DisciplinaryAction model"""
    
    list_display = (
        'id', 'admin', 'target_user', 'action_type', 
        'performed_at', 'expires_at'
    )
    list_display_links = ('id',)
    list_filter = ('action_type', 'performed_at')
    search_fields = ('admin__email', 'target_user__email', 'reason')
    list_per_page = 25
    ordering = ('-performed_at',)
    
    fieldsets = (
        ('Action Details', {
            'fields': ('admin', 'target_user', 'action_type', 'reason')
        }),
        ('Related Report', {
            'fields': ('related_report', 'related_investigation')
        }),
        ('Timestamps', {
            'fields': ('performed_at', 'expires_at')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )
    readonly_fields = ('performed_at',)
    
    def get_actions(self, request):
        actions = super().get_actions(request)
        actions['view_audit_trail'] = (
            self.view_audit_trail,
            'view_audit_trail',
            "View audit trail for selected"
        )
        return actions
    
    def view_audit_trail(self, request, queryset):
        """View audit trail for selected disciplinary actions"""
        # This would redirect to audit log filtered by the target user
        self.message_user(request, f"Audit trail view for {queryset.count()} actions")
    view_audit_trail.short_description = "View audit trail"


# ============================================
# AUDIT LOG ADMIN (Read Only)
# ============================================

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin configuration for AuditLog model (Read Only)"""
    
    list_display = ('id', 'user', 'action', 'entity_type', 'entity_id', 'created_at')
    list_display_links = ('id',)
    list_filter = ('entity_type', 'action', 'created_at')
    search_fields = ('user__email', 'action', 'entity_type')
    list_per_page = 30
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Audit Record', {
            'fields': ('user', 'action', 'entity_type', 'entity_id')
        }),
        ('Details', {
            'fields': ('ip_address', 'user_agent', 'details')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    readonly_fields = (
        'user', 'action', 'entity_type', 'entity_id', 
        'ip_address', 'user_agent', 'details', 'created_at'
    )
    
    def has_add_permission(self, request):
        """Prevent adding audit logs manually"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deleting audit logs"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent changing audit logs"""
        return False
