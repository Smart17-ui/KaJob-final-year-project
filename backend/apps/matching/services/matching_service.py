# apps/matching/services/matching_service.py

import logging
from typing import List, Dict, Any, Optional
from django.db.models import Q, Prefetch
from django.conf import settings
from apps.jobs.repositories import JobRepository
from apps.accounts.repositories import WorkerProfileRepository
from apps.jobs.models import Job, JobAssignment, JobApplication
from apps.accounts.models import WorkerProfile, User
from apps.common.constants import JobStatus, AvailabilityStatus, AssignmentStatus, ApplicationStatus
from apps.matching.services.distance_service import DistanceService
from apps.notifications.services import EmailService

logger = logging.getLogger(__name__)


class MatchingService:
    """
    PURE LOCATION-BASED MATCHING SERVICE.

    This service ONLY handles location-based filtering and distance calculations.
    """

    def __init__(self):
        self.job_repo = JobRepository()
        self.worker_repo = WorkerProfileRepository()
        self.email_service = EmailService()

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
            # Get worker profile with user and profile
            worker_profile = WorkerProfile.objects.select_related('user', 'user__profile').get(user_id=worker_id)
        except WorkerProfile.DoesNotExist:
            logger.warning(f"Worker profile not found for user {worker_id}")
            return []

        #Check if worker has an ACTIVE assignment
        has_active_assignment = JobAssignment.objects.filter(
            worker_id=worker_id,
            status=AssignmentStatus.ACTIVE
        ).exists()

        # If worker is busy, return empty list (no job updates)
        if has_active_assignment:
            logger.info(f"Worker {worker_id} has active assignment. Skipping job updates.")
            return []

        # Get location from the User's Profile
        user = worker_profile.user
        if not hasattr(user, 'profile') or not user.profile:
            logger.warning(f"User {worker_id} has no profile")
            return []

        lat = user.profile.latitude
        lng = user.profile.longitude

        if lat is None or lng is None:
            logger.warning(f"Worker {worker_id} has no location set in profile")
            return []

        # Get jobs with location data
        jobs = Job.objects.filter(
            status=JobStatus.OPEN,
            latitude__isnull=False,
            longitude__isnull=False,
            deleted_at__isnull=True
        ).select_related('category', 'client')

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

        # Send email notification if jobs found AND worker is NOT busy
        if nearby_jobs and len(nearby_jobs) > 0:
            try:
                worker_user = User.objects.get(id=worker_id)
                self._send_nearby_jobs_email(worker_user, nearby_jobs, radius_km)
                logger.info(f"📧 Nearby jobs email sent to worker {worker_id} ({len(nearby_jobs)} jobs found)")
            except Exception as e:
                logger.error(f"Failed to send nearby jobs email: {str(e)}")

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
    # FIND WORKERS NEAR A JOB (for job-post broadcast)
    # ============================================

    def find_workers_near_job(
        self,
        job_id: int,
        radius_km: float = 1.0
    ) -> List[Dict[str, Any]]:
        """
        Return AVAILABLE workers within radius_km of a job's location.

        Used when a job is created — notify every nearby worker.
        Skips: the client themselves, BUSY workers, workers without a
        profile location, and unverified/inactive accounts.
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            logger.warning(f"Job {job_id} not found for worker broadcast")
            return []

        if not job.latitude or not job.longitude:
            logger.warning(f"Job {job_id} has no location — cannot broadcast")
            return []

        # Candidate workers: active, verified, with a location
        candidates = User.objects.filter(
            account_status='ACTIVE',
            is_verified=True,
            deleted_at__isnull=True,
        ).exclude(
            id=job.client_id,
        ).select_related('profile').distinct()

        nearby = []
        for worker in candidates:
            # Skip workers who are not AVAILABLE
            try:
                wp = worker.worker_profile
                if wp and wp.availability_status != AvailabilityStatus.AVAILABLE:
                    continue
            except WorkerProfile.DoesNotExist:
                continue

            profile = getattr(worker, 'profile', None)
            if not profile or profile.latitude is None or profile.longitude is None:
                continue

            distance = DistanceService.calculate_distance(
                float(job.latitude),
                float(job.longitude),
                float(profile.latitude),
                float(profile.longitude),
            )

            if distance is None:
                continue

            if distance <= radius_km:
                nearby.append({
                    'worker': worker,
                    'distance_km': round(distance, 2),
                    'distance_display': DistanceService.get_distance_display(distance),
                })

        nearby.sort(key=lambda x: x['distance_km'])
        logger.info(
            f"Found {len(nearby)} workers within {radius_km}km of job {job_id}"
        )
        return nearby

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

        ONLY shows workers who have APPLIED to this job
        Shows distance from job to applicant
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
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
        ).select_related('worker', 'worker__workerprofile', 'worker__profile')

        if not applications.exists():
            logger.info(f"No applicants for job {job_id}")
            return []

        nearby_applicants = []
        for application in applications:
            worker = application.worker
            try:
                worker_profile = WorkerProfile.objects.select_related('user', 'user__profile').get(user=worker)

                # Get location from the User's Profile
                user = worker_profile.user
                if hasattr(user, 'profile') and user.profile:
                    lat = user.profile.latitude
                    lng = user.profile.longitude

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

        ONLY shows workers who have applied (regardless of distance)
        Can filter by application status
        """
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            logger.warning(f"Job {job_id} not found")
            return []

        if job.client_id != client_id:
            raise PermissionError("You don't have permission to view applicants for this job.")

        applications = JobApplication.objects.filter(
            job_id=job_id
        ).select_related('worker', 'worker__workerprofile', 'worker__profile')

        if status:
            applications = applications.filter(status=status)

        result = []
        for application in applications:
            worker = application.worker
            try:
                worker_profile = WorkerProfile.objects.select_related('user', 'user__profile').get(user=worker)

                distance_km = None
                distance_display = None

                # Get location from the User's Profile
                if job.latitude and job.longitude:
                    user = worker_profile.user
                    if hasattr(user, 'profile') and user.profile:
                        lat = user.profile.latitude
                        lng = user.profile.longitude
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


