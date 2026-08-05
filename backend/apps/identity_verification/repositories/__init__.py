# apps/identity_verification/repositories/__init__.py
from .verification_repository import VerificationRepository
from .document_repository import DocumentRepository

__all__ = [
    'VerificationRepository',
    'DocumentRepository',
]
