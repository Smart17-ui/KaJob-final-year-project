# apps/reports/permissions.py

from rest_framework.permissions import BasePermission


class IsReportOwnerOrAdmin(BasePermission):
    """
    Allow access only to:
      - the user who filed the report (report.reporter), OR
      - an admin user.

    Used on GET /api/reports/my/<id>/ so users can view their own
    reports but not other users' reports.
    """

    message = "You do not have permission to view this report."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin always allowed
        if getattr(user, 'is_admin', False):
            return True

        # Owner of the report
        reporter = getattr(obj, 'reporter', None)
        if reporter is not None and reporter.id == user.id:
            return True

        return False
