# apps/jobs/management/commands/auto_confirm_jobs.py

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.jobs.models import Job, JobAssignment
from apps.common.constants import JobStatus, AssignmentStatus


class Command(BaseCommand):
    help = "Auto-confirm jobs whose AWAITING_CONFIRMATION grace period has expired."

    def handle(self, *args, **options):
        now = timezone.now()

        expired = Job.objects.filter(
            status=JobStatus.AWAITING_CONFIRMATION,
            auto_confirm_at__lte=now,
            deleted_at__isnull=True,
        )

        count = expired.count()
        if not count:
            self.stdout.write("No jobs to auto-confirm.")
            return

        for job in expired:
            job.status = JobStatus.COMPLETED
            job.client_confirmed_complete = True
            job.client_confirmed_at = now
            job.completed_at = now
            job.save(update_fields=[
                'status', 'client_confirmed_complete',
                'client_confirmed_at', 'completed_at', 'updated_at',
            ])

            assignment = job.assignments.filter(
                status__in=[AssignmentStatus.ACTIVE, AssignmentStatus.IN_PROGRESS]
            ).first()
            if assignment:
                assignment.status = AssignmentStatus.COMPLETED
                assignment.completed_at = now
                assignment.save(update_fields=['status', 'completed_at', 'updated_at'])

            self.stdout.write(self.style.SUCCESS(
                f"Auto-confirmed job {job.id} ({job.title})"
            ))

        self.stdout.write(self.style.SUCCESS(
            f"\nAuto-confirmed {count} job(s)."
        ))
