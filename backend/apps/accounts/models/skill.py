from django.db import models
from apps.common.models.mixins import TimestampMixin


class Skill(TimestampMixin):
    """
    Master list of worker skills.
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'skills'
        ordering = ['name']
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.name
