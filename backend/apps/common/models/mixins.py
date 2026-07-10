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


class TimestampMixin(models.Model):
    """
    Adds created_at and updated_at timestamps to models.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SoftDeleteMixin(models.Model):
    """
    Adds soft delete functionality to models.
    """
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_deletions'
    )
    
    objects = SoftDeleteManager()
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False, user=None):
        """Soft delete the object"""
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save(update_fields=['deleted_at', 'deleted_by'])
    
    def hard_delete(self, using=None, keep_parents=False):
        """Permanently delete the object"""
        super().delete(using=using, keep_parents=keep_parents)
    
    def restore(self):
        """Restore a soft-deleted object"""
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['deleted_at', 'deleted_by'])
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None


class BaseModel(TimestampMixin, SoftDeleteMixin):
    """
    Base model with timestamps and soft delete.
    """
    
    class Meta:
        abstract = True
