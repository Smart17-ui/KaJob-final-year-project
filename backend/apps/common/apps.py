from django.apps import AppConfig

class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.common'
    label = 'common'
    verbose_name = 'Common Utilities'

    def ready(self):
        """
        Import signals or perform any app initialization here.
        """
        # Import models to ensure they're registered
        import apps.common.models
