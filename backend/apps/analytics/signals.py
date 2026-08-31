# apps/analytics/signals.py

from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.utils import timezone
from apps.analytics.services import TrackingService, StatsService
from apps.jobs.models import Job, JobApplication, JobAssignment
from apps.reviews.models import Review
from apps.accounts.models import User
import logging

logger = logging.getLogger(__name__)


# ============================================
# USER SIGNALS
# ============================================

@receiver(user_logged_in)
def track_user_login(sender, request, user, **kwargs):
    """Track user login for analytics."""
    try:
        # Track page view for login
        TrackingService.track_page_view(user, request)
        
        # Update user last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        logger.debug(f"User login tracked: {user.id}")
    except Exception as e:
        logger.error(f"Failed to track user login: {str(e)}")


@receiver(user_logged_out)
def track_user_logout(sender, request, user, **kwargs):
    """Track user logout for analytics."""
    try:
        # Track page view for logout
        TrackingService.track_page_view(user, request)
        logger.debug(f"User logout tracked: {user.id}")
    except Exception as e:
        logger.error(f"Failed to track user logout: {str(e)}")


# ============================================
# JOB SIGNALS
# ============================================

@receiver(post_save, sender=Job)
def track_job_created(sender, instance, created, **kwargs):
    """Track job creation for analytics."""
    if created and instance.client:
        try:
            TrackingService.track_page_view(instance.client)
            logger.debug(f"Job creation tracked: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to track job creation: {str(e)}")


# ============================================
# JOB APPLICATION SIGNALS
# ============================================

@receiver(post_save, sender=JobApplication)
def track_job_application(sender, instance, created, **kwargs):
    """Track job application for analytics."""
    if created and instance.worker:
        try:
            TrackingService.track_job_application(instance.worker, instance.job)
            logger.debug(f"Job application tracked: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to track job application: {str(e)}")


# ============================================
# JOB ASSIGNMENT SIGNALS
# ============================================

@receiver(post_save, sender=JobAssignment)
def track_job_assignment(sender, instance, created, **kwargs):
    """Track job assignment for analytics."""
    if created and instance.worker:
        try:
            TrackingService.track_page_view(instance.worker)
            logger.debug(f"Job assignment tracked: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to track job assignment: {str(e)}")


# ============================================
# REVIEW SIGNALS
# ============================================

@receiver(post_save, sender=Review)
def track_review_created(sender, instance, created, **kwargs):
    """Track review creation for analytics."""
    if created:
        try:
            # Track for the reviewer
            if instance.reviewer:
                TrackingService.track_review_given(instance.reviewer, instance)
            
            # Track for the reviewee
            if instance.reviewee:
                TrackingService.track_review_received(instance.reviewee, instance)
            
            logger.debug(f"Review creation tracked: {instance.id}")
        except Exception as e:
            logger.error(f"Failed to track review creation: {str(e)}")


# ============================================
# DAILY STATS CALCULATION
# ============================================

@receiver(post_save, sender=User)
def trigger_stats_calculation(sender, instance, **kwargs):
    """Trigger daily stats calculation when significant events happen."""
    try:
        # Check if we should calculate stats (limit to avoid performance issues)
        from django.core.cache import cache
        key = 'daily_stats_calculated'
        if not cache.get(key):
            StatsService.calculate_daily_stats()
            cache.set(key, True, timeout=3600)  # Cache for 1 hour
    except Exception as e:
        logger.error(f"Failed to trigger stats calculation: {str(e)}")
