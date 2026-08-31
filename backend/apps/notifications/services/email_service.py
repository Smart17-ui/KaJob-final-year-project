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
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        from_email: Optional[str] = None,
    ) -> bool:
        """
        Send an email using a template.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Name of the template (without .html)
            context: Template context
            from_email: Sender email (default: settings.DEFAULT_FROM_EMAIL)
        
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            if from_email is None:
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@kajob.com')
            
            # Render HTML content
            html_content = render_to_string(
                f'emails/{template_name}.html',
                context
            )
            
            # Plain text content
            text_content = strip_tags(html_content)
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[to_email],
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send(fail_silently=False)
            
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
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
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
        }
        return EmailService.send_email(
            to_email=client.email,
            subject=f'Job Completed: {job.title}',
            template_name='job_completed',
            context=context,
        )
    
    @staticmethod
    def send_application_accepted_email(worker, job):
        """Send application accepted notification email."""
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job': job,
            'job_title': job.title,
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'job': job,
            'job_title': job.title,
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
        context = {
            'worker': worker,
            'full_name': worker.full_name,
            'review': review,
            'rating': review.rating,
            'comment': review.comment,
            'reviewer_name': review.reviewer.full_name,
            'job_title': review.job.title,
            'job_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/jobs/{review.job.id}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
        context = {
            'user': user,
            'full_name': user.full_name,
            'reset_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={token}",
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
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
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
        }
        return EmailService.send_email(
            to_email=user.email,
            subject=f'Report Resolved: {report.reference_number}',
            template_name='report_resolved',
            context=context,
        )
