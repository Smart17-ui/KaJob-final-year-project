# apps/jobs/views/job_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import logging

from apps.jobs.services import JobService
from apps.jobs.serializers import (
    JobSerializer,
    JobDetailSerializer,
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


# ============================================================
# HELPER — read the user's currently-selected role from the JWT
# ============================================================

def _current_role(request):
    """
    Extract the user's currently-selected role from the JWT.

    Returns 'CLIENT', 'WORKER', 'ADMIN', or None.
    """
    try:
        token = request.auth
        if token is None:
            return None
        role = token.get('current_role')
        if role in ('CLIENT', 'WORKER', 'ADMIN'):
            return role
    except Exception:
        pass
    return None


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
    GET /api/jobs/{id}/

    Role-aware response shape:

      - Client (job owner)   → JobDetailSerializer
                                (worker nested full, client null)
      - Admin                → JobDetailSerializer
                                (both nested full)
      - Worker               → WorkerJobDetailSerializer
                                (client nested full if assigned,
                                 name-only if unrelated,
                                 owner self hidden)
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request, job_id):
        try:
            job = job_service.get_job_by_id(job_id)

            user = request.user
            is_client_owner = (job.client_id == user.id)
            is_admin = getattr(user, 'is_admin', False)

            if is_client_owner or is_admin:
                serializer = JobDetailSerializer(
                    job, context={'request': request}
                )
            else:
                serializer = WorkerJobDetailSerializer(
                    job,
                    context={
                        'request': request,
                        'worker_id': user.id,
                    },
                )

            return Response(
                {'job': serializer.data},
                status=status.HTTP_200_OK,
            )

        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )


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
    GET /api/jobs/my-jobs/

    Role-aware. Returns jobs based on the user's CURRENT role (from JWT):

      CLIENT -> only jobs the user posted (Job.client == request.user)
      WORKER -> only jobs the user is/was assigned to
                (JobAssignment.worker == request.user)
                Does NOT include applications — those live in
                /api/jobs/my-applications/.

    A dual-role user switching roles gets a different list per role —
    never the union.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        from apps.jobs.models import Job, JobAssignment

        user = request.user
        role = _current_role(request)

        # ── CLIENT: only jobs I posted ─────────────────────
        if role == 'CLIENT':
            jobs = Job.objects.filter(
                client=user,
                deleted_at__isnull=True,
            ).order_by('-posted_at')

        # ── WORKER: only jobs I was actually assigned to ───
        elif role == 'WORKER':
            assigned_job_ids = JobAssignment.objects.filter(
                worker=user,
            ).values_list('job_id', flat=True)

            jobs = Job.objects.filter(
                id__in=assigned_job_ids,
                deleted_at__isnull=True,
            ).order_by('-posted_at')

        # ── No role selected (or ADMIN) → empty ────────────
        else:
            jobs = Job.objects.none()

        serializer = JobListSerializer(jobs, many=True)

        return Response({
            'count': len(serializer.data),
            'role': role,
            'results': serializer.data,
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

        assigned_job_ids = JobAssignment.objects.filter(
            worker=request.user,
            status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
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
    Blocked when job is IN_PROGRESS or AWAITING_CONFIRMATION.
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


class JobDetailForWorkerView(APIView):
    """
    GET /api/jobs/{job_id}/worker/
    Get job details for a worker with CONDITIONAL DISCLOSURE.
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


# ============================================================
# JOB LIFECYCLE — WORKER WITHDRAW / START / DISPUTE
# ============================================================

class WorkerWithdrawView(APIView):
    """
    POST /api/jobs/{job_id}/withdraw/
    Worker withdraws from an ASSIGNED job (before it goes IN_PROGRESS).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]

    def post(self, request, job_id):
        try:
            result = job_service.worker_withdraw(request.user, job_id)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WorkerStartJobView(APIView):
    """
    POST /api/jobs/{job_id}/start/
    Worker starts the job -> Job.status becomes IN_PROGRESS.
    After this, the worker can no longer withdraw.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]

    def post(self, request, job_id):
        try:
            result = job_service.worker_start_job(request.user, job_id)
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RaiseDisputeView(APIView):
    """
    POST /api/jobs/{job_id}/dispute/
    Body: { "reason": "...", "notes": "..." }  (notes optional)
    Either party can raise a dispute on an active job.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request, job_id):
        reason = request.data.get('reason', '')
        notes = request.data.get('notes', '')

        try:
            result = job_service.raise_dispute(
                request.user, job_id, reason, notes
            )
            return Response({
                'message': result['message'],
                'job': JobSerializer(result['job']).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
