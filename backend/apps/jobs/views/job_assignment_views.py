# apps/jobs/views/job_assignment_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.jobs.services import JobAssignmentService
from apps.jobs.serializers import (
    JobAssignmentSerializer,
    JobAssignmentCreateSerializer,
)
from apps.common.permissions import IsClient, IsWorker, IsActiveUser, IsVerifiedUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
job_assignment_service = JobAssignmentService()


class AssignWorkerView(APIView):
    """
    Assign a worker to a job.
    Only the client who posted the job can assign a worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def post(self, request, job_id):
        worker_id = request.data.get('worker_id')
        
        if not worker_id:
            return Response({
                'error': 'worker_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = job_assignment_service.assign_worker(
                request.user,
                job_id,
                worker_id
            )
            return Response({
                'message': result['message'],
                'assignment': JobAssignmentSerializer(result['assignment']).data,
                'job': result['job']
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class WorkerAssignmentsView(APIView):
    """
    Get all assignments for the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        assignments = job_assignment_service.get_assignments_by_worker(
            request.user.id
        )
        return Response({
            'count': len(assignments),
            'results': JobAssignmentSerializer(assignments, many=True).data
        }, status=status.HTTP_200_OK)


class ActiveAssignmentsView(APIView):
    """
    Get active assignments for the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        assignments = job_assignment_service.get_active_assignments_by_worker(
            request.user.id
        )
        return Response({
            'count': len(assignments),
            'results': JobAssignmentSerializer(assignments, many=True).data
        }, status=status.HTTP_200_OK)


class CompleteAssignmentView(APIView):
    """
    Complete an assignment (mark job as completed).
    The worker can complete the assignment when the job is done.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def post(self, request, assignment_id):
        try:
            result = job_assignment_service.complete_assignment(
                request.user,
                assignment_id
            )
            return Response({
                'message': result['message'],
                'assignment': JobAssignmentSerializer(result['assignment']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CancelAssignmentView(APIView):
    """
    Cancel an assignment (only if not completed yet).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def post(self, request, assignment_id):
        try:
            result = job_assignment_service.cancel_assignment(
                request.user,
                assignment_id
            )
            return Response({
                'message': result['message'],
                'assignment': JobAssignmentSerializer(result['assignment']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
class ActiveAssignmentsView(APIView):
    """
    Get active assignments for the authenticated worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def get(self, request):
        assignments = job_assignment_service.get_active_assignments_by_worker(
            request.user.id
        )
        return Response({
            'count': len(assignments),
            'results': JobAssignmentSerializer(assignments, many=True).data
        }, status=status.HTTP_200_OK)


class CancelAssignmentView(APIView):
    """
    Cancel an assignment (only if not completed yet).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]
    
    def post(self, request, assignment_id):
        try:
            result = job_assignment_service.cancel_assignment(
                request.user,
                assignment_id
            )
            return Response({
                'message': result['message'],
                'assignment': JobAssignmentSerializer(result['assignment']).data
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
