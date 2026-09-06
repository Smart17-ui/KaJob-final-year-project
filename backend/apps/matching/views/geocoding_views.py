# apps/matching/views/geocoding_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.matching.services.geocoding_service import GeocodingService
from apps.common.permissions import IsActiveUser


class ReverseGeocodeView(APIView):
    """
    GET /api/matching/geocode/reverse/
    Convert GPS coordinates to human-readable address.
    
    Query Parameters:
        lat: Latitude (e.g., -15.3875)
        lng: Longitude (e.g., 28.3412)
    
    Response:
        {
            "display_name": "Kamwala, Lusaka, Zambia",
            "full_address": "Kamwala, Lusaka, Zambia",
            "road": "Kamwala Road",
            "suburb": "Kamwala",
            "city": "Lusaka",
            "state": "Lusaka Province",
            "country": "Zambia",
            "postcode": "10101"
        }
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        if not lat or not lng:
            return Response(
                {'error': 'lat and lng parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {'error': 'Invalid lat or lng format.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = GeocodingService.reverse_geocode(lat, lng)
        
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Could not find location for these coordinates.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SearchLocationView(APIView):
    """
    GET /api/matching/geocode/search/
    Search for a location by name.
    
    Query Parameters:
        q: Search query (e.g., "Kamwala, Lusaka")
        limit: Max results (default: 5, max: 20)
    
    Response:
        {
            "count": 3,
            "results": [
                {
                    "display_name": "Kamwala, Lusaka, Zambia",
                    "latitude": -15.3875,
                    "longitude": 28.3412,
                    "place_id": 123456,
                    "class": "suburb",
                    "type": "residential"
                }
            ]
        }
    """
    permission_classes = [IsAuthenticated, IsActiveUser]
    
    def get(self, request):
        query = request.query_params.get('q')
        
        if not query:
            return Response(
                {'error': 'q parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        limit = request.query_params.get('limit', 5)
        
        try:
            limit = int(limit)
            limit = min(limit, 20)  # Max 20 results
        except ValueError:
            limit = 5
        
        results = GeocodingService.search_location(query, limit)
        
        return Response({
            'count': len(results),
            'results': results
        }, status=status.HTTP_200_OK)
