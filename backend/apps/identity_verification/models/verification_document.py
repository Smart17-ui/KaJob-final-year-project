from django.db import models
from apps.common.constants import DocumentType, FileType


class VerificationDocument(models.Model):
    """
    Stores uploaded verification documents.
    """
    verification = models.ForeignKey(
        'IdentityVerification',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    # Document Information
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.CHOICES
    )
    file_path = models.CharField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    
    # Timestamps
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
