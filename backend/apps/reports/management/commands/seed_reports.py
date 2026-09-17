# apps/reports/management/commands/seed_reports.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.jobs.models import Job
from apps.reports.models import Report
from apps.common.constants import ReportCategory, ReportStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Seed sample reports for admin panel testing."

    def handle(self, *args, **options):
        reporter = User.objects.filter(email="dan@gmail.com").first()
        if not reporter:
            self.stdout.write(self.style.ERROR(
                "dan@gmail.com not found — log in once first."
            ))
            return

        targets = list(
            User.objects.exclude(id=reporter.id).exclude(is_superuser=True)[:3]
        )
        if not targets:
            self.stdout.write(self.style.ERROR(
                "Need at least one other user to report against."
            ))
            return

        job = Job.objects.first()
        if not job:
            self.stdout.write(self.style.WARNING(
                "No jobs found — create at least one job first."
            ))
            return

        samples = [
            (ReportCategory.FRAUD, ReportStatus.PENDING,
             "Reported user posted a fake job and asked for a deposit upfront."),
            (ReportCategory.NO_SHOW, ReportStatus.PENDING,
             "Worker confirmed twice but never showed up."),
            (ReportCategory.HARASSMENT, ReportStatus.UNDER_INVESTIGATION,
             "Client sent repeated aggressive messages after the job was done."),
            (ReportCategory.POOR_CONDUCT, ReportStatus.PENDING,
             "Used offensive language in chat and refused to cooperate."),
            (ReportCategory.THEFT, ReportStatus.UNDER_INVESTIGATION,
             "Tools went missing after the worker finished the job."),
            (ReportCategory.PROPERTY_DAMAGE, ReportStatus.RESOLVED,
             "Broke a window during the job. Agreed to cover the cost."),
            (ReportCategory.OTHER, ReportStatus.PENDING,
             "Unclear situation — need to review."),
            (ReportCategory.VIOLENCE, ReportStatus.ESCALATED_TO_POLICE,
             "Worker threatened client physically. Referred to police."),
        ]

        created = 0
        for i, (category, status, desc) in enumerate(samples):
            target = targets[i % len(targets)]
            if Report.objects.filter(
                reporter=reporter, category=category, description=desc
            ).exists():
                continue

            report = Report.objects.create(
                job=job,
                reporter=reporter,
                reported_user=target,
                category=category,
                description=desc,
                status=status,
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(
                f"  ✓ {report.reference_number} — {category} → {status}"
            ))

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Created {created} new report(s). "
            f"Total in DB: {Report.objects.count()}"
        ))
