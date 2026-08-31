# apps/admin_panel/serializers/admin_serializer.py

from rest_framework import serializers
from apps.accounts.models import User
from apps.jobs.models import Job
from apps.reviews.models import Review
from apps.identity_verification.models import IdentityVerification
from apps.common.constants import VerificationStatus


class AdminUserSerializer(serializers.ModelSerializer):
    """Full serializer for admin user management."""
    
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    jobs_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'role_display', 'is_verified',
            'is_active', 'is_admin', 'account_status', 'last_login',
            'date_joined', 'jobs_count', 'reviews_count', 'average_rating',
        ]
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_role_display(self, obj):
        return dict(User.ROLE_CHOICES).get(obj.role)
    
    def get_jobs_count(self, obj):
        if obj.is_worker:
            return obj.assigned_jobs.count()
        elif obj.is_client:
            return obj.jobs_posted.count()
        return 0
    
    def get_reviews_count(self, obj):
        return obj.reviews_received.count()
    
    def get_average_rating(self, obj):
        from apps.accounts.models import WorkerProfile
        try:
            profile = WorkerProfile.objects.get(user=obj)
            return profile.average_rating
        except WorkerProfile.DoesNotExist:
            return None


class AdminUserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing users."""
    
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone_number',
            'role', 'role_display', 'is_verified', 'is_active',
            'account_status', 'date_joined',
        ]
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_role_display(self, obj):
        return dict(User.ROLE_CHOICES).get(obj.role)


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
        if obj.assigned_worker:
            return obj.assigned_worker.full_name
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


class AdminVerificationSerializer(serializers.ModelSerializer):
    """Serializer for admin verification management."""
    
    user_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = IdentityVerification
        fields = [
            'id', 'user', 'user_name', 'document_type',
            'document_number', 'verification_status', 'status_display',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            'verification_notes', 'submitted_at', 'document_count',
            'created_at', 'updated_at',
        ]
    
    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None
    
    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(obj.verification_status)
    
    def get_document_count(self, obj):
        return obj.documents.count()


class AdminVerificationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for verification with documents."""
    
    user_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    
    class Meta:
        model = IdentityVerification
        fields = [
            'id', 'user', 'user_name', 'document_type',
            'document_number', 'verification_status', 'status_display',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            'verification_notes', 'submitted_at', 'documents',
            'created_at', 'updated_at',
        ]
    
    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else None
    
    def get_status_display(self, obj):
        return dict(VerificationStatus.CHOICES).get(obj.verification_status)
    
    def get_documents(self, obj):
        from apps.identity_verification.models import VerificationDocument
        docs = VerificationDocument.objects.filter(verification=obj)
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
            for doc in docs
        ]
