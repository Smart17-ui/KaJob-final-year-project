from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Role, Permission, RolePermission, User, UserRole, 
    Profile, WorkerProfile, ClientProfile, Skill, WorkerSkill
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
# PERMISSION ADMIN
# ============================================

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'codename', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'codename', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# ROLE PERMISSION ADMIN
# ============================================

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'role', 'permission', 'created_at')
    list_display_links = ('id',)
    search_fields = ('role__name', 'permission__name')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# USER ADMIN
# ============================================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'full_name', 'email', 'phone_number', 'get_roles', 
        'account_status', 'is_verified', 'created_at'
    )
    list_display_links = ('id', 'full_name')
    list_filter = (
        'account_status', 'is_verified', 'created_at'
    )
    search_fields = ('first_name', 'last_name', 'email', 'phone_number')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('last_login', 'created_at', 'updated_at')
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'first_name'
    
    def get_roles(self, obj):
        """Display roles as a comma-separated list"""
        return ", ".join([role.name for role in obj.roles])
    get_roles.short_description = 'Roles'


# ============================================
# USER ROLE ADMIN
# ============================================

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'role', 'created_at')
    list_display_links = ('id',)
    search_fields = ('user__email', 'role__name')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# PROFILE ADMIN
# ============================================

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'province', 'district', 'created_at')
    list_display_links = ('id', 'user')
    search_fields = ('user__email', 'province', 'district')
    list_filter = ('province', 'district')
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# WORKER PROFILE ADMIN
# ============================================

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'availability_status', 'average_rating', 
        'total_reviews', 'jobs_completed', 'created_at'
    )
    list_display_links = ('id', 'user')
    list_filter = ('availability_status', 'average_rating', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    list_per_page = 25
    ordering = ('-average_rating',)
    readonly_fields = ('availability_updated_at', 'created_at', 'updated_at')
    
    def get_skills(self, obj):
        """Display skills as a comma-separated list"""
        return ", ".join([skill.name for skill in obj.skills.all()])
    get_skills.short_description = 'Skills'


# ============================================
# CLIENT PROFILE ADMIN
# ============================================

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'organization_name', 'created_at')
    list_display_links = ('id', 'user')
    list_filter = ('created_at',)
    search_fields = ('user__first_name', 'user__last_name', 'organization_name')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# SKILL ADMIN
# ============================================

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'icon', 'created_at')
    list_display_links = ('id', 'name')
    list_filter = ('category',)
    search_fields = ('name', 'category', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================
# WORKER SKILL ADMIN
# ============================================

@admin.register(WorkerSkill)
class WorkerSkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'worker_profile', 'skill', 'proficiency', 'years_experience', 'created_at')
    list_display_links = ('id',)
    list_filter = ('skill', 'proficiency', 'created_at')
    search_fields = ('worker_profile__user__first_name', 'skill__name')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')
