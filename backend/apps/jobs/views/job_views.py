# apps/jobs/views/job_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.jobs.services import JobService
from apps.jobs.serializers import (
    JobSerializer,
    JobCreateSerializer,
    JobUpdateSerializer,
    JobListSerializer,
    WorkerJobDetailSerializer,  # 🆕 Import the new serializer
)
from apps.common.permissions import IsClient, IsWorker, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
job_service = JobService()


class CreateJobView(APIView):
    """
    Create a new job posting.
    Only verified clients can post jobs.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def post(self, request):
        serializer = JobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = job_service.create_job(request.user, serializer.validated_data)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data
            }, status=status.HTTP_201_CREATED)
        except BusinessRuleViolation as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    """
    Get job details by ID.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, job_id):
        try:
            job = job_service.get_job_by_id(job_id)
            return Response({
                'job': JobSerializer(job).data
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class OpenJobsView(APIView):
    """
    Get all open jobs.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        jobs = job_service.get_open_jobs()
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class MyJobsView(APIView):
    """
    Get jobs posted by or assigned to the authenticated user.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        user = request.user
        if user.is_client:
            jobs = job_service.get_jobs_by_client(user.id)
        elif user.is_worker:
            jobs = job_service.get_jobs_by_worker(user.id)
        else:
            jobs = []
        
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class MyOpenJobsView(APIView):
    """
    Get open jobs posted by the authenticated client.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request):
        jobs = job_service.get_open_jobs_by_client(request.user.id)
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class MyActiveJobsView(APIView):
    """
    Get active jobs assigned to the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        jobs = job_service.get_active_jobs_by_worker(request.user.id)
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class SearchJobsView(APIView):
    """
    Search jobs by title or description.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({
                'error': 'Search query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        jobs = job_service.search_jobs(query)
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class FilterJobsView(APIView):
    """
    Filter jobs by category and budget.
    Location filtering is handled by the Matching Service.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        category_id = request.query_params.get('category')
        min_budget = request.query_params.get('min_budget')
        max_budget = request.query_params.get('max_budget')
        
        # Convert parameters
        try:
            category_id = int(category_id) if category_id else None
            min_budget = float(min_budget) if min_budget else None
            max_budget = float(max_budget) if max_budget else None
        except ValueError:
            return Response({
                'error': 'Invalid parameter format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        jobs = job_service.filter_jobs(category_id, min_budget, max_budget)
        return Response({
            'count': len(jobs),
            'results': JobListSerializer(jobs, many=True).data
        }, status=status.HTTP_200_OK)


class UpdateJobView(APIView):
    """
    Update a job posting.
    Only the client who posted the job can update it.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def put(self, request, job_id):
        serializer = JobUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = job_service.update_job(request.user, job_id, serializer.validated_data)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DeleteJobView(APIView):
    """
    Delete (soft delete) a job.
    Only the client who posted the job can delete it.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def delete(self, request, job_id):
        try:
            result = job_service.delete_job(request.user, job_id)
            return Response({
                'message': result['message']
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CancelJobView(APIView):
    """
    Cancel a job.
    Only the client who posted the job can cancel it.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def post(self, request, job_id):
        try:
            result = job_service.cancel_job(request.user, job_id)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# DEPRECATED VIEW (Use assignment service instead)
# ============================================

class CompleteJobView(APIView):
    """
    Mark a job as completed.
    DEPRECATED: Use WorkerMarkCompleteView and ClientConfirmCompleteView instead.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request, job_id):
        try:
            result = job_service.complete_job(request.user, job_id)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# 🆕 JOB DETAIL FOR WORKER (Conditional Disclosure)
# ============================================================

class JobDetailForWorkerView(APIView):
    """
    GET /api/jobs/{job_id}/worker/
    
    Get job details for a worker with CONDITIONAL DISCLOSURE.
    
    🔑 KEY FEATURE: Workers only see full details after being assigned.
    
    What workers see:
    ┌─────────────────────────────────────────────────────────────────────┐
    │  IF ASSIGNED:                                                     │
    │  - exact_location: "Plot 15, Kamwala Road"  ✅                   │
    │  - client_name: "John Doe"  ✅                                   │
    │  - client_phone: "+260971234567"  ✅                             │
    │  - can_view_full_details: true                                   │
    │                                                                   │
    │  IF NOT ASSIGNED:                                                │
    │  - exact_location: null  ❌                                      │
    │  - client_name: null  ❌                                         │
    │  - client_phone: null  ❌                                        │
    │  - can_view_full_details: false                                  │
    └─────────────────────────────────────────────────────────────────────┘
    
    Why this matters:
    - Protects client privacy until the job is officially assigned
    - Workers only get contact details after commitment
    - Builds trust in the platform
    
    Permissions:
    - User must be authenticated
    - User must be a worker
    - User must be active and verified
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request, job_id):
        try:
            # Get job with conditional disclosure
            result = job_service.get_job_for_worker(
                job_id=job_id,
                worker_id=request.user.id
            )
            
            # Serialize with conditional disclosure
            serializer = WorkerJobDetailSerializer(
                result['job'],
                context={'worker_id': request.user.id}
            )
            
            # Return response with access info
            return Response({
                'job': serializer.data,
                'can_view_full_details': result['can_view_full_details'],
                'assignment_status': result['assignment_status'],
                'application_status': result['application_status'],
            }, status=status.HTTP_200_OK)
            
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except BusinessRuleViolation as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
# apps/jobs/views/job_views.py

# ... (all your existing imports and views) ...


# ============================================================
# 🆕 MY APPLICATIONS VIEW
# ============================================================

class MyApplicationsView(APIView):
    """
    GET /api/my-applications/
    Get all applications made by the authenticated worker.
    
    This endpoint shows all jobs the worker has applied for,
    along with the application status (PENDING, ACCEPTED, REJECTED).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        from apps.jobs.models import JobApplication
        from apps.jobs.serializers import JobApplicationSerializer
        
        # Get all applications for this worker
        applications = JobApplication.objects.filter(
            worker_id=request.user.id
        ).select_related('job', 'job__category', 'job__client')
        
        # Order by most recent first
        applications = applications.order_by('-applied_at')
        
        serializer = JobApplicationSerializer(applications, many=True)
        
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

# apps/jobs/views/job_views.py

# ... (all your existing imports) ...


# ============================================================
# 🆕 APPLY FOR JOB VIEW
# ============================================================

class ApplyForJobView(APIView):
    """
    POST /api/jobs/{job_id}/apply/
    Apply for a job as a worker.
    
    Requirements:
    - Worker must be verified
    - Worker must be within 1km of the job location
    - Worker must not have already applied
    - Worker must not be assigned to another job
    - Job must be OPEN
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def post(self, request, job_id):
        from apps.jobs.models import Job, JobApplication
        from apps.jobs.serializers import JobApplicationSerializer
        from apps.common.constants import ApplicationStatus
        from apps.accounts.models import Profile
        from apps.matching.services.distance_service import DistanceService
        
        try:
            job = Job.objects.get(id=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if job is open
        if job.status != JobStatus.OPEN:
            return Response(
                {'error': 'This job is no longer available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if worker already applied
        existing_application = JobApplication.objects.filter(
            job_id=job_id,
            worker_id=request.user.id
        ).exists()
        
        if existing_application:
            return Response(
                {'error': 'You have already applied for this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if worker is already assigned to another job
        active_assignment = JobAssignment.objects.filter(
            worker_id=request.user.id,
            status=AssignmentStatus.ACTIVE
        ).exists()
        
        if active_assignment:
            return Response(
                {'error': 'You are currently busy with another job.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if worker has location
        if not hasattr(request.user, 'profile') or not request.user.profile.latitude:
            return Response(
                {'error': 'Please update your location first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if worker is within 1km of job
        if job.latitude and job.longitude:
            distance = DistanceService.calculate_distance(
                float(request.user.profile.latitude),
                float(request.user.profile.longitude),
                float(job.latitude),
                float(job.longitude)
            )
            
            if distance is not None and distance > 1.0:
                return Response(
                    {'error': 'You must be within 1km of the job location to apply. Please move closer and try again.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create application
        application = JobApplication.objects.create(
            job=job,
            worker=request.user,
            status=ApplicationStatus.PENDING
        )
        
        logger.info(f"Worker {request.user.id} applied for job {job_id}")
        
        return Response({
            'message': 'Application submitted successfully!',
            'application': JobApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)
