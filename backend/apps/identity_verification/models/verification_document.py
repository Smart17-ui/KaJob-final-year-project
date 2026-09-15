# apps/identity_verification/models/verification_document.py

from django.db import models
from apps.common.constants import DocumentType


def verification_doc_path(instance, filename):
    """
    Store documents as:
      media/verification_docs/<user_id>/<verification_id>/<document_type>_<filename>
    """
    return (
        f"verification_docs/"
        f"{instance.verification.user_id}/"
        f"{instance.verification_id}/"
        f"{instance.document_type}_{filename}"
    )


class VerificationDocument(models.Model):
    """
    Stores uploaded verification documents.
    """
    verification = models.ForeignKey(
        'IdentityVerification',
        on_delete=models.CASCADE,
        related_name='documents'
    )

    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.CHOICES
    )

    # ✅ REAL file now (not a string path)
    file = models.FileField(
        upload_to=verification_doc_path,
        null=True,
        blank=True,
    )

    # Keep these as metadata
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'verification_documents'
        ordering = ['document_type']
        verbose_name = 'Verification Document'
        verbose_name_plural = 'Verification Documents'
        indexes = [
            models.Index(fields=['verification', 'document_type']),
        ]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.file_name}"
