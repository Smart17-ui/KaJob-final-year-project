# apps/jobs/views/job_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import logging

from apps.jobs.services import JobService
from apps.jobs.serializers import (
    JobSerializer,
    JobCreateSerializer,
    JobUpdateSerializer,
    JobListSerializer,
    WorkerJobDetailSerializer,
)
from apps.common.permissions import IsClient, IsWorker, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.constants import JobStatus, AssignmentStatus


# Service instance
job_service = JobService()
logger = logging.getLogger(__name__)


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


# ============================================================
# ✅ FIXED: MyJobsView
# ============================================================

class MyJobsView(APIView):
    """
    GET /api/my-jobs/
    Get jobs posted by or assigned to the authenticated user.
    
    For Clients: Returns jobs they posted
    For Workers: Returns jobs they are assigned to or have applied for
    For Both: Returns a combined list
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        from apps.jobs.models import Job, JobAssignment, JobApplication
        
        user = request.user
        
        # Start with empty queryset
        jobs = Job.objects.none()
        
        # If user is a client, get jobs they posted
        if user.is_client:
            client_jobs = Job.objects.filter(
                client=user,
                deleted_at__isnull=True
            )
            jobs = jobs | client_jobs
        
        # If user is a worker, get jobs they are assigned to or applied for
        if user.is_worker:
            # Get jobs where worker is assigned
            assigned_job_ids = JobAssignment.objects.filter(
                worker=user
            ).values_list('job_id', flat=True)
            
            # Get jobs where worker has applied
            applied_job_ids = JobApplication.objects.filter(
                worker=user
            ).values_list('job_id', flat=True)
            
            # Combine both
            worker_job_ids = set(assigned_job_ids) | set(applied_job_ids)
            
            if worker_job_ids:
                worker_jobs = Job.objects.filter(
                    id__in=worker_job_ids,
                    deleted_at__isnull=True
                )
                jobs = jobs | worker_jobs
        
        # Remove duplicates and order by most recent
        jobs = jobs.distinct().order_by('-posted_at')
        
        # Serialize
        serializer = JobListSerializer(jobs, many=True)
        
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
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
        from apps.jobs.models import Job, JobAssignment
        
        # Get job IDs where worker has ACTIVE assignment
        assigned_job_ids = JobAssignment.objects.filter(
            worker=request.user,
            status=AssignmentStatus.ACTIVE
        ).values_list('job_id', flat=True)
        
        jobs = Job.objects.filter(
            id__in=assigned_job_ids,
            deleted_at__isnull=True
        ).order_by('-posted_at')
        
        return Response({
            'count': jobs.count(),
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
# JOB DETAIL FOR WORKER (Conditional Disclosure)
# ============================================================

class JobDetailForWorkerView(APIView):
    """
    GET /api/jobs/{job_id}/worker/
    
    Get job details for a worker with CONDITIONAL DISCLOSURE.
    
    🔑 KEY FEATURE: Workers only see full details after being assigned.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request, job_id):
        try:
            result = job_service.get_job_for_worker(
                job_id=job_id,
                worker_id=request.user.id
            )
            
            serializer = WorkerJobDetailSerializer(
                result['job'],
                context={'worker_id': request.user.id}
            )
            
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
