# apps/jobs/serializers/__init__.py

from .job_serializer import (
    JobSerializer,
    JobCreateSerializer,
    JobListSerializer,
    JobDetailSerializer,
    JobUpdateSerializer,
    WorkerJobDetailSerializer,
)
from .job_application_serializer import (
    JobApplicationSerializer,
    JobApplicationCreateSerializer,
    JobApplicationListSerializer,
    ClientApplicationSerializer,
)
from .job_assignment_serializer import (
    JobAssignmentSerializer,
    JobAssignmentCreateSerializer,
    JobAssignmentListSerializer,        # ✅ Now available
    JobAssignmentDetailSerializer,
    JobAssignmentUpdateSerializer,
    JobAssignmentStatusInfoSerializer,
)

__all__ = [
    # Job Serializers
    'JobSerializer',
    'JobCreateSerializer',
    'JobListSerializer',
    'JobDetailSerializer',
    'JobUpdateSerializer',
    'WorkerJobDetailSerializer',
    
    # Job Application Serializers
    'JobApplicationSerializer',
    'JobApplicationCreateSerializer',
    'JobApplicationListSerializer',
    'ClientApplicationSerializer',
    
    # Job Assignment Serializers
    'JobAssignmentSerializer',
    'JobAssignmentCreateSerializer',
    'JobAssignmentListSerializer',      # ✅ Now available
    'JobAssignmentDetailSerializer',
    'JobAssignmentUpdateSerializer',
    'JobAssignmentStatusInfoSerializer',
]
