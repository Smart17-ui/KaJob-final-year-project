# apps/matching/urls.py

from django.urls import path
from apps.matching.views import (
    NearbyJobsView,
    NearbyJobsCountView,
    NearbyApplicantsView,
    AllApplicantsView,
)

urlpatterns = [
    # Worker endpoints
    path('nearby/', NearbyJobsView.as_view(), name='nearby-jobs'),
    path('nearby/count/', NearbyJobsCountView.as_view(), name='nearby-jobs-count'),
    
    # Client endpoints
    path('jobs/<int:job_id>/applicants/nearby/', NearbyApplicantsView.as_view(), name='nearby-applicants'),
    path('jobs/<int:job_id>/applicants/', AllApplicantsView.as_view(), name='all-applicants'),
]
