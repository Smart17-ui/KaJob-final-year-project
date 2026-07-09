from django.db import models

class Role(models.Model):
    """
    User roles in the system.
    """
    name = models.CharField(
        max_length=20,
        unique=True,
        choices=[
            ('ADMIN', 'Administrator'),
            ('WORKER', 'Worker'),
            ('CLIENT', 'Client'),
        ]
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roles'
        ordering = ['name']

    def __str__(self):
        return self.name
