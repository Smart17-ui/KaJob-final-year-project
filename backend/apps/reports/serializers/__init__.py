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
    # Admin serializers
    'ReportSerializer',
    'ReportListSerializer',
    'ReportDetailSerializer',
    'InvestigationSerializer',
    'ReportUserSerializer',
    'ReportJobSerializer',
    # User serializers
    'CreateReportSerializer',
    'MyReportListSerializer',
    'MyReportDetailSerializer',
    'ReportableJobSerializer',
    'OtherPartySerializer',
]
