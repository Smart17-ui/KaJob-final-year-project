# apps/reports/views/user_report_views.py

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

from apps.common.permissions import IsActiveUser
from apps.reports.models import Report
from apps.reports.serializers import (
    CreateReportSerializer,
    MyReportListSerializer,
    MyReportDetailSerializer,
    ReportableJobSerializer,
)
from apps.reports.permissions import IsReportOwnerOrAdmin
from apps.reports.services.reportable_jobs_service import (
    get_reportable_jobs,
)

logger = logging.getLogger(__name__)


def _current_role(request):
    """Extract the user's currently-selected role from the JWT."""
    try:
        token = request.auth
        if token is None:
            return None
        role = token.get('current_role')
        if role in ('CLIENT', 'WORKER', 'ADMIN'):
            return role
    except Exception:
        pass
    return None


class ReportableJobsView(APIView):
    """
    GET /api/reports/reportable-jobs/
    Jobs the authenticated user can file a report on,
    scoped to their currently-selected role.
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        role = request.query_params.get('role') or _current_role(request)
        jobs = get_reportable_jobs(request.user, role)
        return Response({
            'count': jobs.count(),
            'role': role,
            'results': ReportableJobSerializer(
                jobs, many=True, context={'request': request}
            ).data,
        }, status=status.HTTP_200_OK)


class CreateReportView(APIView):
    """
    POST /api/reports/

    Accepts either:
      { "job_id": 4, "category": "FRAUD", "description": "..." }
      { "category": "OTHER", "description": "..." }   ← general complaint
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request):
        serializer = CreateReportSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = serializer.save()

        # Notify admins
        try:
            from apps.notifications.services import NotificationService
            from django.contrib.auth import get_user_model

            User = get_user_model()
            admins = User.objects.filter(
                user_roles__role__name='ADMIN',
                account_status='ACTIVE',
            ).distinct()

            if report.job:
                message = (
                    f"{request.user.full_name} reported "
                    f"{report.reported_user.full_name if report.reported_user else 'someone'} "
                    f"({report.category}) on job: {report.job.title}"
                )
            else:
                message = (
                    f"{request.user.full_name} filed a general report "
                    f"({report.category})"
                )

            svc = NotificationService()
            for admin in admins:
                svc.create_notification(
                    recipient_id=admin.id,
                    notification_type='REPORT_FILED',
                    title='New Report Filed',
                    message=message,
                    redirect_url="/admin/reports",
                    data={'report_id': report.id},
                    send_email=False,
                    send_push=True,
                    role='ADMIN',
                )

            logger.info(
                f"[CreateReport] report #{report.id} filed — "
                f"notified {admins.count()} admins"
            )
        except Exception as e:
            logger.error(
                f"[CreateReport] admin notify failed: "
                f"{type(e).__name__}: {e}"
            )

        return Response({
            'message': 'Report submitted successfully. An admin will review it.',
            'report': MyReportDetailSerializer(report).data,
        }, status=status.HTTP_201_CREATED)


class MyReportsView(APIView):
    """
    GET /api/reports/my/
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        reports = Report.objects.filter(
            reporter=request.user
        ).select_related('job', 'reported_user').order_by('-submitted_at')

        return Response({
            'count': reports.count(),
            'results': MyReportListSerializer(reports, many=True).data,
        }, status=status.HTTP_200_OK)


class MyReportDetailView(APIView):
    """
    GET /api/reports/my/<id>/
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsReportOwnerOrAdmin]

    def get(self, request, report_id):
        try:
            report = Report.objects.select_related(
                'job', 'reported_user'
            ).get(id=report_id, reporter=request.user)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'report': MyReportDetailSerializer(report).data,
        }, status=status.HTTP_200_OK)
