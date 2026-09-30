# apps/accounts/services/worker_skill_service.py

import logging

from django.db import transaction

from apps.accounts.models import Skill, WorkerSkill, WorkerProfile
from apps.audit.models import AuditLog
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

logger = logging.getLogger(__name__)


class WorkerSkillService:
    """Service for managing a worker's skill list."""

    # ============================================
    # HELPERS
    # ============================================

    @staticmethod
    def _get_worker_profile(user) -> WorkerProfile:
        """
        Return the WorkerProfile for this user, or raise a clear error.
        Also guards against non-workers calling these endpoints.
        """
        profile = WorkerProfile.objects.filter(user=user).first()
        if not profile:
            raise BusinessRuleViolation(
                "Only workers can manage skills. "
                "You don't have a worker profile."
            )
        return profile

    @staticmethod
    def _get_worker_skill_or_404(worker_profile, worker_skill_id) -> WorkerSkill:
        """
        Return a WorkerSkill that belongs to this worker,
        or raise ResourceNotFound.
        """
        ws = WorkerSkill.objects.filter(
            id=worker_skill_id,
            worker_profile=worker_profile,
        ).select_related('skill').first()

        if not ws:
            raise ResourceNotFound("Skill not found in your profile.")
        return ws

    # ============================================
    # LIST
    # ============================================

    def list_my_skills(self, user):
        """Return all WorkerSkill rows for this worker."""
        profile = self._get_worker_profile(user)
        return (
            WorkerSkill.objects
            .filter(worker_profile=profile)
            .select_related('skill')
            .order_by('skill__name')
        )

    # ============================================
    # ADD
    # ============================================

    @transaction.atomic
    def add_skill(
        self,
        user,
        skill_id: int,
        proficiency: str = 'INTERMEDIATE',
        years_experience: int = 0,
    ):
        """Add a skill to this worker's profile."""
        profile = self._get_worker_profile(user)

        # Verify the master skill exists
        skill = Skill.objects.filter(id=skill_id).first()
        if not skill:
            raise ResourceNotFound("Skill not found.")

        # Prevent duplicates
        if WorkerSkill.objects.filter(
            worker_profile=profile, skill=skill
        ).exists():
            raise BusinessRuleViolation(
                f"You already have '{skill.name}' in your skills."
            )

        ws = WorkerSkill.objects.create(
            worker_profile=profile,
            skill=skill,
            proficiency=proficiency,
            years_experience=years_experience,
        )

        AuditLog.objects.create(
            user=user,
            action='WORKER_SKILL_ADDED',
            entity_type='WORKER_SKILL',
            entity_id=ws.id,
            details={
                'skill_id': skill.id,
                'skill_name': skill.name,
                'proficiency': proficiency,
                'years_experience': years_experience,
            },
        )

        logger.info(
            f"Worker {user.id} added skill '{skill.name}' "
            f"(proficiency={proficiency}, years={years_experience})"
        )

        return ws

    # ============================================
    # UPDATE
    # ============================================

    @transaction.atomic
    def update_skill(
        self,
        user,
        worker_skill_id: int,
        proficiency: str = None,
        years_experience: int = None,
    ):
        """Update proficiency / years_experience on an existing WorkerSkill."""
        profile = self._get_worker_profile(user)
        ws = self._get_worker_skill_or_404(profile, worker_skill_id)

        changed = {}

        if proficiency is not None and proficiency != ws.proficiency:
            changed['proficiency'] = {
                'from': ws.proficiency,
                'to': proficiency,
            }
            ws.proficiency = proficiency

        if years_experience is not None and years_experience != ws.years_experience:
            changed['years_experience'] = {
                'from': ws.years_experience,
                'to': years_experience,
            }
            ws.years_experience = years_experience

        if not changed:
            # Nothing to update — return the unchanged row
            return ws

        ws.save(update_fields=list(changed.keys()) + ['updated_at'])

        AuditLog.objects.create(
            user=user,
            action='WORKER_SKILL_UPDATED',
            entity_type='WORKER_SKILL',
            entity_id=ws.id,
            details={
                'skill_id': ws.skill_id,
                'changed': changed,
            },
        )

        logger.info(
            f"Worker {user.id} updated WorkerSkill {ws.id} "
            f"({list(changed.keys())})"
        )

        return ws

    # ============================================
    # REMOVE
    # ============================================

    @transaction.atomic
    def remove_skill(self, user, worker_skill_id: int):
        """Remove a skill from this worker's profile."""
        profile = self._get_worker_profile(user)
        ws = self._get_worker_skill_or_404(profile, worker_skill_id)

        skill_name = ws.skill.name
        ws_id = ws.id
        ws.delete()

        AuditLog.objects.create(
            user=user,
            action='WORKER_SKILL_REMOVED',
            entity_type='WORKER_SKILL',
            entity_id=ws_id,
            details={'skill_name': skill_name},
        )

        logger.info(f"Worker {user.id} removed skill '{skill_name}'")

        return {'message': f"Skill '{skill_name}' removed successfully."}
