# apps/analytics/views/stats_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone

from apps.analytics.services import AnalyticsService
from apps.analytics.serializers import (
    DailyStatsSerializer,
    WeeklyStatsSerializer,
    MonthlyStatsSerializer,
    UserActivitySerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser


analytics_service = AnalyticsService()


class UserActivityView(APIView):
    """
    GET /api/analytics/user-activity/{user_id}/
    Get activity for a specific user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, user_id):
        days = request.query_params.get('days', 7)
        try:
            days = int(days)
        except ValueError:
            days = 7
        
        days = min(days, 30)  # Limit to 30 days
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        activities = analytics_service.repository.get_user_activity_range(
            user_id, start_date, end_date
        )
        
        return Response({
            'user_id': user_id,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days,
            },
            'count': len(activities),
            'results': UserActivitySerializer(activities, many=True).data,
        }, status=status.HTTP_200_OK)


class UserActivitySummaryView(APIView):
    """
    GET /api/analytics/user-activity/{user_id}/summary/
    Get activity summary for a specific user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, user_id):
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        days = min(days, 90)
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        activities = analytics_service.repository.get_user_activity_range(
            user_id, start_date, end_date
        )
        
        # Calculate summary
        total_page_views = sum(a.page_views for a in activities)
        total_jobs_viewed = sum(a.jobs_viewed for a in activities)
        total_jobs_applied = sum(a.jobs_applied for a in activities)
        total_jobs_completed = sum(a.jobs_completed for a in activities)
        total_reviews_given = sum(a.reviews_given for a in activities)
        total_reviews_received = sum(a.reviews_received for a in activities)
        
        # Calculate averages
        days_with_activity = len(activities)
        avg_page_views = round(total_page_views / days_with_activity, 1) if days_with_activity > 0 else 0
        
        # Get last activity
        last_activity = activities[0] if activities else None
        
        return Response({
            'user_id': user_id,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days,
            },
            'summary': {
                'total_page_views': total_page_views,
                'total_jobs_viewed': total_jobs_viewed,
                'total_jobs_applied': total_jobs_applied,
                'total_jobs_completed': total_jobs_completed,
                'total_reviews_given': total_reviews_given,
                'total_reviews_received': total_reviews_received,
                'avg_page_views_per_day': avg_page_views,
                'days_active': days_with_activity,
                'last_active': UserActivitySerializer(last_activity).data if last_activity else None,
            }
        }, status=status.HTTP_200_OK)


class TopUsersView(APIView):
    """
    GET /api/analytics/top-users/
    Get top users by activity (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        days = request.query_params.get('days', 7)
        try:
            days = int(days)
        except ValueError:
            days = 7
        
        days = min(days, 30)
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10
        
        limit = min(limit, 50)
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        from apps.analytics.models import UserActivity
        from django.db.models import Sum, Count
        
        # Get top users by page views
        top_users = UserActivity.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('user_id', 'user__full_name').annotate(
            total_page_views=Sum('page_views'),
            total_jobs_viewed=Sum('jobs_viewed'),
            total_jobs_applied=Sum('jobs_applied'),
            total_jobs_completed=Sum('jobs_completed'),
            total_reviews_given=Sum('reviews_given'),
            total_reviews_received=Sum('reviews_received'),
            days_active=Count('id')
        ).order_by('-total_page_views')[:limit]
        
        return Response({
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days,
            },
            'count': len(top_users),
            'results': list(top_users),
        }, status=status.HTTP_200_OK)


class PlatformStatsView(APIView):
    """
    GET /api/analytics/platform-stats/
    Get comprehensive platform statistics (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.jobs.models import Job
        from apps.reviews.models import Review
        
        User = get_user_model()
        
        # User Stats
        total_users = User.objects.filter(is_active=True).count()
        workers = User.objects.filter(role='WORKER', is_active=True).count()
        clients = User.objects.filter(role='CLIENT', is_active=True).count()
        both_roles = User.objects.filter(role='BOTH', is_active=True).count()
        verified_users = User.objects.filter(is_verified=True, is_active=True).count()
        
        # Job Stats
        total_jobs = Job.objects.count()
        open_jobs = Job.objects.filter(status='OPEN').count()
        assigned_jobs = Job.objects.filter(status='ASSIGNED').count()
        in_progress = Job.objects.filter(status='IN_PROGRESS').count()
        completed_jobs = Job.objects.filter(status='COMPLETED').count()
        cancelled_jobs = Job.objects.filter(status='CANCELLED').count()
        
        # Review Stats
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Rating distribution
        rating_distribution = {}
        for i in range(0, 6):
            count = Review.objects.filter(rating=i).count()
            rating_distribution[str(i)] = count
        
        # Daily stats (last 7 days)
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        daily_stats = analytics_service.repository.get_daily_stats_range(week_ago, today)
        
        daily_summary = []
        for stat in daily_stats:
            daily_summary.append({
                'date': stat.date.isoformat(),
                'new_users': stat.new_users,
                'jobs_created': stat.jobs_created,
                'jobs_completed': stat.jobs_completed,
                'reviews_created': stat.reviews_created,
                'page_views': stat.total_page_views,
                'unique_visitors': stat.unique_visitors,
            })
        
        return Response({
            'users': {
                'total': total_users,
                'workers': workers,
                'clients': clients,
                'both_roles': both_roles,
                'verified': verified_users,
                'active_today': daily_stats[-1].active_users if daily_stats else 0,
            },
            'jobs': {
                'total': total_jobs,
                'open': open_jobs,
                'assigned': assigned_jobs,
                'in_progress': in_progress,
                'completed': completed_jobs,
                'cancelled': cancelled_jobs,
                'completion_rate': round((completed_jobs / total_jobs * 100) if total_jobs > 0 else 0, 1),
            },
            'reviews': {
                'total': total_reviews,
                'average_rating': round(avg_rating, 1),
                'rating_distribution': rating_distribution,
            },
            'daily_summary': daily_summary,
            'generated_at': timezone.now().isoformat(),
        }, status=status.HTTP_200_OK)


class ComparisonStatsView(APIView):
    """
    GET /api/analytics/comparison/
    Get comparison stats (week over week, month over month) (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        from django.db.models import Sum
        
        today = timezone.now().date()
        
        # This week vs Last week
        this_week_start = today - timedelta(days=today.weekday())
        last_week_start = this_week_start - timedelta(days=7)
        
        this_week_stats = analytics_service.repository.get_daily_stats_range(
            this_week_start, this_week_start + timedelta(days=6)
        )
        last_week_stats = analytics_service.repository.get_daily_stats_range(
            last_week_start, last_week_start + timedelta(days=6)
        )
        
        # This month vs Last month
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        
        this_month_stats = analytics_service.repository.get_daily_stats_range(
            this_month_start, today
        )
        last_month_stats = analytics_service.repository.get_daily_stats_range(
            last_month_start, last_month_end
        )
        
        def aggregate_stats(stats):
            return {
                'new_users': sum(s.new_users for s in stats),
                'jobs_created': sum(s.jobs_created for s in stats),
                'jobs_completed': sum(s.jobs_completed for s in stats),
                'reviews_created': sum(s.reviews_created for s in stats),
                'page_views': sum(s.total_page_views for s in stats),
                'unique_visitors': sum(s.unique_visitors for s in stats),
            }
        
        this_week_agg = aggregate_stats(this_week_stats)
        last_week_agg = aggregate_stats(last_week_stats)
        this_month_agg = aggregate_stats(this_month_stats)
        last_month_agg = aggregate_stats(last_month_stats)
        
        def calculate_change(current, previous):
            if previous == 0:
                return 0 if current == 0 else 100
            return round(((current - previous) / previous) * 100, 1)
        
        return Response({
            'week_over_week': {
                'this_week': this_week_agg,
                'last_week': last_week_agg,
                'changes': {
                    'new_users': calculate_change(this_week_agg['new_users'], last_week_agg['new_users']),
                    'jobs_created': calculate_change(this_week_agg['jobs_created'], last_week_agg['jobs_created']),
                    'jobs_completed': calculate_change(this_week_agg['jobs_completed'], last_week_agg['jobs_completed']),
                    'reviews_created': calculate_change(this_week_agg['reviews_created'], last_week_agg['reviews_created']),
                    'page_views': calculate_change(this_week_agg['page_views'], last_week_agg['page_views']),
                }
            },
            'month_over_month': {
                'this_month': this_month_agg,
                'last_month': last_month_agg,
                'changes': {
                    'new_users': calculate_change(this_month_agg['new_users'], last_month_agg['new_users']),
                    'jobs_created': calculate_change(this_month_agg['jobs_created'], last_month_agg['jobs_created']),
                    'jobs_completed': calculate_change(this_month_agg['jobs_completed'], last_month_agg['jobs_completed']),
                    'reviews_created': calculate_change(this_month_agg['reviews_created'], last_month_agg['reviews_created']),
                    'page_views': calculate_change(this_month_agg['page_views'], last_month_agg['page_views']),
                }
            },
            'generated_at': timezone.now().isoformat(),
        }, status=status.HTTP_200_OK)
