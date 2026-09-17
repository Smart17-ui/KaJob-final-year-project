# apps/reports/admin.py

from django.contrib import admin
from .models import Report, Investigation


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'reference_number',
        'category',
        'status',
        'reporter',
        'reported_user',
        'submitted_at',
    )
    list_filter = ('status', 'category')
    search_fields = (
        'reference_number',
        'reporter__email',
        'reported_user__email',
        'description',
    )
    readonly_fields = ('reference_number', 'submitted_at')
    ordering = ('-submitted_at',)


@admin.register(Investigation)
class InvestigationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'report',
        'admin',
        'status',
        'decision',
        'started_at',
        'completed_at',
    )
    list_filter = ('status', 'decision')
    search_fields = ('report__reference_number',)
    readonly_fields = ('started_at', 'completed_at')
    ordering = ('-started_at',)
