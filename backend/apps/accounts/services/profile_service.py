# apps/accounts/services/profile_service.py

import logging
from typing import Dict, Any, Optional
from django.db import transaction
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
        
        # Update fields
        for key, value in data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        profile.save()
        
        # Audit log
        self.audit_service.log_action(
            user=user,
            action='PROFILE_UPDATED',
            entity_type='PROFILE',
            entity_id=profile.id,
            details={'updated_fields': list(data.keys())}
        )
        
        logger.info(f"Profile updated for user {user.id}")
        return profile
    
    @transaction.atomic
    def update_location(self, user, latitude: float, longitude: float) -> Profile:
        """Update user location."""
        profile = self.get_profile(user)
        profile.latitude = latitude
        profile.longitude = longitude
        profile.save()
        
        # Audit log
        self.audit_service.log_action(
            user=user,
            action='LOCATION_UPDATED',
            entity_type='PROFILE',
            entity_id=profile.id,
            details={
                'latitude': latitude,
                'longitude': longitude,
            }
        )
        
        logger.info(f"Location updated for user {user.id}")
        return profile
    
    # ============================================
    # WORKER PROFILE OPERATIONS
    # ============================================
    
    def get_worker_profile(self, user) -> WorkerProfile:
        """Get worker profile."""
        if not user.is_worker:
            raise BusinessRuleViolation("User does not have WORKER role.")
        
        worker_profile = self.worker_repo.get_by_user_id(user.id)
        if not worker_profile:
            raise ResourceNotFound("Worker profile not found.")
        return worker_profile
    
    @transaction.atomic
    def update_worker_profile(self, user, data: Dict[str, Any]) -> WorkerProfile:
        """Update worker profile."""
        worker_profile = self.get_worker_profile(user)
        
        for key, value in data.items():
            if hasattr(worker_profile, key):
                setattr(worker_profile, key, value)
        
        worker_profile.save()
        
        # Audit log
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
        """Get client profile."""
        if not user.is_client:
            raise BusinessRuleViolation("User does not have CLIENT role.")
        
        client_profile = self.client_repo.get_by_user_id(user.id)
        if not client_profile:
            raise ResourceNotFound("Client profile not found.")
        return client_profile
    
    @transaction.atomic
    def update_client_profile(self, user, data: Dict[str, Any]) -> ClientProfile:
        """Update client profile."""
        client_profile = self.get_client_profile(user)
        
        for key, value in data.items():
            if hasattr(client_profile, key):
                setattr(client_profile, key, value)
        
        client_profile.save()
        
        # Audit log
        self.audit_service.log_action(
            user=user,
            action='CLIENT_PROFILE_UPDATED',
            entity_type='CLIENT_PROFILE',
            entity_id=client_profile.id,
            details={'updated_fields': list(data.keys())}
        )
        
        logger.info(f"Client profile updated for user {user.id}")
        return client_profile
