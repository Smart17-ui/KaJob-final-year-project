# apps/notifications/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.accounts.models import User
from apps.notifications.services import NotificationService


@receiver(post_save, sender=User)
def create_notification_preferences(sender, instance, created, **kwargs):
    """Create notification preferences when a new user is created."""
    if created:
        from apps.notifications.repositories import NotificationRepository
        repository = NotificationRepository()
        repository.get_or_create_preferences(instance.id)
