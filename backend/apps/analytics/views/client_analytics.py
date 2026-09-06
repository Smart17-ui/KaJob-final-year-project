# apps/analytics/views/client_analytics.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
import logging

from apps.jobs.models import Job, JobApplication, JobAssignment
from apps.reviews.models import Review
from apps.common.permissions import IsClient, IsActiveUser, IsVerifiedUser
from apps.analytics.serializers import ClientAnalyticsSerializer

logger = logging.getLogger(__name__)


class ClientAnalyticsView(APIView):
    """
    GET /api/analytics/client/
    Get comprehensive analytics for the authenticated client.
    
    🔒 Only verified clients can access this.
    
    Returns:
        - Job statistics (total, open, assigned, in_progress, completed, cancelled)
        - Application statistics (total, pending, accepted, rejected)
        - Spending statistics (total, completed, in_progress)
        - Worker statistics (total_hired, active, completed, average_rating, total_reviews)
        - Top job categories
        - Recent activity
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request):
        client = request.user
        
        try:
            # Get all jobs posted by this client
            jobs = Job.objects.filter(client=client, deleted_at__isnull=True)
            
            # Get applications for all jobs
            applications = JobApplication.objects.filter(job__in=jobs)
            
            # Get assignments for all jobs
            assignments = JobAssignment.objects.filter(job__in=jobs)
            
            # Get reviews for workers hired by this client
            reviews = Review.objects.filter(job__in=jobs)
            
            # Build the analytics data
            data = {
                'jobs': self._get_job_stats(jobs),
                'applications': self._get_application_stats(applications),
                'spending': self._get_spending_stats(jobs),
                'workers': self._get_worker_stats(assignments, reviews),
                'top_categories': self._get_top_categories(jobs),
                'recent_activity': self._get_recent_activity(jobs, applications, assignments),
                'summary': self._get_summary(jobs, applications, assignments, reviews),
            }
            
            serializer = ClientAnalyticsSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching client analytics: {str(e)}")
            return Response(
                {'error': 'Failed to fetch analytics data.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_job_stats(self, jobs):
        """Get job statistics for the client."""
        return {
            'total': jobs.count(),
            'open': jobs.filter(status='OPEN').count(),
            'assigned': jobs.filter(status='ASSIGNED').count(),
            'in_progress': jobs.filter(status='IN_PROGRESS').count(),
            'completed': jobs.filter(status='COMPLETED').count(),
            'cancelled': jobs.filter(status='CANCELLED').count(),
        }
    
    def _get_application_stats(self, applications):
        """Get application statistics for the client."""
        return {
            'total': applications.count(),
            'pending': applications.filter(status='PENDING').count(),
            'accepted': applications.filter(status='ACCEPTED').count(),
            'rejected': applications.filter(status='REJECTED').count(),
            'withdrawn': applications.filter(status='WITHDRAWN').count(),
        }
    
    def _get_spending_stats(self, jobs):
        """Get spending statistics for the client."""
        return {
            'total': jobs.aggregate(Sum('budget'))['budget__sum'] or 0,
            'completed': jobs.filter(status='COMPLETED').aggregate(Sum('budget'))['budget__sum'] or 0,
            'in_progress': jobs.filter(status__in=['ASSIGNED', 'IN_PROGRESS']).aggregate(Sum('budget'))['budget__sum'] or 0,
            'average_per_job': jobs.aggregate(Avg('budget'))['budget__avg'] or 0,
        }
    
    def _get_worker_stats(self, assignments, reviews):
        """Get worker statistics for the client."""
        return {
            'total_hired': assignments.count(),
            'active': assignments.filter(status='ACTIVE').count(),
            'in_progress': assignments.filter(status='IN_PROGRESS').count(),
            'completed': assignments.filter(status='COMPLETED').count(),
            'cancelled': assignments.filter(status='CANCELLED').count(),
            'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0,
            'total_reviews': reviews.count(),
        }
    
    def _get_top_categories(self, jobs):
        """Get top job categories for the client."""
        from apps.jobs.models import JobCategory
        
        top_categories = (
            jobs.values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        
        return [
            {
                'name': item['category__name'] or 'Uncategorized',
                'count': item['count'],
            }
            for item in top_categories
        ]
    
    def _get_recent_activity(self, jobs, applications, assignments):
        """Get recent activity for the client."""
        recent_activities = []
        
        # Get recent jobs
        for job in jobs.order_by('-posted_at')[:3]:
            recent_activities.append({
                'type': 'job_posted',
                'title': job.title,
                'status': job.status,
                'timestamp': job.posted_at.isoformat(),
            })
        
        # Get recent applications
        for app in applications.select_related('job', 'worker').order_by('-applied_at')[:3]:
            recent_activities.append({
                'type': 'application_received',
                'job_title': app.job.title,
                'worker_name': app.worker.full_name,
                'status': app.status,
                'timestamp': app.applied_at.isoformat(),
            })
        
        # Get recent assignments
        for assignment in assignments.select_related('job', 'worker').order_by('-assigned_at')[:3]:
            recent_activities.append({
                'type': 'worker_assigned',
                'job_title': assignment.job.title,
                'worker_name': assignment.worker.full_name,
                'status': assignment.status,
                'timestamp': assignment.assigned_at.isoformat(),
            })
        
        # Sort by timestamp and return top 10
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return recent_activities[:10]
    
    def _get_summary(self, jobs, applications, assignments, reviews):
        """Get summary statistics for the client."""
        total_jobs = jobs.count()
        completed_jobs = jobs.filter(status='COMPLETED').count()
        
        return {
            'total_jobs': total_jobs,
            'completion_rate': (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0,
            'total_applications': applications.count(),
            'total_workers_hired': assignments.count(),
            'total_spent': jobs.aggregate(Sum('budget'))['budget__sum'] or 0,
        }


class ClientJobAnalyticsView(APIView):
    """
    GET /api/analytics/client/jobs/
    Get detailed analytics for each job posted by the client.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request):
        client = request.user
        
        jobs = Job.objects.filter(client=client, deleted_at__isnull=True)
        
        result = []
        for job in jobs:
            applications = JobApplication.objects.filter(job=job)
            assignments = JobAssignment.objects.filter(job=job)
            reviews = Review.objects.filter(job=job)
            
            result.append({
                'job_id': job.id,
                'title': job.title,
                'budget': job.budget,
                'status': job.status,
                'status_display': dict(Job.STATUS_CHOICES).get(job.status),
                'posted_at': job.posted_at,
                'completed_at': job.completed_at,
                'applications_count': applications.count(),
                'pending_applications': applications.filter(status='PENDING').count(),
                'accepted_applications': applications.filter(status='ACCEPTED').count(),
                'rejected_applications': applications.filter(status='REJECTED').count(),
                'workers_hired': assignments.count(),
                'average_rating': reviews.aggregate(Avg('rating'))['rating__avg'] or 0,
                'total_reviews': reviews.count(),
            })
        
        return Response({
            'count': len(result),
            'results': result
        }, status=status.HTTP_200_OK)


class ClientTrendsView(APIView):
    """
    GET /api/analytics/client/trends/
    Get trend data for the client over time.
    
    Query Parameters:
        - period: 'week', 'month', 'quarter' (default: 'month')
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request):
        client = request.user
        period = request.query_params.get('period', 'month')
        
        # Determine date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'quarter':
            start_date = now - timedelta(days=90)
        else:  # month
            start_date = now - timedelta(days=30)
        
        # Get jobs in date range
        jobs = Job.objects.filter(
            client=client,
            posted_at__gte=start_date,
            deleted_at__isnull=True
        )
        
        # Group by date
        date_range = []
        current_date = start_date
        while current_date <= now:
            date_range.append(current_date.date())
            current_date += timedelta(days=1)
        
        trend_data = []
        for date in date_range:
            day_jobs = jobs.filter(posted_at__date=date)
            day_applications = JobApplication.objects.filter(
                job__in=day_jobs,
                applied_at__date=date
            )
            
            trend_data.append({
                'date': date.isoformat(),
                'jobs_posted': day_jobs.count(),
                'applications_received': day_applications.count(),
                'jobs_completed': day_jobs.filter(status='COMPLETED').count(),
            })
        
        return Response({
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat(),
            'data': trend_data
        }, status=status.HTTP_200_OK)
