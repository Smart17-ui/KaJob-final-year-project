"""
Apply disciplinary actions to user accounts.
"""

import logging

from django.utils import timezone

from apps.common.constants import (
    UserAccountStatus,
    DisciplinaryActionType,
)
from apps.common.policies import DEFAULT_SUSPENSION_DAYS
from apps.audit.models import AuditLog, DisciplinaryAction

logger = logging.getLogger(__name__)


class AccountStatusService:

    # ============================================
    # ENFORCEMENT ACTIONS
    # ============================================

    @staticmethod
    def warn_user(user, reason, admin, log=True):
        user.warning_count = (user.warning_count or 0) + 1
        user.save(update_fields=['warning_count'])

        if log:
            AccountStatusService._log_action(
                user=user,
                admin=admin,
                action_type=DisciplinaryActionType.WARN,
                reason=reason,
            )
        AccountStatusService._notify(
            user=user,
            kind="WARNING_ISSUED",
            title="Warning Issued",
            message=f"You have received a warning from KaJob admin. Reason: {reason}",
            extra_data={'reason': reason},
        )
        return user

    @staticmethod
    def suspend_user(user, reason, admin, days=DEFAULT_SUSPENSION_DAYS,
                     expires_at=None, log=True):
        now = timezone.now()
        if expires_at is None:
            expires_at = now + timezone.timedelta(days=days)
        else:
            # keep `days` in sync for the notification message
            days = max((expires_at - now).days, 1)

        user.account_status = UserAccountStatus.SUSPENDED
        user.suspended_at = now
        user.suspended_until = expires_at
        user.suspension_reason = reason
        user.save(update_fields=[
            'account_status',
            'suspended_at',
            'suspended_until',
            'suspension_reason',
        ])

        if log:
            AccountStatusService._log_action(
                user=user,
                admin=admin,
                action_type=DisciplinaryActionType.SUSPEND,
                reason=reason,
                expires_at=expires_at,
            )
        AccountStatusService._notify(
            user=user,
            kind="ACCOUNT_SUSPENDED",
            title="Account Suspended",
            message=(
                f"Your account has been suspended for {days} days. "
                f"Reason: {reason}"
            ),
            extra_data={
                'reason': reason,
                'suspended_until': expires_at.isoformat(),
            },
        )
        return user

    @staticmethod
    def ban_user(user, reason, admin, log=True):
        user.account_status = UserAccountStatus.BANNED
        user.banned_at = timezone.now()
        user.ban_reason = reason
        user.suspended_until = None
        user.save(update_fields=[
            'account_status',
            'banned_at',
            'ban_reason',
            'suspended_until',
        ])

        if log:
            AccountStatusService._log_action(
                user=user,
                admin=admin,
                action_type=DisciplinaryActionType.BAN,
                reason=reason,
            )
        AccountStatusService._notify(
            user=user,
            kind="ACCOUNT_BANNED",
            title="Account Banned",
            message=f"Your account has been permanently banned. Reason: {reason}",
            extra_data={'reason': reason},
        )
        return user

    @staticmethod
    def reactivate_user(user, admin, reason="", log=True):
        user.account_status = UserAccountStatus.ACTIVE
        user.suspended_at = None
        user.suspended_until = None
        user.suspension_reason = ""
        user.banned_at = None
        user.ban_reason = ""
        user.save(update_fields=[
            'account_status',
            'suspended_at',
            'suspended_until',
            'suspension_reason',
            'banned_at',
            'ban_reason',
        ])

        if log:
            AccountStatusService._log_action(
                user=user,
                admin=admin,
                action_type=DisciplinaryActionType.UNBAN,
                reason=reason or "Manual reactivation",
            )
        # No notification on reactivation -- the user is already being
        # restored, and they'll see it when they next log in.
        return user

    # ============================================
    # SELF-SERVICE DEACTIVATION (unchanged)
    # ============================================

    @staticmethod
    def deactivate_user(user, reason: str = ""):
        """
        Self-deactivate a user's account.

        Called by the user themselves (not an admin). Sets status to
        DEACTIVATED. The next successful login will auto-reactivate.
        """
        now = timezone.now()

        user.account_status = UserAccountStatus.DEACTIVATED
        user.deactivated_at = now
        user.deactivation_reason = (reason or '').strip()
        user.save(update_fields=[
            'account_status',
            'deactivated_at',
            'deactivation_reason',
        ])

        AuditLog.objects.create(
            user=user,
            action='ACCOUNT_DEACTIVATED',
            entity_type='USER',
            entity_id=user.id,
            details={'reason': user.deactivation_reason},
        )

        return user

    @staticmethod
    def reactivate_on_login(user):
        """
        Called by the login service when a DEACTIVATED user logs in
        with valid credentials. Clears the deactivation state and
        restores the account to ACTIVE.
        """
        user.account_status = UserAccountStatus.ACTIVE
        user.deactivated_at = None
        user.deactivation_reason = ''
        user.save(update_fields=[
            'account_status',
            'deactivated_at',
            'deactivation_reason',
        ])

        AuditLog.objects.create(
            user=user,
            action='ACCOUNT_REACTIVATED_ON_LOGIN',
            entity_type='USER',
            entity_id=user.id,
            details={},
        )

        return user

    @staticmethod
    def delete_account(user):
        """
        Soft-delete an account initiated by the user themselves.

        The row stays in the DB so history (jobs, reviews, assignments)
        remains intact, but:
          - account_status -> DEACTIVATED (blocks login)
          - deleted_at -> now (soft delete)
          - PII anonymized (email/phone/name)
        """
        now = timezone.now()

        # Anonymize PII so the account can't be re-used and no
        # personal data remains attached to historic records
        user.email = f"deleted_{user.id}@kajob.local"
        user.phone_number = f"deleted_{user.id}"
        user.first_name = "Deleted"
        user.last_name = "User"

        user.account_status = UserAccountStatus.DEACTIVATED
        user.deactivated_at = now
        user.deactivation_reason = "User deleted their account."
        user.deleted_at = now

        user.save(update_fields=[
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'account_status',
            'deactivated_at',
            'deactivation_reason',
            'deleted_at',
        ])

        AuditLog.objects.create(
            user=user,
            action='ACCOUNT_DELETED',
            entity_type='USER',
            entity_id=user.id,
            details={'soft_delete': True},
        )

        return user

    # ============================================
    # INTERNAL HELPERS
    # ============================================

    @staticmethod
    def _log_action(user, admin, action_type, reason="", expires_at=None):
        """
        Write a DisciplinaryAction row. On failure, fall back to an
        AuditLog row. Errors are logged, not swallowed silently.
        """
        try:
            DisciplinaryAction.objects.create(
                admin=admin,
                target_user=user,
                action_type=action_type,
                reason=reason,
                expires_at=expires_at,
            )
            return
        except Exception:
            logger.exception(
                "DisciplinaryAction log failed user=%s action=%s",
                getattr(user, 'id', None), action_type,
            )

        try:
            AuditLog.objects.create(
                user=user,
                action=f'DISCIPLINARY_{action_type}',
                entity_type='USER',
                entity_id=user.id,
                details={'reason': reason},
            )
        except Exception:
            logger.exception(
                "AuditLog fallback failed user=%s action=%s",
                getattr(user, 'id', None), action_type,
            )

    @staticmethod
    def _notify(user, kind, title, message, extra_data=None, send_email=True):
        """
        Send an in-app + email notification.

        `extra_data` carries structured fields for the email template
        (e.g. `reason`, `suspended_until`). Falls back to embedding the
        full message as `reason` when not supplied.
        """
        try:
            from apps.notifications.services import NotificationService

            data = {'reason': message}
            if extra_data:
                data.update(extra_data)

            NotificationService().create_notification(
                recipient_id=user.id,
                notification_type=kind,
                title=title,
                message=message,
                redirect_url="/account/status",
                data=data,
                send_email=send_email,
                send_push=True,
            )
        except Exception as e:
            print(f"[AccountStatusService] notify failed: {e}")
