# apps/common/services/geocoding_service.py
import logging
import requests
from typing import Optional, Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)


class GeocodingService:
    """
    Service for geocoding addresses to coordinates.
    Used as fallback when GPS is unavailable.
    """
    
    def __init__(self):
        # Use Google Maps API or OpenStreetMap (free)
        self.api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
    
    def geocode(self, address: str) -> Optional[Dict[str, float]]:
        """
        Convert address to latitude and longitude.
        
        Args:
            address: Human-readable address (e.g., "Kamwala, Lusaka")
        
        Returns:
            Dict with latitude and longitude, or None if failed
        """
        if not address:
            return None
        
        # Try Google Maps API first
        if self.api_key:
            result = self._geocode_google(address)
            if result:
                return result
        
        # Fallback to OpenStreetMap (free, no API key needed)
        return self._geocode_osm(address)
    
    def _geocode_google(self, address: str) -> Optional[Dict[str, float]]:
        """
        Geocode using Google Maps API.
        """
        try:
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                'address': address,
                'key': self.api_key,
            }
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
            
            if data['status'] == 'OK' and data['results']:
                location = data['results'][0]['geometry']['location']
                return {
                    'latitude': location['lat'],
                    'longitude': location['lng'],
                }
        except Exception as e:
            logger.error(f"Google geocoding failed: {e}")
        
        return None
    
    def _geocode_osm(self, address: str) -> Optional[Dict[str, float]]:
        """
        Geocode using OpenStreetMap Nominatim (free).
        """
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1,
            }
            headers = {
                'User-Agent': 'KaJob/1.0'
            }
            response = requests.get(url, params=params, headers=headers, timeout=5)
            data = response.json()
            
            if data:
                return {
                    'latitude': float(data[0]['lat']),
                    'longitude': float(data[0]['lon']),
                }
        except Exception as e:
            logger.error(f"OSM geocoding failed: {e}")
        
        return None
