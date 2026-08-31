# apps/admin_panel/views/job_moderation_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.admin_panel.services import AdminService
from apps.admin_panel.serializers import AdminJobSerializer, AdminJobListSerializer
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


admin_service = AdminService()


class AdminJobListView(APIView):
    """
    GET /api/admin/jobs/
    Get all jobs with optional filters (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        filters = {
            'status': request.query_params.get('status'),
            'search': request.query_params.get('search'),
        }
        filters = {k: v for k, v in filters.items() if v is not None}
        
        jobs = admin_service.get_all_jobs(filters)
        
        return Response({
            'count': len(jobs),
            'results': AdminJobListSerializer(jobs, many=True).data,
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
            job = Job.objects.get(id=job_id)
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
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
