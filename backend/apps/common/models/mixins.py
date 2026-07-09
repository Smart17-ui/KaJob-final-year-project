from django.db import models
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    """
    Manager that excludes soft-deleted records by default.
    """
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def deleted(self):
        """Return only soft-deleted records"""
        return super().get_queryset().filter(deleted_at__isnull=False)

    def all_with_deleted(self):
        """Return all records including soft-deleted ones"""
        return super().get_queryset()


class SoftDeleteMixin(models.Model):
    """
    Mixin to add soft delete functionality to models.
    """
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the record was soft-deleted"
    )
    deleted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_deletions',
        help_text="User who deleted this record"
    )

    objects = SoftDeleteManager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False, user=None):
        """
        Soft delete the object.
        """
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        """
        Permanently delete the object (use with caution!).
        """
        super().delete(using=using, keep_parents=keep_parents)

    def restore(self):
        """
        Restore a soft-deleted object.
        """
        self.deleted_at = None
        self.deleted_by = None
        self.save()

    @property
    def is_deleted(self):
        """Check if the record is soft-deleted."""
        return self.deleted_at is not None
