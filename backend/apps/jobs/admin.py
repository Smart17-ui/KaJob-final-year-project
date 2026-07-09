from django.contrib import admin
from .models import JobCategory, Job, JobApplication

# ============================================
# JOB CATEGORY ADMIN
# ============================================

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'icon', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# JOB ADMIN
# ============================================

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'client', 'assigned_worker', 'status', 
        'budget', 'posted_at'
    )
    list_display_links = ('id', 'title')
    list_filter = ('status', 'category', 'posted_at')  # Removed 'is_deleted'
    search_fields = ('title', 'description', 'client__email', 'general_location')
    list_per_page = 25
    ordering = ('-posted_at',)
    readonly_fields = ('posted_at', 'created_at', 'updated_at')


# ============================================
# JOB APPLICATION ADMIN
# ============================================

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'worker', 'status', 'applied_at')
    list_display_links = ('id',)
    list_filter = ('status', 'applied_at')
    search_fields = ('job__title', 'worker__first_name', 'worker__last_name')
    list_per_page = 25
    ordering = ('-applied_at',)
    readonly_fields = ('applied_at', 'updated_at')
