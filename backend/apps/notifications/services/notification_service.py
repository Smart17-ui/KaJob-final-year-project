# apps/notifications/services/notification_service.py

import logging
from typing import Dict, Any, List, Optional
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification
from apps.notifications.repositories import NotificationRepository
from apps.common.constants import NotificationType
from infrastructure.websocket.services import NotificationBroadcastService

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for managing notifications with WebSocket broadcasting.
    """
    
    def __init__(self):
        self.repository = NotificationRepository()
    
    # ============================================
    # CREATE NOTIFICATION
    # ============================================
    
    @transaction.atomic
    def create_notification(
        self,
        recipient_id: int,
        notification_type: str,
        title: str,
        message: str,
        related_entity_id: int = None,
        related_entity_type: str = None,
        redirect_url: str = None,
        data: dict = None,
        send_email: bool = True,
        send_push: bool = True,
    ) -> Optional[Notification]:
        """
        Create a notification and broadcast via WebSocket.
        """
        try:
            user = User.objects.get(id=recipient_id, is_active=True)
        except User.DoesNotExist:
            logger.warning(f"User {recipient_id} not found or inactive")
            return None
        
        # Check user preferences
        preferences = self.repository.get_or_create_preferences(recipient_id)
        pref_key = notification_type.lower()
        
        # Create in-app notification
        notification = None
        if preferences.in_app_enabled and preferences.is_enabled(pref_key):
            notification = self.repository.create(
                recipient=user,
                title=title,
                message=message,
                notification_type=notification_type,
                related_entity_id=related_entity_id,
                related_entity_type=related_entity_type or '',
                redirect_url=redirect_url or '',
                data=data or {},
                is_read=False,
            )
            logger.info(f"In-app notification created for user {recipient_id}: {notification_type}")
            
            # ✅ Broadcast via WebSocket using NotificationBroadcastService
            if notification:
                NotificationBroadcastService.send_notification_to_user(
                    recipient_id,
                    {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'notification_type': notification.notification_type,
                        'related_entity_id': notification.related_entity_id,
                        'related_entity_type': notification.related_entity_type,
                        'redirect_url': notification.redirect_url,
                        'data': notification.data,
                        'created_at': notification.created_at.isoformat(),
                        'is_read': notification.is_read,
                    }
                )
        
        # Send email
        if send_email and preferences.email_enabled and preferences.is_enabled(pref_key):
            self._send_email_notification(user, notification_type, title, message, data)
        
        # Send push notification via WebSocket if notification was created
        if send_push and preferences.push_enabled and preferences.is_enabled(pref_key):
            if notification:
                # Already sent via WebSocket above
                pass
            else:
                # Send push without creating notification
                self._send_push_notification(
                    recipient_id, 
                    notification_type, 
                    title, 
                    message, 
                    redirect_url, 
                    data
                )
        
        return notification
    
    # ============================================
    # EMAIL NOTIFICATIONS
    # ============================================
    
    def _send_email_notification(self, user, notification_type, title, message, data):
        """Send email notification based on type."""
        try:
            from apps.notifications.services import EmailService
            email_service = EmailService()
            
            # Map notification type to email template
            email_type = notification_type.lower()
            
            if email_type == 'job_posted':
                job = data.get('job')
                distance = data.get('distance')
                if job:
                    email_service.send_job_posted_email(user, job, distance)
            
            elif email_type == 'worker_assigned':
                job = data.get('job')
                if job:
                    email_service.send_job_assigned_email(user, job)
            
            elif email_type == 'job_completed':
                job = data.get('job')
                worker = data.get('worker')
                if job and worker:
                    email_service.send_job_completed_email(user, job, worker)
            
            elif email_type == 'application_accepted':
                job = data.get('job')
                if job:
                    email_service.send_application_accepted_email(user, job)
            
            elif email_type == 'application_rejected':
                job = data.get('job')
                if job:
                    email_service.send_application_rejected_email(user, job)
            
            elif email_type == 'review_received':
                review = data.get('review')
                if review:
                    email_service.send_new_review_email(user, review)
            
            elif email_type == 'verification_approved':
                email_service.send_verification_approved_email(user)
            
            elif email_type == 'verification_rejected':
                reason = data.get('reason', 'No reason provided')
                email_service.send_verification_rejected_email(user, reason)
            
            else:
                # Generic email
                context = {
                    'user': user,
                    'full_name': user.full_name,
                    'title': title,
                    'message': message,
                    'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                }
                email_service.send_email(
                    to_email=user.email,
                    subject=title,
                    template_name='notification',
                    context=context,
                )
            
            logger.info(f"Email sent to {user.email} for {notification_type}")
            
        except Exception as e:
            logger.error(f"Failed to send email for {notification_type}: {str(e)}")
    
    # ============================================
    # PUSH NOTIFICATIONS
    # ============================================
    
    def _send_push_notification(self, user_id, notification_type, title, message, redirect_url, data):
        """
        Send push notification via WebSocket.
        Uses NotificationBroadcastService from infrastructure.
        """
        try:
            NotificationBroadcastService.send_notification_to_user(
                user_id,
                {
                    'type': 'push_notification',
                    'notification_type': notification_type,
                    'title': title,
                    'message': message,
                    'redirect_url': redirect_url,
                    'data': data,
                    'timestamp': timezone.now().isoformat(),
                }
            )
            logger.info(f"Push notification sent to user {user_id}: {notification_type}")
                
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
    
    # ============================================
    # GET NOTIFICATIONS
    # ============================================
    
    def get_user_notifications(self, user_id: int, limit: int = 50) -> List[Notification]:
        """Get notifications for a user."""
        return self.repository.get_by_recipient(user_id, limit)
    
    def get_unread_notifications(self, user_id: int) -> List[Notification]:
        """Get unread notifications for a user."""
        return self.repository.get_unread_by_recipient(user_id)
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user."""
        return self.repository.get_unread_count(user_id)
    
    # ============================================
    # MARK OPERATIONS
    # ============================================
    
    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark a notification as read and broadcast update."""
        notification = self.repository.mark_as_read(notification_id, user_id)
        
        if notification:
            # Broadcast update via WebSocket
            NotificationBroadcastService.send_notification_to_user(
                user_id,
                {
                    'type': 'notification_read',
                    'notification_id': notification_id,
                    'is_read': True,
                }
            )
        
        return notification is not None
    
    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user."""
        count = self.repository.mark_all_as_read(user_id)
        
        # Broadcast update via WebSocket
        NotificationBroadcastService.send_notification_to_user(
            user_id,
            {
                'type': 'all_notifications_read',
                'count': count,
            }
        )
        
        return count
    
    def delete_all(self, user_id: int) -> int:
        """Delete all notifications for a user."""
        return self.repository.delete_all(user_id)
    
    # ============================================
    # PREFERENCES
    # ============================================
    
    def get_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get notification preferences for a user."""
        preferences = self.repository.get_or_create_preferences(user_id)
        from apps.notifications.serializers import NotificationPreferenceSerializer
        return NotificationPreferenceSerializer(preferences).data
    
    def update_preferences(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update notification preferences for a user."""
        preferences = self.repository.update_preferences(user_id, data)
        from apps.notifications.serializers import NotificationPreferenceSerializer
        return NotificationPreferenceSerializer(preferences).data
    
    # ============================================
    # CONVENIENCE METHODS
    # ============================================
    
    def notify_job_posted(self, worker, job, distance=None):
        """Notify worker about a new job."""
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='JOB_POSTED',
            title='New Job Available!',
            message=f"{job.title} - {distance or 'nearby'}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/jobs/{job.id}",
            data={'job': job, 'distance': distance},
        )
    
    def notify_job_assigned(self, worker, job):
        """Notify worker they've been assigned to a job."""
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='WORKER_ASSIGNED',
            title='You\'ve Been Assigned!',
            message=f"You have been assigned to: {job.title}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/jobs/{job.id}",
            data={'job': job},
        )
    
    def notify_job_completed(self, client, job, worker):
        """Notify client that worker completed the job."""
        return self.create_notification(
            recipient_id=client.id,
            notification_type='JOB_COMPLETED',
            title='Job Completed!',
            message=f"{worker.full_name} has completed: {job.title}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/jobs/{job.id}/confirm",
            data={'job': job, 'worker': worker},
        )
    
    def notify_application_accepted(self, worker, job):
        """Notify worker their application was accepted."""
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='APPLICATION_ACCEPTED',
            title='Application Accepted!',
            message=f"Your application for {job.title} has been accepted!",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/jobs/{job.id}",
            data={'job': job},
        )
    
    def notify_application_rejected(self, worker, job):
        """Notify worker their application was rejected."""
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='APPLICATION_REJECTED',
            title='Application Update',
            message=f"Your application for {job.title} has been rejected.",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/jobs/{job.id}",
            data={'job': job},
        )
    
    def notify_new_review(self, worker, review):
        """Notify worker about a new review."""
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='REVIEW_RECEIVED',
            title='New Review!',
            message=f"{review.reviewer.full_name} gave you {review.rating}★ for {review.job.title}",
            related_entity_id=review.id,
            related_entity_type='REVIEW',
            redirect_url=f"/my-reviews",
            data={'review': review},
        )
    
    def notify_verification_approved(self, user):
        """Notify user their verification was approved."""
        return self.create_notification(
            recipient_id=user.id,
            notification_type='VERIFICATION_APPROVED',
            title='Verification Approved! 🎉',
            message='Your identity has been verified. Welcome to KaJob!',
            redirect_url="/dashboard",
            data={'reason': 'approved'},
        )
    
    def notify_verification_rejected(self, user, reason):
        """Notify user their verification was rejected."""
        return self.create_notification(
            recipient_id=user.id,
            notification_type='VERIFICATION_REJECTED',
            title='Verification Rejected',
            message=f'Your verification was rejected. Reason: {reason}',
            redirect_url="/verification",
            data={'reason': reason},
        )
