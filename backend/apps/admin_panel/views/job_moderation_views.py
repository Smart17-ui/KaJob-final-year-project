# apps/admin_panel/views/job_moderation_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.admin_panel.services import AdminService
from apps.admin_panel.serializers import AdminJobSerializer, AdminJobListSerializer
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.common.utilities import paginate_request


admin_service = AdminService()


class AdminJobListView(APIView):
    """
    GET /api/admin/jobs/
    Get all jobs with optional filters and pagination (Admin only).

    Query params:
        status     -- JobStatus value, e.g. OPEN
        search     -- substring match on title/description
        page       -- 1-based (default 1)
        page_size  -- 1..100 (default 20)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request):
        from django.db.models import Q
        from apps.jobs.models import Job

        qs = Job.objects.filter(deleted_at__isnull=True).select_related(
            'client', 'category'
        ).prefetch_related('assignments__worker')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        qs = qs.order_by('-posted_at')

        page, size = paginate_request(request)
        total = qs.count()
        start = (page - 1) * size
        page_qs = qs[start:start + size]

        return Response({
            'count': total,
            'page': page,
            'page_size': size,
            'results': AdminJobListSerializer(page_qs, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminJobDetailView(APIView):
    """
    GET /api/admin/jobs/{id}/
    Get job details (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, job_id):
        try:
            from apps.jobs.models import Job
            job = Job.objects.select_related('client', 'category').get(id=job_id)
            return Response({
                'job': AdminJobSerializer(job).data,
            }, status=status.HTTP_200_OK)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminJobDeleteView(APIView):
    """
    POST /api/admin/jobs/{id}/delete/
    Delete a job (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def post(self, request, job_id):
        reason = request.data.get('reason', 'No reason provided')

        try:
            result = admin_service.delete_job(request.user, job_id, reason)
            return Response({
                'job': AdminJobSerializer(result['job']).data,
                'message': result['message'],
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
