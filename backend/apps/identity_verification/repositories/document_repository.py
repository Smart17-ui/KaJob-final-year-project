# apps/identity_verification/repositories/document_repository.py

from typing import Optional, List
from apps.common.repositories import BaseRepository


class DocumentRepository(BaseRepository):
    """
    Repository for VerificationDocument model operations.
    """
    
    def __init__(self):
        # ✅ Lazy import to avoid circular import
        from apps.identity_verification.models import VerificationDocument
        super().__init__(VerificationDocument)
    
    def get_by_verification_id(self, verification_id: int) -> List[object]:
        """Get all documents for a verification"""
        return self.filter(verification_id=verification_id)
    
    def get_by_type(self, verification_id: int, document_type: str) -> Optional[object]:
        """Get document by type for a verification"""
        return self.filter(
            verification_id=verification_id,
            document_type=document_type
        ).first()
    
    def get_documents_by_user(self, user_id: int) -> List[object]:
        """Get all documents submitted by a user"""
        return self.filter(
            verification__user_id=user_id
        ).order_by('-uploaded_at')
    
    def bulk_create_documents(self, verification_id: int, documents: List[dict]) -> List[object]:
        """Bulk create documents for a verification"""
        document_objs = []
        for doc in documents:
            document_objs.append(
                self.model_class(
                    verification_id=verification_id,
                    document_type=doc['document_type'],
                    file_path=doc['file_path'],
                    file_name=doc['file_name'],
                    file_size=doc.get('file_size'),
                    mime_type=doc.get('mime_type'),
                )
            )
        return self.bulk_create(document_objs)
    
    def get_by_verification_and_type(self, verification_id: int, document_type: str) -> Optional[object]:
        """Get a document by verification ID and document type"""
        return self.filter(
            verification_id=verification_id,
            document_type=document_type
        ).first()
