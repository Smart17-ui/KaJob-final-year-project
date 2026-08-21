# apps/matching/services/matching_service.py

import logging
from typing import List, Dict, Any, Optional
from django.db.models import Q, Prefetch
from apps.jobs.repositories import JobRepository
from apps.accounts.repositories import WorkerProfileRepository
from apps.jobs.models import Job, JobAssignment, JobApplication
from apps.accounts.models import WorkerProfile
from apps.common.constants import JobStatus, AvailabilityStatus, AssignmentStatus, ApplicationStatus
from apps.matching.services.distance_service import DistanceService

logger = logging.getLogger(__name__)


class MatchingService:
    """
    PURE LOCATION-BASED MATCHING SERVICE.
    
    This service ONLY handles location-based filtering and distance calculations.
    """
    
    def __init__(self):
        self.job_repo = JobRepository()
        self.worker_repo = WorkerProfileRepository()
    
    # ============================================
    # FIND JOBS BY LOCATION (For Workers)
    # ============================================
    
    def find_nearby_jobs_for_worker(
        self,
        worker_id: int,
        radius_km: float = 1.0
    ) -> List[Dict[str, Any]]:
        """Find jobs within radius of worker location."""
        try:
            worker_profile = WorkerProfile.objects.get(user_id=worker_id)
        except WorkerProfile.DoesNotExist:
            logger.warning(f"Worker profile not found for user {worker_id}")
            return []
        
        location = worker_profile.current_location
        if not location:
            logger.warning(f"Worker {worker_id} has no location set")
            return []
        
        lat = location.get('latitude')
        lng = location.get('longitude')
        
        if lat is None or lng is None:
            logger.warning(f"Worker {worker_id} has invalid location")
            return []
        
        jobs = self.job_repo.get_jobs_with_location()
        
        nearby_jobs = []
        for job in jobs:
            if job.latitude and job.longitude:
                distance = DistanceService.calculate_distance(
                    float(lat),
                    float(lng),
                    float(job.latitude),
                    float(job.longitude)
                )
                
                if distance is not None and distance <= radius_km:
                    nearby_jobs.append({
                        'job': job,
                        'distance_km': round(distance, 2),
                        'distance_display': DistanceService.get_distance_display(distance),
                    })
        
        nearby_jobs.sort(key=lambda x: x['distance_km'])
        
        logger.info(f"Found {len(nearby_jobs)} nearby jobs for worker {worker_id}")
        
        return nearby_jobs
    
    def count_nearby_jobs_for_worker(
        self,
        worker_id: int,
        radius_km: float = 1.0
    ) -> int:
        """Count jobs within radius of worker location."""
        nearby_jobs = self.find_nearby_jobs_for_worker(worker_id, radius_km)
        return len(nearby_jobs)
    
    # ============================================
    # FIND APPLICANTS BY LOCATION (For Clients)
    # ============================================
    
    def find_nearby_applicants_for_job(
        self,
        job_id: int,
        client_id: int,
        radius_km: float = 1.0
    ) -> List[Dict[str, Any]]:
        """
        Find applicants within radius of job location.
        
        ✅ ONLY shows workers who have APPLIED to this job
        ✅ Shows distance from job to applicant
        """
        try:
            job = Job.objects.get(id=job_id, is_deleted=False)
        except Job.DoesNotExist:
            logger.warning(f"Job {job_id} not found")
            return []
        
        if job.client_id != client_id:
            raise PermissionError("You don't have permission to view applicants for this job.")
        
        if not job.latitude or not job.longitude:
            logger.warning(f"Job {job_id} has no location")
            return []
        
        applications = JobApplication.objects.filter(
            job_id=job_id
        ).select_related('worker', 'worker__workerprofile')
        
        if not applications.exists():
            logger.info(f"No applicants for job {job_id}")
            return []
        
        nearby_applicants = []
        for application in applications:
            worker = application.worker
            try:
                worker_profile = WorkerProfile.objects.get(user=worker)
                location = worker_profile.current_location
                
                if location:
                    lat = location.get('latitude')
                    lng = location.get('longitude')
                    
                    if lat and lng:
                        distance = DistanceService.calculate_distance(
                            float(job.latitude),
                            float(job.longitude),
                            float(lat),
                            float(lng)
                        )
                        
                        if distance is not None and distance <= radius_km:
                            nearby_applicants.append({
                                'worker': worker,
                                'worker_profile': worker_profile,
                                'application': application,
                                'distance_km': round(distance, 2),
                                'distance_display': DistanceService.get_distance_display(distance),
                            })
            except WorkerProfile.DoesNotExist:
                logger.warning(f"Worker profile not found for user {worker.id}")
                continue
        
        nearby_applicants.sort(key=lambda x: x['distance_km'])
        
        logger.info(
            f"Found {len(nearby_applicants)} nearby applicants for job {job_id} "
            f"(out of {applications.count()} total applicants)"
        )
        
        return nearby_applicants
    
    def get_all_applicants_for_job(
        self,
        job_id: int,
        client_id: int,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get ALL applicants for a job (without distance filtering).
        
        ✅ Shows ALL workers who have applied (regardless of distance)
        ✅ Can filter by application status
        """
        try:
            job = Job.objects.get(id=job_id, is_deleted=False)
        except Job.DoesNotExist:
            logger.warning(f"Job {job_id} not found")
            return []
        
        if job.client_id != client_id:
            raise PermissionError("You don't have permission to view applicants for this job.")
        
        applications = JobApplication.objects.filter(
            job_id=job_id
        ).select_related('worker', 'worker__workerprofile')
        
        if status:
            applications = applications.filter(status=status)
        
        result = []
        for application in applications:
            worker = application.worker
            try:
                worker_profile = WorkerProfile.objects.get(user=worker)
                
                distance_km = None
                distance_display = None
                if job.latitude and job.longitude and worker_profile.current_location:
                    lat = worker_profile.current_location.get('latitude')
                    lng = worker_profile.current_location.get('longitude')
                    if lat and lng:
                        distance_km = DistanceService.calculate_distance(
                            float(job.latitude),
                            float(job.longitude),
                            float(lat),
                            float(lng)
                        )
                        if distance_km is not None:
                            distance_display = DistanceService.get_distance_display(distance_km)
                
                result.append({
                    'application_id': application.id,
                    'application_status': application.status,
                    'applied_at': application.applied_at,
                    'distance_km': round(distance_km, 2) if distance_km else None,
                    'distance_display': distance_display,
                    'worker': {
                        'id': worker.id,
                        'full_name': worker.full_name,
                        'email': worker.email,
                        'phone_number': worker.phone_number,
                        'bio': worker_profile.bio if worker_profile else None,
                        'average_rating': worker_profile.average_rating if worker_profile else None,
                        'jobs_completed': worker_profile.jobs_completed if worker_profile else None,
                        'skills': [skill.name for skill in worker_profile.skills.all()] if worker_profile else [],
                        'availability_status': worker_profile.availability_status if worker_profile else None,
                    }
                })
            except WorkerProfile.DoesNotExist:
                result.append({
                    'application_id': application.id,
                    'application_status': application.status,
                    'applied_at': application.applied_at,
                    'distance_km': None,
                    'distance_display': None,
                    'worker': {
                        'id': worker.id,
                        'full_name': worker.full_name,
                        'email': worker.email,
                        'phone_number': worker.phone_number,
                    }
                })
        
        logger.info(f"Found {len(result)} applicants for job {job_id}")
        
        return result
