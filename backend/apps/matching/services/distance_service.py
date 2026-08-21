# apps/matching/services/distance_service.py
import math
from typing import Optional, Tuple
from decimal import Decimal


class DistanceService:
    """
    Service for calculating distances between geographical points.
    Uses the Haversine formula for accurate distance calculation.
    """
    
    # Earth's radius in kilometers
    EARTH_RADIUS_KM = 6371.0
    
    # Fixed search radius (1km)
    DEFAULT_RADIUS_KM = 1.0
    
    @classmethod
    def calculate_distance(
        cls,
        lat1: float,
        lng1: float,
        lat2: float,
        lng2: float
    ) -> Optional[float]:
        """
        Calculate distance between two points using the Haversine formula.
        
        Args:
            lat1: Latitude of point 1
            lng1: Longitude of point 1
            lat2: Latitude of point 2
            lng2: Longitude of point 2
        
        Returns:
            Distance in kilometers, or None if coordinates are invalid
        """
        # Validate coordinates
        if not all([lat1, lng1, lat2, lng2]):
            return None
        
        # Convert to radians
        lat1_rad = math.radians(float(lat1))
        lat2_rad = math.radians(float(lat2))
        delta_lat = math.radians(float(lat2) - float(lat1))
        delta_lng = math.radians(float(lng2) - float(lng1))
        
        # Haversine formula
        a = (
            math.sin(delta_lat / 2) ** 2 +
            math.cos(lat1_rad) * math.cos(lat2_rad) *
            math.sin(delta_lng / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return cls.EARTH_RADIUS_KM * c
    
    @classmethod
    def is_within_radius(
        cls,
        lat1: float,
        lng1: float,
        lat2: float,
        lng2: float,
        radius_km: float = None
    ) -> bool:
        """
        Check if two points are within a certain radius.
        
        Args:
            lat1: Latitude of point 1
            lng1: Longitude of point 1
            lat2: Latitude of point 2
            lng2: Longitude of point 2
            radius_km: Radius in kilometers (default: 1km)
        
        Returns:
            True if within radius, False otherwise
        """
        if radius_km is None:
            radius_km = cls.DEFAULT_RADIUS_KM
        
        distance = cls.calculate_distance(lat1, lng1, lat2, lng2)
        
        if distance is None:
            return False
        
        return distance <= radius_km
    
    @classmethod
    def get_distance_display(cls, distance_km: float) -> str:
        """
        Get a human-readable distance string.
        
        Args:
            distance_km: Distance in kilometers
        
        Returns:
            Formatted distance string (e.g., "500m", "1.5km")
        """
        if distance_km < 1:
            meters = int(distance_km * 1000)
            return f"{meters}m"
        elif distance_km < 10:
            return f"{distance_km:.1f}km"
        else:
            return f"{int(distance_km)}km"
