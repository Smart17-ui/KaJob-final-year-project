# apps/admin_panel/serializers/admin_serializer.py

from rest_framework import serializers
from apps.accounts.models import User
from apps.jobs.models import Job
from apps.reviews.models import Review
from apps.identity_verification.models import IdentityVerification, VerificationDocument
from apps.common.constants import VerificationStatus


# ============================================
# USER SERIALIZERS
# ============================================

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Full serializer for admin user management.
    """

    full_name = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    is_worker = serializers.SerializerMethodField()
    is_client = serializers.SerializerMethodField()
    jobs_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    worker_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number',
            'roles', 'role_display',
            'is_worker', 'is_client',
            'is_verified', 'is_active', 'is_admin',
            'account_status', 'last_login', 'created_at',
            'jobs_count', 'reviews_count', 'average_rating',
            'profile', 'worker_profile',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_roles(self, obj):
        try:
            return list(obj.user_roles.values_list('role__name', flat=True))
        except Exception:
            return []

    def get_role_display(self, obj):
        roles = self.get_roles(obj)
        return ', '.join(roles) if roles else 'No Role'

    def get_is_worker(self, obj):
        try:
            return obj.is_worker
        except Exception:
            return False

    def get_is_client(self, obj):
        try:
            return obj.is_client
        except Exception:
            return False

    def get_jobs_count(self, obj):
        try:
            if obj.is_worker:
                return obj.assigned_jobs.count()
            elif obj.is_client:
                return obj.jobs_posted.count()
        except Exception:
            pass
        return 0

    def get_reviews_count(self, obj):
        try:
            return obj.reviews_received.count()
        except Exception:
            return 0

    def get_average_rating(self, obj):
        from apps.accounts.models import WorkerProfile
        try:
            profile = WorkerProfile.objects.get(user=obj)
            return profile.average_rating
        except WorkerProfile.DoesNotExist:
            return None

    def get_profile(self, obj):
        try:
            profile = obj.profile
            if not profile:
                return None
            return {
                'bio': profile.bio or '',
                'address': profile.address or '',
                'province': profile.province or '',
                'district': profile.district or '',
                'latitude': str(profile.latitude) if profile.latitude else None,
                'longitude': str(profile.longitude) if profile.longitude else None,
                'profile_photo_path': profile.profile_photo_path or None,
            }
        except Exception:
            return None

    def get_worker_profile(self, obj):
        try:
            if not obj.is_worker:
                return None
            wp = obj.worker_profile
            if not wp:
                return None
            return {
                'bio': wp.bio or '',
                'hourly_rate': str(wp.hourly_rate) if wp.hourly_rate else None,
                'average_rating': float(wp.average_rating) if wp.average_rating else 0,
                'jobs_completed': wp.jobs_completed or 0,
                'availability_status': wp.availability_status,
                'skills': [skill.name for skill in wp.skills.all()],
            }
        except Exception:
            return None


class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing users.
    """

    full_name = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    is_worker = serializers.SerializerMethodField()
    is_client = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone_number',
            'roles', 'role_display',
            'is_worker', 'is_client',
            'is_verified', 'is_active', 'account_status', 'created_at',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_roles(self, obj):
        try:
            return list(obj.user_roles.values_list('role__name', flat=True))
        except Exception:
            return []

    def get_role_display(self, obj):
        roles = self.get_roles(obj)
        return ', '.join(roles) if roles else 'No Role'

    def get_is_worker(self, obj):
        try:
            return obj.is_worker
        except Exception:
            return False

    def get_is_client(self, obj):
        try:
            return obj.is_client
        except Exception:
            return False


# ============================================
# JOB SERIALIZERS
# ============================================

class AdminJobSerializer(serializers.ModelSerializer):
    """Serializer for admin job moderation."""

    client_name = serializers.SerializerMethodField()
    worker_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'budget',
            'client_name', 'worker_name', 'category_name',
            'general_location', 'status', 'status_display',
            'created_at', 'posted_at', 'completed_at',
        ]

    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None

    def get_worker_name(self, obj):
        try:
            assignment = obj.assignments.filter(status='ACTIVE').first()
            if assignment:
                return assignment.worker.full_name
        except Exception:
            pass
        return None

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_status_display(self, obj):
        return dict(Job.STATUS_CHOICES).get(obj.status)


class AdminJobListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing jobs."""

    client_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'budget', 'client_name',
            'general_location', 'status', 'status_display', 'created_at',
        ]

    def get_client_name(self, obj):
        return obj.client.full_name if obj.client else None

    def get_status_display(self, obj):
        return dict(Job.STATUS_CHOICES).get(obj.status)


# ============================================
# REVIEW SERIALIZERS
# ============================================

class AdminReviewSerializer(serializers.ModelSerializer):
    """Serializer for admin review moderation."""

    reviewer_name = serializers.SerializerMethodField()
    reviewee_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    rating_display = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'job_title', 'reviewer_name', 'reviewee_name',
            'rating', 'rating_display', 'comment', 'job_completed',
            'status', 'created_at',
        ]

    def get_reviewer_name(self, obj):
        return obj.reviewer.full_name if obj.reviewer else None

    def get_reviewee_name(self, obj):
        return obj.reviewee.full_name if obj.reviewee else None

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None

    def get_rating_display(self, obj):
        return obj.rating_display if hasattr(obj, 'rating_display') else obj.rating


# ============================================
# VERIFICATION SERIALIZERS
# ============================================

class AdminVerificationSerializer(serializers.ModelSerializer):
    """
    Serializer for admin verification management.
    
    FIXED: Now returns NESTED user info (full_name, email, phone) 
    so the frontend can display applicant details.
    """

    user = serializers.SerializerMethodField()      # 🆕 Nested user object
    user_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()    # 🆕 Alias for verification_status
    status_display = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = IdentityVerification
        fields = [
            'id',
            'user',                     # 🆕 nested
            'user_name',
            'document_type',
            'document_number',
            'verification_status',
            'status',                   # 🆕 alias
            'status_display',
            'reviewed_by',
            'reviewed_at',
            'rejection_reason',
            'verification_notes',
            'submitted_at',
            'document_count',
            'created_at',
            'updated_at',
        ]

    def get_user(self, obj):
        """🆕 Return nested user object for the frontend."""
        try:
            user = obj.user
            if not user:
                return None
            return {
                'id': user.id,
                'full_name': user.full_name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'account_status': user.account_status,
                'is_verified': user.is_verified,
            }
        except Exception:
            return None

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_status(self, obj):
        """🆕 Alias for verification_status."""
        return obj.verification_status

    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(
            obj.verification_status,
            obj.verification_status,
        )

    def get_document_count(self, obj):
        try:
            return obj.documents.count()
        except Exception:
            return 0


class AdminVerificationDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for verification with documents.
    
    FIXED: Returns nested user AND documents.
    """

    user = serializers.SerializerMethodField()      # 🆕 Nested user object
    user_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()    # 🆕 Alias
    status_display = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()

    class Meta:
        model = IdentityVerification
        fields = [
            'id',
            'user',                     # 🆕 nested
            'user_name',
            'document_type',
            'document_number',
            'verification_status',
            'status',                   # 🆕 alias
            'status_display',
            'reviewed_by',
            'reviewed_at',
            'rejection_reason',
            'verification_notes',
            'submitted_at',
            'documents',
            'created_at',
            'updated_at',
        ]

    def get_user(self, obj):
        """🆕 Return nested user object."""
        try:
            user = obj.user
            if not user:
                return None
            return {
                'id': user.id,
                'full_name': user.full_name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'account_status': user.account_status,
                'is_verified': user.is_verified,
            }
        except Exception:
            return None

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_status(self, obj):
        """🆕 Alias for verification_status."""
        return obj.verification_status

    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(
            obj.verification_status,
            obj.verification_status,
        )

    def get_documents(self, obj):
        """🆕 Return list of documents."""
        try:
            docs = VerificationDocument.objects.filter(verification=obj)
            return [
                {
                    'id': doc.id,
                    'document_type': doc.document_type,
                    'file_path': doc.file_path,
                    'file_name': doc.file_name,
                    'file_size': doc.file_size,
                    'mime_type': doc.mime_type,
                    'uploaded_at': doc.uploaded_at.isoformat() if hasattr(doc, 'uploaded_at') else None,
                }
                for doc in docs
            ]
        except Exception:
            return []
