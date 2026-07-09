from django.contrib import admin
from .models import IdentityVerification

@admin.register(IdentityVerification)
class IdentityVerificationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'document_type', 'document_number',
        'verification_status', 'submitted_at'
    )
    list_display_links = ('id', 'user')
    list_filter = (
        'document_type', 'verification_status', 'submitted_at'
    )  # Removed 'is_deleted'
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'document_number')
    list_per_page = 25
    ordering = ('-submitted_at',)
    readonly_fields = ('submitted_at', 'created_at', 'updated_at')
    
    actions = ['approve_verifications', 'reject_verifications']
    
    def approve_verifications(self, request, queryset):
        from django.utils import timezone
        count = 0
        for verification in queryset:
            if verification.verification_status != 'VERIFIED':
                verification.verification_status = 'VERIFIED'
                verification.reviewed_by = request.user
                verification.reviewed_at = timezone.now()
                verification.save()
                count += 1
        self.message_user(request, f"{count} verifications approved.")
    approve_verifications.short_description = "Approve selected verifications"
    
    def reject_verifications(self, request, queryset):
        from django.utils import timezone
        count = 0
        for verification in queryset:
            if verification.verification_status != 'REJECTED':
                verification.verification_status = 'REJECTED'
                verification.reviewed_by = request.user
                verification.reviewed_at = timezone.now()
                verification.save()
                count += 1
        self.message_user(request, f"{count} verifications rejected.")
    reject_verifications.short_description = "Reject selected verifications"
