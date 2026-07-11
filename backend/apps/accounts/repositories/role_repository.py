from typing import Optional, List
from apps.accounts.models import Role
from apps.common.repositories import BaseRepository
from apps.common.constants import RoleType


class RoleRepository(BaseRepository[Role]):
    """
    Repository for Role model operations.
    """
    
    def __init__(self):
        super().__init__(Role)
    
    # ============================================
    # FIND BY NAME
    # ============================================
    
    def get_by_name(self, name: str) -> Optional[Role]:
        """Get role by name"""
        return self.get_by_field('name', name)
    
    def get_admin_role(self) -> Optional[Role]:
        """Get admin role"""
        return self.get_by_name(RoleType.ADMIN)
    
    def get_worker_role(self) -> Optional[Role]:
        """Get worker role"""
        return self.get_by_name(RoleType.WORKER)
    
    def get_client_role(self) -> Optional[Role]:
        """Get client role"""
        return self.get_by_name(RoleType.CLIENT)
    
    # ============================================
    # GET ALL
    # ============================================
    
    def get_all_roles(self) -> List[Role]:
        """Get all roles"""
        return self.get_all()
    
    def get_role_names(self) -> List[str]:
        """Get all role names"""
        return [role.name for role in self.get_all_roles()]
    
    # ============================================
    # PERMISSION CHECKS
    # ============================================
    
    def get_role_permissions(self, role_name: str) -> List[str]:
        """Get all permission codenames for a role"""
        role = self.get_by_name(role_name)
        if not role:
            return []
        return [p.codename for p in role.role_permissions.all()]
    
    def has_permission(self, role_name: str, permission_codename: str) -> bool:
        """Check if a role has a specific permission"""
        role = self.get_by_name(role_name)
        if not role:
            return False
        return role.role_permissions.filter(
            permission__codename=permission_codename
        ).exists()
    
    # ============================================
    # VALIDATION
    # ============================================
    
    def role_exists(self, role_name: str) -> bool:
        """Check if role exists"""
        return self.exists(name=role_name)
    
    def is_valid_role(self, role_name: str) -> bool:
        """Check if role is valid (ADMIN, WORKER, or CLIENT)"""
        return role_name in [RoleType.ADMIN, RoleType.WORKER, RoleType.CLIENT]
