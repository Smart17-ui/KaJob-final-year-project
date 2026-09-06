# apps/jobs/models/job_category.py

from django.db import models
from apps.common.models.mixins import BaseModel


class JobCategory(BaseModel):
    """
    Category for jobs (e.g., Plumbing, Electrical, Cleaning).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="FontAwesome or emoji icon")
    
    class Meta:
        db_table = 'job_categories'
        ordering = ['name']
        verbose_name = 'Job Category'
        verbose_name_plural = 'Job Categories'
    
    def __str__(self):
        return self.name
