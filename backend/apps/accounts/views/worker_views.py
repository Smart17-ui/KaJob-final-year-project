# apps/accounts/views/worker_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Count

from apps.accounts.models import User, WorkerProfile
from apps.common.permissions import IsClient, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import ResourceNotFound


class WorkerDetailView(APIView):
    """
    GET /api/workers/{id}/
    Get worker profile details for a client.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request, worker_id):
        # FIXED: use account_status='ACTIVE' instead of is_active=True
        try:
            user = User.objects.get(
                id=worker_id,
                account_status='ACTIVE',
                deleted_at__isnull=True
            )
        except User.DoesNotExist:
            return Response({
                'error': 'Worker not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has worker role
        if not user.is_worker:
            return Response({
                'error': 'User is not a worker.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get worker profile
        try:
            worker_profile = WorkerProfile.objects.get(user=user)
        except WorkerProfile.DoesNotExist:
            return Response({
                'error': 'Worker profile not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get worker's skills
        skills = [skill.name for skill in worker_profile.skills.all()]
        
        # Get worker's reviews and ratings
        reviews_data = self._get_worker_reviews(user)
        
        # Build response
        return Response({
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'phone_number': user.phone_number,
            'bio': worker_profile.bio or '',
            'hourly_rate': str(worker_profile.hourly_rate) if worker_profile.hourly_rate else None,
            'average_rating': reviews_data['average_rating'],
            'total_reviews': reviews_data['total_reviews'],
            'jobs_completed': worker_profile.jobs_completed or 0,
            'skills': skills,
            'availability_status': worker_profile.availability_status,
            'profile_photo': self._get_profile_photo(user),
            'location': self._get_user_location(user),
            'recent_reviews': reviews_data['recent_reviews'],
            'verified': user.is_verified,
            'member_since': user.created_at.strftime('%Y-%m-%d') if user.created_at else None,
        }, status=status.HTTP_200_OK)
    
    def _get_profile_photo(self, user):
        """Get user's profile photo path."""
        if hasattr(user, 'profile') and user.profile:
            return user.profile.profile_photo_path if user.profile.profile_photo_path else None
        return None
    
    def _get_user_location(self, user):
        """Get user's location from profile."""
        if hasattr(user, 'profile') and user.profile:
            profile = user.profile
            if profile.latitude and profile.longitude:
                return {
                    'latitude': float(profile.latitude),
                    'longitude': float(profile.longitude),
                }
        return None
    
    def _get_worker_reviews(self, user):
        """Get reviews and ratings for a worker."""
        try:
            from apps.reviews.models import Review
            
            reviews = Review.objects.filter(
                reviewee=user,
                job_completed=True
            ).select_related('reviewer')
            
            total_reviews = reviews.count()
            average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
            
            recent_reviews = reviews.order_by('-created_at')[:5]
            
            return {
                'average_rating': round(float(average_rating), 1),
                'total_reviews': total_reviews,
                'recent_reviews': [
                    {
                        'rating': review.rating,
                        'comment': review.comment,
                        'reviewer_name': review.reviewer.full_name,
                        'created_at': review.created_at.isoformat(),
                    }
                    for review in recent_reviews
                ]
            }
        except ImportError:
            return {
                'average_rating': 0,
                'total_reviews': 0,
                'recent_reviews': []
            }
        except Exception as e:
            return {
                'average_rating': 0,
                'total_reviews': 0,
                'recent_reviews': []
            }


class WorkerSummaryView(APIView):
    """
    GET /api/workers/{id}/summary/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request, worker_id):
        # FIXED: use account_status='ACTIVE'
        try:
            user = User.objects.get(
                id=worker_id,
                account_status='ACTIVE',
                deleted_at__isnull=True
            )
        except User.DoesNotExist:
            return Response({
                'error': 'Worker not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_worker:
            return Response({
                'error': 'User is not a worker.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            worker_profile = WorkerProfile.objects.get(user=user)
        except WorkerProfile.DoesNotExist:
            return Response({
                'error': 'Worker profile not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        skills = [skill.name for skill in worker_profile.skills.all()]
        
        try:
            from apps.reviews.models import Review
            average_rating = Review.objects.filter(
                reviewee=user,
                job_completed=True
            ).aggregate(Avg('rating'))['rating__avg'] or 0
        except:
            average_rating = 0
        
        return Response({
            'id': user.id,
            'full_name': user.full_name,
            'average_rating': round(float(average_rating), 1),
            'jobs_completed': worker_profile.jobs_completed or 0,
            'skills': skills,
            'availability_status': worker_profile.availability_status,
        }, status=status.HTTP_200_OK)


class WorkerApplicationsView(APIView):
    """
    GET /api/workers/{id}/applications/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request, worker_id):
        from apps.jobs.models import JobApplication
        from apps.jobs.serializers import JobApplicationListSerializer
        
        # FIXED: use account_status='ACTIVE'
        try:
            user = User.objects.get(
                id=worker_id,
                account_status='ACTIVE',
                deleted_at__isnull=True
            )
        except User.DoesNotExist:
            return Response({
                'error': 'Worker not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_worker:
            return Response({
                'error': 'User is not a worker.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        applications = JobApplication.objects.filter(
            worker_id=worker_id
        ).select_related('job', 'job__client')
        
        applications = applications.filter(job__client_id=request.user.id)
        applications = applications.order_by('-applied_at')
        
        return Response({
            'count': len(applications),
            'results': JobApplicationListSerializer(applications, many=True).data
        }, status=status.HTTP_200_OK)


class WorkerAvailabilityView(APIView):
    """
    GET /api/workers/{id}/availability/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request, worker_id):
        from apps.jobs.models import JobAssignment
        from apps.common.constants import AssignmentStatus
        
        # FIXED: use account_status='ACTIVE'
        try:
            user = User.objects.get(
                id=worker_id,
                account_status='ACTIVE',
                deleted_at__isnull=True
            )
        except User.DoesNotExist:
            return Response({
                'error': 'Worker not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_worker:
            return Response({
                'error': 'User is not a worker.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        active_jobs_count = JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).count()
        
        try:
            worker_profile = WorkerProfile.objects.get(user=user)
            availability_status = worker_profile.availability_status
        except WorkerProfile.DoesNotExist:
            availability_status = 'UNAVAILABLE'
        
        is_available = (
            availability_status == 'AVAILABLE' and
            active_jobs_count == 0
        )
        
        return Response({
            'id': user.id,
            'is_available': is_available,
            'availability_status': availability_status,
            'active_jobs_count': active_jobs_count,
        }, status=status.HTTP_200_OK)
