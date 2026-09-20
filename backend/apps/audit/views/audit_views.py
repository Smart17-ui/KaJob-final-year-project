# apps/audit/views/audit_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from apps.audit.models import AuditLog                        # ← THE MISSING IMPORT
from apps.audit.services import AuditService
from apps.audit.serializers import (
    AuditLogSerializer,
    AuditLogListSerializer,
    AuditLogDetailSerializer,
    AuditStatsSerializer,
)
from apps.common.permissions import IsAdmin, IsActiveUser


# Service instance
audit_service = AuditService()


class AuditLogListView(APIView):
    """
    GET /api/logs/
    Get paginated audit logs with filters (Admin only).

    Query params:
        page         — page number (default 1)
        page_size    — items per page (default 20, max 100)
        search       — substring match on action or entity_type
        action       — exact match on action
        entity_type  — exact match on entity_type
        user_id      — filter by user
        start_date   — ISO date (YYYY-MM-DD), inclusive
        end_date     — ISO date (YYYY-MM-DD), inclusive
        ordering     — e.g. '-created_at' (default) or 'created_at'
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request):
        qs = AuditLog.objects.all().select_related('user')

        # ── Filters ─────────────────────────────────
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(action__icontains=search)
                | Q(entity_type__icontains=search)
                | Q(user_agent__icontains=search)
            )

        action = request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)

        entity_type = request.query_params.get('entity_type')
        if entity_type:
            qs = qs.filter(entity_type=entity_type)

        user_id = request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)

        start_date = request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)

        end_date = request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)

        # ── Ordering ────────────────────────────────
        ordering = request.query_params.get('ordering', '-created_at')
        allowed_orderings = {
            '-created_at', 'created_at', 'action', '-action',
        }
        if ordering not in allowed_orderings:
            ordering = '-created_at'
        qs = qs.order_by(ordering)

        # ── Pagination ──────────────────────────────
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 20))
        except (TypeError, ValueError):
            page_size = 20
        page_size = min(max(1, page_size), 100)

        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size

        logs = qs[start:end]

        return Response({
            'count': total,
            'next': page * page_size < total,
            'previous': page > 1,
            'page': page,
            'page_size': page_size,
            'results': AuditLogListSerializer(logs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditLogDetailView(APIView):
    """
    GET /api/logs/{id}/
    Get a specific audit log entry (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, log_id):
        log = get_object_or_404(AuditLog, id=log_id)
        return Response(
            AuditLogDetailSerializer(log).data,
            status=status.HTTP_200_OK,
        )


class AuditUserLogsView(APIView):
    """
    GET /api/users/{user_id}/logs/
    Get audit logs for a specific user (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, user_id):
        qs = AuditLog.objects.filter(
            user_id=user_id
        ).select_related('user').order_by('-created_at')

        total = qs.count()

        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = min(
                max(1, int(request.query_params.get('page_size', 20))),
                100,
            )
        except (TypeError, ValueError):
            page_size = 20

        start = (page - 1) * page_size
        end = start + page_size

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': AuditLogListSerializer(
                qs[start:end], many=True
            ).data,
        }, status=status.HTTP_200_OK)


class AuditEntityLogsView(APIView):
    """
    GET /api/entities/{entity_type}/{entity_id}/
    Get audit logs for a specific entity (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request, entity_type, entity_id):
        qs = AuditLog.objects.filter(
            entity_type=entity_type,
            entity_id=entity_id,
        ).select_related('user').order_by('-created_at')

        return Response({
            'count': qs.count(),
            'results': AuditLogListSerializer(qs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditStatsView(APIView):
    """
    GET /api/stats/
    Get audit statistics (Admin only).

    Returns shape:
        {
            "total_actions": int,
            "by_action": [{"action": str, "count": int}, ...],
            "top_users": [{"user_id": int, "user_name": str, "count": int}, ...],
            "daily_activity": [{"date": "YYYY-MM-DD", "count": int}, ...]
        }

    Query params:
        days — window size in days (default 7)
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]

    def get(self, request):
        try:
            days = int(request.query_params.get('days', 7))
        except (TypeError, ValueError):
            days = 7
        days = max(1, min(days, 365))

        start_date = timezone.now() - timedelta(days=days)

        recent = AuditLog.objects.filter(created_at__gte=start_date)

        # ── total_actions ───────────────────────────
        total_actions = recent.count()

        # ── by_action ───────────────────────────────
        by_action = list(
            recent.values('action')
            .annotate(count=Count('id'))
            .order_by('-count')[:20]
        )

        # ── top_users ───────────────────────────────
        from apps.accounts.models import User

        user_counts = (
            recent.exclude(user__isnull=True)
            .values('user_id')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        user_ids = [u['user_id'] for u in user_counts]
        users_by_id = {
            u.id: u for u in User.objects.filter(id__in=user_ids)
        }

        top_users = []
        for u in user_counts:
            user = users_by_id.get(u['user_id'])
            if user:
                top_users.append({
                    'user_id': user.id,
                    'user_name': user.full_name,
                    'count': u['count'],
                })

        # ── daily_activity ──────────────────────────
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DATE(created_at) AS date, COUNT(*) AS count
                FROM audit_logs
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            """, [start_date])
            daily_activity = [
                {'date': str(row[0]), 'count': row[1]}
                for row in cursor.fetchall()
            ]

        return Response({
            'total_actions': total_actions,
            'by_action': by_action,
            'top_users': top_users,
            'daily_activity': daily_activity,
        }, status=status.HTTP_200_OK)
