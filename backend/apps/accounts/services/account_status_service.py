# apps/accounts/services/account_status_service.py

"""
Apply disciplinary actions to user accounts.
"""

from django.utils import timezone

from apps.common.constants import (
    UserAccountStatus,
    DisciplinaryActionType,
)
from apps.common.policies import DEFAULT_SUSPENSION_DAYS


class AccountStatusService:

    @staticmethod
    def warn_user(user, reason, admin):
        user.warning_count = (user.warning_count or 0) + 1
        user.save(update_fields=['warning_count'])

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
        )
        return user

    @staticmethod
    def suspend_user(user, reason, admin, days=DEFAULT_SUSPENSION_DAYS):
        now = timezone.now()
        user.account_status = UserAccountStatus.SUSPENDED
        user.suspended_at = now
        user.suspended_until = now + timezone.timedelta(days=days)
        user.suspension_reason = reason
        user.save(update_fields=[
            'account_status',
            'suspended_at',
            'suspended_until',
            'suspension_reason',
        ])

        AccountStatusService._log_action(
            user=user,
            admin=admin,
            action_type=DisciplinaryActionType.SUSPEND,
            reason=reason,
            duration_days=days,
        )
        AccountStatusService._notify(
            user=user,
            kind="ACCOUNT_SUSPENDED",
            title="Account Suspended",
            message=(
                f"Your account has been suspended for {days} days. "
                f"Reason: {reason}"
            ),
        )
        return user

    @staticmethod
    def ban_user(user, reason, admin):
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
        )
        return user

    @staticmethod
    def reactivate_user(user, admin, reason=""):
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

        AccountStatusService._log_action(
            user=user,
            admin=admin,
            action_type=DisciplinaryActionType.UNBAN,
            reason=reason or "Manual reactivation",
        )
        return user

    @staticmethod
    def _log_action(user, admin, action_type, reason="", duration_days=None):
        """
        Best-effort log. Tries several candidates; falls back to console.
        """
        try:
            from apps.admin_panel.models import DisciplinaryAction
            DisciplinaryAction.objects.create(
                user=user,
                admin=admin,
                action_type=action_type,
                reason=reason,
                duration_days=duration_days,
            )
            return
        except Exception:
            pass

        try:
            from apps.audit.services import AuditService
            AuditService().log_admin_action(
                admin=admin,
                action=action_type,
                entity_type="USER",
                entity_id=user.id,
                details={"reason": reason, "duration_days": duration_days},
            )
            return
        except Exception:
            pass

        try:
            print(
                f"[AccountStatusService] {action_type} on user={user.id} "
                f"by admin={admin.id} reason={reason!r} days={duration_days}"
            )
        except Exception:
            pass

    @staticmethod
    def _notify(user, kind, title, message):
        try:
            from apps.notifications.services import NotificationService
            NotificationService().create_notification(
                recipient_id=user.id,
                notification_type=kind,
                title=title,
                message=message,
                redirect_url="/account/status",
                data={"reason": message},
                send_email=False,
                send_push=True,
            )
        except Exception as e:
            print(f"[AccountStatusService] notify failed: {e}")
