from django.db import models

class Skill(models.Model):
    """
    Master list of skills that workers can have.
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'skills'
        ordering = ['name']

    def __str__(self):
        return self.name
