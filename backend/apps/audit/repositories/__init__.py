# apps/audit/repositories/__init__.py

from .audit_repository import AuditRepository
from .disciplinary_repository import DisciplinaryRepository

__all__ = ['AuditRepository', 'DisciplinaryRepository']
