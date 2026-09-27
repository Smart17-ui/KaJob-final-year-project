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

# Default radius for find-jobs (when no query param is sent)
DEFAULT_RADIUS_KM = 5.0
MIN_RADIUS_KM = 0.5
MAX_RADIUS_KM = 50.0


def _parse_radius(request):
    """
    Read ?radius= from the query string and clamp it to a sane range.

    Accepts any float in [MIN_RADIUS_KM, MAX_RADIUS_KM].
    Falls back to DEFAULT_RADIUS_KM on missing or invalid input.
    """
    raw = request.query_params.get('radius', DEFAULT_RADIUS_KM)
    try:
        radius = float(raw)
    except (TypeError, ValueError):
        radius = DEFAULT_RADIUS_KM

    if radius <= 0:
        radius = DEFAULT_RADIUS_KM

    return max(MIN_RADIUS_KM, min(radius, MAX_RADIUS_KM))


class NearbyJobsView(APIView):
    """
    GET /api/matching/nearby/?radius=<km>

    Returns nearby jobs for the authenticated worker, scoped to
    the requested radius (in kilometers).

    - Default radius: 5.0 km
    - Clamped to [0.5, 50.0] km
    - Only shows general location (exact location is hidden
      unless the worker is assigned)

    Read-only: does NOT send any emails.
    Notifications for new jobs are sent at post time by
    JobService.create_job.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]

    def get(self, request):
        radius = _parse_radius(request)

        nearby_jobs = matching_service.find_nearby_jobs_for_worker(
            request.user.id,
            radius,
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
    GET /api/matching/nearby/count/?radius=<km>

    Returns the number of nearby jobs for the authenticated worker.
    Same radius handling as NearbyJobsView.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser]

    def get(self, request):
        radius = _parse_radius(request)

        count = matching_service.count_nearby_jobs_for_worker(
            request.user.id,
            radius,
        )

        return Response({
            'count': count,
            'radius_km': radius,
        }, status=status.HTTP_200_OK)


class NearbyApplicantsView(APIView):
    """
    GET /api/matching/jobs/{job_id}/applicants/nearby/?radius=<km>

    Returns nearby applicants for a job.

    - Only shows workers who have APPLIED to this job
    - Scoped to the requested radius (default 5.0 km)
    - Shows distance from the job to each applicant
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]

    def get(self, request, job_id):
        radius = _parse_radius(request)

        try:
            nearby_applicants = matching_service.find_nearby_applicants_for_job(
                job_id=job_id,
                client_id=request.user.id,
                radius_km=radius,
            )
        except PermissionError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN,
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
                    'skills': [
                        skill.name for skill in worker_profile.skills.all()
                    ] if worker_profile else [],
                    'availability_status': (
                        worker_profile.availability_status
                        if worker_profile else None
                    ),
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
    GET /api/matching/jobs/{job_id}/applicants/?status=<filter>

    Returns ALL applicants for a job (without distance filtering).

    - Shows every worker who has applied, regardless of distance
    - Optional status filter (e.g. ?status=PENDING)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient, IsVerifiedUser]

    def get(self, request, job_id):
        status_filter = request.query_params.get('status')

        try:
            applicants = matching_service.get_all_applicants_for_job(
                job_id=job_id,
                client_id=request.user.id,
                status=status_filter,
            )
        except PermissionError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'count': len(applicants),
            'job_id': job_id,
            'filters': {
                'status': status_filter,
            },
            'results': applicants,
        }, status=status.HTTP_200_OK)
