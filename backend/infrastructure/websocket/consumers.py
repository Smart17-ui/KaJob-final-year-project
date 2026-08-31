# infrastructure/websocket/consumers.py

import json
import logging
from math import radians, sin, cos, sqrt, atan2
from datetime import timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from apps.notifications.models import Notification
from apps.common.constants import UserAccountStatus, JobStatus
from apps.jobs.models import Job

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications and location tracking.
    """
    
    # 📏 Configurable thresholds
    MIN_DISTANCE_CHANGE_METERS = 50   # Save if moved more than 50 meters
    MIN_TIME_CHANGE_SECONDS = 30       # Or wait at least 30 seconds between saves
    JOB_SEARCH_RADIUS_KM = 1.0         # Default job search radius
    MAX_JOB_SEARCH_RADIUS_KM = 10.0    # Maximum job search radius
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = await self.get_user_from_token()
        
        if not self.user:
            logger.warning("WebSocket connection rejected: Unauthenticated user")
            await self.close()
            return
        
        # Store last saved location to compare
        self.last_saved_lat = None
        self.last_saved_lng = None
        self.last_saved_time = None
        self.current_radius = self.JOB_SEARCH_RADIUS_KM
        
        self.user_group_name = f'notifications_{self.user.id}'
        self.user_location_group = f'location_{self.user.id}'
        
        # Add user to notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        # Add user to location group
        await self.channel_layer.group_add(
            self.user_location_group,
            self.channel_name
        )
        
        await self.accept()
        
        logger.info(f"WebSocket connected: User {self.user.email} (ID: {self.user.id})")
        
        # Get current location from database
        current_location = await self.get_user_location()
        if current_location:
            self.last_saved_lat = current_location.get('latitude')
            self.last_saved_lng = current_location.get('longitude')
            self.last_saved_time = timezone.now()
        
        # Send connection confirmation
        await self.send_json({
            'type': 'connection_established',
            'message': 'Connected to notification service',
            'user_id': self.user.id,
            'timestamp': timezone.now().isoformat(),
        })
        
        # Get user role
        user_role = await self.get_user_role(self.user.id)
        await self.send_json({
            'type': 'user_role',
            'role': user_role,
        })
        
        # Get initial nearby jobs if worker
        if user_role == 'WORKER' and current_location:
            nearby_jobs = await self.get_nearby_jobs_for_worker(
                self.user.id,
                self.current_radius
            )
            await self.send_json({
                'type': 'nearby_jobs_initial',
                'jobs': nearby_jobs,
                'count': len(nearby_jobs),
                'radius_km': self.current_radius,
                'message': f'📍 Found {len(nearby_jobs)} jobs near you',
            })
        
        # Send unread count
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'unread_count',
            'count': unread_count,
        })
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
        if hasattr(self, 'user_location_group'):
            await self.channel_layer.group_discard(
                self.user_location_group,
                self.channel_name
            )
        logger.info(f"WebSocket disconnected: User {self.user.email if self.user else 'Unknown'}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            # ============================================
            # 📍 SMART LOCATION UPDATE
            # ============================================
            
            if message_type == 'location_update':
                """Handle location update with smart saving and auto-job refresh."""
                latitude = data.get('latitude')
                longitude = data.get('longitude')
                accuracy = data.get('accuracy')
                
                if latitude is None or longitude is None:
                    await self.send_json({
                        'type': 'location_error',
                        'message': 'Invalid location data',
                    })
                    return
                
                # ✅ CHECK IF WE SHOULD SAVE THIS LOCATION
                should_save = await self.should_save_location(
                    latitude,
                    longitude
                )
                
                if should_save:
                    # Save to database
                    updated = await self.update_user_location(
                        self.user.id,
                        latitude,
                        longitude,
                        accuracy
                    )
                    
                    if updated:
                        # Update last saved location
                        self.last_saved_lat = latitude
                        self.last_saved_lng = longitude
                        self.last_saved_time = timezone.now()
                        
                        # Get user role
                        user_role = await self.get_user_role(self.user.id)
                        
                        # ✅ FOR WORKERS: Auto-refresh nearby jobs
                        if user_role == 'WORKER':
                            nearby_jobs = await self.get_nearby_jobs_for_worker(
                                self.user.id,
                                self.current_radius
                            )
                            
                            # ✅ Push new jobs to worker
                            await self.send_json({
                                'type': 'nearby_jobs_updated',
                                'jobs': nearby_jobs,
                                'count': len(nearby_jobs),
                                'radius_km': self.current_radius,
                                'message': f'📍 Found {len(nearby_jobs)} jobs near you!',
                                'timestamp': timezone.now().isoformat(),
                            })
                            
                            logger.info(f"📍 Worker {self.user.id} location updated, {len(nearby_jobs)} jobs found")
                        
                        # ✅ Broadcast to nearby clients for matching
                        await self.broadcast_location_to_nearby_clients(
                            self.user.id,
                            user_role,
                            latitude,
                            longitude
                        )
                        
                        await self.send_json({
                            'type': 'location_updated',
                            'message': 'Location saved and broadcasted',
                            'role': user_role,
                            'latitude': latitude,
                            'longitude': longitude,
                            'timestamp': timezone.now().isoformat(),
                        })
                    else:
                        await self.send_json({
                            'type': 'location_error',
                            'message': 'Failed to update location',
                        })
                else:
                    # Location not saved - but still acknowledge
                    await self.send_json({
                        'type': 'location_received',
                        'message': 'Location received (no significant change)',
                        'timestamp': timezone.now().isoformat(),
                    })
            
            # ============================================
            # SEARCH RADIUS UPDATE
            # ============================================
            
            elif message_type == 'set_search_radius':
                """Worker sets job search radius."""
                radius = data.get('radius', 1.0)
                
                # Validate radius (between 0.5km and 10km)
                if radius < 0.5:
                    radius = 0.5
                elif radius > self.MAX_JOB_SEARCH_RADIUS_KM:
                    radius = self.MAX_JOB_SEARCH_RADIUS_KM
                
                self.current_radius = radius
                
                # Recalculate jobs with new radius
                nearby_jobs = await self.get_nearby_jobs_for_worker(
                    self.user.id,
                    self.current_radius
                )
                
                await self.send_json({
                    'type': 'search_radius_updated',
                    'radius_km': self.current_radius,
                    'jobs': nearby_jobs,
                    'count': len(nearby_jobs),
                    'message': f'📍 Showing jobs within {self.current_radius}km',
                })
            
            # ============================================
            # GET NEARBY JOBS (Manual Refresh)
            # ============================================
            
            elif message_type == 'refresh_nearby_jobs':
                """Manual refresh of nearby jobs."""
                radius = data.get('radius', self.current_radius)
                nearby_jobs = await self.get_nearby_jobs_for_worker(
                    self.user.id,
                    radius
                )
                
                await self.send_json({
                    'type': 'nearby_jobs_refreshed',
                    'jobs': nearby_jobs,
                    'count': len(nearby_jobs),
                    'radius_km': radius,
                    'message': f'📍 Found {len(nearby_jobs)} jobs',
                    'timestamp': timezone.now().isoformat(),
                })
            
            # ============================================
            # NOTIFICATION HANDLERS
            # ============================================
            
            elif message_type == 'mark_read':
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
                    await self.send_json({
                        'type': 'notification_read',
                        'notification_id': notification_id,
                    })
            
            elif message_type == 'mark_all_read':
                await self.mark_all_notifications_read()
                await self.send_json({
                    'type': 'all_notifications_read',
                })
                unread_count = await self.get_unread_count()
                await self.send_json({
                    'type': 'unread_count',
                    'count': unread_count,
                })
            
            # ============================================
            # GET NEARBY USERS (For Clients)
            # ============================================
            
            elif message_type == 'get_nearby_workers':
                """Client gets nearby workers."""
                radius = data.get('radius', 5)
                nearby_workers = await self.get_nearby_workers(self.user.id, radius)
                await self.send_json({
                    'type': 'nearby_workers',
                    'data': nearby_workers,
                    'count': len(nearby_workers),
                })
            
            elif message_type == 'ping':
                await self.send_json({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat(),
                })
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {e}")
    
    async def send_json(self, data):
        """Send JSON data to WebSocket."""
        await self.send(text_data=json.dumps(data))
    
    # ============================================
    # NOTIFICATION EVENTS
    # ============================================
    
    async def send_notification(self, event):
        """Send notification to user's WebSocket."""
        notification = event.get('notification', {})
        
        await self.send_json({
            'type': 'new_notification',
            'notification': notification,
        })
        
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'unread_count',
            'count': unread_count,
        })
    
    # ============================================
    # 📍 SMART LOCATION CHECK
    # ============================================
    
    async def should_save_location(self, latitude, longitude):
        """
        Determine if we should save this location to database.
        Returns True if:
        1. No previous location saved
        2. Moved more than MIN_DISTANCE_CHANGE_METERS
        3. More than MIN_TIME_CHANGE_SECONDS has passed
        """
        # No previous location → always save
        if self.last_saved_lat is None or self.last_saved_lng is None:
            logger.info("📍 First location - saving to database")
            return True
        
        # Calculate distance moved
        distance_meters = self._calculate_distance_meters(
            self.last_saved_lat,
            self.last_saved_lng,
            latitude,
            longitude
        )
        
        # Check time since last save
        time_since_save = (timezone.now() - self.last_saved_time).total_seconds()
        
        # ✅ Save if moved more than threshold OR waited more than threshold
        should_save = (
            distance_meters >= self.MIN_DISTANCE_CHANGE_METERS or
            time_since_save >= self.MIN_TIME_CHANGE_SECONDS
        )
        
        if should_save:
            logger.info(f"📍 Saving location - Distance: {distance_meters:.0f}m, Time: {time_since_save:.0f}s")
        else:
            logger.info(f"⏭️ Skipping save - Distance: {distance_meters:.0f}m, Time: {time_since_save:.0f}s")
        
        return should_save
    
    # ============================================
    # 🎯 JOB SEARCH - NEARBY JOBS
    # ============================================
    
    @database_sync_to_async
    def get_nearby_jobs_for_worker(self, user_id, radius_km=1.0):
        """
        Get all open jobs within radius of worker's location.
        This is the core job matching function.
        """
        try:
            user = User.objects.get(id=user_id)
            
            # Check if user has location
            if not hasattr(user, 'profile') or not user.profile.latitude:
                return []
            
            lat = float(user.profile.latitude)
            lng = float(user.profile.longitude)
            
            # Get all open jobs with location data
            jobs = Job.objects.filter(
                status=JobStatus.OPEN,
                latitude__isnull=False,
                longitude__isnull=False,
                is_deleted=False
            ).select_related('category', 'client')
            
            nearby_jobs = []
            
            for job in jobs:
                if job.latitude and job.longitude:
                    distance = self._calculate_distance(
                        lat, lng,
                        float(job.latitude),
                        float(job.longitude)
                    )
                    
                    if distance <= radius_km:
                        nearby_jobs.append({
                            'id': job.id,
                            'title': job.title,
                            'description': job.description,
                            'budget': str(job.budget),
                            'general_location': job.general_location,
                            'exact_location': None,  # Hidden until accepted
                            'category': job.category.name if job.category else None,
                            'urgency': job.urgency,
                            'job_date': job.job_date.isoformat() if job.job_date else None,
                            'duration_hours': str(job.duration_hours) if job.duration_hours else None,
                            'client_name': None,  # Hidden until accepted
                            'client_phone': None,  # Hidden until accepted
                            'latitude': float(job.latitude),
                            'longitude': float(job.longitude),
                            'distance_km': round(distance, 2),
                            'distance_display': self._format_distance(distance),
                            'posted_at': job.posted_at.isoformat() if job.posted_at else None,
                            'is_urgent': job.is_urgent,
                            'can_view_full_details': False,  # Worker hasn't accepted yet
                        })
            
            # Sort by distance (closest first)
            nearby_jobs.sort(key=lambda x: x['distance_km'])
            
            logger.info(f"Found {len(nearby_jobs)} jobs within {radius_km}km for worker {user_id}")
            return nearby_jobs
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error getting nearby jobs: {e}")
            return []
    
    # ============================================
    # 📍 LOCATION DATABASE OPERATIONS
    # ============================================
    
    @database_sync_to_async
    def update_user_location(self, user_id, latitude, longitude, accuracy=None):
        """Update user's location in database."""
        try:
            user = User.objects.get(id=user_id)
            
            if hasattr(user, 'profile'):
                user.profile.latitude = latitude
                user.profile.longitude = longitude
                user.profile.save(update_fields=['latitude', 'longitude', 'updated_at'])
            
            return True
            
        except User.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error updating location: {e}")
            return False
    
    @database_sync_to_async
    def get_user_location(self):
        """Get current location of user."""
        try:
            if hasattr(self.user, 'profile'):
                profile = self.user.profile
                if profile.latitude and profile.longitude:
                    return {
                        'latitude': float(profile.latitude),
                        'longitude': float(profile.longitude),
                        'last_updated': profile.updated_at.isoformat() if profile.updated_at else None,
                    }
            return None
        except Exception as e:
            logger.error(f"Error getting location: {e}")
            return None
    
    # ============================================
    # 👤 USER ROLE
    # ============================================
    
    @database_sync_to_async
    def get_user_role(self, user_id):
        """Get user's primary role."""
        try:
            user = User.objects.get(id=user_id)
            
            if hasattr(user, 'worker_profile'):
                return 'WORKER'
            
            if hasattr(user, 'client_profile'):
                return 'CLIENT'
            
            return 'UNKNOWN'
        except User.DoesNotExist:
            return 'UNKNOWN'
    
    # ============================================
    # 📨 BROADCAST TO NEARBY CLIENTS
    # ============================================
    
    @database_sync_to_async
    def broadcast_location_to_nearby_clients(self, user_id, role, latitude, longitude):
        """
        Broadcast worker location to nearby clients.
        This helps clients find nearby workers.
        """
        try:
            if role != 'WORKER':
                return False
            
            # Find clients within 10km
            clients = User.objects.filter(
                account_status=UserAccountStatus.ACTIVE,
                profile__latitude__isnull=False,
                profile__longitude__isnull=False,
            ).exclude(id=user_id).select_related('profile')
            
            worker = User.objects.get(id=user_id)
            broadcast_count = 0
            
            for client in clients:
                if client.profile.latitude and client.profile.longitude:
                    distance = self._calculate_distance(
                        latitude,
                        longitude,
                        float(client.profile.latitude),
                        float(client.profile.longitude)
                    )
                    
                    # Only notify clients within 10km
                    if distance <= 10:
                        group_name = f'notifications_{client.id}'
                        self.channel_layer.group_send(
                            group_name,
                            {
                                'type': 'nearby_worker_update',
                                'worker_id': user_id,
                                'worker_name': worker.full_name,
                                'latitude': latitude,
                                'longitude': longitude,
                                'distance_km': round(distance, 2),
                                'distance_display': self._format_distance(distance),
                                'timestamp': timezone.now().isoformat(),
                            }
                        )
                        broadcast_count += 1
            
            logger.info(f"Broadcast worker {user_id} location to {broadcast_count} nearby clients")
            return True
            
        except Exception as e:
            logger.error(f"Error broadcasting location: {e}")
            return False
    
    # ============================================
    # 🔍 GET NEARBY WORKERS (For Clients)
    # ============================================
    
    @database_sync_to_async
    def get_nearby_workers(self, user_id, radius_km=5):
        """Get nearby workers for a client."""
        try:
            user = User.objects.get(id=user_id)
            if not hasattr(user, 'profile') or not user.profile.latitude:
                return []
            
            lat = float(user.profile.latitude)
            lng = float(user.profile.longitude)
            
            nearby_workers = []
            
            # Get all active workers with location data
            workers = User.objects.filter(
                account_status=UserAccountStatus.ACTIVE,
                worker_profile__isnull=False,
                profile__latitude__isnull=False,
                profile__longitude__isnull=False,
            ).exclude(id=user_id).select_related('profile', 'worker_profile')
            
            for worker in workers:
                if worker.profile.latitude and worker.profile.longitude:
                    distance = self._calculate_distance(
                        lat, lng,
                        float(worker.profile.latitude),
                        float(worker.profile.longitude)
                    )
                    
                    if distance <= radius_km:
                        nearby_workers.append({
                            'id': worker.id,
                            'name': worker.full_name,
                            'latitude': float(worker.profile.latitude),
                            'longitude': float(worker.profile.longitude),
                            'distance_km': round(distance, 2),
                            'distance_display': self._format_distance(distance),
                            'hourly_rate': str(worker.worker_profile.hourly_rate) if worker.worker_profile else None,
                            'rating': float(worker.worker_profile.rating) if worker.worker_profile else 0,
                            'verified': worker.worker_profile.verified if worker.worker_profile else False,
                        })
            
            nearby_workers.sort(key=lambda x: x['distance_km'])
            return nearby_workers
            
        except Exception as e:
            logger.error(f"Error getting nearby workers: {e}")
            return []
    
    # ============================================
    # 📋 NOTIFICATION DB OPERATIONS
    # ============================================
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count for user."""
        if not self.user:
            return 0
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a notification as read."""
        if not self.user:
            return False
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read."""
        if not self.user:
            return 0
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
    
    # ============================================
    # 🔐 AUTH
    # ============================================
    
    @database_sync_to_async
    def get_user_from_token(self):
        """Extract user from JWT token in WebSocket handshake."""
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            
            if not token:
                return None
            
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            
            user = User.objects.get(id=user_id)
            if user.account_status != UserAccountStatus.ACTIVE:
                return None
            
            return user
            
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            logger.warning(f"Token validation failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting user from token: {e}")
            return None
    
    # ============================================
    # 📐 DISTANCE CALCULATION HELPERS
    # ============================================
    
    @staticmethod
    def _calculate_distance(lat1, lng1, lat2, lng2):
        """Calculate distance in kilometers using Haversine formula."""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def _calculate_distance_meters(lat1, lng1, lat2, lng2):
        """Calculate distance in meters using Haversine formula."""
        R = 6371000  # Earth's radius in meters
        
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def _format_distance(distance_km):
        """Format distance in human-readable format."""
        if distance_km < 1:
            meters = int(distance_km * 1000)
            return f"{meters}m"
        elif distance_km < 10:
            return f"{distance_km:.1f}km"
        else:
            return f"{int(distance_km)}km"


# ============================================
# JOB CONSUMER
# ============================================

class JobConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for job-specific updates."""
    
    async def connect(self):
        self.job_id = self.scope['url_route']['kwargs'].get('job_id')
        self.user = await self.get_user_from_token()
        
        if not self.user:
            await self.close()
            return
        
        self.job_group_name = f'job_{self.job_id}'
        
        await self.channel_layer.group_add(
            self.job_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"Job WebSocket connected: Job {self.job_id}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'job_group_name'):
            await self.channel_layer.group_discard(
                self.job_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            await self.send_json({
                'type': 'echo',
                'data': data,
                'timestamp': timezone.now().isoformat(),
            })
        except json.JSONDecodeError:
            await self.send_json({
                'type': 'error',
                'message': 'Invalid JSON',
            })
    
    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
    
    async def job_update(self, event):
        await self.send_json({
            'type': 'job_update',
            'job_id': self.job_id,
            'data': event.get('data', {}),
        })
    
    @database_sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            if not token:
                return None
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            user = User.objects.get(id=user_id)
            if user.account_status != UserAccountStatus.ACTIVE:
                return None
            return user
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None


# ============================================
# CHAT CONSUMER
# ============================================

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat."""
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        self.user = await self.get_user_from_token()
        
        if not self.user:
            await self.close()
            return
        
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"Chat WebSocket connected: Room {self.room_name}")
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get('type') == 'message':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': data.get('message'),
                        'sender_id': self.user.id,
                        'sender_name': self.user.full_name,
                        'timestamp': timezone.now().isoformat(),
                    }
                )
        except json.JSONDecodeError:
            await self.send_json({'type': 'error', 'message': 'Invalid JSON'})
    
    async def chat_message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp'],
        })
    
    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
    
    @database_sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            if not token:
                return None
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            user = User.objects.get(id=user_id)
            if user.account_status != UserAccountStatus.ACTIVE:
                return None
            return user
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None
