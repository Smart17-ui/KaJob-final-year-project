# apps/reviews/urls.py

from django.urls import path
from apps.reviews.views import (
    CreateReviewView,
    WorkerReviewsView,
    MyReviewsView,
    MyReviewsGivenView,
    WorkerRatingStatsView,
    MyRatingStatsView,
    JobReviewsView,
    UnratedJobsView,
)

urlpatterns = [
    # Create review
    path('create/', CreateReviewView.as_view(), name='review-create'),
    
    # Worker reviews
    path('worker/<int:worker_id>/', WorkerReviewsView.as_view(), name='worker-reviews'),
    path('my-reviews/', MyReviewsView.as_view(), name='my-reviews'),
    path('my-reviews-given/', MyReviewsGivenView.as_view(), name='my-reviews-given'),
    
    # Rating stats
    path('stats/<int:worker_id>/', WorkerRatingStatsView.as_view(), name='worker-rating-stats'),
    path('my-stats/', MyRatingStatsView.as_view(), name='my-rating-stats'),
    
    # Job reviews
    path('job/<int:job_id>/', JobReviewsView.as_view(), name='job-reviews'),
    
    # Unrated jobs
    path('unrated-jobs/', UnratedJobsView.as_view(), name='unrated-jobs'),
]
