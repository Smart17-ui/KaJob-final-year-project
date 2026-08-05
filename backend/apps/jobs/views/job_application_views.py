# apps/jobs/views/job_application_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.jobs.services import JobApplicationService
from apps.jobs.serializers import (
    JobApplicationSerializer,
    JobApplicationCreateSerializer,
    JobApplicationListSerializer,
)
from apps.common.permissions import IsWorker, IsClient, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
job_application_service = JobApplicationService()


class ApplyForJobView(APIView):
    """
    Apply for a job.
    Only verified workers can apply for jobs.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def post(self, request, job_id):
        serializer = JobApplicationCreateSerializer(data={'job_id': job_id})
        serializer.is_valid(raise_exception=True)
        
        try:
            result = job_application_service.apply_for_job(
                request.user, 
                job_id
            )
            return Response({
                'message': result['message'],
                'application': JobApplicationSerializer(result['application']).data
            }, status=status.HTTP_201_CREATED)
        except BusinessRuleViolation as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ResourceNotFound as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class JobApplicationsView(APIView):
    """
    Get all applications for a job.
    Only the client who posted the job can view applications.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request, job_id):
        try:
            applications = job_application_service.get_applications_for_job(
                request.user, 
                job_id
            )
            return Response({
                'count': len(applications),
                'results': JobApplicationListSerializer(applications, many=True).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PendingApplicationsView(APIView):
    """
    Get pending applications for a job.
    Only the client who posted the job can view pending applications.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request, job_id):
        try:
            applications = job_application_service.get_pending_applications_for_job(
                request.user, 
                job_id
            )
            return Response({
                'count': len(applications),
                'results': JobApplicationListSerializer(applications, many=True).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateApplicationStatusView(APIView):
    """
    Update the status of a job application (Accept/Reject).
    Only the client who posted the job can update application status.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def patch(self, request, application_id):
        status_action = request.data.get('status')
        
        if status_action not in ['accept', 'reject']:
            return Response({
                'error': 'Status must be "accept" or "reject"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if status_action == 'accept':
                result = job_application_service.accept_application(
                    request.user, 
                    application_id
                )
            else:
                result = job_application_service.reject_application(
                    request.user, 
                    application_id
                )
            
            return Response({
                'message': result['message'],
                'application': JobApplicationSerializer(result['application']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(APIView):
    """
    Get all applications made by the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        applications = job_application_service.get_applications_by_worker(
            request.user.id
        )
        return Response({
            'count': len(applications),
            'results': JobApplicationListSerializer(applications, many=True).data
        }, status=status.HTTP_200_OK)
class MyApplicationsView(APIView):
    """
    Get all applications made by the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        applications = job_application_service.get_applications_by_worker(
            request.user.id
        )
        return Response({
            'count': len(applications),
            'results': JobApplicationListSerializer(applications, many=True).data
        }, status=status.HTTP_200_OK)
