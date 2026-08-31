# infrastructure/websocket/services/notification_broadcast.py

import logging
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationBroadcastService:
    """
    Service for broadcasting notifications via WebSocket.
    Supports:
    - User notifications
    - Job updates
    - Chat messages
    - Worker location broadcasts
    - Nearby worker notifications
    - Job matching alerts
    """
    
    @staticmethod
    def send_notification_to_user(user_id: int, notification_data: dict):
        """
        Send a notification to a specific user via WebSocket.
        
        Args:
            user_id: User ID to send notification to
            notification_data: Notification data dict with id, title, message, etc.
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{user_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'notification': notification_data,
                }
            )
            
            logger.info(f"Notification sent to user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to send notification to user {user_id}: {e}")
    
    @staticmethod
    def send_job_update(job_id: int, data: dict):
        """
        Send a job update to all users watching a job.
        
        Args:
            job_id: Job ID
            data: Update data (status, assignment, etc.)
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'job_{job_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'job_update',
                    'data': data,
                }
            )
            
            logger.info(f"Job update sent for job {job_id}")
            
        except Exception as e:
            logger.error(f"Failed to send job update for job {job_id}: {e}")
    
    @staticmethod
    def send_chat_message(room_name: str, message_data: dict):
        """
        Send a chat message to all users in a room.
        
        Args:
            room_name: Chat room name
            message_data: Message data (message, sender_id, sender_name, timestamp)
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'chat_{room_name}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'chat_message',
                    **message_data,
                }
            )
            
            logger.info(f"Chat message sent to room {room_name}")
            
        except Exception as e:
            logger.error(f"Failed to send chat message to room {room_name}: {e}")
    
    # ============================================
    # 🆕 WORKER LOCATION BROADCAST
    # ============================================
    
    @staticmethod
    def broadcast_worker_location_to_nearby_clients(
        worker_id: int,
        worker_name: str,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0
    ):
        """
        Broadcast worker location to nearby clients within radius.
        
        Args:
            worker_id: Worker user ID
            worker_name: Worker full name
            latitude: Worker current latitude
            longitude: Worker current longitude
            radius_km: Search radius in kilometers (default: 10km)
        """
        try:
            channel_layer = get_channel_layer()
            
            # Find clients within radius with location data
            from apps.common.constants import UserAccountStatus
            
            clients = User.objects.filter(
                account_status=UserAccountStatus.ACTIVE,
                client_profile__isnull=False,
                profile__latitude__isnull=False,
                profile__longitude__isnull=False,
            ).select_related('profile')
            
            broadcast_count = 0
            
            for client in clients:
                if client.profile.latitude and client.profile.longitude:
                    # Calculate distance
                    distance = NotificationBroadcastService._calculate_distance(
                        latitude,
                        longitude,
                        float(client.profile.latitude),
                        float(client.profile.longitude)
                    )
                    
                    # Only notify clients within radius
                    if distance <= radius_km:
                        group_name = f'notifications_{client.id}'
                        
                        async_to_sync(channel_layer.group_send)(
                            group_name,
                            {
                                'type': 'nearby_worker_update',
                                'worker_id': worker_id,
                                'worker_name': worker_name,
                                'latitude': latitude,
                                'longitude': longitude,
                                'distance_km': round(distance, 2),
                                'distance_display': NotificationBroadcastService._format_distance(distance),
                                'timestamp': str(timezone.now()),
                            }
                        )
                        broadcast_count += 1
            
            if broadcast_count > 0:
                logger.info(f"Broadcast worker {worker_id} location to {broadcast_count} nearby clients")
            
        except Exception as e:
            logger.error(f"Failed to broadcast worker location: {e}")
    
    @staticmethod
    def broadcast_worker_to_nearby_clients(
        worker_id: int,
        worker_name: str,
        latitude: float,
        longitude: float,
        distance: float,
        distance_display: str
    ):
        """
        Send a single worker update to nearby clients (called from consumer).
        
        Args:
            worker_id: Worker user ID
            worker_name: Worker full name
            latitude: Worker latitude
            longitude: Worker longitude
            distance: Distance to client
            distance_display: Human-readable distance
        """
        try:
            channel_layer = get_channel_layer()
            
            # This is called from the consumer for each client
            # The consumer already handles the loop, so we just broadcast
            # to all clients in the nearby_workers group
            
            # Broadcast to all clients listening for nearby workers
            async_to_sync(channel_layer.group_send)(
                'nearby_workers',
                {
                    'type': 'worker_location_update',
                    'worker_id': worker_id,
                    'worker_name': worker_name,
                    'latitude': latitude,
                    'longitude': longitude,
                    'distance_km': round(distance, 2),
                    'distance_display': distance_display,
                    'timestamp': str(timezone.now()),
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to broadcast worker location: {e}")
    
    # ============================================
    # 🆕 JOB MATCHING BROADCAST
    # ============================================
    
    @staticmethod
    def broadcast_job_to_nearby_workers(job):
        """
        Broadcast a new job to nearby workers.
        
        Args:
            job: Job instance with location data
        """
        try:
            if not job.latitude or not job.longitude:
                logger.warning(f"Job {job.id} has no location, cannot broadcast")
                return
            
            channel_layer = get_channel_layer()
            
            # Find workers within the job's search radius
            from apps.common.constants import UserAccountStatus
            from apps.jobs.models import Job
            
            lat = float(job.latitude)
            lng = float(job.longitude)
            radius_km = job.search_radius_km
            
            workers = User.objects.filter(
                account_status=UserAccountStatus.ACTIVE,
                worker_profile__isnull=False,
                profile__latitude__isnull=False,
                profile__longitude__isnull=False,
            ).select_related('profile', 'worker_profile')
            
            broadcast_count = 0
            
            for worker in workers:
                if worker.profile.latitude and worker.profile.longitude:
                    distance = NotificationBroadcastService._calculate_distance(
                        lat,
                        lng,
                        float(worker.profile.latitude),
                        float(worker.profile.longitude)
                    )
                    
                    if distance <= radius_km:
                        group_name = f'notifications_{worker.id}'
                        
                        # Build job data (without sensitive info)
                        job_data = {
                            'id': job.id,
                            'title': job.title,
                            'description': job.description[:200],  # Truncated
                            'budget': str(job.budget),
                            'general_location': job.general_location,
                            'category': job.category.name if job.category else None,
                            'urgency': job.urgency,
                            'distance_km': round(distance, 2),
                            'distance_display': NotificationBroadcastService._format_distance(distance),
                            'posted_at': job.posted_at.isoformat() if job.posted_at else None,
                            'is_urgent': job.is_urgent,
                        }
                        
                        async_to_sync(channel_layer.group_send)(
                            group_name,
                            {
                                'type': 'new_job_notification',
                                'job': job_data,
                            }
                        )
                        broadcast_count += 1
            
            if broadcast_count > 0:
                logger.info(f"Broadcast job {job.id} to {broadcast_count} nearby workers")
            
        except Exception as e:
            logger.error(f"Failed to broadcast job {job.id}: {e}")
    
    @staticmethod
    def broadcast_job_matched_to_worker(worker_id: int, job_data: dict):
        """
        Send a job match notification to a specific worker.
        
        Args:
            worker_id: Worker user ID
            job_data: Job data dictionary
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{worker_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'job_matched_notification',
                    'job': job_data,
                }
            )
            
            logger.info(f"Job match sent to worker {worker_id}")
            
        except Exception as e:
            logger.error(f"Failed to send job match to worker {worker_id}: {e}")
    
    # ============================================
    # 🆕 BATCH NOTIFICATIONS
    # ============================================
    
    @staticmethod
    def send_batch_notifications(user_ids: list, notification_data: dict):
        """
        Send the same notification to multiple users.
        
        Args:
            user_ids: List of user IDs
            notification_data: Notification data dict
        """
        try:
            channel_layer = get_channel_layer()
            
            for user_id in user_ids:
                group_name = f'notifications_{user_id}'
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'send_notification',
                        'notification': notification_data,
                    }
                )
            
            logger.info(f"Batch notification sent to {len(user_ids)} users")
            
        except Exception as e:
            logger.error(f"Failed to send batch notifications: {e}")
    
    @staticmethod
    def send_job_update_to_participants(job_id: int, worker_id: int, client_id: int, data: dict):
        """
        Send job update to both worker and client involved in a job.
        
        Args:
            job_id: Job ID
            worker_id: Worker user ID
            client_id: Client user ID
            data: Update data
        """
        try:
            channel_layer = get_channel_layer()
            
            # Send to worker
            worker_group = f'notifications_{worker_id}'
            async_to_sync(channel_layer.group_send)(
                worker_group,
                {
                    'type': 'job_update',
                    'job_id': job_id,
                    'data': {**data, 'recipient_role': 'WORKER'},
                }
            )
            
            # Send to client
            client_group = f'notifications_{client_id}'
            async_to_sync(channel_layer.group_send)(
                client_group,
                {
                    'type': 'job_update',
                    'job_id': job_id,
                    'data': {**data, 'recipient_role': 'CLIENT'},
                }
            )
            
            logger.info(f"Job {job_id} update sent to worker {worker_id} and client {client_id}")
            
        except Exception as e:
            logger.error(f"Failed to send job update to participants: {e}")
    
    # ============================================
    # 🆕 NEARBY WORKERS UPDATE
    # ============================================
    
    @staticmethod
    def send_nearby_workers_update(client_id: int, nearby_workers: list):
        """
        Send a list of nearby workers to a client.
        
        Args:
            client_id: Client user ID
            nearby_workers: List of nearby worker data
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{client_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'nearby_workers_update',
                    'workers': nearby_workers,
                    'count': len(nearby_workers),
                    'timestamp': str(timezone.now()),
                }
            )
            
            logger.info(f"Nearby workers update sent to client {client_id}")
            
        except Exception as e:
            logger.error(f"Failed to send nearby workers update to client {client_id}: {e}")
    
    # ============================================
    # 🆕 NEARBY JOBS UPDATE
    # ============================================
    
    @staticmethod
    def send_nearby_jobs_update(worker_id: int, nearby_jobs: list, radius_km: float):
        """
        Send a list of nearby jobs to a worker.
        
        Args:
            worker_id: Worker user ID
            nearby_jobs: List of nearby job data
            radius_km: Search radius in kilometers
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{worker_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'nearby_jobs_update',
                    'jobs': nearby_jobs,
                    'count': len(nearby_jobs),
                    'radius_km': radius_km,
                    'timestamp': str(timezone.now()),
                }
            )
            
            logger.info(f"Nearby jobs update sent to worker {worker_id}")
            
        except Exception as e:
            logger.error(f"Failed to send nearby jobs update to worker {worker_id}: {e}")
    
    # ============================================
    # 🆕 NOTIFICATION TYPES FOR CONSUMER EVENTS
    # ============================================
    
    @staticmethod
    def send_job_assigned_notification(worker_id: int, job_data: dict):
        """
        Send job assigned notification to worker.
        
        Args:
            worker_id: Worker user ID
            job_data: Job data with full details
        """
        try:
            channel_layer = get_channel_layer()
            group_name = f'notifications_{worker_id}'
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'job_assigned_notification',
                    'job': job_data,
                }
            )
            
            logger.info(f"Job assigned notification sent to worker {worker_id}")
            
        except Exception as e:
            logger.error(f"Failed to send job assigned notification: {e}")
    
    @staticmethod
    def send_job_completed_notification(client_id: int, worker_id: int, job_data: dict):
        """
        Send job completed notification to both client and worker.
        
        Args:
            client_id: Client user ID
            worker_id: Worker user ID
            job_data: Job data
        """
        try:
            channel_layer = get_channel_layer()
            
            # Send to client
            client_group = f'notifications_{client_id}'
            async_to_sync(channel_layer.group_send)(
                client_group,
                {
                    'type': 'job_completed_notification',
                    'job': job_data,
                    'recipient_role': 'CLIENT',
                }
            )
            
            # Send to worker
            worker_group = f'notifications_{worker_id}'
            async_to_sync(channel_layer.group_send)(
                worker_group,
                {
                    'type': 'job_completed_notification',
                    'job': job_data,
                    'recipient_role': 'WORKER',
                }
            )
            
            logger.info(f"Job completed notification sent for job {job_data.get('id')}")
            
        except Exception as e:
            logger.error(f"Failed to send job completed notification: {e}")
    
    # ============================================
    # PRIVATE HELPER METHODS
    # ============================================
    
    @staticmethod
    def _calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate distance in kilometers using Haversine formula.
        """
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def _format_distance(distance_km: float) -> str:
        """
        Format distance in human-readable format.
        """
        if distance_km < 1:
            meters = int(distance_km * 1000)
            return f"{meters}m"
        elif distance_km < 10:
            return f"{distance_km:.1f}km"
        else:
            return f"{int(distance_km)}km"


# Import timezone for timestamps
from django.utils import timezone
