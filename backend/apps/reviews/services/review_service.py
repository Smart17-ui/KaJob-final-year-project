# apps/reviews/services/review_service.py

import logging
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from apps.reviews.models import Review
from apps.reviews.repositories import ReviewRepository
from apps.jobs.repositories import JobRepository
from apps.accounts.repositories import UserRepository
from apps.common.constants import JobStatus, AssignmentStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)


class ReviewService:
    """Service for review operations."""

    def __init__(self):
        self.review_repo = ReviewRepository()
        self.job_repo = JobRepository()
        self.user_repo = UserRepository()

    # ============================================
    # PRIVATE HELPERS
    # ============================================

    def _get_job_worker(self, job):
        """
        Return the worker assigned to this job (as a User), or None.

        The Job model has no `assigned_worker` / `assigned_worker_id`
        field — the worker is linked via JobAssignment. We accept any
        assignment that has actually been used (ACTIVE, IN_PROGRESS, or
        COMPLETED) so that reviews can still be created after the
        assignment transitions to COMPLETED.
        """
        assignment = (
            job.assignments
            .filter(status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
            ])
            .select_related('worker')
            .order_by('-assigned_at')
            .first()
        )
        return assignment.worker if assignment else None

    def _get_job_parties(self, job) -> Dict[str, Optional[object]]:
        """
        Return the two parties of a job:
            {
                'client': <User or None>,
                'worker': <User or None>,
            }

        Used to validate the reviewer/reviewee pair without hardcoding
        a direction. This works for both Client→Worker and (later)
        Worker→Client reviews.
        """
        return {
            'client': job.client,
            'worker': self._get_job_worker(job),
        }

    # ============================================
    # CREATE REVIEW
    # ============================================

    @transaction.atomic
    def create_review(self, reviewer, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new review.

        Rules:
        - Job must be COMPLETED
        - Reviewer must be one of the two parties (client or worker)
        - Reviewee must be the OTHER party
        - Reviewer cannot review themselves
        - One review per reviewer per job
        - rating=0 ⇔ job_completed=False
        """
        job_id = data.get('job_id')
        reviewee_id = data.get('reviewee_id')

        # Get the job
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")

        # Job must be completed
        if job.status != JobStatus.COMPLETED:
            raise BusinessRuleViolation(
                f"Cannot review a job with status '{job.status}'. "
                f"Only completed jobs can be reviewed."
            )

        # Resolve the two parties of this job
        parties = self._get_job_parties(job)
        client = parties['client']
        worker = parties['worker']

        # Reviewer must be one of the two parties
        is_client = client is not None and client.id == reviewer.id
        is_worker = worker is not None and worker.id == reviewer.id

        if not (is_client or is_worker):
            raise BusinessRuleViolation(
                "You are not a participant on this job and cannot review it."
            )

        # The other party is the valid reviewee
        other_party = worker if is_client else client

        if other_party is None:
            raise BusinessRuleViolation(
                "The other party on this job is not available. "
                "Cannot create a review."
            )

        # Reviewee must be the other party
        if other_party.id != reviewee_id:
            raise BusinessRuleViolation(
                "You can only review the other participant of this job."
            )

        # Sanity: cannot review yourself
        if reviewer.id == reviewee_id:
            raise BusinessRuleViolation("You cannot review yourself.")

        # One review per reviewer per job
        existing_review = self.review_repo.get_review_for_job_and_client(
            job_id, reviewer.id
        )
        if existing_review:
            raise BusinessRuleViolation(
                "You have already reviewed this job."
            )

        # Determine completion flag + rating consistency
        job_completed = data.get('job_completed', True)
        rating = data.get('rating')

        if rating == 0 and job_completed:
            raise BusinessRuleViolation(
                "If you give a 0 rating, please indicate that the job was "
                "not completed."
            )

        if not job_completed and rating > 0:
            raise BusinessRuleViolation(
                "If the job was not completed, the rating must be 0."
            )

        # Create the review
        review = self.review_repo.create(
            job=job,
            reviewer=reviewer,
            reviewee_id=reviewee_id,
            rating=rating,
            comment=data.get('comment', ''),
            job_completed=job_completed,
        )

        logger.info(
            f"Review created: {reviewer.id} reviewed {reviewee_id} "
            f"for job {job_id}"
        )

        return {
            'review': review,
            'message': 'Review submitted successfully!'
        }

    # ============================================
    # GET REVIEWS
    # ============================================

    def get_reviews_for_worker(self, worker_id: int) -> List[Review]:
        """Get all reviews received by a worker."""
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
        """Get most recent reviews received by a worker."""
        return self.review_repo.get_recent_reviews_for_worker(worker_id, limit)

    def get_unrated_jobs(self, client_id: int) -> List[Dict]:
        """Get all completed jobs that a client hasn't reviewed yet."""
        jobs = self.review_repo.get_unrated_completed_jobs_for_client(client_id)

        result = []
        for job in jobs:
            worker = self._get_job_worker(job)
            result.append({
                'job_id': job.id,
                'job_title': job.title,
                'worker_name': worker.full_name if worker else None,
                'completed_at': job.completed_at,
            })

        return result

    # ============================================
    # WORKER-SIDE UNRATED JOBS (worker → client)
    # ============================================

    def get_worker_unrated_jobs(self, worker_id: int) -> List[Dict]:
        """
        Get all completed jobs that a worker hasn't reviewed the client for.

        Mirrors `get_unrated_jobs` (client-side) but inverted. The
        counterparty on the worker side is the client, so we return
        `client_name` instead of `worker_name`.
        """
        jobs = self.review_repo.get_unrated_completed_jobs_for_worker(worker_id)

        result = []
        for job in jobs:
            result.append({
                'job_id': job.id,
                'job_title': job.title,
                'client_name': job.client.full_name if job.client else None,
                'completed_at': job.completed_at,
            })

        return result
