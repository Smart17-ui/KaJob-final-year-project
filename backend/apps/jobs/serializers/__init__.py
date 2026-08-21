# apps/jobs/serializers/__init__.py

from .job_serializer import (
    JobSerializer,
    JobCreateSerializer,
    JobUpdateSerializer,
    JobListSerializer,
    WorkerJobDetailSerializer,  # 🆕 Add this import
)
from .job_application_serializer import (
    JobApplicationSerializer,
    JobApplicationCreateSerializer,
    JobApplicationListSerializer,
)
from .job_assignment_serializer import (
    JobAssignmentSerializer,
    JobAssignmentCreateSerializer,
)

__all__ = [
    # Job serializers
    'JobSerializer',
    'JobCreateSerializer',
    'JobUpdateSerializer',
    'JobListSerializer',
    'WorkerJobDetailSerializer',  # 🆕 Add this to __all__
    
    # Job Application serializers
    'JobApplicationSerializer',
    'JobApplicationCreateSerializer',
    'JobApplicationListSerializer',
    
    # Job Assignment serializers
    'JobAssignmentSerializer',
    'JobAssignmentCreateSerializer',
]
