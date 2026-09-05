# apps/jobs/views/application_status_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.jobs.models import JobApplication
from apps.common.permissions import IsActiveUser
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
        status_info = ApplicationStatus.get_display_info(application.status)
        
        # Get valid transitions
        valid_transitions = ApplicationStatus.get_valid_transitions(application.status)
        
        return Response({
            'status': application.status,
            'display': status_info['label'],
            'icon': status_info['icon'],
            'color': status_info['color'],
            'description': status_info['description'],
            'is_terminal': ApplicationStatus.is_terminal(application.status),
            'is_active': ApplicationStatus.is_active(application.status),
            'valid_transitions': valid_transitions,
            'can_accept': 'ACCEPTED' in valid_transitions,
            'can_reject': 'REJECTED' in valid_transitions,
            'can_withdraw': 'WITHDRAWN' in valid_transitions,
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
        
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({
                'error': 'Status is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status is valid
        valid_statuses = [choice[0] for choice in ApplicationStatus.CHOICES]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if transition is allowed
        if not ApplicationStatus.can_transition(application.status, new_status):
            valid_transitions = ApplicationStatus.get_valid_transitions(application.status)
            return Response({
                'error': f'Cannot transition from "{application.status}" to "{new_status}". '
                         f'Valid transitions: {", ".join(valid_transitions)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle different transitions with permission checks
        try:
            if new_status == ApplicationStatus.ACCEPTED:
                # Only client can accept
                if request.user.id != application.job.client_id:
                    return Response({
                        'error': 'Only the client can accept applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = application.accept(client_user=request.user)
                
            elif new_status == ApplicationStatus.REJECTED:
                # Only client can reject
                if request.user.id != application.job.client_id:
                    return Response({
                        'error': 'Only the client can reject applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = application.reject()
                
            elif new_status == ApplicationStatus.WITHDRAWN:
                # Only worker can withdraw
                if request.user.id != application.worker_id:
                    return Response({
                        'error': 'Only the worker can withdraw applications.'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                result = application.withdraw()
                
            else:
                return Response({
                    'error': f'Unsupported transition to "{new_status}".'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get updated status info
            status_info = ApplicationStatus.get_display_info(application.status)
            
            return Response({
                'message': result['message'],
                'application': {
                    'id': application.id,
                    'status': application.status,
                    'status_display': status_info['label'],
                    'status_icon': status_info['icon'],
                    'status_color': status_info['color'],
                    'status_description': status_info['description'],
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
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request, job_id):
        from django.db.models import Count
        from apps.jobs.models import Job
        
        # Verify job exists
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({
                'error': 'Job not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has permission (client who owns job or admin)
        if request.user.id != job.client_id and not request.user.is_admin:
            return Response({
                'error': 'You don\'t have permission to view this job\'s applications.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get status counts
        status_counts = JobApplication.objects.filter(
            job_id=job_id
        ).values('status').annotate(count=Count('status'))
        
        summary = {
            'total': 0,
            'pending': 0,
            'accepted': 0,
            'rejected': 0,
            'withdrawn': 0,
            'completed': 0,
        }
        
        for item in status_counts:
            status = item['status']
            count = item['count']
            summary['total'] += count
            
            if status == ApplicationStatus.PENDING:
                summary['pending'] = count
            elif status == ApplicationStatus.ACCEPTED:
                summary['accepted'] = count
            elif status == ApplicationStatus.REJECTED:
                summary['rejected'] = count
            elif status == ApplicationStatus.WITHDRAWN:
                summary['withdrawn'] = count
            elif status == ApplicationStatus.COMPLETED:
                summary['completed'] = count
        
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
            info = ApplicationStatus.get_display_info(status_code)
            statuses.append({
                'status': status_code,
                'display': status_display,
                'icon': info['icon'],
                'color': info['color'],
                'description': info['description'],
                'is_terminal': ApplicationStatus.is_terminal(status_code),
                'is_active': ApplicationStatus.is_active(status_code),
                'valid_transitions': ApplicationStatus.get_valid_transitions(status_code),
            })
        
        return Response({
            'count': len(statuses),
            'results': statuses
        }, status=status.HTTP_200_OK)
