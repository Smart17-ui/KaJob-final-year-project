# apps/audit/services/disciplinary_service.py

import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.audit.models import DisciplinaryAction
from apps.audit.repositories import DisciplinaryRepository
from apps.common.constants import DisciplinaryActionType, UserAccountStatus
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound

User = get_user_model()
logger = logging.getLogger(__name__)


class DisciplinaryService:
    """
    Owns the DisciplinaryAction table. Delegates account-status changes
    to AccountStatusService with log=False so this service is the single
    writer of DisciplinaryAction rows for the create/revoke flows.
    """

    def __init__(self):
        self.repository = DisciplinaryRepository()

    # ============================================
    # CREATE
    # ============================================

    @transaction.atomic
    def create_action(
        self,
        admin,
        target_user_id: int,
        action_type: str,
        reason: str,
        notes: str = '',
        expires_at: Optional[datetime] = None,
        related_report_id: Optional[int] = None,
        related_investigation_id: Optional[int] = None,
    ) -> DisciplinaryAction:
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            raise ResourceNotFound("Target user not found.")

        if admin.id == target_user_id:
            raise BusinessRuleViolation("Admin cannot take action on themselves.")

        if target_user.is_admin:
            raise BusinessRuleViolation("Cannot take disciplinary action on an admin.")

        if action_type == DisciplinaryActionType.SUSPEND:
            if expires_at is None:
                raise BusinessRuleViolation("Suspension must have an expiry date.")
            if expires_at <= timezone.now():
                raise BusinessRuleViolation("Expiry date must be in the future.")
            if self.repository.get_active_suspensions(target_user_id).exists():
                raise BusinessRuleViolation("User already has an active suspension.")

        action = self.repository.create(
            admin=admin,
            target_user=target_user,
            action_type=action_type,
            reason=reason,
            notes=notes,
            expires_at=expires_at,
            related_report_id=related_report_id,
            related_investigation_id=related_investigation_id,
        )

        self._enforce(target_user, action_type, reason, expires_at, admin)
        self._audit(admin, target_user_id, action_type, reason, expires_at)

        logger.info(
            "Disciplinary action %s on user=%s by admin=%s",
            action_type, target_user_id, admin.id,
        )
        return action

    def _enforce(self, target_user, action_type, reason, expires_at, admin):
        from apps.accounts.services.account_status_service import AccountStatusService

        if action_type == DisciplinaryActionType.WARN:
            AccountStatusService.warn_user(target_user, reason, admin, log=False)

        elif action_type == DisciplinaryActionType.SUSPEND:
            AccountStatusService.suspend_user(
                target_user, reason, admin, expires_at=expires_at, log=False,
            )

        elif action_type == DisciplinaryActionType.BAN:
            AccountStatusService.ban_user(target_user, reason, admin, log=False)

        elif action_type == DisciplinaryActionType.UNBAN:
            AccountStatusService.reactivate_user(
                target_user, admin, reason=reason, log=False,
            )
        # VERIFY / REJECT_VERIFICATION / DISMISS_REPORT: no status change

    def _audit(self, admin, target_user_id, action_type, reason, expires_at):
        try:
            from apps.audit.services import AuditService
            AuditService().log_admin_action(
                admin=admin,
                action=f'DISCIPLINARY_{action_type}',
                entity_type='USER',
                entity_id=target_user_id,
                details={
                    'action_type': action_type,
                    'reason': reason,
                    'expires_at': expires_at.isoformat() if expires_at else None,
                },
            )
        except Exception:
            logger.exception("Audit mirror failed action=%s", action_type)

    # ============================================
    # REVOKE
    # ============================================

    @transaction.atomic
    def revoke_action(self, action_id: int, admin, reason: str = "") -> DisciplinaryAction:
        try:
            original = DisciplinaryAction.objects.get(id=action_id)
        except DisciplinaryAction.DoesNotExist:
            raise ResourceNotFound("Disciplinary action not found.")

        if original.action_type not in (
            DisciplinaryActionType.SUSPEND,
            DisciplinaryActionType.BAN,
        ):
            raise BusinessRuleViolation("Only suspensions and bans can be revoked.")

        if (
            original.action_type == DisciplinaryActionType.SUSPEND
            and original.expires_at
            and original.expires_at <= timezone.now()
        ):
            raise BusinessRuleViolation("This suspension has already expired.")

        target_user = original.target_user
        if target_user.account_status == UserAccountStatus.ACTIVE:
            raise BusinessRuleViolation("User is already active.")

        from apps.accounts.services.account_status_service import AccountStatusService
        AccountStatusService.reactivate_user(
            target_user, admin, reason=reason, log=False,
        )

        unban_reason = reason or (
            f"Revoked {original.get_action_type_display().lower()} #{original.id}"
        )
        unban = self.repository.create(
            admin=admin,
            target_user=target_user,
            action_type=DisciplinaryActionType.UNBAN,
            reason=unban_reason,
            notes="",
            expires_at=None,
            related_report_id=original.related_report_id,
            related_investigation_id=original.related_investigation_id,
        )

        self._audit(
            admin, target_user.id, DisciplinaryActionType.UNBAN, unban_reason, None,
        )
        logger.info(
            "Revoked action=%s on user=%s by admin=%s",
            original.id, target_user.id, admin.id,
        )
        return unban

    # ============================================
    # QUERIES
    # ============================================

    def get_user_actions(self, user_id: int) -> List[DisciplinaryAction]:
        return self.repository.get_by_target_user(user_id)

    def get_active_actions(self, user_id: int) -> List[DisciplinaryAction]:
        return self.repository.get_active_actions(user_id)

    def is_user_suspended(self, user_id: int) -> bool:
        return self.repository.get_active_suspensions(user_id).exists()

    def get_action_stats(self) -> Dict[str, Any]:
        return self.repository.get_stats()

    def get_user_status(self, user_id: int) -> Dict[str, Any]:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ResourceNotFound("User not found.")

        qs = DisciplinaryAction.objects.filter(target_user_id=user_id)

        active_suspension = (
            qs.filter(action_type=DisciplinaryActionType.SUSPEND)
              .filter(expires_at__gt=timezone.now())
              .order_by('-performed_at')
              .first()
        )

        return {
            'user_id': user.id,
            'full_name': user.full_name,
            'account_status': user.account_status,
            'warning_count': getattr(user, 'warning_count', 0) or 0,
            'suspended_until': user.suspended_until,
            'ban_reason': getattr(user, 'ban_reason', '') or '',
            'total_actions': qs.count(),
            'active_suspension_id': active_suspension.id if active_suspension else None,
            'recent_actions': qs.order_by('-performed_at')[:10],
        }
