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
        role: Optional[str] = None,
    ) -> Optional[Notification]:
        """
        Create a notification and broadcast via WebSocket.

        Args:
            role: 'CLIENT' | 'WORKER' | 'ADMIN' | None
                  None means role-agnostic (shows on every dashboard).
        """
        try:
            user = User.objects.get(
                id=recipient_id,
                account_status='ACTIVE',
                deleted_at__isnull=True
            )
        except User.DoesNotExist:
            logger.warning(f"User {recipient_id} not found or inactive")
            return None

        preferences = self.repository.get_or_create_preferences(recipient_id)
        pref_key = notification_type.lower()

        # Sanitize data — convert any model instance to its PK
        if data:
            def _sanitize(v):
                if hasattr(v, '_meta'):
                    return v.pk
                if isinstance(v, dict):
                    return {k: _sanitize(val) for k, val in v.items()}
                if isinstance(v, (list, tuple)):
                    return [_sanitize(val) for val in v]
                return v
            data = {k: _sanitize(v) for k, v in data.items()}

        notification = None
        if preferences.in_app_enabled and preferences.is_enabled(pref_key):
            notification = self.repository.create(
                recipient=user,
                role=role,
                title=title,
                message=message,
                notification_type=notification_type,
                related_entity_id=related_entity_id,
                related_entity_type=related_entity_type or '',
                redirect_url=redirect_url or '',
                data=data or {},
                is_read=False,
            )
            logger.info(
                f"In-app notification created for user {recipient_id} "
                f"(role={role}): {notification_type}"
            )

            if notification:
                NotificationBroadcastService.send_notification_to_user(
                    recipient_id,
                    {
                        'id': notification.id,
                        'role': notification.role,
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

        if send_email and preferences.email_enabled and preferences.is_enabled(pref_key):
            self._send_email_notification(user, notification_type, title, message, data)

        if send_push and preferences.push_enabled and preferences.is_enabled(pref_key):
            if notification:
                pass  # already sent
            else:
                self._send_push_notification(
                    recipient_id, notification_type, title, message,
                    redirect_url, data
                )

        return notification

    # ============================================
    # EMAIL NOTIFICATIONS
    # ============================================

    def _send_email_notification(self, user, notification_type, title, message, data):
        """Send email notification based on type."""
        try:
            from apps.notifications.services import EmailService
            from apps.jobs.models import Job
            from apps.reviews.models import Review

            email_service = EmailService()
            email_type = notification_type.lower()
            data = data or {}

            if email_type == 'job_posted':
                job_id = data.get('job_id')
                distance = data.get('distance')
                job = Job.objects.filter(id=job_id).first() if job_id else None
                if job:
                    email_service.send_job_posted_email(user, job, distance)

            elif email_type == 'worker_assigned':
                job_id = data.get('job_id')
                job = Job.objects.filter(id=job_id).first() if job_id else None
                if job:
                    email_service.send_job_assigned_email(user, job)

            elif email_type == 'job_completed':
                job_id = data.get('job_id')
                worker_id = data.get('worker_id')
                job = Job.objects.filter(id=job_id).first() if job_id else None
                worker = User.objects.filter(id=worker_id).first() if worker_id else None
                if job and worker:
                    email_service.send_job_completed_email(user, job, worker)

            elif email_type == 'application_accepted':
                job_id = data.get('job_id')
                job = Job.objects.filter(id=job_id).first() if job_id else None
                if job:
                    email_service.send_application_accepted_email(user, job)

            elif email_type == 'application_rejected':
                job_id = data.get('job_id')
                job = Job.objects.filter(id=job_id).first() if job_id else None
                if job:
                    email_service.send_application_rejected_email(user, job)

            elif email_type == 'review_received':
                review_id = data.get('review_id')
                review = Review.objects.filter(id=review_id).first() if review_id else None
                if review:
                    email_service.send_new_review_email(user, review)

            elif email_type == 'verification_approved':
                email_service.send_verification_approved_email(user)

            elif email_type == 'verification_rejected':
                reason = data.get('reason', 'No reason provided')
                email_service.send_verification_rejected_email(user, reason)

            else:
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
    # GET NOTIFICATIONS (role-aware)
    # ============================================

    def get_user_notifications(
        self, user_id: int, limit: int = 50, role: Optional[str] = None
    ) -> List[Notification]:
        return self.repository.get_by_recipient(user_id, limit, role)

    def get_unread_notifications(
        self, user_id: int, role: Optional[str] = None
    ) -> List[Notification]:
        return self.repository.get_unread_by_recipient(user_id, role)

    def get_unread_count(
        self, user_id: int, role: Optional[str] = None
    ) -> int:
        return self.repository.get_unread_count(user_id, role)

    # ============================================
    # MARK OPERATIONS
    # ============================================

    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        notification = self.repository.mark_as_read(notification_id, user_id)
        if notification:
            NotificationBroadcastService.send_notification_to_user(
                user_id,
                {
                    'type': 'notification_read',
                    'notification_id': notification_id,
                    'is_read': True,
                }
            )
        return notification is not None

    def mark_all_as_read(self, user_id: int, role: Optional[str] = None) -> int:
        count = self.repository.mark_all_as_read(user_id, role)
        NotificationBroadcastService.send_notification_to_user(
            user_id,
            {
                'type': 'all_notifications_read',
                'count': count,
                'role': role,
            }
        )
        return count

    def delete_all(self, user_id: int, role: Optional[str] = None) -> int:
        return self.repository.delete_all(user_id, role)

    # ============================================
    # PREFERENCES
    # ============================================

    def get_preferences(self, user_id: int) -> Dict[str, Any]:
        preferences = self.repository.get_or_create_preferences(user_id)
        from apps.notifications.serializers import NotificationPreferenceSerializer
        return NotificationPreferenceSerializer(preferences).data

    def update_preferences(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        preferences = self.repository.update_preferences(user_id, data)
        from apps.notifications.serializers import NotificationPreferenceSerializer
        return NotificationPreferenceSerializer(preferences).data

    # ============================================
    # CONVENIENCE METHODS — now with roles
    # ============================================

    def notify_job_posted(self, worker, job, distance=None):
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='JOB_POSTED',
            title='New Job Available!',
            message=f"{job.title} - {distance or 'nearby'}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/worker/dashboard/jobs/{job.id}",
            data={'job_id': job.id, 'distance': distance},
            role='WORKER',
        )

    def notify_job_assigned(self, worker, job):
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='WORKER_ASSIGNED',
            title="You've Been Assigned!",
            message=f"You have been assigned to: {job.title}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/worker/dashboard/jobs/{job.id}",
            data={'job_id': job.id},
            role='WORKER',
        )

    def notify_job_completed(self, client, job, worker):
        return self.create_notification(
            recipient_id=client.id,
            notification_type='JOB_COMPLETED',
            title='Job Completed!',
            message=f"{worker.full_name} has completed: {job.title}",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/client/dashboard/jobs/{job.id}",
            data={'job_id': job.id, 'worker_id': worker.id},
            role='CLIENT',
        )

    def notify_application_accepted(self, worker, job):
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='APPLICATION_ACCEPTED',
            title='Application Accepted!',
            message=f"Your application for {job.title} has been accepted!",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url=f"/worker/dashboard/jobs/{job.id}",
            data={'job_id': job.id},
            role='WORKER',
        )

    def notify_application_rejected(self, worker, job):
        return self.create_notification(
            recipient_id=worker.id,
            notification_type='APPLICATION_REJECTED',
            title='Application Update',
            message=f"Your application for {job.title} has been rejected.",
            related_entity_id=job.id,
            related_entity_type='JOB',
            redirect_url="/worker/dashboard/find-jobs",
            data={'job_id': job.id},
            role='WORKER',
        )

    def notify_new_review(self, recipient, review):
        """
        Notify a user about a new review.
        Role inferred from the recipient's current role on the platform.
        """
        # Infer role: workers get worker notifications, clients get client ones
        if getattr(recipient, 'is_worker', False) and not getattr(recipient, 'is_client', False):
            role = 'WORKER'
            redirect = '/worker/dashboard/settings/profile'
        elif getattr(recipient, 'is_client', False) and not getattr(recipient, 'is_worker', False):
            role = 'CLIENT'
            redirect = '/client/dashboard/settings/profile'
        else:
            # Dual role — keep it role-agnostic
            role = None
            redirect = '/dashboard'

        return self.create_notification(
            recipient_id=recipient.id,
            notification_type='REVIEW_RECEIVED',
            title='New Review!',
            message=f"{review.reviewer.full_name} gave you {review.rating}★ for {review.job.title}",
            related_entity_id=review.id,
            related_entity_type='REVIEW',
            redirect_url=redirect,
            data={'review_id': review.id, 'job_id': review.job_id},
            send_email=False,
            role=role,
        )

    def notify_verification_approved(self, user):
        """Role-agnostic — user sees this on both dashboards."""
        return self.create_notification(
            recipient_id=user.id,
            notification_type='VERIFICATION_APPROVED',
            title='Verification Approved!',
            message='Your identity has been verified. Welcome to KaJob!',
            redirect_url="/dashboard",
            data={'reason': 'approved'},
            role=None,
        )

    def notify_verification_rejected(self, user, reason):
        """Role-agnostic."""
        return self.create_notification(
            recipient_id=user.id,
            notification_type='VERIFICATION_REJECTED',
            title='Verification Rejected',
            message=f'Your verification was rejected. Reason: {reason}',
            redirect_url="/dashboard/settings/verification",
            data={'reason': reason},
            role=None,
        )
