# apps/audit/management/commands/expire_disciplinary_actions.py

"""
Expire suspensions whose end time has passed.

When a user is suspended, `AccountStatusService.suspend_user` writes a
`DisciplinaryAction` row with action_type=SUSPEND and an `expires_at`.
If the user logs in after the expiry, `User.can_log_in()` flips them back
to ACTIVE -- but that leaves the SUSPEND row unpaired and, if the user
never logs in, the account stays SUSPENDED in the DB.

This command closes that gap:
  - finds users whose SUSPENDED status has lapsed,
  - flips them back to ACTIVE,
  - writes a paired UNBAN row so the disciplinary history is complete.

It is idempotent: re-running it is safe and creates no duplicate rows.

Usage:
    python manage.py expire_disciplinary_actions
    python manage.py expire_disciplinary_actions --dry-run
    python manage.py expire_disciplinary_actions --limit 500

Schedule to run once a day (or hourly):
- Windows: Task Scheduler
- Linux:   cron (0 * * * *)
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.services.account_status_service import AccountStatusService
from apps.audit.models import DisciplinaryAction
from apps.common.constants import (
    UserAccountStatus,
    DisciplinaryActionType,
)


class Command(BaseCommand):
    help = (
        "Expire lapsed suspensions: flip users back to ACTIVE and write "
        "a paired UNBAN row in the disciplinary history."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be expired without making changes.',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=500,
            help='Maximum number of users to process (default: 500).',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        now = timezone.now()

        # Users whose suspension window has lapsed.
        #
        # `deleted_at__isnull=True` skips soft-deleted accounts.
        # `suspended_until__isnull=False` skips any historical rows where
        # suspension was set without an end date -- those need manual review,
        # not silent auto-expiry.
        eligible = User.objects.filter(
            account_status=UserAccountStatus.SUSPENDED,
            suspended_until__lte=now,
            suspended_until__isnull=False,
            deleted_at__isnull=True,
        ).order_by('suspended_until')[:limit]

        total = eligible.count()

        if total == 0:
            self.stdout.write(
                f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] "
                f"No suspensions to expire."
            )
            return

        self.stdout.write(
            f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Found {total} suspension(s) eligible for expiry."
        )

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN -- no changes."))
            for user in eligible:
                self.stdout.write(
                    f"  Would expire: user #{user.id} {user.email} "
                    f"(suspended_until="
                    f"{user.suspended_until.strftime('%Y-%m-%d %H:%M:%S')})"
                )
            return

        # Command has no admin actor; use the platform "system" convention:
        # find a superuser to attribute the UNBAN to. Falls back to the
        # first admin if no superuser exists.
        system_admin = (
            User.objects.filter(is_superuser=True).order_by('id').first()
            or User.objects.filter(is_staff=True).order_by('id').first()
        )
        if system_admin is None:
            self.stderr.write(
                self.style.ERROR(
                    "No superuser or staff user found to attribute UNBAN rows. "
                    "Create an admin first."
                )
            )
            return

        succeeded = 0
        failed = 0

        for user in eligible:
            try:
                with transaction.atomic():
                    self._expire_user(user, system_admin)
                succeeded += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Expired suspension for user #{user.id} "
                        f"{user.email}"
                    )
                )
            except Exception as e:
                failed += 1
                self.stderr.write(
                    self.style.ERROR(
                        f"  Failed to expire user #{user.id}: {e}"
                    )
                )

        summary_style = (
            self.style.SUCCESS if failed == 0 else self.style.WARNING
        )
        self.stdout.write(
            summary_style(
                f"Done. Succeeded: {succeeded}, Failed: {failed}."
            )
        )

    def _expire_user(self, user, admin):
        """
        Idempotent expiry for one user.

        `reactivate_user(..., log=False)` clears the account fields
        without writing a row; we write the UNBAN row ourselves so we can
        tailor the reason and avoid the pipeline's notification side effect.
        """
        # Guard against a race: another process may have flipped the user
        # between the query and now.
        user.refresh_from_db()
        if user.account_status != UserAccountStatus.SUSPENDED:
            return

        # 1. Clear account-status fields (log=False -> no row, no notify)
        AccountStatusService.reactivate_user(
            user,
            admin=admin,
            reason="Automatic: suspension expired",
            log=False,
        )

        # 2. Write the paired UNBAN row
        DisciplinaryAction.objects.create(
            admin=admin,
            target_user=user,
            action_type=DisciplinaryActionType.UNBAN,
            reason="Automatic: suspension expired",
            notes="",
            expires_at=None,
        )
