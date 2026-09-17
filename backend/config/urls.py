# config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # ============================================
    # DJANGO ADMIN
    # ============================================
    path('admin/', admin.site.urls),
    
    # ============================================
    # API ENDPOINTS - SPECIFIC PATHS FIRST
    # ============================================
    
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    
    # ============================================
    # API ENDPOINTS - GENERIC PATHS
    # ============================================
    
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.identity_verification.urls')),
    path('api/', include('apps.audit.urls')),
    path('api/', include('apps.analytics.urls')),
    path('api/', include('apps.admin_panel.urls')),
    path('api/', include('apps.notifications.urls')),
    
    # ============================================
    # API DOCUMENTATION
    # ============================================
    
    # Schema (JSON/YAML) - used by Swagger and ReDoc
    path(
        'api/schema/',
        SpectacularAPIView.as_view(),
        name='schema',
    ),
    
    # Swagger UI - interactive API documentation
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),
    
    # ReDoc - alternative API documentation
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema'),
        name='redoc',
    ),
    
    # ============================================
    # ROOT REDIRECT
    # ============================================
    
    # Redirect root to Swagger docs
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
]

# ============================================
# MEDIA & STATIC FILES (Development Only)
# ============================================

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
