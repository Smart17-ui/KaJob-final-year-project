# apps/jobs/views/job_category_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from apps.jobs.models import JobCategory
from apps.jobs.serializers.job_category_serializer import (
    JobCategoryListSerializer,
    JobCategoryDetailSerializer,
)


class JobCategoryListView(APIView):
    """
    Public endpoint: list all job categories.
    GET /api/jobs/categories/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        categories = JobCategory.objects.all().order_by('name')
        serializer = JobCategoryListSerializer(categories, many=True)
        return Response(
            {'results': serializer.data},
            status=status.HTTP_200_OK,
        )


class JobCategoryDetailView(APIView):
    """
    Public endpoint: retrieve one job category.
    GET /api/jobs/categories/<id>/
    """
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        try:
            category = JobCategory.objects.get(id=category_id)
        except JobCategory.DoesNotExist:
            return Response(
                {'error': 'Category not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = JobCategoryDetailSerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
