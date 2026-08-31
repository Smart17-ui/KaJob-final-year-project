# apps/admin_panel/services/admin_service.py

import logging
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from apps.jobs.models import Job
from apps.reviews.models import Review
from apps.identity_verification.models import IdentityVerification, VerificationDocument
from apps.common.constants import VerificationStatus
from apps.admin_panel.repositories import AdminRepository
from apps.audit.services import AuditService
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

User = get_user_model()
logger = logging.getLogger(__name__)


class AdminService:
    """
    Service for admin panel operations.
    """
    
    def __init__(self):
        self.repository = AdminRepository()
        self.audit_service = AuditService()
    
    # ============================================
    # RECENT ACTIVITY
    # ============================================
    
    def get_recent_activity(self, limit: int = 20) -> List[Dict]:
        """Get recent platform activity."""
        return self.repository.get_recent_activity(limit)
    
    # ============================================
    # USER MANAGEMENT
    # ============================================
    
    def get_all_users(self, filters: Dict = None) -> List[User]:
        """Get all users with optional filters."""
        users = User.objects.filter(is_active=True)
        
        if filters:
            if filters.get('role'):
                users = users.filter(role=filters['role'])
            if filters.get('is_verified') is not None:
                users = users.filter(is_verified=filters['is_verified'])
            if filters.get('is_active') is not None:
                users = users.filter(is_active=filters['is_active'])
            if filters.get('search'):
                search = filters['search']
                users = users.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(phone_number__icontains=search)
                )
        
        return users.order_by('-date_joined')
    
    def get_user_detail(self, user_id: int) -> User:
        """Get user details."""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ResourceNotFound("User not found.")
    
    @transaction.atomic
    def suspend_user(self, admin, user_id: int, reason: str) -> Dict[str, Any]:
        """Suspend a user."""
        user = self.get_user_detail(user_id)
        
        if user.is_admin:
            raise BusinessRuleViolation("Cannot suspend an admin user.")
        
        if not user.is_active:
            raise BusinessRuleViolation("User is already suspended or inactive.")
        
        user.is_active = False
        user.save()
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='ADMIN_SUSPEND_USER',
            entity_type='USER',
            entity_id=user_id,
            details={'user_name': user.full_name, 'reason': reason}
        )
        
        logger.info(f"User {user_id} suspended by admin {admin.id}")
        
        return {
            'user': user,
            'message': f"User {user.full_name} has been suspended.",
        }
    
    @transaction.atomic
    def activate_user(self, admin, user_id: int) -> Dict[str, Any]:
        """Activate a suspended user."""
        user = self.get_user_detail(user_id)
        
        if user.is_active:
            raise BusinessRuleViolation("User is already active.")
        
        user.is_active = True
        user.save()
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='ADMIN_ACTIVATE_USER',
            entity_type='USER',
            entity_id=user_id,
            details={'user_name': user.full_name}
        )
        
        logger.info(f"User {user_id} activated by admin {admin.id}")
        
        return {
            'user': user,
            'message': f"User {user.full_name} has been activated.",
        }
    
    # ============================================
    # JOB MODERATION
    # ============================================
    
    def get_all_jobs(self, filters: Dict = None) -> List[Job]:
        """Get all jobs with optional filters."""
        jobs = Job.objects.all()
        
        if filters:
            if filters.get('status'):
                jobs = jobs.filter(status=filters['status'])
            if filters.get('search'):
                search = filters['search']
                jobs = jobs.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search)
                )
        
        return jobs.order_by('-created_at')
    
    @transaction.atomic
    def delete_job(self, admin, job_id: int, reason: str) -> Dict[str, Any]:
        """Delete a job (soft delete)."""
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")
        
        job.is_deleted = True
        job.save()
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='ADMIN_DELETE_JOB',
            entity_type='JOB',
            entity_id=job_id,
            details={'job_title': job.title, 'reason': reason}
        )
        
        logger.info(f"Job {job_id} deleted by admin {admin.id}")
        
        return {
            'job': job,
            'message': f"Job '{job.title}' has been deleted.",
        }
    
    # ============================================
    # REVIEW MODERATION
    # ============================================
    
    def get_all_reviews(self, filters: Dict = None) -> List[Review]:
        """Get all reviews with optional filters."""
        reviews = Review.objects.all()
        
        if filters:
            if filters.get('status'):
                reviews = reviews.filter(status=filters['status'])
            if filters.get('rating'):
                reviews = reviews.filter(rating=filters['rating'])
        
        return reviews.order_by('-created_at')
    
    @transaction.atomic
    def approve_review(self, admin, review_id: int) -> Dict[str, Any]:
        """Approve a review."""
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            raise ResourceNotFound("Review not found.")
        
        review.approve()
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='ADMIN_APPROVE_REVIEW',
            entity_type='REVIEW',
            entity_id=review_id,
            details={'job_title': review.job.title}
        )
        
        logger.info(f"Review {review_id} approved by admin {admin.id}")
        
        return {
            'review': review,
            'message': "Review has been approved.",
        }
    
    @transaction.atomic
    def reject_review(self, admin, review_id: int) -> Dict[str, Any]:
        """Reject a review."""
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            raise ResourceNotFound("Review not found.")
        
        review.reject()
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='ADMIN_REJECT_REVIEW',
            entity_type='REVIEW',
            entity_id=review_id,
            details={'job_title': review.job.title}
        )
        
        logger.info(f"Review {review_id} rejected by admin {admin.id}")
        
        return {
            'review': review,
            'message': "Review has been rejected.",
        }
    
    # ============================================
    # VERIFICATION MANAGEMENT
    # ============================================
    
    def get_verifications(self, status: str = None) -> List[IdentityVerification]:
        """Get verifications by status."""
        queryset = IdentityVerification.objects.select_related('user')
        
        if status:
            queryset = queryset.filter(verification_status=status)
        else:
            queryset = queryset.filter(
                verification_status__in=[
                    VerificationStatus.PENDING,
                    VerificationStatus.UNDER_REVIEW
                ]
            )
        
        return queryset.order_by('-submitted_at')
    
    def get_verification_detail(self, verification_id: int) -> IdentityVerification:
        """Get verification detail with documents."""
        try:
            return IdentityVerification.objects.select_related('user').get(id=verification_id)
        except IdentityVerification.DoesNotExist:
            raise ResourceNotFound("Verification not found.")
    
    @transaction.atomic
    def approve_verification(self, admin, verification_id: int, notes: str = '') -> Dict[str, Any]:
        """Approve a verification."""
        verification = self.get_verification_detail(verification_id)
        
        if verification.verification_status in [
            VerificationStatus.VERIFIED,
            VerificationStatus.REJECTED
        ]:
            raise BusinessRuleViolation(f"Verification is already {verification.verification_status}.")
        
        verification.approve(admin)
        
        if notes:
            verification.verification_notes = notes
            verification.save(update_fields=['verification_notes'])
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='VERIFICATION_APPROVED',
            entity_type='VERIFICATION',
            entity_id=verification_id,
            details={
                'user_name': verification.user.full_name,
                'user_id': verification.user.id,
                'document_type': verification.document_type,
                'notes': notes,
            }
        )
        
        logger.info(f"Verification {verification_id} approved by admin {admin.id}")
        
        return {
            'verification': verification,
            'message': f"Verification for {verification.user.full_name} has been approved.",
        }
    
    @transaction.atomic
    def reject_verification(self, admin, verification_id: int, reason: str, notes: str = '') -> Dict[str, Any]:
        """Reject a verification."""
        verification = self.get_verification_detail(verification_id)
        
        if verification.verification_status in [
            VerificationStatus.VERIFIED,
            VerificationStatus.REJECTED
        ]:
            raise BusinessRuleViolation(f"Verification is already {verification.verification_status}.")
        
        verification.reject(admin, reason)
        
        if notes:
            verification.verification_notes = notes
            verification.save(update_fields=['verification_notes'])
        
        self.audit_service.log_admin_action(
            admin=admin,
            action='VERIFICATION_REJECTED',
            entity_type='VERIFICATION',
            entity_id=verification_id,
            details={
                'user_name': verification.user.full_name,
                'user_id': verification.user.id,
                'document_type': verification.document_type,
                'reason': reason,
                'notes': notes,
            }
        )
        
        logger.info(f"Verification {verification_id} rejected by admin {admin.id}")
        
        return {
            'verification': verification,
            'message': f"Verification for {verification.user.full_name} has been rejected.",
        }
    
    def get_verification_stats(self) -> Dict[str, Any]:
        """Get verification statistics."""
        pending = IdentityVerification.objects.filter(
            verification_status__in=[
                VerificationStatus.PENDING,
                VerificationStatus.UNDER_REVIEW
            ]
        ).count()
        
        verified = IdentityVerification.objects.filter(
            verification_status=VerificationStatus.VERIFIED
        ).count()
        
        rejected = IdentityVerification.objects.filter(
            verification_status=VerificationStatus.REJECTED
        ).count()
        
        not_submitted = IdentityVerification.objects.filter(
            verification_status=VerificationStatus.NOT_SUBMITTED
        ).count()
        
        total = IdentityVerification.objects.count()
        
        recent = IdentityVerification.objects.select_related('user').order_by('-submitted_at')[:5]
        
        return {
            'pending': pending,
            'verified': verified,
            'rejected': rejected,
            'not_submitted': not_submitted,
            'total': total,
            'recent': [
                {
                    'id': v.id,
                    'user_name': v.user.full_name,
                    'document_type': v.document_type,
                    'status': v.verification_status,
                    'submitted_at': v.submitted_at.isoformat(),
                }
                for v in recent
            ]
        }
    
    def get_verification_documents(self, verification_id: int) -> List[Dict]:
        """Get verification documents."""
        verification = self.get_verification_detail(verification_id)
        
        documents = VerificationDocument.objects.filter(verification=verification)
        
        return [
            {
                'id': doc.id,
                'document_type': doc.document_type,
                'file_path': doc.file_path,
                'file_name': doc.file_name,
                'file_size': doc.file_size,
                'mime_type': doc.mime_type,
                'uploaded_at': doc.uploaded_at.isoformat(),
            }
            for doc in documents
        ]
