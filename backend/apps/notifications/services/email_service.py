# apps/notifications/services/email_service.py

import logging
from typing import Dict, Any, Optional
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending email notifications.
    """

    # ============================================
    # HELPERS
    # ============================================

    @staticmethod
    def _frontend_url() -> str:
        return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

    @staticmethod
    def _job_url_for(user, job) -> str:
        """
        Return the correct job detail URL based on the recipient's role.

        - Worker only          → /worker/dashboard/jobs/{id}
        - Client only          → /client/dashboard/jobs/{id}
        - Both roles           → client (job management is client-side)
        - Neither (admin only) → /worker/dashboard/jobs/{id} (fallback)
        """
        frontend = EmailService._frontend_url()
        is_worker = getattr(user, 'is_worker', False)
        is_client = getattr(user, 'is_client', False)

        if is_client:
            return f"{frontend}/client/dashboard/jobs/{job.id}"
        return f"{frontend}/worker/dashboard/jobs/{job.id}"

    @staticmethod
    def _settings_verification_url_for(user) -> str:
        """
        Return the verification settings URL for the user's role.
        """
        frontend = EmailService._frontend_url()
        is_worker = getattr(user, 'is_worker', False)
        is_client = getattr(user, 'is_client', False)

        if is_client:
            return f"{frontend}/client/dashboard/settings/verification"
        return f"{frontend}/worker/dashboard/settings/verification"

    # ============================================
    # CORE SEND METHODS
    # ============================================

    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        from_email: Optional[str] = None,
    ) -> bool:
        """Send an email using a template."""
        try:
            if from_email is None:
                from_email = getattr(
                    settings, 'DEFAULT_FROM_EMAIL', 'noreply@kajob.com'
                )

            html_content = render_to_string(
                f'emails/{template_name}.html',
                context
            )
            text_content = strip_tags(html_content)

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)

            logger.info(f"Email sent to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    def send_plain_email(
        to_email: str,
        subject: str,
        message: str,
        from_email: Optional[str] = None,
    ) -> bool:
        """Send a plain-text email (no template)."""
        try:
            if from_email is None:
                from_email = getattr(
                    settings, 'DEFAULT_FROM_EMAIL', 'noreply@kajob.com'
                )

            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Plain email sent to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send plain email to {to_email}: {str(e)}")
            return False

    # ============================================
    # SPECIFIC EMAIL TEMPLATES
    # ============================================

    @staticmethod
    def send_welcome_email(user, password=None):
        """Send welcome email to new user."""
        context = {
            'user': user,
            'full_name': user.full_name,
            'frontend_url': EmailService._frontend_url(),
            'password': password,
        }
        return EmailService.send_email(
            to_email=user.email,
            subject='Welcome to KaJob!',
            template_name='welcome',
            context=context,
        )

    @staticmethod
    def send_job_posted_email(user, job, distance=None):
        """Send job posted notification email."""
        context = {
            'user': user,
            'full_name': user.full_name,
            'job': job,
            'job_title': job.title,
            'budget': job.budget,
            'distance': distance,
            'job_url': EmailService._job_url_for(user, job),
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=user.email,
            subject=f'New Job: {job.title}',
            template_name='job_posted',
            context=context,
        )

    @staticmethod
    def send_job_assigned_email(worker, job):
        """Send job assigned notification email."""
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job': job,
            'job_title': job.title,
            'budget': job.budget,
            'job_url': EmailService._job_url_for(worker, job),
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=worker.email,
            subject=f'You have been assigned to: {job.title}',
            template_name='job_assigned',
            context=context,
        )

    @staticmethod
    def send_job_completed_email(client, job, worker):
        """Send job completed notification email to client."""
        context = {
            'client': client,
            'full_name': client.full_name,
            'job': job,
            'job_title': job.title,
            'worker_name': worker.full_name,
            'job_url': EmailService._job_url_for(client, job),
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=client.email,
            subject=f'Job Completed: {job.title}',
            template_name='job_completed',
            context=context,
        )

    @staticmethod
    def send_application_accepted_email(worker, job):
        """Send application accepted notification email (currently unused)."""
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job': job,
            'job_title': job.title,
            'job_url': EmailService._job_url_for(worker, job),
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=worker.email,
            subject=f'Application Accepted: {job.title}',
            template_name='application_accepted',
            context=context,
        )

    @staticmethod
    def send_application_rejected_email(worker, job):
        """Send application rejected notification email."""
        frontend = EmailService._frontend_url()
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job': job,
            'job_title': job.title,
            # Send rejected workers to FIND JOBS, not the job detail page
            'job_url': f"{frontend}/worker/dashboard/find-jobs",
            'frontend_url': frontend,
        }
        return EmailService.send_email(
            to_email=worker.email,
            subject=f'Application Update: {job.title}',
            template_name='application_rejected',
            context=context,
        )

    @staticmethod
    def send_new_review_email(worker, review):
        """Send new review notification email."""
        frontend = EmailService._frontend_url()
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'review': review,
            'rating': review.rating,
            'comment': review.comment,
            'reviewer_name': review.reviewer.full_name,
            'job_title': review.job.title,
            # Send worker to their profile page (where reviews are shown)
            'job_url': f"{frontend}/worker/dashboard/settings/profile",
            'frontend_url': frontend,
        }
        return EmailService.send_email(
            to_email=worker.email,
            subject=f'New Review: {review.rating}★ from {review.reviewer.full_name}',
            template_name='new_review',
            context=context,
        )

    @staticmethod
    def send_verification_approved_email(user):
        """Send verification approved notification email."""
        context = {
            'user': user,
            'full_name': user.full_name,
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=user.email,
            subject='Identity Verification Approved',
            template_name='verification_approved',
            context=context,
        )

    @staticmethod
    def send_verification_rejected_email(user, reason):
        """Send verification rejected notification email."""
        context = {
            'user': user,
            'full_name': user.full_name,
            'reason': reason,
            'verification_url': EmailService._settings_verification_url_for(user),
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=user.email,
            subject='Identity Verification Rejected',
            template_name='verification_rejected',
            context=context,
        )

    @staticmethod
    def send_password_reset_email(user, token):
        """Send password reset email."""
        frontend = EmailService._frontend_url()
        context = {
            'user': user,
            'full_name': user.full_name,
            'reset_url': f"{frontend}/reset-password?token={token}",
            'frontend_url': frontend,
        }
        return EmailService.send_email(
            to_email=user.email,
            subject='Password Reset Request',
            template_name='password_reset',
            context=context,
        )

    @staticmethod
    def send_report_resolved_email(user, report):
        """Send report resolved notification email."""
        context = {
            'user': user,
            'full_name': user.full_name,
            'report': report,
            'reference_number': report.reference_number,
            'frontend_url': EmailService._frontend_url(),
        }
        return EmailService.send_email(
            to_email=user.email,
            subject=f'Report Resolved: {report.reference_number}',
            template_name='report_resolved',
            context=context,
        )

    @staticmethod
    def send_nearby_jobs_email(worker, jobs, radius_km):
        """Send email notification to worker about nearby jobs."""
        frontend_url = EmailService._frontend_url()

        # Format jobs for email
        job_list = ""
        for item in jobs[:5]:
            job = item['job']
            job_list += f"""
            • {job.title}
              💰 K{job.budget} | 📍 {item['distance_display']} away
              {frontend_url}/worker/dashboard/jobs/{job.id}

            """

        if len(jobs) > 5:
            job_list += f"\n... and {len(jobs) - 5} more jobs"

        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job_count': len(jobs),
            'job_list': job_list,
            'radius_km': radius_km,
            'frontend_url': frontend_url,
            # Worker job list page (route confirmed in App.tsx)
            'jobs_url': f"{frontend_url}/worker/dashboard/find-jobs",
        }

        subject = f"🔔 {len(jobs)} new jobs found near you!"

        try:
            return EmailService.send_email(
                to_email=worker.email,
                subject=subject,
                template_name='nearby_jobs',
                context=context,
            )
        except Exception as e:
            logger.error(f"Nearby jobs email failed: {e}")
            return False
