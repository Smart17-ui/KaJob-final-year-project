# config/asgi.py

import os
import django

# Set the settings module first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django BEFORE anything imports models
django.setup()

from django.core.asgi import get_asgi_application

# Now it's safe to import Django apps and routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from infrastructure.websocket.routing import websocket_urlpatterns


# Create the HTTP ASGI application FIRST (this triggers
# Django's app registry initialization).
django_asgi_app = get_asgi_application()


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
