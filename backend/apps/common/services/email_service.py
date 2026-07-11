from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Pure infrastructure service for sending emails.
    Single Responsibility: ONLY handles sending emails - no business logic.
    """
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str = None,
        from_email: str = None
    ) -> bool:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text email content (auto-generated from HTML if not provided)
            from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
        
        Returns:
            bool: True if email was sent successfully
        """
        if text_content is None:
            text_content = strip_tags(html_content)
        
        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL
        
        try:
            send_mail(
                subject=subject,
                message=text_content,
                html_message=html_content,
                from_email=from_email,
                recipient_list=[to_email],
                fail_silently=False,
            )
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    # ============================================
    # VERIFICATION EMAILS
    # ============================================
    
    def send_verification_email(self, user, token: str) -> bool:
        """
        Send email verification link.
        """
        subject = 'Verify Your Email - KaJob'
        verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    background: #4CAF50; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>KaJob</h1>
                </div>
                <div class="content">
                    <h2>Welcome to KaJob, {user.first_name}!</h2>
                    <p>Thank you for registering with KaJob. Please verify your email address by clicking the button below:</p>
                    <p style="text-align: center;">
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="{verification_link}">{verification_link}</a></p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account with KaJob, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 KaJob. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to KaJob, {user.first_name}!
        
        Thank you for registering with KaJob. Please verify your email address by clicking the link below:
        
        {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with KaJob, please ignore this email.
        
        Best regards,
        The KaJob Team
        """
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    # ============================================
    # PASSWORD RESET EMAILS
    # ============================================
    
    def send_password_reset_email(self, user, token: str) -> bool:
        """
        Send password reset link.
        """
        subject = 'Reset Your Password - KaJob'
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #FF5722; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    background: #FF5722; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>KaJob</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hello {user.first_name},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </p>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><a href="{reset_link}">{reset_link}</a></p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 KaJob. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hello {user.first_name},
        
        We received a request to reset your password. Click the link below to reset it:
        
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        The KaJob Team
        """
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    # ============================================
    # WELCOME EMAILS
    # ============================================
    
    def send_welcome_email(self, user) -> bool:
        """
        Send welcome email after successful verification.
        """
        subject = 'Welcome to KaJob!'
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>KaJob</h1>
                </div>
                <div class="content">
                    <h2>Welcome to KaJob, {user.first_name}!</h2>
                    <p>We're excited to have you on board. You're now part of Zambia's trusted job marketplace.</p>
                    <h3>Getting Started:</h3>
                    <ol>
                        <li>Complete your profile</li>
                        <li>Verify your identity</li>
                        <li>Start posting jobs or applying for work</li>
                    </ol>
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 KaJob. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to KaJob, {user.first_name}!
        
        We're excited to have you on board. You're now part of Zambia's trusted job marketplace.
        
        Getting Started:
        1. Complete your profile
        2. Verify your identity
        3. Start posting jobs or applying for work
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Best regards,
        The KaJob Team
        """
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
