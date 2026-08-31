# infrastructure/websocket/routing.py

from django.urls import re_path
from infrastructure.websocket.consumers import (
    NotificationConsumer,
    JobConsumer,
    ChatConsumer,
)

websocket_urlpatterns = [
    # Notification WebSocket (authenticated)
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\d+)/$', NotificationConsumer.as_asgi()),
    
    # Job-specific WebSocket
    re_path(r'ws/jobs/(?P<job_id>\d+)/$', JobConsumer.as_asgi()),
    
    # Chat WebSocket
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
]
