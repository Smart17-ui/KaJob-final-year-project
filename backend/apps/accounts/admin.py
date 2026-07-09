from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Role, User, WorkerProfile, ClientProfile, Skill, WorkerSkill
)

# ============================================
# ROLE ADMIN
# ============================================

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# USER ADMIN
# ============================================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'full_name', 'email', 'phone_number', 'role', 
        'account_status', 'is_verified', 'created_at'
    )
    list_display_links = ('id', 'full_name')
    list_filter = (
        'role', 'account_status', 'is_verified', 'created_at'
    )  # Removed 'is_deleted'
    search_fields = ('first_name', 'last_name', 'email', 'phone_number')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('last_login', 'created_at', 'updated_at')
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'first_name'


# ============================================
# WORKER PROFILE ADMIN
# ============================================

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'availability_status', 'average_rating', 
        'total_reviews', 'created_at'
    )
    list_display_links = ('id', 'user')
    list_filter = ('availability_status', 'average_rating', 'created_at')  # Removed 'is_deleted'
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    list_per_page = 25
    ordering = ('-average_rating',)
    readonly_fields = ('availability_updated_at', 'created_at', 'updated_at')


# ============================================
# CLIENT PROFILE ADMIN
# ============================================

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'organization_name', 'created_at')
    list_display_links = ('id', 'user')
    list_filter = ('created_at',)  # Removed 'is_deleted'
    search_fields = ('user__first_name', 'user__last_name', 'organization_name')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# SKILL ADMIN
# ============================================

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'created_at')
    list_display_links = ('id', 'name')
    list_filter = ('category',)
    search_fields = ('name', 'category')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# WORKER SKILL ADMIN
# ============================================

@admin.register(WorkerSkill)
class WorkerSkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'worker_profile', 'skill', 'created_at')
    list_display_links = ('id',)
    list_filter = ('skill', 'created_at')
    search_fields = ('worker_profile__user__first_name', 'skill__name')
    list_per_page = 20
    readonly_fields = ('created_at',)
