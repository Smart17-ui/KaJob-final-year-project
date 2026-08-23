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
    # FIND BY REViewee (Worker)
    # ============================================
    
    def get_reviews_for_worker(self, worker_id: int) -> List[Review]:
        """Get all reviews for a worker."""
        return self.filter(reviewee_id=worker_id).order_by('-created_at')
    
    def get_recent_reviews_for_worker(self, worker_id: int, limit: int = 5) -> List[Review]:
        """Get most recent reviews for a worker."""
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
    
    def get_review_for_job_and_client(self, job_id: int, client_id: int) -> Optional[Review]:
        """Get a review for a specific job by a specific client."""
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
        
        jobs = Job.objects.filter(
            client_id=client_id,
            status=JobStatus.COMPLETED
        ).exclude(
            id__in=reviewed_job_ids
        ).select_related('assigned_worker')
        
        return list(jobs)
    
    # ============================================
    # STATISTICS
    # ============================================
    
    def get_rating_stats(self, worker_id: int) -> Dict[str, Any]:
        """
        Get rating statistics for a worker.
        
        Returns:
            {
                'average_rating': 4.5,
                'total_reviews': 15,
                'completed_jobs': 14,
                'incomplete_jobs': 1,
                'completion_rate': 93.3,
                'rating_distribution': {0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 7}
            }
        """
        reviews = self.filter(reviewee_id=worker_id)
        
        # Overall stats
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        
        # Completion stats
        completed = reviews.filter(job_completed=True).count()
        incomplete = reviews.filter(job_completed=False).count()
        total = completed + incomplete
        
        # Rating distribution
        distribution = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for rating in reviews.values_list('rating', flat=True):
            if rating in distribution:
                distribution[rating] += 1
        
        return {
            'average_rating': round(stats['average_rating'] or 0, 1),
            'total_reviews': stats['total_reviews'] or 0,
            'completed_jobs': completed,
            'incomplete_jobs': incomplete,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 1),
            'rating_distribution': distribution,
        }
