# apps/matching/urls.py

from django.urls import path
from apps.matching.views.matching_views import (
    NearbyJobsView,
    NearbyJobsCountView,
    NearbyApplicantsView,
    AllApplicantsView,
)
from apps.matching.views.geocoding_views import (
    ReverseGeocodeView,
    SearchLocationView,
)

app_name = 'matching'

urlpatterns = [
    # ============================================
    # WORKER ENDPOINTS
    # ============================================
    
    # GET /api/matching/nearby/?radius=1.0
    path('nearby/', NearbyJobsView.as_view(), name='nearby-jobs'),
    
    # GET /api/matching/nearby/count/?radius=1.0
    path('nearby/count/', NearbyJobsCountView.as_view(), name='nearby-jobs-count'),
    
    # ============================================
    # CLIENT ENDPOINTS
    # ============================================
    
    # GET /api/matching/jobs/4/applicants/nearby/?radius=1.0
    path('jobs/<int:job_id>/applicants/nearby/', NearbyApplicantsView.as_view(), name='nearby-applicants'),
    
    # GET /api/matching/jobs/4/applicants/
    path('jobs/<int:job_id>/applicants/', AllApplicantsView.as_view(), name='all-applicants'),
    
    # ============================================
    # 🆕 GEOCODING ENDPOINTS
    # ============================================
    
    # GET /api/matching/geocode/reverse/?lat=-15.3875&lng=28.3412
    path('geocode/reverse/', ReverseGeocodeView.as_view(), name='reverse-geocode'),
    
    # GET /api/matching/geocode/search/?q=Kamwala
    path('geocode/search/', SearchLocationView.as_view(), name='search-location'),
]
