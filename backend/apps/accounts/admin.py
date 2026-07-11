# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import (
    Role,
    Permission,
    RolePermission,
    User,
    UserRole,
    Profile,
    WorkerProfile,
    ClientProfile,
    Skill,
    WorkerSkill,
)


# ============================================
# INLINE ADMINS
# ============================================

class UserRoleInline(admin.TabularInline):
    """Inline for user roles in User admin"""
    model = UserRole
    extra = 1
    raw_id_fields = ('role',)
    fields = ('role', 'created_at')
    readonly_fields = ('created_at',)


class RolePermissionInline(admin.TabularInline):
    """Inline for role permissions in Role admin"""
    model = RolePermission
    extra = 1
    raw_id_fields = ('permission',)
    fields = ('permission', 'created_at')
    readonly_fields = ('created_at',)


class WorkerSkillInline(admin.TabularInline):
    """Inline for worker skills in WorkerProfile admin"""
    model = WorkerSkill
    extra = 1
    raw_id_fields = ('skill',)
    fields = ('skill', 'proficiency', 'years_experience', 'created_at')
    readonly_fields = ('created_at',)


# ============================================
# ROLE ADMIN
# ============================================

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin configuration for Role model"""
    
    list_display = ('id', 'name', 'description', 'permission_count', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    inlines = [RolePermissionInline]
    
    fieldsets = (
        (_('Role Information'), {
            'fields': ('name', 'description')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def permission_count(self, obj):
        """Display the number of permissions for this role"""
        return obj.role_permissions.count()
    permission_count.short_description = 'Permissions'
    permission_count.admin_order_field = 'role_permissions__count'


# ============================================
# PERMISSION ADMIN
# ============================================

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Admin configuration for Permission model"""
    
    list_display = ('id', 'name', 'codename', 'description_short', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'codename', 'description')
    list_filter = ('created_at',)
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Permission Information'), {
            'fields': ('name', 'codename', 'description')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def description_short(self, obj):
        """Display a shortened description"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = 'Description'


# ============================================
# ROLE PERMISSION ADMIN
# ============================================

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    """Admin configuration for RolePermission model"""
    
    list_display = ('id', 'role', 'permission', 'created_at')
    list_display_links = ('id',)
    search_fields = ('role__name', 'permission__name')
    list_filter = ('role', 'permission', 'created_at')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Mapping Information'), {
            'fields': ('role', 'permission')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ============================================
# USER ADMIN
# ============================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    
    list_display = (
        'id', 'full_name', 'email', 'phone_number', 'get_roles_display',
        'account_status', 'is_verified', 'is_staff', 'is_superuser', 'created_at'
    )
    list_display_links = ('id', 'full_name')
    list_filter = ('account_status', 'is_verified', 'is_staff', 'is_superuser', 'created_at', 'deleted_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number')
    list_per_page = 25
    ordering = ('-created_at',)
    
    # Empty filter_horizontal
    filter_horizontal = ()
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password_hash')
        }),
        (_('Personal Info'), {
            'fields': ('first_name', 'last_name', 'phone_number')
        }),
        (_('Permissions'), {
            'fields': ('account_status', 'is_verified', 'is_staff', 'is_superuser')
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'created_at', 'updated_at')
        }),
        (_('Soft Delete'), {
            'fields': ('deleted_at', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone_number', 'password_hash', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ('last_login', 'created_at', 'updated_at', 'deleted_at', 'deleted_by')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number')
    ordering = ('-created_at',)
    
    inlines = [UserRoleInline]
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Full Name'
    full_name.admin_order_field = 'first_name'
    
    def get_roles_display(self, obj):
        roles = obj.roles
        if roles:
            return ", ".join([role.name for role in roles])
        return '-'
    get_roles_display.short_description = 'Roles'
    
    def get_is_active(self, obj):
        return obj.is_active
    get_is_active.boolean = True
    get_is_active.short_description = 'Active'
    
    def get_queryset(self, request):
        return self.model.objects.all_with_deleted()


# ============================================
# USER ROLE ADMIN
# ============================================

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """Admin configuration for UserRole model"""
    
    list_display = ('id', 'user', 'role', 'created_at')
    list_display_links = ('id',)
    search_fields = ('user__email', 'role__name')
    list_filter = ('role', 'created_at')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Mapping Information'), {
            'fields': ('user', 'role')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ============================================
# PROFILE ADMIN
# ============================================

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin configuration for Profile model"""
    
    list_display = ('id', 'user', 'province', 'district', 'created_at')
    list_display_links = ('id', 'user')
    search_fields = ('user__email', 'province', 'district', 'address')
    list_filter = ('province', 'district', 'created_at')
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'deleted_by')
    
    fieldsets = (
        (_('Profile Information'), {
            'fields': ('user', 'bio', 'profile_photo_path')
        }),
        (_('Address'), {
            'fields': ('address', 'province', 'district')
        }),
        (_('Location'), {
            'fields': ('latitude', 'longitude')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        (_('Soft Delete'), {
            'fields': ('deleted_at', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )


# ============================================
# WORKER PROFILE ADMIN
# ============================================

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    """Admin configuration for WorkerProfile model"""
    
    list_display = (
        'id', 'user', 'availability_status', 'average_rating',
        'total_reviews', 'jobs_completed', 'get_skills_display', 'created_at'
    )
    list_display_links = ('id', 'user')
    list_filter = ('availability_status', 'average_rating', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'bio')
    list_per_page = 25
    ordering = ('-average_rating',)
    readonly_fields = ('availability_updated_at', 'created_at', 'updated_at', 'deleted_at', 'deleted_by')
    
    inlines = [WorkerSkillInline]
    
    fieldsets = (
        (_('Worker Information'), {
            'fields': ('user', 'bio', 'years_of_experience')
        }),
        (_('Availability'), {
            'fields': ('availability_status', 'availability_updated_at')
        }),
        (_('Performance'), {
            'fields': ('average_rating', 'total_reviews', 'jobs_completed')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        (_('Soft Delete'), {
            'fields': ('deleted_at', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )
    
    def get_skills_display(self, obj):
        """Display skills as a comma-separated list"""
        skills = obj.skills.all()
        if skills:
            return ", ".join([skill.name for skill in skills])
        return '-'
    get_skills_display.short_description = 'Skills'


# ============================================
# CLIENT PROFILE ADMIN
# ============================================

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ClientProfile model"""
    
    list_display = ('id', 'user', 'organization_name', 'created_at')
    list_display_links = ('id', 'user')
    list_filter = ('created_at',)
    search_fields = ('user__first_name', 'user__last_name', 'organization_name', 'address')
    list_per_page = 25
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'deleted_at', 'deleted_by')
    
    fieldsets = (
        (_('Client Information'), {
            'fields': ('user', 'organization_name', 'address', 'tax_id')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        (_('Soft Delete'), {
            'fields': ('deleted_at', 'deleted_by'),
            'classes': ('collapse',)
        }),
    )


# ============================================
# SKILL ADMIN
# ============================================

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin configuration for Skill model"""
    
    list_display = ('id', 'name', 'category', 'icon', 'created_at')
    list_display_links = ('id', 'name')
    list_filter = ('category',)
    search_fields = ('name', 'category', 'description')
    list_per_page = 20
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Skill Information'), {
            'fields': ('name', 'category', 'description', 'icon')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ============================================
# WORKER SKILL ADMIN
# ============================================

@admin.register(WorkerSkill)
class WorkerSkillAdmin(admin.ModelAdmin):
    """Admin configuration for WorkerSkill model"""
    
    list_display = (
        'id', 'worker_profile', 'skill', 'proficiency',
        'years_experience', 'created_at'
    )
    list_display_links = ('id',)
    list_filter = ('skill', 'proficiency', 'created_at')
    search_fields = ('worker_profile__user__first_name', 'skill__name')
    list_per_page = 20
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (_('Worker Skill Information'), {
            'fields': ('worker_profile', 'skill', 'proficiency', 'years_experience')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
