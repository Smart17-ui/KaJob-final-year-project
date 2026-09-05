# apps/jobs/views/application_status_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import ValidationError

from apps.jobs.models import JobApplication
from apps.jobs.services.application_flow_service import (
    ApplicationFlowService,
    ApplicationStatusDisplay,
)
from apps.jobs.serializers.application_status_serializer import (
    ApplicationStatusTransitionSerializer,
    ApplicationStatusInfoSerializer,
    ApplicationStatusSummarySerializer,
)
from apps.common.permissions import IsClient, IsWorker, IsActiveUser, IsVerifiedUser
from apps.common.constants import ApplicationStatus


class ApplicationStatusView(APIView):
    """
    GET /api/applications/{id}/status/
    Get the current status and allowed transitions for an application.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, application_id):
        try:
            application = JobApplication.objects.select_related('job').get(id=application_id)
        except JobApplication.DoesNotExist:
            return Response({
                'error': 'Application not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has permission to view this application
        if (request.user.id != application.worker_id and 
            request.user.id != application.job.client_id):
            return Response({
                'error': 'You don\'t have permission to view this application.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get status info
        status_info = ApplicationStatusDisplay.get_status_info(application.status)
        
        # Get valid transitions
        valid_transitions = ApplicationFlowService.get_valid_transitions(application.status)
        
        return Response({
            'status': application.status,
            'display': status_info['display'],
            'icon': status_info['icon'],
            'color': status_info['color'],
            'description': status_info['description'],
            'is_terminal': ApplicationFlowService.is_terminal(application.status),
            'is_active': ApplicationFlowService.is_active(application.status),
            'valid_transitions': valid_transitions,
            'can_accept': 'accept' in valid_transitions,
            'can_reject': 'reject' in valid_transitions,
            'can_withdraw': 'withdraw' in valid_transitions,
        }, status=status.HTTP_200_OK)


class ApplicationStatusTransitionView(APIView):
    """
    POST /api/applications/{id}/transition/
    Transition an application to a new status.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def post(self, request, application_id):
        try:
            application = JobApplication.objects.select_related('job', 'worker').get(id=application_id)
        except JobApplication.DoesNotExist:
            return Response({
                'error': 'Application not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate request
        serializer = ApplicationStatusTransitionSerializer(
            data=request.data,
            context={'application': application}
        )
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        
        try:
            # Handle different transitions
            if new_status == ApplicationStatus.ACCEPTED:
                # Only client can accept
                if request.user.id != application.job.client_id:
                    return Response({
                        'error': 'Only the client can accept applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = ApplicationFlowService.accept_application(
                    application, 
                    request.user
                )
                
            elif new_status == ApplicationStatus.REJECTED:
                # Only client can reject
                if request.user.id != application.job.client_id:
                    return Response({
                        'error': 'Only the client can reject applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = ApplicationFlowService.reject_application(
                    application,
                    request.user
                )
                
            elif new_status == ApplicationStatus.WITHDRAWN:
                # Only worker can withdraw
                if request.user.id != application.worker_id:
                    return Response({
                        'error': 'Only the worker can withdraw applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = ApplicationFlowService.withdraw_application(
                    application,
                    request.user
                )
                
            else:
                return Response({
                    'error': f'Unsupported transition to "{new_status}".'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get updated status info
            status_info = ApplicationStatusDisplay.get_status_info(application.status)
            
            return Response({
                'message': result['message'],
                'application': {
                    'id': application.id,
                    'status': application.status,
                    'status_display': status_info['display'],
                    'status_icon': status_info['icon'],
                    'status_color': status_info['color'],
                },
                **result
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ApplicationStatusSummaryView(APIView):
    """
    GET /api/jobs/{job_id}/applications/summary/
    Get a summary of all application statuses for a job.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]
    
    def get(self, request, job_id):
        summary = ApplicationFlowService.get_application_status_summary(job_id)
        
        return Response(summary, status=status.HTTP_200_OK)


class ApplicationStatusOptionsView(APIView):
    """
    GET /api/applications/statuses/
    Get all available application statuses with their information.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        statuses = []
        
        for status_code, status_display in ApplicationStatus.CHOICES:
            info = ApplicationStatusDisplay.get_status_info(status_code)
            statuses.append({
                'status': status_code,
                'display': status_display,
                'icon': info['icon'],
                'color': info['color'],
                'description': info['description'],
                'is_terminal': ApplicationFlowService.is_terminal(status_code),
                'is_active': ApplicationFlowService.is_active(status_code),
                'valid_transitions': ApplicationFlowService.get_valid_transitions(status_code),
            })
        
        return Response({
            'count': len(statuses),
            'results': statuses
        }, status=status.HTTP_200_OK)
