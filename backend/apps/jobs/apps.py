# apps/jobs/apps.py

from django.apps import AppConfig


class JobsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.jobs'

    def ready(self):
        # Register signal handlers
        import apps.jobs.signals  # noqa: F401
