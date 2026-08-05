# apps/identity_verification/repositories/document_repository.py
from typing import Optional, List
from apps.identity_verification.models import VerificationDocument
from apps.common.repositories import BaseRepository


class DocumentRepository(BaseRepository[VerificationDocument]):
    """
    Repository for VerificationDocument model operations.
    """
    
    def __init__(self):
        super().__init__(VerificationDocument)
    
    def get_by_verification_id(self, verification_id: int) -> List[VerificationDocument]:
        """Get all documents for a verification"""
        return self.filter(verification_id=verification_id)
    
    def get_by_type(self, verification_id: int, document_type: str) -> Optional[VerificationDocument]:
        """Get document by type for a verification"""
        return self.get_by_field('verification_id', verification_id).filter(
            document_type=document_type
        ).first()
    
    def get_documents_by_user(self, user_id: int) -> List[VerificationDocument]:
        """Get all documents submitted by a user"""
        return self.filter(
            verification__user_id=user_id
        ).order_by('-uploaded_at')
    
    def bulk_create_documents(self, verification_id: int, documents: List[dict]) -> List[VerificationDocument]:
        """Bulk create documents for a verification"""
        document_objs = []
        for doc in documents:
            document_objs.append(
                VerificationDocument(
                    verification_id=verification_id,
                    document_type=doc['document_type'],
                    file_path=doc['file_path'],
                    file_name=doc['file_name'],
                    file_size=doc.get('file_size'),
                    mime_type=doc.get('mime_type'),
                )
            )
        return self.bulk_create(document_objs)
