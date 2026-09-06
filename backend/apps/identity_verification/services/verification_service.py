# apps/identity_verification/services/verification_service.py

import logging
import random
import re
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from typing import Dict, Any, List, Optional
from datetime import timedelta
from apps.identity_verification.repositories import (
    VerificationRepository,
    DocumentRepository,
)
from apps.identity_verification.models import IdentityVerification
from apps.accounts.models import User
from apps.audit.models import AuditLog
from apps.common.constants import VerificationStatus, DocumentType
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.services import EmailService

logger = logging.getLogger(__name__)


class VerificationService:
    """
    Service for identity verification operations.
    
    Phone and email verification status is stored on the User model:
    - User.phone_verified (boolean)
    - User.email_verified (boolean)
    - User.phone_otp (string)
    - User.phone_otp_created_at (datetime)
    - User.phone_attempts (integer)
    - User.email_verification_token (string)
    - User.email_verification_sent_at (datetime)
    """
    
    def __init__(self):
        self.verification_repo = VerificationRepository()
        self.document_repo = DocumentRepository()
        self.email_service = EmailService()
    
    # ============================================
    # GET OR CREATE VERIFICATION
    # ============================================
    
    def get_or_create_verification(self, user) -> IdentityVerification:
        """
        Get or create a verification record for a user.
        """
        verification = self.verification_repo.get_by_user_id(user.id)
        if not verification:
            # Use the first available document type from choices
            try:
                if hasattr(DocumentType, 'NRC_FRONT'):
                    default_doc_type = DocumentType.NRC_FRONT
                else:
                    default_doc_type = DocumentType.CHOICES[0][0]
            except (AttributeError, IndexError):
                default_doc_type = 'NRC_FRONT'  # Fallback
            
            verification = self.verification_repo.create(
                user=user,
                document_type=default_doc_type,
                document_number='',  # Will be updated when user submits
                verification_status=VerificationStatus.NOT_SUBMITTED,
            )
            logger.info(f"Verification record created for user {user.email}")
        return verification
    
    # ============================================
    # PHONE NUMBER VALIDATION
    # ============================================
    
    def validate_phone_number(self, phone_number: str) -> Dict[str, Any]:
        """
        Validate phone number format.
        
        Supports:
        - Zambia: +260 97xxxxxxx, 097xxxxxxx
        - International: +[country_code][number]
        """
        # Remove all spaces, dashes, and parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', phone_number)
        
        if not cleaned:
            return {
                'is_valid': False,
                'normalized': '',
                'country_code': '',
                'error': 'Phone number cannot be empty.'
            }
        
        # Zambia number: 097xxxxxxx or +26097xxxxxxx
        zambia_pattern = r'^(?:\+?260|0)?([97]\d{8})$'
        match = re.match(zambia_pattern, cleaned)
        
        if match:
            number_part = match.group(1)
            normalized = f"+260{number_part}"
            return {
                'is_valid': True,
                'normalized': normalized,
                'country_code': 'ZM',
                'error': None
            }
        
        # International number
        international_pattern = r'^\+\d{1,3}\d{7,14}$'
        if re.match(international_pattern, cleaned):
            return {
                'is_valid': True,
                'normalized': cleaned,
                'country_code': 'INT',
                'error': None
            }
        
        return {
            'is_valid': False,
            'normalized': '',
            'country_code': '',
            'error': 'Invalid phone number format. Please use a valid Zambia number (e.g., 0971234567) or international format (e.g., +260971234567).'
        }
    
    def normalize_phone_number(self, phone_number: str) -> str:
        """Normalize phone number to a standard format."""
        result = self.validate_phone_number(phone_number)
        if result['is_valid']:
            return result['normalized']
        return phone_number
    
    # ============================================
    # PHASE 1: PHONE VERIFICATION (OTP via Email)
    # ============================================
    
    def send_phone_otp(self, user) -> Dict[str, Any]:
        """
        Send OTP to user's phone number via email (SMS fallback).
        """
        # Validate phone number
        phone_number = user.phone_number or ''
        phone_validation = self.validate_phone_number(phone_number)
        if not phone_validation['is_valid']:
            return {
                'status': 'invalid_phone',
                'message': phone_validation['error'],
                'phone_number': phone_number,
                'suggestion': 'Please update your phone number to a valid format.'
            }
        
        normalized_phone = phone_validation['normalized']
        
        # Update user's phone number with normalized version
        if user.phone_number != normalized_phone:
            user.phone_number = normalized_phone
            user.save(update_fields=['phone_number'])
        
        # Check if phone is already verified
        if getattr(user, 'phone_verified', False):
            return {
                'status': 'already_verified',
                'message': 'Phone number is already verified.',
                'phone_number': normalized_phone,
            }
        
        # Generate OTP
        otp = self._generate_otp()
        user.phone_otp = otp
        user.phone_otp_created_at = timezone.now()
        user.phone_attempts = 0
        user.save(update_fields=['phone_otp', 'phone_otp_created_at', 'phone_attempts'])
        
        # Get or create verification record
        verification = self.get_or_create_verification(user)
        verification.verification_status = VerificationStatus.PENDING
        verification.save(update_fields=['verification_status'])
        
        # Send OTP via email (SMS fallback)
        try:
            from apps.notifications.services import EmailService
            email_service = EmailService()
            
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            context = {
                'user': user,
                'full_name': user.full_name,
                'otp': otp,
                'phone_number': normalized_phone,
                'frontend_url': frontend_url,
                'expiry_minutes': 10,
            }
            
            email_service.send_email(
                to_email=user.email,
                subject='Your KaJob Verification Code',
                template_name='phone_otp',
                context=context,
            )
            
            logger.info(f"OTP for {normalized_phone} sent via email to {user.email}")
            
            return {
                'status': 'otp_sent',
                'message': f'OTP sent to {normalized_phone} via email.',
                'phone_number': normalized_phone,
                'via': 'email',
                'expires_in': 10,
                'country_code': phone_validation.get('country_code', 'ZM'),
            }
            
        except Exception as e:
            logger.error(f"Failed to send OTP via email: {str(e)}")
            logger.info(f"OTP for {normalized_phone}: {otp}")
            
            return {
                'status': 'otp_sent',
                'message': f'OTP generated for {normalized_phone}. (Check console for OTP)',
                'phone_number': normalized_phone,
                'via': 'console',
                'expires_in': 10,
            }
    
    def verify_phone_otp(self, user, otp: str) -> Dict[str, Any]:
        """
        Verify phone using OTP.
        """
        # Check if already verified
        if getattr(user, 'phone_verified', False):
            return {
                'status': 'already_verified',
                'message': 'Phone number is already verified.',
            }
        
        # Check if OTP exists
        if not user.phone_otp:
            return {
                'status': 'no_otp',
                'message': 'No OTP has been sent. Please request a new one.',
            }
        
        # Check attempts
        if user.phone_attempts >= 5:
            return {
                'status': 'max_attempts',
                'message': 'Maximum attempts exceeded. Please request a new OTP.',
            }
        
        # Verify OTP
        if user.phone_otp != otp:
            user.phone_attempts += 1
            user.save(update_fields=['phone_attempts'])
            return {
                'status': 'invalid',
                'message': 'Invalid OTP. Please try again.',
                'attempts_remaining': 5 - user.phone_attempts,
            }
        
        # Check if OTP is expired (10 minutes)
        if user.phone_otp_created_at:
            expiry = user.phone_otp_created_at + timedelta(minutes=10)
            if timezone.now() > expiry:
                return {
                    'status': 'expired',
                    'message': 'OTP has expired. Please request a new one.',
                }
        
        # OTP verified!
        user.phone_verified = True
        user.phone_verified_at = timezone.now()
        user.save(update_fields=['phone_verified', 'phone_verified_at'])
        
        # Get or create verification record
        verification = self.get_or_create_verification(user)
        verification.verification_status = VerificationStatus.PENDING
        verification.save(update_fields=['verification_status'])
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='PHONE_VERIFIED',
            entity_type='USER',
            entity_id=user.id,
            details={
                'phone_number': user.phone_number,
            }
        )
        
        logger.info(f"Phone verified for user {user.email}")
        
        return {
            'status': 'verified',
            'message': 'Phone number verified successfully!',
            'next_step': 'email_verification',
        }
    
    # ============================================
    # PHASE 2: EMAIL VERIFICATION
    # ============================================
    
    def send_email_verification(self, user) -> Dict[str, Any]:
        """Send email verification link to user."""
        # Check if phone is verified first
        if not getattr(user, 'phone_verified', False):
            return {
                'status': 'phone_not_verified',
                'message': 'Please verify your phone number first.',
                'required_phase': 'phone_verification',
            }
        
        if getattr(user, 'email_verified', False):
            return {
                'status': 'already_verified',
                'message': 'Email is already verified.',
            }
        
        # Generate token
        import uuid
        token = str(uuid.uuid4())
        user.email_verification_token = token
        user.email_verification_sent_at = timezone.now()
        user.save(update_fields=['email_verification_token', 'email_verification_sent_at'])
        
        # Get or create verification record
        verification = self.get_or_create_verification(user)
        verification.verification_status = VerificationStatus.PENDING
        verification.save(update_fields=['verification_status'])
        
        # Send verification email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email?token={token}"
        
        try:
            from apps.notifications.services import EmailService
            email_service = EmailService()
            
            context = {
                'user': user,
                'full_name': user.full_name,
                'verification_url': verification_url,
                'frontend_url': frontend_url,
                'expiry_hours': 24,
            }
            
            email_service.send_email(
                to_email=user.email,
                subject='Verify Your Email Address',
                template_name='email_verification',
                context=context,
            )
            
            logger.info(f"Email verification sent to {user.email}")
            
            return {
                'status': 'email_sent',
                'message': 'Verification email sent to your email address.',
                'email': user.email,
            }
            
        except Exception as e:
            logger.error(f"Failed to send email verification: {str(e)}")
            return {
                'status': 'error',
                'message': 'Failed to send verification email. Please try again.',
            }
    
    def verify_email_token(self, token: str) -> Dict[str, Any]:
        """Verify email using token."""
        try:
            user = User.objects.get(email_verification_token=token)
        except User.DoesNotExist:
            return {
                'status': 'invalid_token',
                'message': 'Invalid or expired verification token.',
            }
        
        if getattr(user, 'email_verified', False):
            return {
                'status': 'already_verified',
                'message': 'Email is already verified.',
            }
        
        # Check if token is expired (24 hours)
        if user.email_verification_sent_at:
            expiry = user.email_verification_sent_at + timedelta(hours=24)
            if timezone.now() > expiry:
                return {
                    'status': 'expired',
                    'message': 'Verification link has expired. Please request a new one.',
                }
        
        # Email verified!
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.save(update_fields=['email_verified', 'email_verified_at'])
        
        # Get or create verification record
        verification = self.get_or_create_verification(user)
        verification.verification_status = VerificationStatus.PENDING
        verification.save(update_fields=['verification_status'])
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='EMAIL_VERIFIED',
            entity_type='USER',
            entity_id=user.id,
            details={'email': user.email}
        )
        
        logger.info(f"Email verified for user {user.email}")
        
        return {
            'status': 'verified',
            'message': 'Email verified successfully!',
            'next_step': 'document_upload',
        }
    
    # ============================================
    # PHASE 3: DOCUMENT VERIFICATION
    # ============================================
    
    @transaction.atomic
    def submit_verification(self, user, data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit identity verification documents for admin review."""
        # Check if email is verified first
        if not getattr(user, 'email_verified', False):
            raise BusinessRuleViolation(
                "Please verify your email before submitting documents."
            )
        
        verification = self.get_or_create_verification(user)
        
        # Check if user already has a pending verification
        if verification.verification_status == VerificationStatus.UNDER_REVIEW:
            raise BusinessRuleViolation(
                "You already have a pending verification request. "
                "Please wait for admin review."
            )
        
        # Check if user is already fully verified
        if verification.verification_status == VerificationStatus.VERIFIED:
            raise BusinessRuleViolation("Your identity is already verified.")
        
        # Check for duplicate document number
        if self.verification_repo.document_number_exists(data['document_number']):
            raise BusinessRuleViolation(
                "This document number is already registered. "
                "Please use a different one or contact support."
            )
        
        # Update verification record
        verification.document_type = data['document_type']
        verification.document_number = data['document_number']
        verification.verification_status = VerificationStatus.UNDER_REVIEW
        verification.save(update_fields=['document_type', 'document_number', 'verification_status'])
        
        # Create documents
        documents = []
        for doc_data in data.get('documents', []):
            document = self.document_repo.create(
                verification=verification,
                document_type=doc_data['document_type'],
                file_path=doc_data['file_path'],
                file_name=doc_data['file_name'],
                file_size=doc_data.get('file_size'),
                mime_type=doc_data.get('mime_type'),
            )
            documents.append(document)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='VERIFICATION_SUBMITTED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'document_type': data['document_type'],
                'document_count': len(documents),
            }
        )
        
        logger.info(f"Verification submitted for user {user.email} (ID: {verification.id})")
        
        return {
            'verification': verification,
            'documents': documents,
            'message': 'Verification submitted successfully. Please wait for admin review.',
        }
    
    # ============================================
    # ADMIN OPERATIONS
    # ============================================
    
    @transaction.atomic
    def approve_verification(self, admin, verification_id: int, notes: str = '') -> Dict[str, Any]:
        """Admin approves verification."""
        verification = self.verification_repo.get_by_id(verification_id)
        if not verification:
            raise ResourceNotFound("Verification not found.")
        
        if verification.verification_status in [VerificationStatus.VERIFIED, VerificationStatus.REJECTED]:
            raise BusinessRuleViolation(f"Verification is already {verification.verification_status}.")
        
        # Use the approve method from the model
        verification.approve(admin)
        
        # Audit log
        AuditLog.objects.create(
            user=admin,
            action='VERIFICATION_APPROVED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'user_name': verification.user.full_name,
                'user_id': verification.user.id,
                'document_type': verification.document_type,
            }
        )
        
        # Send welcome email
        user = verification.user
        try:
            from apps.notifications.services import EmailService
            email_service = EmailService()
            email_service.send_welcome_email(user)
            logger.info(f"Welcome email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
        
        logger.info(f"Verification {verification_id} approved by admin {admin.id}")
        
        return {
            'verification': verification,
            'message': f"Verification for {user.full_name} has been approved. Welcome email sent.",
        }
    
    @transaction.atomic
    def reject_verification(self, admin, verification_id: int, reason: str, notes: str = '') -> Dict[str, Any]:
        """Admin rejects verification."""
        verification = self.verification_repo.get_by_id(verification_id)
        if not verification:
            raise ResourceNotFound("Verification not found.")
        
        if verification.verification_status in [VerificationStatus.VERIFIED, VerificationStatus.REJECTED]:
            raise BusinessRuleViolation(f"Verification is already {verification.verification_status}.")
        
        # Use the reject method from the model
        verification.reject(admin, reason)
        
        # Audit log
        AuditLog.objects.create(
            user=admin,
            action='VERIFICATION_REJECTED',
            entity_type='IDENTITY_VERIFICATION',
            entity_id=verification.id,
            details={
                'user_name': verification.user.full_name,
                'user_id': verification.user.id,
                'reason': reason,
            }
        )
        
        logger.info(f"Verification {verification_id} rejected by admin {admin.id}")
        
        return {
            'verification': verification,
            'message': f"Verification for {verification.user.full_name} has been rejected.",
        }
    
    # ============================================
    # UPDATE PHONE NUMBER
    # ============================================
    
    def update_phone_number(self, user, new_phone_number: str) -> Dict[str, Any]:
        """Update user's phone number and reset verification if needed."""
        phone_validation = self.validate_phone_number(new_phone_number)
        if not phone_validation['is_valid']:
            return {
                'status': 'invalid_phone',
                'message': phone_validation['error'],
                'phone_number': new_phone_number,
                'suggestion': 'Please enter a valid phone number.'
            }
        
        normalized_phone = phone_validation['normalized']
        
        # Check if phone is already used by another user
        existing_user = User.objects.filter(phone_number=normalized_phone).exclude(id=user.id).first()
        if existing_user:
            return {
                'status': 'phone_taken',
                'message': 'This phone number is already registered to another account.',
                'phone_number': normalized_phone,
            }
        
        # Update phone number
        old_phone = user.phone_number
        user.phone_number = normalized_phone
        user.phone_verified = False
        user.phone_verified_at = None
        user.phone_otp = ''
        user.phone_otp_created_at = None
        user.phone_attempts = 0
        user.email_verified = False
        user.email_verified_at = None
        user.email_verification_token = ''
        user.email_verification_sent_at = None
        user.save()
        
        # Reset verification status
        verification = self.get_or_create_verification(user)
        verification.verification_status = VerificationStatus.NOT_SUBMITTED
        verification.save(update_fields=['verification_status'])
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='PHONE_NUMBER_UPDATED',
            entity_type='USER',
            entity_id=user.id,
            details={
                'old_phone': old_phone,
                'new_phone': normalized_phone,
                'verification_reset': True,
            }
        )
        
        logger.info(f"Phone number updated for user {user.email}: {old_phone} → {normalized_phone}")
        
        return {
            'status': 'updated',
            'message': 'Phone number updated successfully. Please verify your new phone number.',
            'phone_number': normalized_phone,
            'verification_reset': True,
            'next_step': 'phone_verification',
        }
    
    # ============================================
    # GET VERIFICATION STATUS
    # ============================================
    
    def get_verification_status(self, user) -> Dict[str, Any]:
        """Get current verification status for a user."""
        verification = self.verification_repo.get_by_user_id(user.id)
        
        if not verification:
            return {
                'has_submitted': False,
                'verification_status': VerificationStatus.NOT_SUBMITTED,
                'status_display': 'Not Submitted',
                'phone_verified': getattr(user, 'phone_verified', False),
                'email_verified': getattr(user, 'email_verified', False),
                'fully_verified': False,
                'message': 'You have not started verification.',
                'next_step': 'phone_verification',
            }
        
        return {
            'has_submitted': True,
            'verification_id': verification.id,
            'verification_status': verification.verification_status,
            'status_display': verification.get_verification_status_display(),
            'phone_verified': getattr(user, 'phone_verified', False),
            'email_verified': getattr(user, 'email_verified', False),
            'fully_verified': verification.verification_status == VerificationStatus.VERIFIED,
            'phone_number': user.phone_number,
            'email': user.email,
            'document_type': verification.document_type,
            'document_number': verification.document_number,
            'submitted_at': verification.submitted_at,
            'reviewed_at': verification.reviewed_at,
            'rejection_reason': verification.rejection_reason,
            'message': self._get_status_message(verification),
            'next_step': self._get_next_step(verification),
        }
    
    # ============================================
    # PRIVATE METHODS
    # ============================================
    
    def _generate_otp(self) -> str:
        """Generate a 6-digit OTP."""
        return f"{random.randint(100000, 999999)}"
    
    def _get_status_message(self, verification: IdentityVerification) -> str:
        """Get user-friendly status message."""
        status_messages = {
            VerificationStatus.NOT_SUBMITTED: 'Please start the verification process.',
            VerificationStatus.PENDING: 'Please verify your phone number and email.',
            VerificationStatus.UNDER_REVIEW: 'Documents submitted. Waiting for admin review.',
            VerificationStatus.VERIFIED: 'Your identity has been verified successfully!',
            VerificationStatus.REJECTED: f'Your verification was rejected. Reason: {verification.rejection_reason}',
            VerificationStatus.EXPIRED: 'Your verification has expired. Please submit again.',
        }
        return status_messages.get(verification.verification_status, 'Unknown status.')
    
    def _get_next_step(self, verification: IdentityVerification) -> str:
        """Get the next step in the verification process."""
        if not verification:
            return 'phone_verification'
        
        status_map = {
            VerificationStatus.NOT_SUBMITTED: 'phone_verification',
            VerificationStatus.PENDING: 'phone_verification',
            VerificationStatus.UNDER_REVIEW: 'admin_review',
            VerificationStatus.VERIFIED: 'complete',
            VerificationStatus.REJECTED: 'rejected',
            VerificationStatus.EXPIRED: 'phone_verification',
        }
        return status_map.get(verification.verification_status, 'unknown')
