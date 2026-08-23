# apps/reviews/views/review_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.reviews.services import ReviewService
from apps.reviews.serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
    ReviewListSerializer,
    RatingStatsSerializer,
    UnratedJobSerializer,
)
from apps.common.permissions import IsWorker, IsClient, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
review_service = ReviewService()


class CreateReviewView(APIView):
    """
    POST /api/reviews/create/
    Create a review for a worker.
    
    Rules:
    - Only clients can review
    - Job must be completed
    - One review per client per job
    - Clients cannot review themselves
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = review_service.create_review(
                request.user,
                serializer.validated_data
            )
            return Response({
                'message': result['message'],
                'review': ReviewSerializer(result['review']).data,
            }, status=status.HTTP_201_CREATED)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class WorkerReviewsView(APIView):
    """
    GET /api/reviews/worker/{worker_id}/
    Get all reviews for a specific worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, worker_id):
        reviews = review_service.get_reviews_for_worker(worker_id)
        return Response({
            'count': len(reviews),
            'results': ReviewListSerializer(reviews, many=True).data,
        }, status=status.HTTP_200_OK)


class MyReviewsView(APIView):
    """
    GET /api/reviews/my-reviews/
    Get all reviews for the authenticated user (as a worker).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        reviews = review_service.get_reviews_for_worker(request.user.id)
        return Response({
            'count': len(reviews),
            'results': ReviewListSerializer(reviews, many=True).data,
        }, status=status.HTTP_200_OK)


class MyReviewsGivenView(APIView):
    """
    GET /api/reviews/my-reviews-given/
    Get all reviews given by the authenticated user (as a client).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request):
        reviews = review_service.get_reviews_by_client(request.user.id)
        return Response({
            'count': len(reviews),
            'results': ReviewListSerializer(reviews, many=True).data,
        }, status=status.HTTP_200_OK)


class WorkerRatingStatsView(APIView):
    """
    GET /api/reviews/stats/{worker_id}/
    Get rating statistics for a worker.
    
    Returns:
        - average_rating
        - total_reviews
        - completed_jobs
        - incomplete_jobs
        - completion_rate
        - rating_distribution
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, worker_id):
        stats = review_service.get_rating_stats(worker_id)
        return Response(stats, status=status.HTTP_200_OK)


class MyRatingStatsView(APIView):
    """
    GET /api/reviews/my-stats/
    Get rating statistics for the authenticated user (as a worker).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        stats = review_service.get_rating_stats(request.user.id)
        return Response(stats, status=status.HTTP_200_OK)


class JobReviewsView(APIView):
    """
    GET /api/reviews/job/{job_id}/
    Get all reviews for a job.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, job_id):
        reviews = review_service.get_reviews_for_job(job_id)
        return Response({
            'count': len(reviews),
            'results': ReviewListSerializer(reviews, many=True).data,
        }, status=status.HTTP_200_OK)


class UnratedJobsView(APIView):
    """
    GET /api/reviews/unrated-jobs/
    Get all completed jobs that the client hasn't reviewed yet.
    
    This is used to show clients what jobs they need to review.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request):
        unrated_jobs = review_service.get_unrated_jobs(request.user.id)
        
        # Check if there are unrated jobs
        if unrated_jobs:
            return Response({
                'count': len(unrated_jobs),
                'message': 'You have unrated jobs. Please review them before posting new jobs.',
                'results': unrated_jobs,
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'count': 0,
                'message': 'You have no unrated jobs.',
                'results': [],
            }, status=status.HTTP_200_OK)
