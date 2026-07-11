from typing import Optional, List
from django.db.models import Q
from apps.accounts.models import WorkerProfile
from apps.common.repositories import BaseRepository
from apps.common.constants import AvailabilityStatus


class WorkerProfileRepository(BaseRepository[WorkerProfile]):
    """
    Repository for WorkerProfile model operations.
    """
    
    def __init__(self):
        super().__init__(WorkerProfile)
    
    # ============================================
    # FIND BY USER
    # ============================================
    
    def get_by_user_id(self, user_id: int) -> Optional[WorkerProfile]:
        """Get worker profile by user ID"""
        return self.get_by_field('user_id', user_id)
    
    def get_or_create_worker_profile(self, user_id: int) -> WorkerProfile:
        """Get or create a worker profile"""
        worker, _ = self.get_or_create(user_id=user_id)
        return worker
    
    # ============================================
    # FILTER BY AVAILABILITY
    # ============================================
    
    def get_available_workers(self) -> List[WorkerProfile]:
        """Get all available workers (verified, active)"""
        return self.filter(
            availability_status=AvailabilityStatus.AVAILABLE,
            user__is_verified=True,
            user__account_status='ACTIVE',
            deleted_at__isnull=True
        ).select_related('user')
    
    def get_busy_workers(self) -> List[WorkerProfile]:
        """Get all busy workers"""
        return self.filter(
            availability_status=AvailabilityStatus.BUSY,
            deleted_at__isnull=True
        )
    
    def get_unavailable_workers(self) -> List[WorkerProfile]:
        """Get all unavailable workers"""
        return self.filter(
            availability_status=AvailabilityStatus.UNAVAILABLE,
            deleted_at__isnull=True
        )
    
    # ============================================
    # FILTER BY PERFORMANCE
    # ============================================
    
    def get_workers_by_rating(self, min_rating: float = 4.0) -> List[WorkerProfile]:
        """Get workers with rating above minimum"""
        return self.filter(
            average_rating__gte=min_rating,
            availability_status=AvailabilityStatus.AVAILABLE,
            deleted_at__isnull=True
        )
    
    def get_top_workers(self, limit: int = 10) -> List[WorkerProfile]:
        """Get top-rated available workers"""
        return self.filter(
            availability_status=AvailabilityStatus.AVAILABLE,
            deleted_at__isnull=True
        ).order_by('-average_rating')[:limit]
    
    # ============================================
    # FILTER BY SKILLS
    # ============================================
    
    def get_workers_by_skill(self, skill_name: str) -> List[WorkerProfile]:
        """Get available workers with a specific skill"""
        return self.filter(
            skills__name__iexact=skill_name,
            availability_status=AvailabilityStatus.AVAILABLE,
            deleted_at__isnull=True
        )
    
    def get_workers_by_skills(self, skill_names: List[str]) -> List[WorkerProfile]:
        """Get available workers with any of the specified skills"""
        return self.filter(
            skills__name__in=skill_names,
            availability_status=AvailabilityStatus.AVAILABLE,
            deleted_at__isnull=True
        ).distinct()
    
    def get_workers_with_all_skills(self, skill_names: List[str]) -> List[WorkerProfile]:
        """Get available workers with ALL specified skills"""
        # This is more complex - using subquery
        from django.db.models import Count
        return self.filter(
            skills__name__in=skill_names,
            availability_status=AvailabilityStatus.AVAILABLE,
            deleted_at__isnull=True
        ).annotate(
            skill_count=Count('skills')
        ).filter(
            skill_count=len(skill_names)
        )
    
    # ============================================
    # UPDATE OPERATIONS
    # ============================================
    
    def update_availability(self, user_id: int, status: str) -> Optional[WorkerProfile]:
        """Update worker availability status"""
        worker = self.get_by_user_id(user_id)
        if not worker:
            return None
        return self.update(worker, availability_status=status)
    
    def update_rating(self, user_id: int) -> Optional[WorkerProfile]:
        """Update worker's average rating from reviews"""
        from apps.reviews.models import Review
        from django.db.models import Avg
        
        worker = self.get_by_user_id(user_id)
        if not worker:
            return None
        
        reviews = Review.objects.filter(
            reviewee_id=user_id,
            deleted_at__isnull=True
        )
        
        if reviews.exists():
            avg = reviews.aggregate(Avg('rating'))['rating__avg']
            total = reviews.count()
            return self.update(
                worker,
                average_rating=round(avg, 2),
                total_reviews=total
            )
        else:
            return self.update(
                worker,
                average_rating=0.00,
                total_reviews=0
            )
    
    def increment_jobs_completed(self, user_id: int) -> Optional[WorkerProfile]:
        """Increment the number of jobs completed"""
        worker = self.get_by_user_id(user_id)
        if not worker:
            return None
        return self.update(worker, jobs_completed=worker.jobs_completed + 1)
    
    def reset_jobs_completed(self, user_id: int) -> Optional[WorkerProfile]:
        """Reset jobs completed count to 0"""
        worker = self.get_by_user_id(user_id)
        if not worker:
            return None
        return self.update(worker, jobs_completed=0)
    
    # ============================================
    # VALIDATION
    # ============================================
    
    def is_worker_available(self, user_id: int) -> bool:
        """Check if a worker is available"""
        worker = self.get_by_user_id(user_id)
        if not worker:
            return False
        return (
            worker.availability_status == AvailabilityStatus.AVAILABLE
            and worker.user.is_verified
            and worker.user.account_status == 'ACTIVE'
            and not worker.is_deleted
        )
    
    def is_worker_busy(self, user_id: int) -> bool:
        """Check if a worker is busy"""
        worker = self.get_by_user_id(user_id)
        if not worker:
            return False
        return worker.availability_status == AvailabilityStatus.BUSY
    
    # ============================================
    # LOCATION-BASED QUERIES
    # ============================================
    
    def get_nearby_workers(self, latitude: float, longitude: float, radius_km: int = 10) -> List[WorkerProfile]:
        """
        Get available workers within a radius.
        Note: For production, use PostGIS for accurate distance calculation.
        """
        # Simplified version - 1 degree ≈ 111km
        lat_range = radius_km / 111.0
        lng_range = radius_km / (111.0 * 111.0)
        
        return self.filter(
            user__profile__latitude__isnull=False,
            user__profile__longitude__isnull=False,
            user__profile__latitude__gte=latitude - lat_range,
            user__profile__latitude__lte=latitude + lat_range,
            user__profile__longitude__gte=longitude - lng_range,
            user__profile__longitude__lte=longitude + lng_range,
            availability_status=AvailabilityStatus.AVAILABLE,
            user__is_verified=True,
            user__account_status='ACTIVE',
            deleted_at__isnull=True
        ).select_related('user')
