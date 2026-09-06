# apps/audit/urls.py

from django.urls import path
from apps.audit.views import (
    # Audit Logs
    AuditLogListView,
    AuditLogDetailView,
    AuditUserLogsView,
    AuditEntityLogsView,
    AuditStatsView,
    # Disciplinary Actions
    DisciplinaryCreateView,
    DisciplinaryActionListView,
    DisciplinaryActionDetailView,
    DisciplinaryUserActionsView,
)

urlpatterns = [
    # Audit Logs
    path('logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('logs/<int:log_id>/', AuditLogDetailView.as_view(), name='audit-log-detail'),
    path('users/<int:user_id>/logs/', AuditUserLogsView.as_view(), name='audit-user-logs'),
    path('entities/<str:entity_type>/<int:entity_id>/', AuditEntityLogsView.as_view(), name='audit-entity-logs'),
    path('stats/', AuditStatsView.as_view(), name='audit-stats'),
    
    # Disciplinary Actions
    path('disciplinary/create/', DisciplinaryCreateView.as_view(), name='disciplinary-create'),
    path('disciplinary/actions/', DisciplinaryActionListView.as_view(), name='disciplinary-actions'),
    path('disciplinary/actions/<int:action_id>/', DisciplinaryActionDetailView.as_view(), name='disciplinary-action-detail'),
    path('disciplinary/users/<int:user_id>/actions/', DisciplinaryUserActionsView.as_view(), name='disciplinary-user-actions'),
]
