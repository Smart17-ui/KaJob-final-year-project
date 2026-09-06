# config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints - Specific paths FIRST
    path('api/jobs/', include('apps.jobs.urls')),           # ✅ Jobs at /api/jobs/
    path('api/matching/', include('apps.matching.urls')),   # ✅ Matching at /api/matching/
    path('api/reviews/', include('apps.reviews.urls')),     # ✅ Reviews at /api/reviews/
    
    # Generic API endpoints
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.identity_verification.urls')),
    path('api/', include('apps.audit.urls')),
    path('api/', include('apps.analytics.urls')),
    path('api/', include('apps.admin_panel.urls')),
    path('api/', include('apps.notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
