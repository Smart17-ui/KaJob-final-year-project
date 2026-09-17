# apps/reports/serializers/__init__.py

from .report_serializer import (
    ReportSerializer,
    ReportListSerializer,
    ReportDetailSerializer,
    InvestigationSerializer,
    ReportUserSerializer,
    ReportJobSerializer,
)

from .user_report_serializer import (
    CreateReportSerializer,
    MyReportListSerializer,
    MyReportDetailSerializer,
    ReportableJobSerializer,
    OtherPartySerializer,
)

__all__ = [
    'ReportSerializer',
    'ReportListSerializer',
    'ReportDetailSerializer',
    'InvestigationSerializer',
    'ReportUserSerializer',
    'ReportJobSerializer',
    'CreateReportSerializer',
    'MyReportListSerializer',
    'MyReportDetailSerializer',
    'ReportableJobSerializer',
    'OtherPartySerializer',
]
