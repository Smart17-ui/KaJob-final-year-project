from django.db import models

class JobCategory(models.Model):
    """
    Master list of job categories.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name (e.g., Plumbing, Electrical)"
    )
    description = models.TextField(
        blank=True,
        help_text="Category description"
    )
    icon = models.CharField(
        max_length=100,
        blank=True,
        help_text="Icon class or path"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_categories'
        ordering = ['name']

    def __str__(self):
        return self.name
