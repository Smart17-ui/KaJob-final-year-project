# apps/accounts/views/profile_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.accounts.services import ProfileService
from apps.accounts.serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    WorkerProfileSerializer,
    WorkerProfileUpdateSerializer,
    ClientProfileSerializer,
    ClientProfileUpdateSerializer,
    UpdatePhoneSerializer,
)
from apps.common.permissions import IsActiveUser, IsWorker, IsClient
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


# Service instance
profile_service = ProfileService()


class UserProfileView(APIView):
    """
    GET /api/auth/profile/
    Get the authenticated user's profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        profile = profile_service.get_profile(request.user)
        return Response({
            'profile': ProfileSerializer(profile).data,
        }, status=status.HTTP_200_OK)


class UserProfileUpdateView(APIView):
    """
    PUT /api/auth/profile/update/
    Update the authenticated user's profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def put(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = profile_service.update_profile(
                request.user,
                serializer.validated_data
            )
            return Response({
                'message': 'Profile updated successfully!',
                'profile': ProfileSerializer(profile).data,
            }, status=status.HTTP_200_OK)
        except BusinessRuleViolation as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class WorkerProfileView(APIView):
    """
    GET /api/auth/profile/worker/
    Get the authenticated user's worker profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]

    def get(self, request):
        try:
            worker_profile = profile_service.get_worker_profile(request.user)
            return Response({
                'worker_profile': WorkerProfileSerializer(worker_profile).data,
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class WorkerProfileUpdateView(APIView):
    """
    PUT /api/auth/profile/worker/update/
    Update the authenticated user's worker profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsWorker]

    def put(self, request):
        serializer = WorkerProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            worker_profile = profile_service.update_worker_profile(
                request.user,
                serializer.validated_data
            )
            return Response({
                'message': 'Worker profile updated successfully!',
                'worker_profile': WorkerProfileSerializer(worker_profile).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClientProfileView(APIView):
    """
    GET /api/auth/profile/client/
    Get the authenticated user's client profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]

    def get(self, request):
        try:
            client_profile = profile_service.get_client_profile(request.user)
            return Response({
                'client_profile': ClientProfileSerializer(client_profile).data,
            }, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


class ClientProfileUpdateView(APIView):
    """
    PUT /api/auth/profile/client/update/
    Update the authenticated user's client profile.
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsClient]

    def put(self, request):
        serializer = ClientProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            client_profile = profile_service.update_client_profile(
                request.user,
                serializer.validated_data
            )
            return Response({
                'message': 'Client profile updated successfully!',
                'client_profile': ClientProfileSerializer(client_profile).data,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================
# LOCATION
# ============================================

class UpdateLocationView(APIView):
    """
    PUT  /api/auth/profile/location/
    POST /api/auth/profile/location/

    Body: { "latitude": -15.3875, "longitude": 28.3412 }

    Works for BOTH clients and workers.
    Auto-creates Profile if missing.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def put(self, request):
        return self._handle(request)

    def post(self, request):
        return self._handle(request)

    def _handle(self, request):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude is None or longitude is None:
            return Response(
                {'error': 'latitude and longitude are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = profile_service.update_location(
                request.user,
                latitude,
                longitude
            )

            nearby_count = 0
            if request.user.is_worker:
                try:
                    from apps.matching.services.matching_service import (
                        MatchingService,
                    )
                    nearby_count = (
                        MatchingService().count_nearby_jobs_for_worker(
                            request.user.id, radius_km=1.0
                        )
                    )
                except Exception:
                    pass

            return Response({
                'message': 'Location updated successfully!',
                'profile': ProfileSerializer(profile).data,
                'nearby_jobs_count': nearby_count,
            }, status=status.HTTP_200_OK)

        except BusinessRuleViolation as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================
# PHONE NUMBER MANAGEMENT
# ============================================

class UpdatePhoneNumberView(APIView):
    """
    PUT /api/auth/profile/phone/
    Update the authenticated user's phone number.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def put(self, request):
        serializer = UpdatePhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phone_number']

        try:
            from apps.identity_verification.services import VerificationService
            verification_service = VerificationService()

            result = verification_service.update_phone_number(
                request.user, phone_number
            )

            if result['status'] == 'invalid_phone':
                return Response(
                    {'error': result['message']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if result['status'] == 'phone_taken':
                return Response(
                    {'error': result['message']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(result, status=status.HTTP_200_OK)

        except BusinessRuleViolation as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to update phone number: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
