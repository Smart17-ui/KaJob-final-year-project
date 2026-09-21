# apps/jobs/views/job_application_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction
import logging

from apps.jobs.services import JobApplicationService
from apps.jobs.serializers import (
    JobApplicationSerializer,
    JobApplicationCreateSerializer,
    JobApplicationListSerializer,
    ClientApplicationSerializer,
)
from apps.common.permissions import (
    IsWorker,
    IsClient,
    IsActiveUser,
    IsVerifiedUser,
)
from apps.common.exceptions import (
    BusinessRuleViolation,
    ResourceNotFound,
)
from apps.jobs.models import Job, JobApplication, JobAssignment
from apps.common.constants import (
    ApplicationStatus,
    AssignmentStatus,
    JobStatus,
)


# Service instance
job_application_service = JobApplicationService()
logger = logging.getLogger(__name__)


class ApplyForJobView(APIView):
    """
    POST /api/jobs/{job_id}/apply/

    Apply for a job.

    Only verified workers can apply.
    Worker cannot apply to their own job.
    Worker must be within 1km of the job location.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsWorker,
        IsVerifiedUser,
    ]

    def post(self, request, job_id):
        serializer = JobApplicationCreateSerializer(
            data={
                "job_id": job_id
            }
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            result = job_application_service.apply_for_job(
                request.user,
                job_id
            )

            return Response(
                {
                    "message": result["message"],
                    "application": JobApplicationSerializer(
                        result["application"]
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except BusinessRuleViolation as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ResourceNotFound as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_404_NOT_FOUND,
            )


class JobApplicationsView(APIView):
    """
    GET /api/jobs/{job_id}/applications/

    Get all applications for a job.

    Only the client who posted the job can view
    the applications.

    The response includes worker profile details
    so the client can view information about each
    applicant.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsClient,
        IsVerifiedUser,
    ]

    def get(self, request, job_id):
        try:
            applications = (
                job_application_service.get_applications_for_job(
                    request.user,
                    job_id
                )
            )

            return Response(
                {
                    "count": len(applications),
                    "results": ClientApplicationSerializer(
                        applications,
                        many=True
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        except (
            BusinessRuleViolation,
            ResourceNotFound,
        ) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class PendingApplicationsView(APIView):
    """
    GET /api/jobs/{job_id}/applications/pending/

    Get pending applications for a job.

    Only the client who posted the job can view
    pending applications.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsClient,
    ]

    def get(self, request, job_id):
        try:
            applications = (
                job_application_service
                .get_pending_applications_for_job(
                    request.user,
                    job_id
                )
            )

            return Response(
                {
                    "count": len(applications),
                    "results": JobApplicationListSerializer(
                        applications,
                        many=True
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        except (
            BusinessRuleViolation,
            ResourceNotFound,
        ) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# ACCEPT / REJECT APPLICATION
# ============================================================


class UpdateApplicationStatusView(APIView):
    """
    PATCH /api/applications/{id}/status/

    Update the status of a job application.

    When status is "accept":

    1. Application becomes ACCEPTED.
    2. Worker is assigned to the job.
    3. Job status becomes ASSIGNED.
    4. All other pending applications are REJECTED.
    5. Worker becomes BUSY.
    6. Worker is notified via "Worker Assigned" email.

    The operation is atomic. The job row is locked with
    select_for_update() to prevent two concurrent accepts
    from both passing the OPEN-status check.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsClient,
        IsVerifiedUser,
    ]

    def patch(self, request, application_id):
        status_action = request.data.get(
            "status"
        )

        if status_action not in [
            "accept",
            "reject",
        ]:
            return Response(
                {
                    "error": (
                        'Status must be "accept" or "reject"'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if status_action == "accept":
                result = self._accept_application_atomic(
                    request.user,
                    application_id
                )
            else:
                result = self._reject_application(
                    request.user,
                    application_id
                )

            return Response(
                result,
                status=status.HTTP_200_OK,
            )

        except (
            BusinessRuleViolation,
            ResourceNotFound,
        ) as e:
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    @transaction.atomic
    def _accept_application_atomic(
        self,
        client,
        application_id
    ):
        """
        Accept an application and assign worker atomically.

        Uses select_for_update() on the job row so any concurrent
        accept on the same job blocks until this transaction commits,
        then sees the fresh ASSIGNED status and is rejected.
        """

        # 1. Load the application (locked via the PENDING filter)
        try:
            application = (
                JobApplication.objects
                .select_related("worker")
                .get(
                    id=application_id,
                    status=ApplicationStatus.PENDING
                )
            )
        except JobApplication.DoesNotExist:
            raise ResourceNotFound(
                "Application not found or already processed."
            )

        # 2. Lock the JOB row — the critical guard
        try:
            job = (
                Job.objects
                .select_for_update()
                .get(
                    id=application.job_id,
                    deleted_at__isnull=True
                )
            )
        except Job.DoesNotExist:
            raise ResourceNotFound("Job not found.")

        worker = application.worker

        # Validate: Client owns the job
        if job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to accept this application."
            )

        # Validate: Job is open (against the freshly-locked row)
        if job.status != JobStatus.OPEN:
            raise BusinessRuleViolation(
                f"Cannot accept application for a '{job.status}' job."
            )

        # Validate: Worker is not already assigned
        existing_active = (
            JobAssignment.objects.filter(
                worker_id=worker.id,
                status=AssignmentStatus.ACTIVE
            ).exists()
        )

        if existing_active:
            raise BusinessRuleViolation(
                "Worker is already assigned to another job."
            )

        # Create assignment
        assignment = JobAssignment.objects.create(
            job=job,
            worker=worker,
            assigned_by=client,
            status=AssignmentStatus.ACTIVE
        )

        # Update application
        application.status = ApplicationStatus.ACCEPTED
        application.save()

        # Update job
        job.status = JobStatus.ASSIGNED
        job.save()

        # Reject all other pending applications
        rejected_count = (
            JobApplication.objects.filter(
                job=job,
                status=ApplicationStatus.PENDING
            )
            .exclude(
                id=application_id
            )
            .update(
                status=ApplicationStatus.REJECTED
            )
        )

        # Update worker availability
        try:
            worker_profile = worker.worker_profile
            worker_profile.availability_status = "BUSY"
            worker_profile.save()
        except Exception:
            pass

        # Notify the worker — single notification when they get the job
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_job_assigned(
                worker=worker,
                job=job,
            )
            logger.info(
                f"[notify] job_assigned sent to worker {worker.id}"
            )
        except Exception as e:
            logger.error(
                f"[notify] _accept_application_atomic failed: {e}"
            )

        return {
            "message": (
                "Application accepted and worker "
                "assigned successfully!"
            ),

            "application": JobApplicationSerializer(
                application
            ).data,

            "assignment": {
                "id": assignment.id,
                "job": assignment.job_id,
                "worker": assignment.worker_id,
                "status": assignment.status,
                "status_display": dict(
                    AssignmentStatus.CHOICES
                ).get(
                    assignment.status
                ),
                "assigned_at": assignment.assigned_at,
            },

            "job": {
                "id": job.id,
                "status": job.status,
                "status_display": dict(
                    JobStatus.CHOICES
                ).get(
                    job.status
                ),
            },

            "rejected_applications": rejected_count,
        }

    @transaction.atomic
    def _reject_application(
        self,
        client,
        application_id
    ):
        """
        Reject an application.
        """

        try:
            application = (
                JobApplication.objects
                .select_related("job")
                .get(
                    id=application_id,
                    status=ApplicationStatus.PENDING
                )
            )
        except JobApplication.DoesNotExist:
            raise ResourceNotFound(
                "Application not found or already processed."
            )

        # Validate: Client owns the job
        if application.job.client_id != client.id:
            raise BusinessRuleViolation(
                "You don't have permission to reject this application."
            )

        application.status = ApplicationStatus.REJECTED
        application.save()

        # Notify the worker their application was rejected
        try:
            from apps.notifications.services import NotificationService
            NotificationService().notify_application_rejected(
                worker=application.worker,
                job=application.job,
            )
            logger.info(
                f"[notify] application_rejected sent to worker "
                f"{application.worker.id}"
            )
        except Exception as e:
            logger.error(
                f"[notify] _reject_application failed: {e}"
            )

        return {
            "message": (
                "Application rejected successfully!"
            ),
            "application": JobApplicationSerializer(
                application
            ).data,
        }


class MyApplicationsView(APIView):
    """
    GET /api/my-applications/

    Get all applications made by the
    authenticated worker.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsWorker,
    ]

    def get(self, request):
        applications = (
            job_application_service
            .get_applications_by_worker(
                request.user.id
            )
        )

        return Response(
            {
                "count": len(applications),
                "results": JobApplicationListSerializer(
                    applications,
                    many=True
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class MyJobApplicationsView(APIView):
    """
    GET /api/my-job-applications/

    Get all applications for jobs posted by
    the authenticated client.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsClient,
    ]

    def get(self, request):
        applications = (
            job_application_service
            .get_applications_by_client(
                request.user.id
            )
        )

        return Response(
            {
                "count": len(applications),
                "results": JobApplicationListSerializer(
                    applications,
                    many=True
                ).data,
            },
            status=status.HTTP_200_OK,
        )


class WithdrawApplicationView(APIView):
    """
    POST /api/jobs/applications/{id}/withdraw/

    Worker withdraws their own PENDING application.
    Once accepted, they must use /api/jobs/{job_id}/withdraw/ instead.
    """
    permission_classes = [
        IsAuthenticated, IsActiveUser, IsWorker, IsVerifiedUser,
    ]

    def post(self, request, application_id):
        try:
            result = job_application_service.withdraw_application(
                request.user, application_id
            )
            return Response({
                'message': result['message'],
                'application': result['application'].id,
                'status': result['application'].status,
            }, status=status.HTTP_200_OK)
        except (BusinessRuleViolation, ResourceNotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# CONSOLIDATED CLIENT APPLICATIONS ENDPOINT
# ============================================================


class ClientApplicationsView(APIView):
    """
    GET /api/jobs/applications/client/

    Get all applications for jobs owned by the
    authenticated client.

    Includes worker profile details for each
    application.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsClient,
        IsVerifiedUser,
    ]

    def get(self, request):
        from apps.jobs.models import Job

        # Get all jobs owned by this client
        jobs = (
            Job.objects.filter(
                client_id=request.user.id,
                deleted_at__isnull=True
            )
            .values_list(
                "id",
                flat=True
            )
        )

        # Get all applications for these jobs
        applications = (
            JobApplication.objects.filter(
                job_id__in=jobs
            )
            .select_related(
                "job",
                "worker",
                "worker__worker_profile"
            )
            .order_by(
                "-applied_at"
            )
        )

        # Use the enhanced client serializer
        serializer = ClientApplicationSerializer(
            applications,
            many=True
        )

        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
