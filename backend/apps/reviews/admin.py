from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'job', 'reviewer', 'reviewee', 'rating', 
        'comment_preview', 'created_at'
    )
    list_display_links = ('id',)
    list_filter = ('rating', 'created_at')  # Removed 'is_deleted'
    search_fields = ('job__title', 'reviewer__email', 'reviewee__email')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def comment_preview(self, obj):
        if obj.comment:
            return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
        return '-'
    comment_preview.short_description = 'Comment'
