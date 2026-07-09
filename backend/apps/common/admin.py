from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import SoftDeleteMixin

# Note: SoftDeleteMixin is abstract, so we don't register it directly
# But we can create a custom admin mixin for soft delete

class SoftDeleteAdminMixin:
    """Mixin for admin to handle soft deleted records"""
    
    def get_queryset(self, request):
        """Show all records including soft deleted"""
        qs = self.model.objects.all_with_deleted()
        ordering = self.ordering or ()
        if ordering:
            qs = qs.order_by(*ordering)
        return qs
    
    def delete_model(self, request, obj):
        """Soft delete instead of hard delete"""
        obj.delete(user=request.user)
    
    def delete_queryset(self, request, queryset):
        """Soft delete queryset"""
        for obj in queryset:
            obj.delete(user=request.user)
    
    def restore_model(self, request, obj):
        """Restore soft deleted record"""
        obj.restore()
    
    def restore_queryset(self, request, queryset):
        """Restore queryset"""
        for obj in queryset:
            obj.restore()
    
    def is_deleted(self, obj):
        """Display if record is deleted"""
        return obj.is_deleted
    is_deleted.boolean = True
    is_deleted.short_description = 'Deleted'

# We'll use this mixin for all model admins
