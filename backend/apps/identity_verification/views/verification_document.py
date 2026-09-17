# apps/identity_verification/views/verification_document.py

from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.identity_verification.models import (
    IdentityVerification,
    VerificationDocument,
)
from apps.identity_verification.serializers.verification_serializer import (
    DocumentSerializer,
)
from apps.common.constants import VerificationStatus


class VerificationDocumentUploadView(APIView):
    """
    POST /api/verification/documents/upload/

    multipart/form-data:
      document_type = "NRC" | "PASSPORT" | ...
      file = <binary>
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        document_type = request.data.get("document_type")
        uploaded_file = request.FILES.get("file")

        if not document_type:
            return Response(
                {"error": "document_type is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file:
            return Response(
                {"error": "file is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification, _ = IdentityVerification.objects.get_or_create(
            user=request.user,
            defaults={
                "document_type": document_type,
                "document_number": "",
                "verification_status": VerificationStatus.PENDING,
            },
        )

        # Replace previous doc of same type
        existing = verification.documents.filter(
            document_type=document_type
        ).first()
        if existing:
            existing.delete()

        serializer = DocumentSerializer(
            data={
                "verification": verification.id,
                "document_type": document_type,
                "file": uploaded_file,
            },
            context={"request": request},
        )

        if serializer.is_valid():
            doc = serializer.save()

            if verification.verification_status == VerificationStatus.NOT_SUBMITTED:
                verification.verification_status = VerificationStatus.PENDING
                verification.save(update_fields=["verification_status"])

            return Response(
                {
                    "message": "Document uploaded successfully.",
                    "document": DocumentSerializer(
                        doc, context={"request": request}
                    ).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
