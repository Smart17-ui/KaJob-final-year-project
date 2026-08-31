# apps/admin_panel/views/review_moderation_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.admin_panel.services import AdminService
from apps.admin_panel.serializers import AdminReviewSerializer
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound


admin_service = AdminService()


class AdminReviewListView(APIView):
    """
    GET /api/admin/reviews/
    Get all reviews with optional filters (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        filters = {
            'status': request.query_params.get('status'),
            'rating': request.query_params.get('rating'),
        }
        filters = {k: v for k, v in filters.items() if v is not None}
        
        reviews = admin_service.get_all_reviews(filters)
        
        return Response({
            'count': len(reviews),
            'results': AdminReviewSerializer(reviews, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminReviewApproveView(APIView):
    """
    POST /api/admin/reviews/{id}/approve/
    Approve a review (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, review_id):
        try:
            result = admin_service.approve_review(request.user, review_id)
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminReviewRejectView(APIView):
    """
    POST /api/admin/reviews/{id}/reject/
    Reject a review (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, review_id):
        try:
            result = admin_service.reject_review(request.user, review_id)
            return Response(result, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
