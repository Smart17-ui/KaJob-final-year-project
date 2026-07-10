from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


class IsAuthenticated(BasePermission):
    """Check if user is authenticated."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsActiveUser(BasePermission):
    """Check if user account is active."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active


class IsVerifiedUser(BasePermission):
    """Check if user is verified."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified


class IsAdmin(BasePermission):
    """Check if user is admin."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsWorker(BasePermission):
    """Check if user is worker."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_worker


class IsClient(BasePermission):
    """Check if user is client."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_client


class HasPermission(BasePermission):
    """
    Check if user has a specific permission.
    """
    
    def __init__(self, permission_codename):
        self.permission_codename = permission_codename
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.has_permission(self.permission_codename):
            return True
        
        raise PermissionDenied(
            f"You do not have permission to perform this action. "
            f"Required: {self.permission_codename}"
        )


class HasAnyPermission(BasePermission):
    """
    Check if user has any of the specified permissions.
    """
    
    def __init__(self, permission_codenames):
        self.permission_codenames = permission_codenames
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        for codename in self.permission_codenames:
            if request.user.has_permission(codename):
                return True
        
        raise PermissionDenied(
            f"You need one of these permissions: {', '.join(self.permission_codenames)}"
        )
