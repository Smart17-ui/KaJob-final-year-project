# apps/admin_panel/views/report_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.admin_panel.services import AdminService
from apps.common.permissions import IsAdmin, IsActiveUser
from apps.common.exceptions import BusinessRuleViolation, ResourceNotFound
from apps.reports.models import Report, Investigation, ReportEvidence
from apps.reports.serializers import (
    ReportSerializer,
    ReportListSerializer,
    ReportDetailSerializer,
    InvestigationSerializer,
    ReportEvidenceSerializer,
    ReportStatsSerializer,
)


class AdminReportListView(APIView):
    """
    GET /api/admin/reports/
    Get all reports with optional filters (Admin only).
    
    Query params:
    - status: PENDING, UNDER_INVESTIGATION, RESOLVED, ESCALATED_TO_POLICE
    - category: THEFT, FRAUD, HARASSMENT, SAFETY, CONTENT, TECHNICAL
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        reports = Report.objects.all().select_related('job', 'reporter', 'reported_user')
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            reports = reports.filter(status=status_filter)
        
        category_filter = request.query_params.get('category')
        if category_filter:
            reports = reports.filter(category=category_filter)
        
        reports = reports.order_by('-submitted_at')
        
        return Response({
            'count': len(reports),
            'results': ReportListSerializer(reports, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminReportDetailView(APIView):
    """
    GET /api/admin/reports/{id}/
    Get report details with investigation and evidence (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, report_id):
        try:
            report = Report.objects.select_related(
                'job', 'reporter', 'reported_user'
            ).get(id=report_id)
            return Response({
                'report': ReportDetailSerializer(report).data,
            }, status=status.HTTP_200_OK)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminReportStartInvestigationView(APIView):
    """
    POST /api/admin/reports/{id}/investigate/
    Start investigation for a report (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already under investigation
        if report.status in ['UNDER_INVESTIGATION', 'RESOLVED', 'ESCALATED_TO_POLICE']:
            return Response(
                {'error': f'Report is already {report.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if investigation already exists
        if hasattr(report, 'investigation'):
            return Response(
                {'error': 'Investigation already started for this report.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create investigation
        investigation = Investigation.objects.create(
            report=report,
            admin=request.user,
            status='UNDER_INVESTIGATION',
            internal_notes=request.data.get('internal_notes', ''),
        )
        
        # Update report status
        report.status = 'UNDER_INVESTIGATION'
        report.save()
        
        # Log audit
        from apps.audit.services import AuditService
        audit_service = AuditService()
        audit_service.log_admin_action(
            admin=request.user,
            action='REPORT_INVESTIGATION_STARTED',
            entity_type='REPORT',
            entity_id=report.id,
            details={
                'report_reference': report.reference_number,
                'category': report.category,
            }
        )
        
        return Response({
            'message': f'Investigation started for report {report.reference_number}.',
            'investigation': InvestigationSerializer(investigation).data,
        }, status=status.HTTP_200_OK)


class AdminReportResolveView(APIView):
    """
    POST /api/admin/reports/{id}/resolve/
    Resolve a report with a decision (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def post(self, request, report_id):
        decision = request.data.get('decision')
        decision_notes = request.data.get('decision_notes', '')
        
        if not decision:
            return Response(
                {'error': 'Decision is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if report is under investigation
        if report.status != 'UNDER_INVESTIGATION':
            return Response(
                {'error': 'Report must be under investigation to resolve.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if investigation exists
        if not hasattr(report, 'investigation'):
            return Response(
                {'error': 'No investigation found for this report.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Complete investigation
        investigation = report.investigation
        investigation.complete(decision, decision_notes)
        
        # Log audit
        from apps.audit.services import AuditService
        audit_service = AuditService()
        audit_service.log_admin_action(
            admin=request.user,
            action='REPORT_RESOLVED',
            entity_type='REPORT',
            entity_id=report.id,
            details={
                'report_reference': report.reference_number,
                'decision': decision,
                'notes': decision_notes,
            }
        )
        
        return Response({
            'message': f'Report {report.reference_number} has been resolved.',
            'report': ReportDetailSerializer(report).data,
        }, status=status.HTTP_200_OK)


class AdminReportEvidenceView(APIView):
    """
    GET /api/admin/reports/{id}/evidence/
    Get evidence for a report (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        evidence = ReportEvidence.objects.filter(report=report).order_by('-uploaded_at')
        
        return Response({
            'report_id': report.id,
            'reference_number': report.reference_number,
            'count': len(evidence),
            'results': ReportEvidenceSerializer(evidence, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminReportStatsView(APIView):
    """
    GET /api/admin/reports/stats/
    Get report statistics (Admin only).
    """
    permission_classes = [IsAuthenticated, IsActiveUser, IsAdmin]
    
    def get(self, request):
        from django.db.models import Count
        
        # Status distribution
        status_stats = Report.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Category distribution
        category_stats = Report.objects.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Total counts
        total = Report.objects.count()
        pending = Report.objects.filter(status='PENDING').count()
        under_investigation = Report.objects.filter(status='UNDER_INVESTIGATION').count()
        resolved = Report.objects.filter(status='RESOLVED').count()
        escalated = Report.objects.filter(status='ESCALATED_TO_POLICE').count()
        
        # Recent reports
        recent = Report.objects.select_related(
            'reporter', 'reported_user'
        ).order_by('-submitted_at')[:5]
        
        return Response({
            'total': total,
            'pending': pending,
            'under_investigation': under_investigation,
            'resolved': resolved,
            'escalated_to_police': escalated,
            'by_status': list(status_stats),
            'by_category': list(category_stats),
            'recent': ReportListSerializer(recent, many=True).data,
        }, status=status.HTTP_200_OK)
