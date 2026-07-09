from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'recipient', 'title', 'notification_type', 
        'is_read', 'created_at'
    )
    list_display_links = ('id', 'title')
    list_filter = ('notification_type', 'is_read', 'created_at')  # Removed 'is_deleted'
    search_fields = ('recipient__email', 'title', 'message')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'read_at')
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        count = queryset.update(is_read=True)
        self.message_user(request, f"{count} notifications marked as read.")
    mark_as_read.short_description = "Mark selected as read"
    
    def mark_as_unread(self, request, queryset):
        count = queryset.update(is_read=False)
        self.message_user(request, f"{count} notifications marked as unread.")
    mark_as_unread.short_description = "Mark selected as unread"
