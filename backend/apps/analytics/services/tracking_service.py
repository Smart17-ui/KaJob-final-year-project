# apps/analytics/services/tracking_service.py

import logging
from datetime import datetime
from django.utils import timezone
from apps.analytics.models import UserActivity

logger = logging.getLogger(__name__)


class TrackingService:
    """
    Service for tracking user activity.
    """
    
    @classmethod
    def get_or_create_activity(cls, user, date=None):
        """Get or create user activity for today."""
        if date is None:
            date = timezone.now().date()
        
        activity, created = UserActivity.objects.get_or_create(
            user=user,
            date=date,
            defaults={
                'page_views': 0,
                'jobs_viewed': 0,
                'jobs_applied': 0,
                'jobs_completed': 0,
                'reviews_given': 0,
                'reviews_received': 0,
                'session_count': 0,
                'total_time_spent': 0,
            }
        )
        return activity
    
    @classmethod
    def track_page_view(cls, user, request=None):
        """Track a page view."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.page_views += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked page view for user {user.id}")
        except Exception as e:
            logger.error(f"Failed to track page view: {str(e)}")
    
    @classmethod
    def track_job_view(cls, user, job):
        """Track a job view."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.jobs_viewed += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked job view for user {user.id}, job {job.id}")
        except Exception as e:
            logger.error(f"Failed to track job view: {str(e)}")
    
    @classmethod
    def track_job_application(cls, user, job):
        """Track a job application."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.jobs_applied += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked job application for user {user.id}, job {job.id}")
        except Exception as e:
            logger.error(f"Failed to track job application: {str(e)}")
    
    @classmethod
    def track_job_completion(cls, user, job):
        """Track a job completion."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.jobs_completed += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked job completion for user {user.id}, job {job.id}")
        except Exception as e:
            logger.error(f"Failed to track job completion: {str(e)}")
    
    @classmethod
    def track_review_given(cls, user, review):
        """Track a review given."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.reviews_given += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked review given for user {user.id}")
        except Exception as e:
            logger.error(f"Failed to track review given: {str(e)}")
    
    @classmethod
    def track_review_received(cls, user, review):
        """Track a review received."""
        try:
            activity = cls.get_or_create_activity(user)
            activity.reviews_received += 1
            activity.last_active_at = timezone.now()
            activity.save()
            logger.debug(f"Tracked review received for user {user.id}")
        except Exception as e:
            logger.error(f"Failed to track review received: {str(e)}")
