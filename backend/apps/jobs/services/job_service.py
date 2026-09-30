# apps/jobs/services/job_service.py

import logging
from datetime import date
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import JobRepository
from apps.jobs.models import Job, JobAssignment, JobApplication
from apps.audit.models import AuditLog
from apps.common.constants import JobStatus, AssignmentStatus, ApplicationStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.matching.services import GeocodingService
from urllib.parse import quote

logger = logging.getLogger(__name__)


class JobService:
    """
    Service for job management operations.
    Single Responsibility: Manage job postings.
    """

    def __init__(self):
        self.job_repo = JobRepository()

    # ============================================
    # HELPER: GENERATE MAP URLs
    # ============================================

    @staticmethod
    def generate_map_urls(latitude: float, longitude: float, address: str = None) -> Dict[str, str]:
        """Generate Google Maps URLs for the location."""
        MAPS_BASE = "https://www.google.com/maps"

        if latitude and longitude:
            location_param = f"{latitude},{longitude}"
        elif address:
            location_param = quote(address)
        else:
            return {'map_url': '', 'directions_url': ''}

        map_url = f"{MAPS_BASE}/place/{location_param}"
        directions_url = f"{MAPS_BASE}/dir/?api=1&destination={location_param}"

        return {
            'map_url': map_url,
            'directions_url': directions_url,
        }

    # ============================================
    # HELPER: FILTER OUT EXPIRED JOBS
    # ============================================

    @staticmethod
    def _exclude_expired(qs):
        """
        Remove jobs whose job_date has passed.

        Jobs with no job_date are always kept (anytime/flexible jobs).
        """
        return qs.filter(
            Q(job_date__isnull=True) | Q(job_date__gte=timezone.now().date())
        )

    # ============================================
    # CREATE JOB
    # ============================================

    @transaction.atomic
    def create_job(self, client, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job posting."""
        if not client.is_verified:
            raise BusinessRuleViolation("You must be verified to post a job.")

        if not client.is_active:
            raise BusinessRuleViolation("Your account is not active.")

        if data['budget'] <= 0:
            raise BusinessRuleViolation("Budget must be greater than zero.")

        duration_hours = data.get('duration_hours')
        if duration_hours is not None:
            if duration_hours <= 0:
                raise BusinessRuleViolation("Duration must be greater than zero.")
            if duration_hours > 24:
                raise BusinessRuleViolation("Duration cannot exceed 24 hours.")

        job_date = data.get('job_date')
        if job_date:
            if job_date < timezone.now().date():
                raise BusinessRuleViolation("Job date cannot be in the past.")

        general_location = (data.get('general_location') or '').strip()
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        # ── Location is REQUIRED ──────────────────────────────────
        if not (latitude and longitude) and not general_location:
            raise BusinessRuleViolation(
                "Please provide a job location. Tap 'Use My Location' "
                "or enter a general location."
            )

        # ── Case 1: coords given, no text → reverse geocode for display
        if (latitude and longitude) and not general_location:
            try:
                general_location = GeocodingService.get_display_location(
                    float(latitude),
                    float(longitude),
                    fallback=f"{latitude}, {longitude}"
                )
                logger.info(f"Auto-filled general_location: {general_location}")
            except Exception as e:
                logger.warning(f"Failed to auto-fill location: {str(e)}")
                general_location = f"{latitude}, {longitude}"

        # ── Case 2: text given, no coords → forward geocode ──────
        if general_location and (not latitude or not longitude):
            try:
                results = GeocodingService.search_location(general_location, limit=1)
                if results:
                    first = results[0]
                    lat_c = first.get('latitude')
                    lng_c = first.get('longitude')
                    if lat_c and lng_c and (lat_c != 0.0 or lng_c != 0.0):
                        latitude = lat_c
                        longitude = lng_c
                        logger.info(
                            f"Geocoded '{general_location}' -> "
                            f"{latitude},{longitude}"
                        )
                    else:
                        logger.warning(
                            f"Geocoding returned zero coords for "
                            f"'{general_location}' — keeping text only"
                        )
                else:
                    logger.info(
                        f"No geocoding result for '{general_location}' — "
                        f"keeping text location only"
                    )
            except Exception as e:
                logger.warning(
                    f"Forward geocoding failed for '{general_location}': {e}"
                )

        map_urls = {}
        if latitude and longitude:
            try:
                map_urls = self.generate_map_urls(
                    float(latitude),
                    float(longitude),
                    general_location
                )
                logger.info(f"Generated map URLs for job")
            except Exception as e:
                logger.warning(f"Failed to generate map URLs: {str(e)}")

        job = self.job_repo.create(
            client=client,
            title=data['title'],
            description=data['description'],
            budget=data['budget'],
            category_id=data['category_id'],
            general_location=general_location,
            exact_location=data.get('exact_location', ''),
            latitude=latitude,
            longitude=longitude,
            map_url=map_urls.get('map_url', ''),
            directions_url=map_urls.get('directions_url', ''),
            place_id=data.get('place_id', ''),
            status=JobStatus.OPEN,
            job_date=job_date,
            job_time=data.get('job_time'),
            timeframe=data.get('timeframe', 'ANYTIME'),
            is_flexible=data.get('is_flexible', True),
            duration_hours=duration_hours,
            urgency=data.get('urgency', 'NORMAL'),
        )

        required_skills = data.get('required_skills', [])
        if required_skills:
            job.required_skills.set(required_skills)
            logger.info(f"Added {len(required_skills)} skills to job {job.id}")

        AuditLog.objects.create(
            user=client,
            action='JOB_CREATED',
            entity_type='JOB',
            entity_id=job.id,
            details={
                'title': job.title,
                'budget': str(job.budget),
                'category_id': job.category_id,
                'job_date': str(job.job_date) if job.job_date else None,
                'urgency': job.urgency,
                'required_skills': required_skills,
                'general_location': general_location,
                'has_map': bool(job.map_url),
            }
        )

        logger.info(f"Job created: {job.title} by {client.email} (ID: {job.id})")

        # Notify nearby available workers (within 10 km)
        try:
            from apps.matching.services.matching_service import MatchingService
            from apps.notifications.services import NotificationService

            nearby = MatchingService().find_workers_near_job(
                job_id=job.id, radius_km=10.0
            )

            if nearby:
                notif = NotificationService()
                for item in nearby:
                    try:
                        notif.notify_job_posted(
                            worker=item['worker'],
                            job=job,
                            distance=item['distance_display'],
                        )
                    except Exception as inner_e:
                        logger.error(
                            f"[notify] job_posted failed for worker "
                            f"{item['worker'].id}: {inner_e}"
                        )

                logger.info(
                    f"[notify] job_posted broadcast to {len(nearby)} workers"
                )
            else:
                logger.info(
                    f"[notify] job_posted: no nearby workers within 10km of job {job.id}"
                )
        except Exception as e:
            logger.error(f"[notify] job_posted broadcast failed: {e}")

        return {
            'job': job,
            'message': 'Job posted successfully!'
        }

    # ============================================
    # GET JOBS
    # ============================================

    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Get job by ID (no date filter — caller decides visibility)."""
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
            return job
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")

    def get_open_jobs(self) -> List[Job]:
        """Get all open jobs, excluding expired ones."""
        qs = Job.objects.filter(
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        )
        qs = self._exclude_expired(qs)
        return qs.order_by('-posted_at')

    def get_urgent_jobs(self) -> List[Job]:
        """Get urgent and immediate jobs, excluding expired ones."""
        qs = Job.objects.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        )
        qs = self._exclude_expired(qs)
        return qs.order_by('job_date', '-posted_at')

    def get_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get jobs posted by a client (excluding hidden ones)."""
        return Job.objects.filter(
            client_id=client_id,
            deleted_at__isnull=True,
            client_hidden_at__isnull=True,
        ).order_by('-posted_at')

    def get_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get jobs assigned to a worker (excluding worker-hidden ones)."""
        return Job.objects.filter(
            assignments__worker_id=worker_id,
            assignments__worker_hidden_at__isnull=True,
            deleted_at__isnull=True
        ).distinct().order_by('-posted_at')

    def get_active_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get active jobs assigned to a worker (excluding worker-hidden ones)."""
        return Job.objects.filter(
            assignments__worker_id=worker_id,
            assignments__status=AssignmentStatus.ACTIVE,
            assignments__worker_hidden_at__isnull=True,
            deleted_at__isnull=True
        ).distinct().order_by('-posted_at')

    def get_open_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get open jobs posted by a client (excluding hidden ones)."""
        return Job.objects.filter(
            client_id=client_id,
            status=JobStatus.OPEN,
            deleted_at__isnull=True,
            client_hidden_at__isnull=True,
        ).order_by('-posted_at')

    def get_jobs_by_skills(self, skill_ids: List[int]) -> List[Job]:
        """Get jobs that require specific skills (excluding expired ones)."""
        qs = Job.objects.filter(
            required_skills__in=skill_ids,
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).distinct()
        qs = self._exclude_expired(qs)
        return qs.order_by('-posted_at')

    def search_jobs(self, query: str) -> List[Job]:
        """Search jobs by title or description (excluding expired ones)."""
        qs = Job.objects.filter(
            title__icontains=query,
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        )
        qs = self._exclude_expired(qs)
        return qs.order_by('-posted_at')

    # ============================================
    # FILTER JOBS (Non-location filters)
    # ============================================

    def filter_jobs(
        self,
        category_id: int = None,
        min_budget: float = None,
        max_budget: float = None,
        skill_ids: List[int] = None,
        urgency: str = None,
        job_date: date = None,
        timeframe: str = None,
    ) -> List[Job]:
        """Filter jobs by category, budget, skills, urgency, date, and timeframe."""
        jobs = Job.objects.filter(
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        )
        jobs = self._exclude_expired(jobs)

        if category_id:
            jobs = jobs.filter(category_id=category_id)
        if min_budget:
            jobs = jobs.filter(budget__gte=min_budget)
        if max_budget:
            jobs = jobs.filter(budget__lte=max_budget)
        if skill_ids:
            jobs = jobs.filter(required_skills__in=skill_ids).distinct()
        if urgency:
            jobs = jobs.filter(urgency=urgency)
        if job_date:
            jobs = jobs.filter(job_date=job_date)
        if timeframe:
            jobs = jobs.filter(timeframe=timeframe)

        return jobs.order_by('-posted_at')

    # ============================================
    # UPDATE JOB
    # ============================================

    @transaction.atomic
    def update_job(self, client, job_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a job posting."""
        job = self.get_job_by_id(job_id)

        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to update this job.")

        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(f"Cannot update a {job.status} job.")

        # ── Validate new date if present ─────────────────────────
        new_job_date = data.get('job_date')
        if new_job_date:
            if new_job_date < timezone.now().date():
                raise BusinessRuleViolation(
                    "Job date cannot be in the past. "
                    "Please choose today or a future date."
                )

        for key, value in data.items():
            if key == 'required_skills':
                if value:
                    job.required_skills.set(value)
                else:
                    job.required_skills.clear()
            elif key in ['latitude', 'longitude']:
                setattr(job, key, value)
                if 'latitude' in data and 'longitude' in data:
                    lat = data.get('latitude')
                    lng = data.get('longitude')
                    if lat and lng:
                        map_urls = self.generate_map_urls(
                            float(lat),
                            float(lng),
                            job.general_location
                        )
                        job.map_url = map_urls.get('map_url', '')
                        job.directions_url = map_urls.get('directions_url', '')
            elif hasattr(job, key) and key not in ['id', 'client', 'created_at', 'posted_at']:
                setattr(job, key, value)

        job.save()

        AuditLog.objects.create(
            user=client,
            action='JOB_UPDATED',
            entity_type='JOB',
            entity_id=job.id,
            details={'updated_fields': list(data.keys())}
        )

        logger.info(f"Job {job_id} updated by {client.email}")

        return {
            'job': job,
            'message': 'Job updated successfully!'
        }

    # ============================================
    # DELETE JOB
    # ============================================

    @transaction.atomic
    def delete_job(self, client, job_id: int) -> Dict[str, Any]:
        """
        Soft delete a job.

        Only OPEN and CANCELLED jobs can be deleted.
        Once assigned, the job cannot be deleted or cancelled.
        """
        job = self.get_job_by_id(job_id)

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to delete this job."
            )

        if job.status not in [JobStatus.OPEN, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(
                f"Cannot delete a job with status '{job.status}'. "
                f"Only Open and Cancelled jobs can be deleted."
            )

        job.deleted_at = timezone.now()
        job.deleted_by = client
        job.save()

        AuditLog.objects.create(
            user=client,
            action='JOB_DELETED',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title}
        )

        logger.info(f"Job {job_id} deleted by {client.email}")

        return {
            'message': 'Job deleted successfully!'
        }

    # ============================================
    # CANCEL JOB (kept for backward compat)
    # ============================================

    @transaction.atomic
    def cancel_job(self, client, job_id: int) -> Dict[str, Any]:
        """
        Cancel a job. Kept for backward compatibility.
        Under the current policy, ASSIGNED jobs cannot be cancelled.
        """
        job = self.get_job_by_id(job_id)

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to cancel this job."
            )

        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(
                f"This job is already {job.status.lower()}."
            )

        if job.status in [JobStatus.IN_PROGRESS, JobStatus.AWAITING_CONFIRMATION]:
            raise BusinessRuleViolation(
                "This job is already underway. "
                "Please raise a dispute instead of cancelling."
            )

        previous_status = job.status

        active_assignment = job.assignments.filter(
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
        ).first()

        if active_assignment:
            active_assignment.status = AssignmentStatus.CANCELLED
            active_assignment.cancelled_at = timezone.now()
            active_assignment.save(update_fields=['status', 'cancelled_at', 'updated_at'])

        job.status = JobStatus.CANCELLED
        job.save(update_fields=['status', 'updated_at'])

        AuditLog.objects.create(
            user=client,
            action='JOB_CANCELLED',
            entity_type='JOB',
            entity_id=job.id,
            details={'previous_status': previous_status},
        )

        logger.info(f"Job {job_id} cancelled by client {client.id}")

        return {
            'job': job,
            'message': 'Job cancelled successfully.',
        }

    # ============================================
    # WORKER WITHDRAW FROM ASSIGNED JOB
    # ============================================

    @transaction.atomic
    def worker_withdraw(self, worker, job_id: int) -> Dict[str, Any]:
        """Worker withdraws from a job."""
        job = self.get_job_by_id(job_id)

        assignment = job.assignments.filter(
            worker=worker,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS],
        ).first()

        if not assignment:
            raise BusinessRuleViolation(
                "You are not actively assigned to this job."
            )

        if job.status == JobStatus.IN_PROGRESS:
            raise BusinessRuleViolation(
                "You can no longer withdraw — the job is in progress. "
                "Please raise a dispute instead."
            )

        if job.status != JobStatus.ASSIGNED:
            raise BusinessRuleViolation(
                f"You cannot withdraw from a job with status '{job.status}'."
            )

        assignment.status = AssignmentStatus.CANCELLED
        assignment.cancelled_at = timezone.now()
        assignment.save(update_fields=['status', 'cancelled_at', 'updated_at'])

        job.status = JobStatus.OPEN
        job.save(update_fields=['status', 'updated_at'])

        AuditLog.objects.create(
            user=worker,
            action='WORKER_WITHDREW',
            entity_type='JOB',
            entity_id=job.id,
            details={'assignment_id': assignment.id},
        )

        logger.info(f"Worker {worker.id} withdrew from job {job_id}")

        return {
            'job': job,
            'message': 'You have withdrawn from this job.',
        }

    # ============================================
    # WORKER STARTS THE JOB (ASSIGNED -> IN_PROGRESS)
    # ============================================

    @transaction.atomic
    def worker_start_job(self, worker, job_id: int) -> Dict[str, Any]:
        """Worker starts the job."""
        job = self.get_job_by_id(job_id)

        assignment = job.assignments.filter(
            worker=worker,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS],
        ).first()

        if not assignment:
            raise BusinessRuleViolation(
                "You are not assigned to this job."
            )

        if job.status == JobStatus.IN_PROGRESS:
            raise BusinessRuleViolation("This job is already in progress.")

        if job.status != JobStatus.ASSIGNED:
            raise BusinessRuleViolation(
                f"Cannot start a job with status '{job.status}'."
            )

        job.status = JobStatus.IN_PROGRESS
        job.save(update_fields=['status', 'updated_at'])

        assignment.status = AssignmentStatus.IN_PROGRESS
        assignment.save(update_fields=['status', 'updated_at'])

        AuditLog.objects.create(
            user=worker,
            action='JOB_STARTED',
            entity_type='JOB',
            entity_id=job.id,
            details={'assignment_id': assignment.id},
        )

        logger.info(f"Worker {worker.id} started job {job_id}")

        return {
            'job': job,
            'message': 'Job started. You are now committed until completion.',
        }

    # ============================================
    # RAISE DISPUTE
    # ============================================

    @transaction.atomic
    def raise_dispute(
        self,
        user,
        job_id: int,
        reason: str,
        notes: str = '',
    ) -> Dict[str, Any]:
        """Raise a dispute on a job."""
        job = self.get_job_by_id(job_id)

        is_client = job.client_id == user.id
        is_worker = job.assignments.filter(
            worker=user,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS],
        ).exists()

        if not (is_client or is_worker):
            raise BusinessRuleViolation(
                "You are not a participant on this job."
            )

        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(
                f"Cannot raise a dispute on a {job.status.lower()} job."
            )

        if job.is_disputed:
            raise BusinessRuleViolation(
                "This job already has an open dispute."
            )

        if not reason or len(reason.strip()) < 10:
            raise BusinessRuleViolation(
                "Please provide a reason of at least 10 characters."
            )

        job.is_disputed = True
        job.dispute_reason = reason.strip()
        if notes:
            job.dispute_resolution_notes = notes.strip()
        job.dispute_raised_by = user
        job.dispute_status = 'PENDING'
        job.save(update_fields=[
            'is_disputed', 'dispute_reason', 'dispute_resolution_notes',
            'dispute_raised_by', 'dispute_status', 'updated_at',
        ])

        AuditLog.objects.create(
            user=user,
            action='DISPUTE_RAISED',
            entity_type='JOB',
            entity_id=job.id,
            details={'reason': reason[:200]},
        )

        logger.info(f"Dispute raised on job {job_id} by user {user.id}")

        return {
            'job': job,
            'message': 'Dispute raised. An admin will review this shortly.',
        }

    # ============================================
    # GET JOB FOR WORKER (Conditional Disclosure)
    # ============================================

    def get_job_for_worker(self, job_id: int, worker_id: int) -> Dict[str, Any]:
        """
        Get job details for a worker with conditional disclosure.
        """
        job = self.get_job_by_id(job_id)

        is_assigned = JobAssignment.objects.filter(
            job=job,
            worker_id=worker_id,
            status__in=[
                AssignmentStatus.ACTIVE,
                AssignmentStatus.IN_PROGRESS,
                AssignmentStatus.COMPLETED,
                AssignmentStatus.CANCELLED,
            ],
        ).exists()

        if (
            job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]
            and not is_assigned
        ):
            raise BusinessRuleViolation("This job is no longer available.")

        if job.status in [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS]:
            has_active_assignment = JobAssignment.objects.filter(
                job=job,
                status__in=[
                    AssignmentStatus.ACTIVE,
                    AssignmentStatus.IN_PROGRESS,
                ],
            ).exists()

            if has_active_assignment and not is_assigned:
                raise BusinessRuleViolation(
                    "This job has been assigned to another worker."
                )

        application = JobApplication.objects.filter(
            job=job,
            worker_id=worker_id,
        ).first()

        return {
            'job': job,
            'can_view_full_details': is_assigned,
            'assignment_status': job.get_worker_assignment_status(worker_id),
            'application_status': application.status if application else None,
        }

    # ============================================
    # HIDE / UNHIDE — CLIENT SIDE
    # ============================================

    @transaction.atomic
    def hide_job(self, client, job_id: int) -> Dict[str, Any]:
        """
        Hide a completed job from the client's dashboard.

        Only COMPLETED jobs can be hidden. The job stays visible to
        workers and admins — the client just stops seeing it in My Jobs.
        """
        job = self.get_job_by_id(job_id)

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to hide this job."
            )

        if job.status != JobStatus.COMPLETED:
            raise BusinessRuleViolation(
                "Only completed jobs can be hidden. "
                "Cancelled jobs can be deleted instead."
            )

        if job.client_hidden_at is not None:
            raise BusinessRuleViolation("This job is already hidden.")

        job.client_hidden_at = timezone.now()
        job.save(update_fields=['client_hidden_at', 'updated_at'])

        AuditLog.objects.create(
            user=client,
            action='JOB_HIDDEN',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title, 'status': job.status},
        )

        logger.info(f"Job {job_id} hidden by client {client.id}")

        return {
            'job': job,
            'message': 'Job hidden from your dashboard.',
        }

    @transaction.atomic
    def unhide_job(self, client, job_id: int) -> Dict[str, Any]:
        """Unhide a job so it appears on the client's dashboard again."""
        job = self.get_job_by_id(job_id)

        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to unhide this job."
            )

        if job.client_hidden_at is None:
            raise BusinessRuleViolation("This job is not hidden.")

        job.client_hidden_at = None
        job.save(update_fields=['client_hidden_at', 'updated_at'])

        AuditLog.objects.create(
            user=client,
            action='JOB_UNHIDDEN',
            entity_type='JOB',
            entity_id=job.id,
            details={'title': job.title},
        )

        logger.info(f"Job {job_id} unhidden by client {client.id}")

        return {
            'job': job,
            'message': 'Job is visible again on your dashboard.',
        }

    # ============================================
    # HIDE / UNHIDE — WORKER SIDE
    # ============================================

    @transaction.atomic
    def hide_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """
        Hide a completed or cancelled assignment from the worker's
        My Work page.

        The job stays visible to the client and admin.
        """
        assignment = JobAssignment.objects.filter(
            id=assignment_id, deleted_at__isnull=True
        ).first()

        if not assignment:
            raise ResourceNotFound("Assignment not found.")

        if assignment.worker_id != worker.id:
            raise BusinessRuleViolation(
                "This assignment does not belong to you."
            )

        if assignment.status not in [
            AssignmentStatus.COMPLETED,
            AssignmentStatus.CANCELLED,
        ]:
            raise BusinessRuleViolation(
                "You can only hide completed or cancelled assignments."
            )

        if assignment.worker_hidden_at is not None:
            raise BusinessRuleViolation("This assignment is already hidden.")

        assignment.worker_hidden_at = timezone.now()
        assignment.save(update_fields=['worker_hidden_at', 'updated_at'])

        AuditLog.objects.create(
            user=worker,
            action='ASSIGNMENT_HIDDEN',
            entity_type='JOB_ASSIGNMENT',
            entity_id=assignment.id,
            details={'job_id': assignment.job_id},
        )

        logger.info(f"Assignment {assignment_id} hidden by worker {worker.id}")

        return {
            'assignment_id': assignment.id,
            'message': 'Assignment hidden from your work history.',
        }

    @transaction.atomic
    def unhide_assignment(self, worker, assignment_id: int) -> Dict[str, Any]:
        """Unhide an assignment so it appears on the worker's My Work page."""
        assignment = JobAssignment.objects.filter(
            id=assignment_id, deleted_at__isnull=True
        ).first()

        if not assignment:
            raise ResourceNotFound("Assignment not found.")

        if assignment.worker_id != worker.id:
            raise BusinessRuleViolation(
                "This assignment does not belong to you."
            )

        if assignment.worker_hidden_at is None:
            raise BusinessRuleViolation("This assignment is not hidden.")

        assignment.worker_hidden_at = None
        assignment.save(update_fields=['worker_hidden_at', 'updated_at'])

        AuditLog.objects.create(
            user=worker,
            action='ASSIGNMENT_UNHIDDEN',
            entity_type='JOB_ASSIGNMENT',
            entity_id=assignment.id,
            details={'job_id': assignment.job_id},
        )

        logger.info(f"Assignment {assignment_id} unhidden by worker {worker.id}")

        return {
            'assignment_id': assignment.id,
            'message': 'Assignment is visible again in your work history.',
        }

    # ============================================
    # COUNT OPERATIONS
    # ============================================

    def count_open_jobs(self) -> int:
        """Count all open jobs (including expired — admin metric)."""
        return Job.objects.filter(
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).count()

    def count_jobs_by_client(self, client_id: int) -> int:
        return Job.objects.filter(
            client_id=client_id,
            deleted_at__isnull=True
        ).count()

    def count_active_jobs_by_worker(self, worker_id: int) -> int:
        return Job.objects.filter(
            assignments__worker_id=worker_id,
            assignments__status=AssignmentStatus.ACTIVE,
            deleted_at__isnull=True
        ).distinct().count()

    def count_urgent_jobs(self) -> int:
        return Job.objects.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        ).count()
