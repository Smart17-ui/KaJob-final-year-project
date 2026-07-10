from django.contrib import admin
from .models import Report, ReportEvidence, Investigation


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'reference_number', 'category', 'reporter', 
        'reported_user', 'status', 'submitted_at'
    )
    list_display_links = ('id', 'reference_number')
    list_filter = ('category', 'status', 'submitted_at')  # Removed 'admin_decision'
    search_fields = ('reference_number', 'reporter__email', 'reported_user__email')
    list_per_page = 25
    ordering = ('-submitted_at',)
    readonly_fields = ('reference_number', 'submitted_at', 'created_at', 'updated_at')


@admin.register(ReportEvidence)
class ReportEvidenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'report', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at')
    list_display_links = ('id',)
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('report__reference_number', 'file_name')
    list_per_page = 25
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(Investigation)
class InvestigationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'report', 'admin', 'status', 'get_decision', 'started_at'
    )
    list_display_links = ('id',)
    list_filter = ('status', 'started_at')  # Removed 'decision'
    search_fields = ('report__reference_number', 'admin__email')
    list_per_page = 25
    ordering = ('-started_at',)
    readonly_fields = ('started_at', 'created_at', 'updated_at')
    
    def get_decision(self, obj):
        """Get the admin decision"""
        return obj.decision if obj.decision else '-'
    get_decision.short_description = 'Decision'
