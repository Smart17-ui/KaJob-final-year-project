# apps/analytics/services/stats_service.py

import logging
from datetime import datetime, timedelta
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.jobs.models import Job
from apps.reviews.models import Review
from apps.audit.models import AuditLog
from apps.analytics.models import DailyStats, WeeklyStats, MonthlyStats

User = get_user_model()
logger = logging.getLogger(__name__)


class StatsService:
    """
    Service for calculating platform statistics.
    """
    
    @classmethod
    def calculate_daily_stats(cls, date=None):
        """Calculate statistics for a specific day."""
        if date is None:
            date = timezone.now().date()
        
        start_date = datetime.combine(date, datetime.min.time())
        end_date = datetime.combine(date, datetime.max.time())
        
        # User Stats
        total_users = User.objects.filter(is_active=True).count()
        total_workers = User.objects.filter(
            Q(role='WORKER') | Q(role='BOTH'),
            is_active=True
        ).count()
        total_clients = User.objects.filter(
            Q(role='CLIENT') | Q(role='BOTH'),
            is_active=True
        ).count()
        total_both = User.objects.filter(role='BOTH', is_active=True).count()
        verified_users = User.objects.filter(is_verified=True, is_active=True).count()
        active_users = User.objects.filter(
            last_login__range=[start_date, end_date],
            is_active=True
        ).count()
        
        # New Users
        new_users = User.objects.filter(
            date_joined__range=[start_date, end_date],
            is_active=True
        ).count()
        new_workers = User.objects.filter(
            date_joined__range=[start_date, end_date],
            role__in=['WORKER', 'BOTH'],
            is_active=True
        ).count()
        new_clients = User.objects.filter(
            date_joined__range=[start_date, end_date],
            role__in=['CLIENT', 'BOTH'],
            is_active=True
        ).count()
        
        # Job Stats
        total_jobs = Job.objects.count()
        jobs_created = Job.objects.filter(created_at__range=[start_date, end_date]).count()
        jobs_completed = Job.objects.filter(
            completed_at__range=[start_date, end_date],
            status='COMPLETED'
        ).count()
        jobs_cancelled = Job.objects.filter(
            status='CANCELLED',
            updated_at__range=[start_date, end_date]
        ).count()
        open_jobs = Job.objects.filter(status='OPEN').count()
        assigned_jobs = Job.objects.filter(status='ASSIGNED').count()
        in_progress_jobs = Job.objects.filter(status='IN_PROGRESS').count()
        
        # Review Stats
        total_reviews = Review.objects.count()
        reviews_created = Review.objects.filter(
            created_at__range=[start_date, end_date]
        ).count()
        avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Rating Distribution
        rating_distribution = {}
        for i in range(0, 6):
            count = Review.objects.filter(
                rating=i,
                created_at__range=[start_date, end_date]
            ).count()
            rating_distribution[str(i)] = count
        
        # Visit Stats
        total_page_views = AuditLog.objects.filter(
            created_at__range=[start_date, end_date]
        ).count()
        unique_visitors = AuditLog.objects.filter(
            created_at__range=[start_date, end_date]
        ).values('user_id').distinct().count()
        
        # Create or update daily stats
        stats, created = DailyStats.objects.update_or_create(
            date=date,
            defaults={
                'total_users': total_users,
                'total_workers': total_workers,
                'total_clients': total_clients,
                'total_both_roles': total_both,
                'verified_users': verified_users,
                'active_users': active_users,
                'new_users': new_users,
                'new_workers': new_workers,
                'new_clients': new_clients,
                'total_jobs': total_jobs,
                'jobs_created': jobs_created,
                'jobs_completed': jobs_completed,
                'jobs_cancelled': jobs_cancelled,
                'open_jobs': open_jobs,
                'assigned_jobs': assigned_jobs,
                'in_progress_jobs': in_progress_jobs,
                'total_reviews': total_reviews,
                'reviews_created': reviews_created,
                'avg_rating': avg_rating,
                'rating_distribution': rating_distribution,
                'total_page_views': total_page_views,
                'unique_visitors': unique_visitors,
            }
        )
        
        logger.info(f"Daily stats calculated for {date}")
        return stats
    
    @classmethod
    def calculate_all_stats(cls):
        """Calculate stats for today and ensure historical data exists."""
        today = timezone.now().date()
        
        # Calculate for today
        cls.calculate_daily_stats(today)
        
        # Calculate for the last 30 days if missing
        for i in range(1, 31):
            date = today - timedelta(days=i)
            if not DailyStats.objects.filter(date=date).exists():
                cls.calculate_daily_stats(date)
        
        # Calculate weekly stats for the last 4 weeks
        today_weekday = today.weekday()
        for i in range(4):
            week_start = today - timedelta(days=today_weekday + (i * 7))
            week_stats = WeeklyStats.objects.filter(week_start=week_start)
            if not week_stats.exists():
                # Calculate daily stats for the week first
                for j in range(7):
                    date = week_start + timedelta(days=j)
                    if not DailyStats.objects.filter(date=date).exists():
                        cls.calculate_daily_stats(date)
                # Aggregate weekly stats
                weekly_stats = DailyStats.objects.filter(
                    date__gte=week_start,
                    date__lt=week_start + timedelta(days=7)
                )
                if weekly_stats.exists():
                    WeekStats.objects.update_or_create(
                        week_start=week_start,
                        defaults={
                            'week_end': week_start + timedelta(days=6),
                            'total_users': weekly_stats.last().total_users,
                            'new_users': sum(stat.new_users for stat in weekly_stats),
                            'active_users': sum(stat.active_users for stat in weekly_stats),
                            'jobs_created': sum(stat.jobs_created for stat in weekly_stats),
                            'jobs_completed': sum(stat.jobs_completed for stat in weekly_stats),
                            'reviews_created': sum(stat.reviews_created for stat in weekly_stats),
                            'avg_rating': sum(stat.avg_rating for stat in weekly_stats) / weekly_stats.count(),
                            'total_page_views': sum(stat.total_page_views for stat in weekly_stats),
                            'unique_visitors': sum(stat.unique_visitors for stat in weekly_stats),
                        }
                    )
        
        # Calculate monthly stats for the last 12 months
        for i in range(12):
            month = today.replace(day=1) - timedelta(days=30 * i)
            month = month.replace(day=1)
            if not MonthlyStats.objects.filter(month=month).exists():
                # Aggregate weekly stats for the month
                month_weekly_stats = WeeklyStats.objects.filter(
                    week_start__gte=month,
                    week_start__lt=month.replace(day=28) + timedelta(days=4)
                )
                if month_weekly_stats.exists():
                    MonthlyStats.objects.update_or_create(
                        month=month,
                        defaults={
                            'total_users': month_weekly_stats.last().total_users,
                            'new_users': sum(stat.new_users for stat in month_weekly_stats),
                            'active_users': sum(stat.active_users for stat in month_weekly_stats),
                            'jobs_created': sum(stat.jobs_created for stat in month_weekly_stats),
                            'jobs_completed': sum(stat.jobs_completed for stat in month_weekly_stats),
                            'reviews_created': sum(stat.reviews_created for stat in month_weekly_stats),
                            'avg_rating': sum(stat.avg_rating for stat in month_weekly_stats) / month_weekly_stats.count(),
                            'total_page_views': sum(stat.total_page_views for stat in month_weekly_stats),
                            'unique_visitors': sum(stat.unique_visitors for stat in month_weekly_stats),
                        }
                    )
        
        logger.info("All stats calculated successfully")
