# apps/jobs/management/commands/auto_confirm_jobs.py

"""
Auto-confirm jobs that have been in AWAITING_CONFIRMATION past their
grace period without the client responding.

Usage:
    python manage.py auto_confirm_jobs
    python manage.py auto_confirm_jobs --dry-run
    python manage.py auto_confirm_jobs --limit 500

Schedule this to run every 2 minutes:
- Windows: Task Scheduler
- Linux:   cron (*/2 * * * *)
"""

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.jobs.models import Job
from apps.jobs.services.job_assignment_service import JobAssignmentService
from apps.common.constants import JobStatus


class Command(BaseCommand):
    help = (
        "Auto-confirm jobs that have been in AWAITING_CONFIRMATION "
        "past their grace period."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be confirmed without making changes.',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=200,
            help='Maximum number of jobs to process (default: 200).',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        now = timezone.now()

        eligible = Job.objects.filter(
            status=JobStatus.AWAITING_CONFIRMATION,
            auto_confirm_at__lte=now,
            auto_confirmed_at__isnull=True,
            deleted_at__isnull=True,
        ).order_by('auto_confirm_at')[:limit]

        total = eligible.count()

        if total == 0:
            self.stdout.write(
                f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] "
                f"No jobs to auto-confirm."
            )
            return

        self.stdout.write(
            f"[{now.strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Found {total} job(s) eligible for auto-confirm."
        )

        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no changes."))
            for job in eligible:
                self.stdout.write(
                    f"  Would auto-confirm: job #{job.id} "
                    f"'{job.title}' "
                    f"(auto_confirm_at="
                    f"{job.auto_confirm_at.strftime('%Y-%m-%d %H:%M:%S')})"
                )
            return

        service = JobAssignmentService()
        succeeded = 0
        failed = 0

        for job in eligible:
            try:
                service.auto_confirm_job(job)
                succeeded += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Auto-confirmed job #{job.id} '{job.title}'"
                    )
                )
            except Exception as e:
                failed += 1
                self.stderr.write(
                    self.style.ERROR(
                        f"  Failed to auto-confirm job #{job.id}: {e}"
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
