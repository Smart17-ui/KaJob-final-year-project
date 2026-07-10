from django.contrib import admin
from .models import JobCategory, Job, JobApplication, JobAssignment


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'icon', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'client', 'get_assigned_worker', 'status', 
        'budget', 'posted_at'
    )
    list_display_links = ('id', 'title')
    list_filter = ('status', 'category', 'posted_at')
    search_fields = ('title', 'description', 'client__email')
    list_per_page = 25
    ordering = ('-posted_at',)
    readonly_fields = ('posted_at', 'created_at', 'updated_at')
    
    def get_assigned_worker(self, obj):
        """Get the assigned worker for this job"""
        assignment = obj.assignments.filter(status='ACTIVE').first()
        if assignment:
            return assignment.worker.full_name
        return '-'
    get_assigned_worker.short_description = 'Assigned Worker'


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'worker', 'status', 'applied_at')
    list_display_links = ('id',)
    list_filter = ('status', 'applied_at')
    search_fields = ('job__title', 'worker__email')
    list_per_page = 25
    ordering = ('-applied_at',)
    readonly_fields = ('applied_at', 'updated_at')


@admin.register(JobAssignment)
class JobAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'worker', 'status', 'assigned_at')
    list_display_links = ('id',)
    list_filter = ('status', 'assigned_at')
    search_fields = ('job__title', 'worker__email')
    list_per_page = 25
    ordering = ('-assigned_at',)
    readonly_fields = ('assigned_at', 'created_at', 'updated_at')
