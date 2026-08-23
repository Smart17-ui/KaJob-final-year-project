# apps/reviews/serializers/review_serializer.py

from rest_framework import serializers
from apps.reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""
    
    reviewer_name = serializers.SerializerMethodField()
    reviewee_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    rating_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'job',
            'job_title',
            'reviewer',
            'reviewer_name',
            'reviewee',
            'reviewee_name',
            'rating',
            'rating_display',
            'comment',
            'job_completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'reviewer',
            'created_at',
            'updated_at',
        ]
    
    def get_reviewer_name(self, obj):
        return obj.reviewer.full_name if obj.reviewer else None
    
    def get_reviewee_name(self, obj):
        return obj.reviewee.full_name if obj.reviewee else None
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
    
    def get_rating_display(self, obj):
        return obj.rating_display


class ReviewCreateSerializer(serializers.Serializer):
    """Serializer for creating a review."""
    
    job_id = serializers.IntegerField(required=True)
    reviewee_id = serializers.IntegerField(required=True)  # Worker being reviewed
    rating = serializers.IntegerField(min_value=0, max_value=5, required=True)
    comment = serializers.CharField(required=False, allow_blank=True)
    job_completed = serializers.BooleanField(default=True)
    
    def validate(self, data):
        """Validate that rating matches job_completed flag."""
        rating = data.get('rating')
        job_completed = data.get('job_completed', True)
        
        if rating == 0 and job_completed:
            raise serializers.ValidationError(
                "If you give a 0 rating, please indicate that the job was not completed."
            )
        
        if not job_completed and rating > 0:
            raise serializers.ValidationError(
                "If the job was not completed, the rating must be 0."
            )
        
        return data


class ReviewListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing reviews."""
    
    reviewer_name = serializers.SerializerMethodField()
    rating_display = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id',
            'job_title',
            'rating',
            'rating_display',
            'comment',
            'job_completed',
            'reviewer_name',
            'created_at',
        ]
    
    def get_reviewer_name(self, obj):
        return obj.reviewer.full_name if obj.reviewer else None
    
    def get_rating_display(self, obj):
        return obj.rating_display
    
    def get_job_title(self, obj):
        return obj.job.title if obj.job else None


class RatingStatsSerializer(serializers.Serializer):
    """Serializer for rating statistics."""
    
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    completed_jobs = serializers.IntegerField()
    incomplete_jobs = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    rating_distribution = serializers.DictField()


class UnratedJobSerializer(serializers.Serializer):
    """Serializer for unrated jobs."""
    
    job_id = serializers.IntegerField()
    job_title = serializers.CharField()
    worker_name = serializers.CharField()
    completed_at = serializers.DateTimeField()
