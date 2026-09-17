# apps/accounts/services/profile_service.py

import logging
from typing import Dict, Any, Optional
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.accounts.models import Profile, WorkerProfile, ClientProfile
from apps.accounts.repositories import (
    ProfileRepository,
    WorkerProfileRepository,
    ClientProfileRepository,
)
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.audit.services import AuditService

User = get_user_model()
logger = logging.getLogger(__name__)


class ProfileService:
    """
    Service for profile management.
    """

    def __init__(self):
        self.profile_repo = ProfileRepository()
        self.worker_repo = WorkerProfileRepository()
        self.client_repo = ClientProfileRepository()
        self.audit_service = AuditService()

    # ============================================
    # PROFILE OPERATIONS
    # ============================================

    def get_profile(self, user) -> Profile:
        """Get user profile."""
        profile = self.profile_repo.get_by_user_id(user.id)
        if not profile:
            raise ResourceNotFound("Profile not found.")
        return profile

    @transaction.atomic
    def update_profile(self, user, data: Dict[str, Any]) -> Profile:
        """Update user profile."""
        profile = self.get_profile(user)

        for key, value in data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        profile.save()

        self.audit_service.log_action(
            user=user,
            action='PROFILE_UPDATED',
            entity_type='PROFILE',
            entity_id=profile.id,
            details={'updated_fields': list(data.keys())}
        )

        logger.info(f"Profile updated for user {user.id}")
        return profile

    # ============================================
    # LOCATION — works for clients AND workers,
    # auto-creates the Profile if missing
    # ============================================

    @transaction.atomic
    def update_location(self, user, latitude, longitude) -> Profile:
        """
        Update the user's location.
        - Auto-creates Profile if missing
        - Saves lat/lng and location_updated_at
        - Triggers matching refresh for workers
        """
        profile, created = Profile.objects.get_or_create(user=user)

        try:
            lat_f = float(latitude)
            lng_f = float(longitude)
        except (TypeError, ValueError):
            raise BusinessRuleViolation(
                "latitude and longitude must be numeric."
            )

        if not (-90 <= lat_f <= 90):
            raise BusinessRuleViolation(
                "Latitude must be between -90 and 90."
            )
        if not (-180 <= lng_f <= 180):
            raise BusinessRuleViolation(
                "Longitude must be between -180 and 180."
            )

        profile.latitude = lat_f
        profile.longitude = lng_f
        profile.location_updated_at = timezone.now()
        profile.save(update_fields=[
            'latitude', 'longitude', 'location_updated_at', 'updated_at'
        ])

        self.audit_service.log_action(
            user=user,
            action='LOCATION_UPDATED',
            entity_type='PROFILE',
            entity_id=profile.id,
            details={
                'latitude': lat_f,
                'longitude': lng_f,
                'profile_created': created,
            }
        )

        logger.info(
            f"Location updated for user {user.id} ({lat_f}, {lng_f}) — "
            f"profile_created={created}"
        )

        if user.is_worker:
            self._refresh_worker_matches(user)

        return profile

    def _refresh_worker_matches(self, user):
        """
        Best-effort: recompute nearby jobs for the worker and
        broadcast over WebSocket. Never raises.
        """
        try:
            from apps.matching.services.matching_service import MatchingService
            svc = MatchingService()
            jobs = svc.find_nearby_jobs_for_worker(user.id, radius_km=1.0)

            logger.info(
                f"Worker {user.id} has {len(jobs)} nearby jobs "
                f"after location update"
            )

            # Broadcast over WebSocket if available
            try:
                from infrastructure.websocket.services import (
                    NotificationBroadcastService,
                )
                NotificationBroadcastService.send_notification_to_user(
                    user.id,
                    {
                        'type': 'nearby_jobs_update',
                        'count': len(jobs),
                        'jobs': [
                            {
                                'id': j['job'].id,
                                'title': j['job'].title,
                                'distance_km': j['distance_km'],
                                'distance_display': j['distance_display'],
                            }
                            for j in jobs[:10]
                        ],
                    }
                )
            except Exception as ws_err:
                logger.warning(f"WS broadcast failed (non-fatal): {ws_err}")

        except Exception as e:
            logger.warning(f"Match refresh failed (non-fatal): {e}")

    # ============================================
    # WORKER PROFILE OPERATIONS
    # ============================================

    def get_worker_profile(self, user) -> WorkerProfile:
        if not user.is_worker:
            raise BusinessRuleViolation("User does not have WORKER role.")

        worker_profile = self.worker_repo.get_by_user_id(user.id)
        if not worker_profile:
            raise ResourceNotFound("Worker profile not found.")
        return worker_profile

    @transaction.atomic
    def update_worker_profile(self, user, data: Dict[str, Any]) -> WorkerProfile:
        worker_profile = self.get_worker_profile(user)

        for key, value in data.items():
            if hasattr(worker_profile, key):
                setattr(worker_profile, key, value)

        worker_profile.save()

        self.audit_service.log_action(
            user=user,
            action='WORKER_PROFILE_UPDATED',
            entity_type='WORKER_PROFILE',
            entity_id=worker_profile.id,
            details={'updated_fields': list(data.keys())}
        )

        logger.info(f"Worker profile updated for user {user.id}")
        return worker_profile

    # ============================================
    # CLIENT PROFILE OPERATIONS
    # ============================================

    def get_client_profile(self, user) -> ClientProfile:
        if not user.is_client:
            raise BusinessRuleViolation("User does not have CLIENT role.")

        client_profile = self.client_repo.get_by_user_id(user.id)
        if not client_profile:
            raise ResourceNotFound("Client profile not found.")
        return client_profile

    @transaction.atomic
    def update_client_profile(self, user, data: Dict[str, Any]) -> ClientProfile:
        client_profile = self.get_client_profile(user)

        for key, value in data.items():
            if hasattr(client_profile, key):
                setattr(client_profile, key, value)

        client_profile.save()

        self.audit_service.log_action(
            user=user,
            action='CLIENT_PROFILE_UPDATED',
            entity_type='CLIENT_PROFILE',
            entity_id=client_profile.id,
            details={'updated_fields': list(data.keys())}
        )

        logger.info(f"Client profile updated for user {user.id}")
        return client_profile
