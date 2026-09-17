# apps/jobs/signals.py

"""
Signal handlers that keep WorkerProfile.availability_status in sync
with the worker's actual JobAssignment state.

Rule:
- If a worker has ANY assignment in (ACTIVE, IN_PROGRESS)  -> BUSY
- Otherwise                                                 -> AVAILABLE
"""

import logging

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.jobs.models import JobAssignment
from apps.common.constants import AssignmentStatus

logger = logging.getLogger(__name__)


def _sync_worker_availability(worker_id):
    """
    Recompute the desired availability for a worker and persist it
    if it differs from the current value.
    """
    from apps.accounts.models import WorkerProfile

    if not worker_id:
        return

    has_active = JobAssignment.objects.filter(
        worker_id=worker_id,
        status__in=[
            AssignmentStatus.ACTIVE,
            AssignmentStatus.IN_PROGRESS,
        ],
    ).exists()

    desired = 'BUSY' if has_active else 'AVAILABLE'

    try:
        profile = WorkerProfile.objects.get(user_id=worker_id)
    except WorkerProfile.DoesNotExist:
        # Worker has no profile yet — nothing to sync
        return

    if profile.availability_status != desired:
        profile.availability_status = desired
        # availability_updated_at has auto_now=True so it updates automatically
        profile.save(update_fields=['availability_status', 'availability_updated_at'])
        logger.info(
            f"[availability] worker={worker_id} set to {desired} "
            f"(has_active_assignment={has_active})"
        )


@receiver(post_save, sender=JobAssignment)
def on_assignment_saved(sender, instance, **kwargs):
    """Fires on create AND every status change."""
    _sync_worker_availability(instance.worker_id)


@receiver(post_delete, sender=JobAssignment)
def on_assignment_deleted(sender, instance, **kwargs):
    """Fires when an assignment row is deleted."""
    _sync_worker_availability(instance.worker_id)
