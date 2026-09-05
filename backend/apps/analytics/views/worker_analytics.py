# apps/analytics/views/worker_analytics.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
import logging

from apps.jobs.models import JobApplication, JobAssignment, Job
from apps.reviews.models import Review
from apps.common.permissions import IsWorker, IsActiveUser, IsVerifiedUser
from apps.analytics.serializers import WorkerAnalyticsSerializer

logger = logging.getLogger(__name__)


class WorkerAnalyticsView(APIView):
    """
    GET /api/analytics/worker/
    Get comprehensive analytics for the authenticated worker.
    
    🔒 Only verified workers can access this.
    
    Returns:
        - Overview statistics (total_applications, accepted_applications, acceptance_rate)
        - Job statistics (total, active, in_progress, completed, cancelled)
        - Earnings statistics (total, average_per_job)
        - Performance statistics (average_rating, total_reviews, completion_rate)
        - Recent jobs
        - Rating distribution
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request):
        worker = request.user
        
        try:
            # Get all applications by this worker
            applications = JobApplication.objects.filter(worker=worker)
            
            # Get all assignments for this worker
            assignments = JobAssignment.objects.filter(worker=worker)
            
            # Get all reviews for this worker
            reviews = Review.objects.filter(reviewee=worker)
            
            # Build the analytics data
            data = {
                'overview': self._get_overview_stats(applications),
                'jobs': self._get_job_stats(assignments),
                'earnings': self._get_earnings_stats(assignments),
                'performance': self._get_performance_stats(reviews, assignments),
                'recent_jobs': self._get_recent_jobs(assignments),
                'rating_distribution': self._get_rating_distribution(reviews),
                'summary': self._get_summary(applications, assignments, reviews),
            }
            
            serializer = WorkerAnalyticsSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching worker analytics: {str(e)}")
            return Response(
                {'error': 'Failed to fetch analytics data.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_overview_stats(self, applications):
        """Get overview statistics for the worker."""
        total_applications = applications.count()
        accepted_applications = applications.filter(status='ACCEPTED').count()
        
        return {
            'total_applications': total_applications,
            'accepted_applications': accepted_applications,
            'acceptance_rate': (accepted_applications / total_applications * 100) if total_applications > 0 else 0,
        }
    
    def _get_job_stats(self, assignments):
        """Get job statistics for the worker."""
        return {
            'total': assignments.count(),
            'active': assignments.filter(status='ACTIVE').count(),
            'in_progress': assignments.filter(status='IN_PROGRESS').count(),
            'completed': assignments.filter(status='COMPLETED').count(),
            'cancelled': assignments.filter(status='CANCELLED').count(),
        }
    
    def _get_earnings_stats(self, assignments):
        """Get earnings statistics for the worker."""
        completed_assignments = assignments.filter(status='COMPLETED')
        
        total_earnings = completed_assignments.aggregate(
            Sum('job__budget')
        )['job__budget__sum'] or 0
        
        average_per_job = completed_assignments.aggregate(
            Avg('job__budget')
        )['job__budget__avg'] or 0
        
        return {
            'total': total_earnings,
            'average_per_job': average_per_job,
            'highest_paying': completed_assignments.order_by('-job__budget').first(),
            'lowest_paying': completed_assignments.order_by('job__budget').first(),
        }
    
    def _get_performance_stats(self, reviews, assignments):
        """Get performance statistics for the worker."""
        total_assignments = assignments.count()
        completed_assignments = assignments.filter(status='COMPLETED').count()
        
        return {
            'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0,
            'total_reviews': reviews.count(),
            'completion_rate': (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0,
            'positive_reviews': reviews.filter(rating__gte=4).count(),
            'negative_reviews': reviews.filter(rating__lte=2).count(),
        }
    
    def _get_recent_jobs(self, assignments):
        """Get recent jobs for the worker."""
        recent_assignments = assignments.select_related('job', 'job__client').order_by('-assigned_at')[:5]
        
        return [
            {
                'job_id': assignment.job_id,
                'title': assignment.job.title,
                'client_name': assignment.job.client.full_name,
                'budget': assignment.job.budget,
                'status': assignment.status,
                'status_display': dict(JobAssignment.STATUS_CHOICES).get(assignment.status),
                'assigned_at': assignment.assigned_at.isoformat(),
                'completed_at': assignment.completed_at.isoformat() if assignment.completed_at else None,
            }
            for assignment in recent_assignments
        ]
    
    def _get_rating_distribution(self, reviews):
        """Get rating distribution for the worker."""
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for rating in reviews.values_list('rating', flat=True):
            if rating in distribution:
                distribution[rating] += 1
        
        return distribution
    
    def _get_summary(self, applications, assignments, reviews):
        """Get summary statistics for the worker."""
        total_assignments = assignments.count()
        completed_assignments = assignments.filter(status='COMPLETED').count()
        
        return {
            'total_applications': applications.count(),
            'total_jobs_completed': completed_assignments,
            'total_earnings': assignments.filter(status='COMPLETED').aggregate(Sum('job__budget'))['job__budget__sum'] or 0,
            'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0,
            'total_reviews': reviews.count(),
            'completion_rate': (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0,
        }


class WorkerJobHistoryView(APIView):
    """
    GET /api/analytics/worker/jobs/
    Get detailed job history for the worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request):
        worker = request.user
        
        # Get all assignments for this worker
        assignments = JobAssignment.objects.filter(
            worker=worker
        ).select_related('job', 'job__client', 'job__category')
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            assignments = assignments.filter(status=status_filter)
        
        result = []
        for assignment in assignments:
            review = Review.objects.filter(job=assignment.job, reviewee=worker).first()
            
            result.append({
                'job_id': assignment.job.id,
                'title': assignment.job.title,
                'description': assignment.job.description,
                'category': assignment.job.category.name if assignment.job.category else None,
                'client_name': assignment.job.client.full_name,
                'budget': assignment.job.budget,
                'status': assignment.status,
                'status_display': dict(JobAssignment.STATUS_CHOICES).get(assignment.status),
                'assigned_at': assignment.assigned_at,
                'completed_at': assignment.completed_at,
                'rating': review.rating if review else None,
                'review_comment': review.comment if review else None,
            })
        
        return Response({
            'count': len(result),
            'results': result
        }, status=status.HTTP_200_OK)


class WorkerEarningsTrendView(APIView):
    """
    GET /api/analytics/worker/earnings-trend/
    Get earnings trend data for the worker over time.
    
    Query Parameters:
        - period: 'week', 'month', 'quarter' (default: 'month')
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request):
        worker = request.user
        period = request.query_params.get('period', 'month')
        
        # Determine date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        else:  # month
            start_date = now - timedelta(days=30)
        
        # Get completed assignments in date range
        assignments = JobAssignment.objects.filter(
            worker=worker,
            status='COMPLETED',
            completed_at__gte=start_date
        ).select_related('job')
        
        # Group by date
        date_range = []
        current_date = start_date
        while current_date <= now:
            date_range.append(current_date.date())
            current_date += timedelta(days=1)
        
        trend_data = []
        for date in date_range:
            day_assignments = assignments.filter(completed_at__date=date)
            
            trend_data.append({
                'date': date.isoformat(),
                'earnings': day_assignments.aggregate(Sum('job__budget'))['job__budget__sum'] or 0,
                'jobs_completed': day_assignments.count(),
            })
        
        return Response({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat(),
            'total_earnings': assignments.aggregate(Sum('job__budget'))['job__budget__sum'] or 0,
            'data': trend_data
        }, status=status.HTTP_200_OK)
