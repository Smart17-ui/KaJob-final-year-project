from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.translation import gettext_lazy as _

class KaJobAdminSite(AdminSite):
    """Custom admin site for KaJob"""
    
    site_header = _('KaJob Administration')
    site_title = _('KaJob Admin Portal')
    index_title = _('Welcome to KaJob Admin Dashboard')
    
    def get_app_list(self, request):
        """Customize app list ordering"""
        app_list = super().get_app_list(request)
        
        # Custom ordering of apps
        app_order = [
            'apps.accounts',
            'apps.identity_verification',
            'apps.jobs',
            'apps.reports',
            'apps.reviews',
            'apps.notifications',
            'apps.audit',
        ]
        
        # Sort apps based on app_order
        ordered_apps = []
        for app_name in app_order:
            for app in app_list:
                if app['app_label'] == app_name:
                    ordered_apps.append(app)
                    break
        
        # Add remaining apps
        for app in app_list:
            if app not in ordered_apps:
                ordered_apps.append(app)
        
        return ordered_apps

# Create custom admin site instance
admin_site = KaJobAdminSite(name='kajob_admin')

# Register all models with custom admin site
# The model registrations will use this admin site
admin.site = admin_site
