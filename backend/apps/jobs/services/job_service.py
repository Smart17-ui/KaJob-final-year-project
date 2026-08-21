# apps/jobs/services/job_service.py

import logging
from datetime import date
from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, List, Optional
from apps.jobs.repositories import JobRepository
from apps.jobs.models import Job
from apps.audit.models import AuditLog
from apps.common.constants import JobStatus
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
    # 🆕 HELPER: GENERATE MAP URLs
    # ============================================
    
    @staticmethod
    def generate_map_urls(latitude: float, longitude: float, address: str = None) -> Dict[str, str]:
        """
        Generate Google Maps URLs for the location.
        
        Args:
            latitude: GPS latitude
            longitude: GPS longitude
            address: Optional human-readable address
        
        Returns:
            Dict with map_url and directions_url
        """
        # Google Maps base URLs
        MAPS_BASE = "https://www.google.com/maps"
        
        # Use coordinates or address for the URL
        if latitude and longitude:
            location_param = f"{latitude},{longitude}"
        elif address:
            location_param = quote(address)
        else:
            return {
                'map_url': '',
                'directions_url': '',
            }
        
        # Generate map URL (shows the location on map)
        map_url = f"{MAPS_BASE}/place/{location_param}"
        
        # Generate directions URL (shows directions from current location)
        directions_url = f"{MAPS_BASE}/dir/?api=1&destination={location_param}"
        
        return {
            'map_url': map_url,
            'directions_url': directions_url,
        }
    
    # ============================================
    # CREATE JOB
    # ============================================
    
    @transaction.atomic
    def create_job(self, client, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new job posting.
        
        🆕 Auto-fills general_location from GPS coordinates if not provided.
        🆕 Auto-generates map_url and directions_url from GPS coordinates.
        
        Args:
            client: The client user
            data: {
                title, description, budget, category_id,
                general_location (optional), exact_location (optional),
                latitude, longitude,
                job_date (optional), job_time (optional), timeframe,
                is_flexible, duration_hours, urgency,
                required_skills (optional),
                place_id (optional)
            }
        
        Returns:
            Dict with job details
        """
        # Check if client is verified
        if not client.is_verified:
            raise BusinessRuleViolation("You must be verified to post a job.")
        
        # Check if client is active
        if not client.is_active:
            raise BusinessRuleViolation("Your account is not active.")
        
        # Validate budget
        if data['budget'] <= 0:
            raise BusinessRuleViolation("Budget must be greater than zero.")
        
        # Validate duration
        duration_hours = data.get('duration_hours')
        if duration_hours is not None:
            if duration_hours <= 0:
                raise BusinessRuleViolation("Duration must be greater than zero.")
            if duration_hours > 24:
                raise BusinessRuleViolation("Duration cannot exceed 24 hours.")
        
        # Validate job date
        job_date = data.get('job_date')
        if job_date:
            if job_date < timezone.now().date():
                raise BusinessRuleViolation("Job date cannot be in the past.")
        
        # 🆕 Auto-fill general_location from GPS if not provided
        general_location = data.get('general_location')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not general_location and latitude and longitude:
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
        
        # 🆕 Generate map URLs from GPS coordinates
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
        
        # Create job with all fields
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
            # 🆕 Map URLs
            map_url=map_urls.get('map_url', ''),
            directions_url=map_urls.get('directions_url', ''),
            place_id=data.get('place_id', ''),
            status=JobStatus.OPEN,
            # Timing fields
            job_date=job_date,
            job_time=data.get('job_time'),
            timeframe=data.get('timeframe', 'ANYTIME'),
            is_flexible=data.get('is_flexible', True),
            duration_hours=duration_hours,
            urgency=data.get('urgency', 'NORMAL'),
        )
        
        # Add skills if provided (OPTIONAL)
        required_skills = data.get('required_skills', [])
        if required_skills:
            job.required_skills.set(required_skills)
            logger.info(f"Added {len(required_skills)} skills to job {job.id}")
        
        # Audit log
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
        
        return {
            'job': job,
            'message': 'Job posted successfully!'
        }
    
    # ============================================
    # GET JOBS
    # ============================================
    
    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Get job by ID"""
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        return job
    
    def get_open_jobs(self) -> List[Job]:
        """Get all open jobs"""
        return self.job_repo.get_open_jobs()
    
    def get_urgent_jobs(self) -> List[Job]:
        """Get urgent and immediate jobs"""
        return self.job_repo.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        ).order_by('job_date', '-posted_at')
    
    def get_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get jobs posted by a client"""
        return self.job_repo.get_by_client_id(client_id)
    
    def get_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get jobs assigned to a worker"""
        return self.job_repo.get_jobs_by_worker(worker_id)
    
    def get_active_jobs_by_worker(self, worker_id: int) -> List[Job]:
        """Get active jobs assigned to a worker"""
        return self.job_repo.get_active_jobs_by_worker(worker_id)
    
    def get_open_jobs_by_client(self, client_id: int) -> List[Job]:
        """Get open jobs posted by a client"""
        return self.job_repo.get_open_jobs_by_client(client_id)
    
    def get_jobs_by_skills(self, skill_ids: List[int]) -> List[Job]:
        """Get jobs that require specific skills (optional)"""
        return self.job_repo.filter(
            required_skills__in=skill_ids,
            status=JobStatus.OPEN,
            deleted_at__isnull=True
        ).distinct().order_by('-posted_at')
    
    def search_jobs(self, query: str) -> List[Job]:
        """Search jobs by title or description"""
        return self.job_repo.search_jobs(query)
    
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
        """
        Filter jobs by category, budget, skills, urgency, date, and timeframe.
        Location filtering is handled by the Matching Service.
        """
        jobs = self.job_repo.filter_jobs(category_id, min_budget, max_budget)
        
        # Filter by skills if provided (optional)
        if skill_ids:
            jobs = jobs.filter(required_skills__in=skill_ids).distinct()
        
        # Filter by urgency if provided
        if urgency:
            jobs = jobs.filter(urgency=urgency)
        
        # Filter by date if provided
        if job_date:
            jobs = jobs.filter(job_date=job_date)
        
        # Filter by timeframe if provided
        if timeframe:
            jobs = jobs.filter(timeframe=timeframe)
        
        return jobs.order_by('-posted_at')
    
    # ============================================
    # UPDATE JOB
    # ============================================
    
    @transaction.atomic
    def update_job(self, client, job_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a job posting.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to update this job.")
        
        # Check if job can be updated
        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation(f"Cannot update a {job.status} job.")
        
        # Update job fields (including timing and skills)
        for key, value in data.items():
            if key == 'required_skills':
                if value:
                    job.required_skills.set(value)
                else:
                    job.required_skills.clear()
            elif key == 'latitude' or key == 'longitude':
                # 🆕 If GPS coordinates change, regenerate map URLs
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
        
        # Audit log
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
        Delete (soft delete) a job.
        """
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFound("Job not found.")
        
        # Check ownership
        if job.client_id != client.id:
            raise BusinessRuleViolation("You don't have permission to delete this job.")
        
        # Check if job can be deleted
        if job.status == JobStatus.COMPLETED:
            raise BusinessRuleViolation("Cannot delete a completed job.")
        
        # Soft delete
        self.job_repo.delete(job, user=client)
        
        # Audit log
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
    # 🆕 GET JOB FOR WORKER (Conditional Disclosure)
    # ============================================
    
    def get_job_for_worker(self, job_id: int, worker_id: int) -> Dict[str, Any]:
        """
        Get job details for a worker with conditional disclosure.
        
        🔑 This is the KEY method for the conditional disclosure feature.
        
        What it does:
        1. Gets the job by ID
        2. Checks if the worker has an ACTIVE assignment
        3. If assigned: Worker can see full details (exact_location, map_url, directions_url, client_name, client_phone)
        4. If not assigned: Worker can only see general_location
        
        Why this matters:
        - Protects client privacy until the job is officially assigned
        - Workers only get contact details and map after commitment
        - Builds trust in the platform
        
        Args:
            job_id: The job ID
            worker_id: The worker's user ID
        
        Returns:
            Dict containing:
            - job: The Job object
            - can_view_full_details: Boolean
            - assignment_status: str or None
            - application_status: str or None
        
        Raises:
            ResourceNotFound: If job doesn't exist
            BusinessRuleViolation: If job is not available or assigned to someone else
        """
        # Get the job
        job = self.get_job_by_id(job_id)
        
        # Check if job is available or assigned to this worker
        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            raise BusinessRuleViolation("This job is no longer available.")
        
        # Check if worker is assigned to this job
        is_assigned = job.is_accepted_by_worker(worker_id)
        
        # If job is assigned to someone else, worker can't view it
        if job.status in [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS, JobStatus.AWAITING_CONFIRMATION]:
            from apps.jobs.models import JobAssignment
            from apps.common.constants import AssignmentStatus
            
            has_active_assignment = JobAssignment.objects.filter(
                job=job,
                status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
            ).exists()
            
            if has_active_assignment and not is_assigned:
                raise BusinessRuleViolation(
                    "This job has been assigned to another worker."
                )
        
        # Return job with access information
        return {
            'job': job,
            'can_view_full_details': is_assigned,
            'assignment_status': job.get_worker_assignment_status(worker_id),
            'application_status': job.get_worker_application_status(worker_id),
        }
    
    # ============================================
    # COUNT OPERATIONS
    # ============================================
    
    def count_open_jobs(self) -> int:
        """Count open jobs"""
        return self.job_repo.count_open_jobs()
    
    def count_jobs_by_client(self, client_id: int) -> int:
        """Count jobs posted by a client"""
        return self.job_repo.count_jobs_by_client(client_id)
    
    def count_active_jobs_by_worker(self, worker_id: int) -> int:
        """Count active jobs assigned to a worker"""
        return self.job_repo.count_active_jobs_by_worker(worker_id)
    
    def count_urgent_jobs(self) -> int:
        """Count urgent and immediate jobs"""
        return self.job_repo.filter(
            status=JobStatus.OPEN,
            urgency__in=['IMMEDIATE', 'URGENT'],
            deleted_at__isnull=True
        ).count()
