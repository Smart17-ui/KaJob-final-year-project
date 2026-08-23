# apps/reviews/services/review_service.py

import logging
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from apps.reviews.models import Review
from apps.reviews.repositories import ReviewRepository
from apps.jobs.repositories import JobRepository
from apps.accounts.repositories import UserRepository
from apps.common.constants import JobStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)


class ReviewService:
    """Service for review operations."""
    
    def __init__(self):
        self.review_repo = ReviewRepository()
        self.job_repo = JobRepository()
        self.user_repo = UserRepository()
    
    # ============================================
    # CREATE REVIEW
    # ============================================
    
    @transaction.atomic
    def create_review(self, reviewer, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new review.
        
        Rules:
        - Job must be completed
        - Only the client (reviewer) can review
        - Client cannot review themselves
        - One review per client per job
        - reviewee must be the worker assigned to the job
        """
        job_id = data.get('job_id')
        reviewee_id = data.get('reviewee_id')
        
        # Get job
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check if job is completed
        if job.status != JobStatus.COMPLETED:
            raise BusinessRuleViolation(
                f"Cannot review a job with status '{job.status}'. Only completed jobs can be reviewed."
            )
        
        # Check if reviewer is the client of this job
        if job.client_id != reviewer.id:
            raise BusinessRuleViolation(
                "Only the client who posted this job can review it."
            )
        
        # Check if reviewee is the assigned worker
        if job.assigned_worker_id != reviewee_id:
            raise BusinessRuleViolation(
                "The worker you are trying to review was not assigned to this job."
            )
        
        # Check if reviewer is reviewing themselves
        if reviewer.id == reviewee_id:
            raise BusinessRuleViolation("You cannot review yourself.")
        
        # Check if review already exists
        existing_review = self.review_repo.get_review_for_job_and_client(
            job_id, reviewer.id
        )
        if existing_review:
            raise BusinessRuleViolation(
                "You have already reviewed this job."
            )
        
        # Determine if job was completed
        job_completed = data.get('job_completed', True)
        rating = data.get('rating')
        
        # Validate rating consistency
        if rating == 0 and job_completed:
            raise BusinessRuleViolation(
                "If you give a 0 rating, please indicate that the job was not completed."
            )
        
        if not job_completed and rating > 0:
            raise BusinessRuleViolation(
                "If the job was not completed, the rating must be 0."
            )
        
        # Create review
        review = self.review_repo.create(
            job=job,
            reviewer=reviewer,
            reviewee_id=reviewee_id,
            rating=rating,
            comment=data.get('comment', ''),
            job_completed=job_completed,
        )
        
        logger.info(f"Review created: {reviewer.id} reviewed {reviewee_id} for job {job_id}")
        
        return {
            'review': review,
            'message': 'Review submitted successfully!'
        }
    
    # ============================================
    # GET REVIEWS
    # ============================================
    
    def get_reviews_for_worker(self, worker_id: int) -> List[Review]:
        """Get all reviews for a worker."""
        return self.review_repo.get_reviews_for_worker(worker_id)
    
    def get_reviews_by_client(self, client_id: int) -> List[Review]:
        """Get all reviews given by a client."""
        return self.review_repo.get_reviews_by_client(client_id)
    
    def get_reviews_for_job(self, job_id: int) -> List[Review]:
        """Get all reviews for a job."""
        return self.review_repo.get_reviews_for_job(job_id)
    
    def get_rating_stats(self, worker_id: int) -> Dict[str, Any]:
        """Get rating statistics for a worker."""
        return self.review_repo.get_rating_stats(worker_id)
    
    def get_recent_reviews(self, worker_id: int, limit: int = 5) -> List[Review]:
        """Get most recent reviews for a worker."""
        return self.review_repo.get_recent_reviews_for_worker(worker_id, limit)
    
    def get_unrated_jobs(self, client_id: int) -> List[Dict]:
        """Get all completed jobs that a client hasn't reviewed yet."""
        jobs = self.review_repo.get_unrated_completed_jobs_for_client(client_id)
        
        result = []
        for job in jobs:
            result.append({
                'job_id': job.id,
                'job_title': job.title,
                'worker_name': job.assigned_worker.full_name if job.assigned_worker else None,
                'completed_at': job.completed_at,
            })
        
        return result
