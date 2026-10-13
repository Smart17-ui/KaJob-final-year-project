# config/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.views.static import serve
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

    # Reports must come BEFORE the generic 'api/' mounts below.
    # apps.admin_panel.urls declares a 'reports/' route that would
    # otherwise shadow this one.
    path('api/reports/', include('apps.reports.urls')),

    # ============================================
    # API ENDPOINTS - GENERIC PATHS
    # ============================================

    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.identity_verification.urls')),
    path('api/', include('apps.audit.urls')),
    path('api/', include('apps.analytics.urls')),
    path('api/', include('apps.admin_panel.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # ============================================
    # API DOCUMENTATION
    # ============================================

    path(
        'api/schema/',
        SpectacularAPIView.as_view(),
        name='schema',
    ),

    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),

    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema'),
        name='redoc',
    ),

    # ============================================
    # ROOT REDIRECT
    # ============================================

    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
]


# ============================================
# MEDIA & STATIC FILES
# ============================================
#
# When DEBUG=True, Django can use the built-in helper `static()`.
# When DEBUG=False (production, e.g. on Render), `static()` becomes
# a no-op — so we register a URL pattern that serves media directly
# via `django.views.static.serve`. This makes uploaded files
# accessible even with DEBUG=False.
#
# WARNING: This is intended for demo deployments. Render's free tier
# uses an ephemeral disk, so uploaded files are deleted whenever the
# service redeploys. For production, move media to persistent storage
# (S3, Cloudflare R2, or a persistent Render disk).

if settings.DEBUG:
    # Development: use the standard helpers
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    # Production: serve media via Django's static view so uploaded
    # verification documents are reachable by the admin dashboard.
    urlpatterns += [
        re_path(
            r'^media/(?P<path>.*)$',
            serve,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]
