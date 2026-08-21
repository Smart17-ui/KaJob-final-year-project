# apps/matching/services/geocoding_service.py

import json
import logging
from typing import Optional, Dict, List
from urllib.request import urlopen, Request
from urllib.parse import quote, urlencode
from urllib.error import URLError, HTTPError

logger = logging.getLogger(__name__)


class GeocodingService:
    """
    Service to convert GPS coordinates to human-readable addresses.
    Uses OpenStreetMap Nominatim API (free, no API key required).
    Uses Python's built-in urllib (no external dependencies).
    
    This is used to:
    1. Auto-fill general_location when client provides GPS coordinates
    2. Display location in human-readable format on the frontend
    """
    
    # OpenStreetMap Nominatim API endpoint
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
    SEARCH_URL = "https://nominatim.openstreetmap.org/search"
    
    @classmethod
    def _make_request(cls, url: str, params: dict) -> Optional[dict]:
        """
        Make a GET request to the given URL with parameters.
        Uses Python's built-in urllib.
        """
        try:
            # Build URL with parameters
            full_url = f"{url}?{urlencode(params)}"
            
            # Create request with headers
            req = Request(
                full_url,
                headers={
                    'User-Agent': 'KaJob/1.0 (https://kajob.com)',
                    'Accept': 'application/json',
                }
            )
            
            # Make the request
            with urlopen(req, timeout=10) as response:
                data = response.read().decode('utf-8')
                return json.loads(data)
                
        except HTTPError as e:
            logger.warning(f"Geocoding HTTP error: {e.code} - {e.reason}")
        except URLError as e:
            logger.warning(f"Geocoding URL error: {e.reason}")
        except Exception as e:
            logger.error(f"Geocoding error: {str(e)}")
        
        return None
    
    @classmethod
    def reverse_geocode(cls, lat: float, lng: float) -> Optional[Dict]:
        """
        Convert GPS coordinates to human-readable address.
        
        Args:
            lat: Latitude (e.g., -15.3875)
            lng: Longitude (e.g., 28.3412)
        
        Returns:
            Dict with address details, or None if failed
        
        Example Response:
            {
                'display_name': 'Kamwala, Lusaka, Zambia',
                'road': 'Kamwala Road',
                'suburb': 'Kamwala',
                'city': 'Lusaka',
                'state': 'Lusaka Province',
                'country': 'Zambia',
                'postcode': '10101',
                'full_address': 'Kamwala, Lusaka, Zambia'
            }
        """
        try:
            data = cls._make_request(
                cls.NOMINATIM_URL,
                {
                    'lat': lat,
                    'lon': lng,
                    'format': 'json',
                    'zoom': 18,
                    'addressdetails': 1,
                }
            )
            
            if data and data.get('address'):
                address = data.get('address', {})
                display_name = data.get('display_name', '')
                
                # Build a clean address
                road = address.get('road')
                suburb = address.get('suburb')
                city = address.get('city') or address.get('town') or address.get('village')
                state = address.get('state')
                country = address.get('country')
                postcode = address.get('postcode')
                
                # Create a human-readable location string
                parts = []
                if road:
                    parts.append(road)
                if suburb:
                    parts.append(suburb)
                if city:
                    parts.append(city)
                elif state:
                    parts.append(state)
                if country and country not in parts:
                    parts.append(country)
                
                full_address = ', '.join(parts) if parts else display_name
                
                return {
                    'display_name': display_name,
                    'road': road,
                    'suburb': suburb,
                    'city': city,
                    'state': state,
                    'country': country,
                    'postcode': postcode,
                    'full_address': full_address,
                }
                
        except Exception as e:
            logger.error(f"Reverse geocoding error: {str(e)}")
        
        return None
    
    @classmethod
    def get_display_location(cls, lat: float, lng: float, fallback: str = None) -> str:
        """
        Get a human-readable location from GPS coordinates.
        Returns fallback or coordinates if geocoding fails.
        
        Args:
            lat: Latitude
            lng: Longitude
            fallback: Optional fallback string
        
        Returns:
            Human-readable location string
        """
        result = cls.reverse_geocode(lat, lng)
        
        if result and result.get('full_address'):
            return result['full_address']
        
        if fallback:
            return fallback
        
        # If all else fails, return coordinates
        return f"{lat:.6f}, {lng:.6f}"
    
    @classmethod
    def search_location(cls, query: str, limit: int = 5) -> List[Dict]:
        """
        Search for a location by name (forward geocoding).
        
        Args:
            query: Location name (e.g., "Kamwala, Lusaka")
            limit: Max results to return
        
        Returns:
            List of matching locations with coordinates
        """
        try:
            data = cls._make_request(
                cls.SEARCH_URL,
                {
                    'q': query,
                    'format': 'json',
                    'limit': limit,
                    'addressdetails': 1,
                }
            )
            
            if data and isinstance(data, list):
                results = []
                for item in data:
                    results.append({
                        'display_name': item.get('display_name'),
                        'latitude': float(item.get('lat', 0)),
                        'longitude': float(item.get('lon', 0)),
                        'place_id': item.get('place_id'),
                        'class': item.get('class'),
                        'type': item.get('type'),
                    })
                return results
                
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
        
        return []
