from django.db import models
from apps.common.models.mixins import TimestampMixin


class JobCategory(TimestampMixin):
    """
    Master list of job categories.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    class Meta:
        db_table = 'job_categories'
        ordering = ['name']
        verbose_name = 'Job Category'
        verbose_name_plural = 'Job Categories'
    
    def __str__(self):
        return self.name
