# apps/matching/views/matching_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.matching.services.matching_service import MatchingService
from apps.matching.serializers.matching_serializer import JobMatchSerializer
from apps.common.permissions import IsWorker, IsClient, IsActiveUser, IsVerifiedUser


# Service instance
matching_service = MatchingService()


class NearbyJobsView(APIView):
    """
    GET /api/matching/nearby/
    Get nearby jobs for the authenticated worker.
    
    ✅ ONLY returns jobs within 1km radius
    ✅ Shows distance from worker to job
    ✅ Shows ONLY general location (no exact location)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request):
        radius = request.query_params.get('radius', 1.0)
        
        try:
            radius = float(radius)
        except ValueError:
            radius = 1.0
        
        radius = max(0.5, min(radius, 10.0))
        
        nearby_jobs = matching_service.find_nearby_jobs_for_worker(
            request.user.id,
            radius
        )
        
        results = []
        for item in nearby_jobs:
            job = item['job']
            results.append({
                'job': JobMatchSerializer(job).data,
                'distance_km': item['distance_km'],
                'distance_display': item['distance_display'],
            })
        
        return Response({
            'count': len(results),
            'radius_km': radius,
            'results': results,
        }, status=status.HTTP_200_OK)


class NearbyJobsCountView(APIView):
    """
    GET /api/matching/nearby/count/
    Get count of nearby jobs for a worker.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]
    
    def get(self, request):
        radius = request.query_params.get('radius', 1.0)
        
        try:
            radius = float(radius)
        except ValueError:
            radius = 1.0
        
        count = matching_service.count_nearby_jobs_for_worker(
            request.user.id,
            radius
        )
        
        return Response({
            'count': count,
            'radius_km': radius,
        }, status=status.HTTP_200_OK)


class NearbyApplicantsView(APIView):
    """
    GET /api/matching/jobs/{job_id}/applicants/nearby/
    Get nearby applicants for a job.
    
    ✅ ONLY shows workers who have APPLIED to this job
    ✅ ONLY shows applicants within 1km radius
    ✅ Shows distance from job to applicant
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request, job_id):
        radius = request.query_params.get('radius', 1.0)
        
        try:
            radius = float(radius)
        except ValueError:
            radius = 1.0
        
        radius = max(0.5, min(radius, 10.0))
        
        try:
            nearby_applicants = matching_service.find_nearby_applicants_for_job(
                job_id=job_id,
                client_id=request.user.id,
                radius_km=radius
            )
        except PermissionError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        
        results = []
        for item in nearby_applicants:
            worker = item['worker']
            worker_profile = item['worker_profile']
            application = item['application']
            
            results.append({
                'application_id': application.id,
                'application_status': application.status,
                'applied_at': application.applied_at,
                'worker': {
                    'id': worker.id,
                    'full_name': worker.full_name,
                    'email': worker.email,
                    'phone_number': worker.phone_number,
                    'bio': worker_profile.bio if worker_profile else None,
                    'average_rating': worker_profile.average_rating if worker_profile else None,
                    'jobs_completed': worker_profile.jobs_completed if worker_profile else None,
                    'skills': [skill.name for skill in worker_profile.skills.all()] if worker_profile else [],
                    'availability_status': worker_profile.availability_status if worker_profile else None,
                },
                'distance_km': item['distance_km'],
                'distance_display': item['distance_display'],
            })
        
        return Response({
            'count': len(results),
            'radius_km': radius,
            'job_id': job_id,
            'results': results,
        }, status=status.HTTP_200_OK)


class AllApplicantsView(APIView):
    """
    GET /api/matching/jobs/{job_id}/applicants/
    Get ALL applicants for a job (without distance filter).
    
    ✅ Shows ALL workers who have applied (regardless of distance)
    ✅ Can filter by application status
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]
    
    def get(self, request, job_id):
        status_filter = request.query_params.get('status')
        
        try:
            applicants = matching_service.get_all_applicants_for_job(
                job_id=job_id,
                client_id=request.user.id,
                status=status_filter
            )
        except PermissionError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'count': len(applicants),
            'job_id': job_id,
            'filters': {
                'status': status_filter,
            },
            'results': applicants,
        }, status=status.HTTP_200_OK)
