from django.contrib import admin
from .models import Report, ReportEvidence

# ============================================
# REPORT ADMIN
# ============================================

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'reference_number', 'category', 'reporter', 
        'reported_user', 'status', 'admin_decision', 'submitted_at'
    )
    list_display_links = ('id', 'reference_number')
    list_filter = ('category', 'status', 'admin_decision', 'submitted_at')  # Removed 'is_deleted'
    search_fields = ('reference_number', 'reporter__email', 'reported_user__email', 'description')
    list_per_page = 25
    ordering = ('-submitted_at',)
    readonly_fields = ('reference_number', 'submitted_at', 'created_at', 'updated_at')
    
    actions = ['generate_police_report']
    
    def generate_police_report(self, request, queryset):
        count = 0
        for report in queryset:
            if not report.police_report_generated:
                report.police_report_generated = True
                report.police_report_path = f"police_reports/{report.reference_number}.pdf"
                report.save()
                count += 1
        self.message_user(request, f"{count} police reports generated.")
    generate_police_report.short_description = "Generate police reports"


# ============================================
# REPORT EVIDENCE ADMIN
# ============================================

@admin.register(ReportEvidence)
class ReportEvidenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'report', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at')
    list_display_links = ('id',)
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('report__reference_number', 'file_name')
    list_per_page = 25
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)
