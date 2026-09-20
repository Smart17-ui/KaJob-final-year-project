# apps/reviews/repositories/review_repository.py

from typing import Optional, List, Dict, Any
from django.db.models import Q, Avg, Count
from apps.common.repositories import BaseRepository
from apps.reviews.models import Review


class ReviewRepository(BaseRepository[Review]):
    """Repository for Review model operations."""

    def __init__(self):
        super().__init__(Review)

    # ============================================
    # FIND BY REVIEWEE (Worker)
    # ============================================

    def get_reviews_for_worker(self, worker_id: int) -> List[Review]:
        """Get all reviews received by a worker."""
        return self.filter(reviewee_id=worker_id).order_by('-created_at')

    def get_recent_reviews_for_worker(
        self, worker_id: int, limit: int = 5
    ) -> List[Review]:
        """Get most recent reviews received by a worker."""
        return self.filter(reviewee_id=worker_id).order_by('-created_at')[:limit]

    # ============================================
    # FIND BY REVIEWER (Client)
    # ============================================

    def get_reviews_by_client(self, client_id: int) -> List[Review]:
        """Get all reviews given by a client."""
        return self.filter(reviewer_id=client_id).order_by('-created_at')

    # ============================================
    # FIND BY JOB
    # ============================================

    def get_reviews_for_job(self, job_id: int) -> List[Review]:
        """Get all reviews for a job."""
        return self.filter(job_id=job_id).order_by('-created_at')

    def get_review_for_job_and_client(
        self, job_id: int, client_id: int
    ) -> Optional[Review]:
        """Get a review for a specific job by a specific reviewer."""
        return self.filter(job_id=job_id, reviewer_id=client_id).first()

    # ============================================
    # FIND UNRATED JOBS
    # ============================================

    def get_unrated_completed_jobs_for_client(self, client_id: int) -> List:
        """Get completed jobs that the client hasn't reviewed yet."""
        from apps.jobs.models import Job
        from apps.common.constants import JobStatus

        reviewed_job_ids = self.filter(
            reviewer_id=client_id
        ).values_list('job_id', flat=True)

        jobs = (
            Job.objects
            .filter(client_id=client_id, status=JobStatus.COMPLETED)
            .exclude(id__in=reviewed_job_ids)
            .prefetch_related('assignments__worker')
        )

        return list(jobs)

    # ============================================
    # STATISTICS
    # ============================================

    def get_rating_stats(self, worker_id: int) -> Dict[str, Any]:
        """
        Get rating statistics for a worker.
        """
        reviews = self.filter(reviewee_id=worker_id)

        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
        )

        completed = reviews.filter(job_completed=True).count()
        incomplete = reviews.filter(job_completed=False).count()
        total = completed + incomplete

        distribution = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for rating in reviews.values_list('rating', flat=True):
            if rating in distribution:
                distribution[rating] += 1

        return {
            'average_rating': round(stats['average_rating'] or 0, 1),
            'total_reviews': stats['total_reviews'] or 0,
            'completed_jobs': completed,
            'incomplete_jobs': incomplete,
            'completion_rate': round(
                (completed / total * 100) if total > 0 else 0, 1
            ),
            'rating_distribution': distribution,
        }
