from django.db import transaction
from django.utils import timezone
from typing import Dict, Any, Optional
from apps.accounts.repositories import (
    UserRepository,
    RoleRepository,
    ProfileRepository,
    WorkerProfileRepository,
    ClientProfileRepository,
)
from apps.accounts.services.token_service import TokenService
from apps.audit.models import AuditLog
from apps.common.constants import RoleType, UserAccountStatus
from apps.common.exceptions import BusinessRuleViolation
from apps.common.services import EmailService
from apps.accounts.models import User


class AuthService:
    """
    Handles ALL authentication operations.
    Single Responsibility: Manage authentication (register, login, password, verification).
    """
    
    def __init__(self):
        # Repositories
        self.user_repo = UserRepository()
        self.role_repo = RoleRepository()
        self.profile_repo = ProfileRepository()
        self.worker_repo = WorkerProfileRepository()
        self.client_repo = ClientProfileRepository()
        
        # Services
        self.email_service = EmailService()
        self.token_service = TokenService()
    
    # ============================================
    # REGISTRATION (Role Player Pattern)
    # ============================================
    
    @transaction.atomic
    def register_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user OR add a role to existing user.
        Implements the Role Player Pattern - one user can have multiple roles.
        """
        # Normalize email - case insensitive
        data['email'] = data['email'].lower().strip()
        
        # Check if user already exists
        existing_user = self.user_repo.get_by_email(data['email'])
        
        # If user exists, add the new role (Role Player Pattern)
        if existing_user:
            return self._add_role_to_existing_user(existing_user, data)
        
        # ============================================
        # NEW USER REGISTRATION
        # ============================================
        
        # Validate phone uniqueness
        if self.user_repo.phone_exists(data['phone_number']):
            raise BusinessRuleViolation("Phone number is already registered.")
        
        # Get role
        role = self.role_repo.get_by_name(data['role'])
        if not role:
            raise BusinessRuleViolation(f"Role '{data['role']}' does not exist.")
        
        # Create user
        user = self.user_repo.create(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone_number=data['phone_number'],
            account_status=UserAccountStatus.ACTIVE,
            is_verified=False,
        )
        
        # Set password
        user.set_password(data['password'])
        self.user_repo.update(user, password_hash=user.password_hash)
        
        # Add role
        user.add_role(role)
        
        # Create profiles
        self.profile_repo.create(user=user, bio='', address='')
        
        if role.name == RoleType.WORKER:
            self.worker_repo.create(user=user)
        elif role.name == RoleType.CLIENT:
            self.client_repo.create(user=user)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='USER_REGISTERED',
            entity_type='USER',
            entity_id=user.id,
            details={'role': role.name},
        )
        
        # Generate verification token
        verification_token = self.token_service.generate_verification_token(user)
        
        # Send verification email
        self.email_service.send_verification_email(user, verification_token)
        
        # Generate access tokens
        tokens = self.token_service.generate_tokens(user)
        
        return {
            'user': user,
            'tokens': tokens,
            'message': 'Registration successful! Please check your email to verify your account.'
        }
    
    # ============================================
    # PRIVATE METHODS
    # ============================================
    
    def _add_role_to_existing_user(self, user: User, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new role to an existing user (Role Player Pattern).
        """
        # Get the role
        role = self.role_repo.get_by_name(data['role'])
        if not role:
            raise BusinessRuleViolation(f"Role '{data['role']}' does not exist.")
        
        # Check if user already has this role
        if user.has_role(data['role']):
            raise BusinessRuleViolation(f"User already has the '{data['role']}' role.")
        
        # Add the new role to the user
        user.add_role(role)
        
        # Create role-specific profile if needed
        if role.name == RoleType.WORKER and not hasattr(user, 'worker_profile'):
            self.worker_repo.create(user=user)
        elif role.name == RoleType.CLIENT and not hasattr(user, 'client_profile'):
            self.client_repo.create(user=user)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='ROLE_ADDED',
            entity_type='USER',
            entity_id=user.id,
            details={'role': role.name},
        )
        
        # Generate tokens
        tokens = self.token_service.generate_tokens(user)
        
        # Determine the message based on role
        if role.name == RoleType.WORKER:
            message = "Worker role added successfully! You can now apply for jobs."
        elif role.name == RoleType.CLIENT:
            message = "Client role added successfully! You can now post jobs."
        else:
            message = f"{role.name} role added successfully!"
        
        return {
            'user': user,
            'tokens': tokens,
            'message': message
        }
    
    # ============================================
    # LOGIN / LOGOUT / REFRESH (WITH ROLE SELECTION)
    # ============================================
    
    def login_user(self, email: str, password: str, role: str = None, request=None) -> Dict[str, Any]:
        """
        Authenticate user and generate tokens with role selection.
        
        Args:
            email: User's email
            password: User's password
            role: Optional role to login as (WORKER or CLIENT)
            request: HTTP request (for IP logging)
        
        Returns:
            Dict with user, tokens, selected_role, and available_roles
        """
        # Normalize email - case insensitive
        email = email.lower().strip()
        
        # Get user by email
        user = self.user_repo.get_by_email(email)
        if not user:
            raise BusinessRuleViolation("Invalid email or password.")
        
        # Check if user can login
        can_login, error_message = self.user_repo.can_login(user)
        if not can_login:
            raise BusinessRuleViolation(error_message)
        
        # Check password
        if not user.check_password(password):
            raise BusinessRuleViolation("Invalid email or password.")
        
        # Handle role selection
        user_roles = user.get_roles_names()
        
        if not user_roles:
            raise BusinessRuleViolation("User has no roles assigned.")
        
        # If role is provided, validate it
        if role:
            if role not in user_roles:
                raise BusinessRuleViolation(
                    f"User does not have the '{role}' role. Available roles: {', '.join(user_roles)}"
                )
            selected_role = role
        else:
            # If no role provided, use the first role
            selected_role = user_roles[0]
        
        # Update last login
        self.user_repo.update_last_login(user)
        
        # Audit log
        AuditLog.objects.create(
            user=user,
            action='USER_LOGIN',
            entity_type='USER',
            entity_id=user.id,
            details={
                'ip': request.META.get('REMOTE_ADDR') if request else None,
                'user_agent': request.META.get('HTTP_USER_AGENT') if request else None,
                'login_as': selected_role,
            },
        )
        
        # Generate tokens
        tokens = self.token_service.generate_tokens(user)
        
        return {
            'user': user,
            'tokens': tokens,
            'selected_role': selected_role,
            'available_roles': user_roles,
        }
    
    def logout_user(self, refresh_token: str) -> bool:
        """Logout by blacklisting refresh token."""
        return self.token_service.blacklist_token(refresh_token)
    
    def refresh_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Refresh access token."""
        return self.token_service.refresh_access_token(refresh_token)
    
    # ============================================
    # PASSWORD MANAGEMENT
    # ============================================
    
    def change_password(self, user, old_password: str, new_password: str) -> bool:
        """Change user password."""
        if not user.check_password(old_password):
            raise BusinessRuleViolation("Current password is incorrect.")
        
        user.set_password(new_password)
        self.user_repo.update(user, password_hash=user.password_hash)
        
        AuditLog.objects.create(
            user=user,
            action='PASSWORD_CHANGED',
            entity_type='USER',
            entity_id=user.id,
        )
        
        return True
    
    def forgot_password(self, email: str) -> bool:
        """Send password reset email."""
        # Normalize email - case insensitive
        email = email.lower().strip()
        
        user = self.user_repo.get_by_email(email)
        if not user:
            # Security: Don't reveal if email exists
            return True
        
        reset_token = self.token_service.generate_reset_token(user)
        self.email_service.send_password_reset_email(user, reset_token)
        
        return True
    
    def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token."""
        user = self.token_service.get_user_from_reset_token(token)
        if not user:
            raise BusinessRuleViolation("Invalid or expired token.")
        
        user.set_password(new_password)
        self.user_repo.update(user, password_hash=user.password_hash)
        
        AuditLog.objects.create(
            user=user,
            action='PASSWORD_RESET',
            entity_type='USER',
            entity_id=user.id,
        )
        
        return True
    
    # ============================================
    # EMAIL VERIFICATION
    # ============================================
    
    def verify_email(self, token: str) -> bool:
        """Verify user's email address."""
        user = self.token_service.get_user_from_verification_token(token)
        if not user:
            raise BusinessRuleViolation("Invalid or expired token.")
        
        if user.is_verified:
            return True
        
        # Mark as verified
        self.user_repo.verify_user(user)
        
        AuditLog.objects.create(
            user=user,
            action='EMAIL_VERIFIED',
            entity_type='USER',
            entity_id=user.id,
        )
        
        # Send welcome email
        self.email_service.send_welcome_email(user)
        
        return True
    
    def resend_verification_email(self, user) -> bool:
        """Resend verification email."""
        if user.is_verified:
            raise BusinessRuleViolation("Email is already verified.")
        
        verification_token = self.token_service.generate_verification_token(user)
        self.email_service.send_verification_email(user, verification_token)
        
        return True
    
    # ============================================
    # USER LOOKUP
    # ============================================
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.user_repo.get_by_id(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        # Normalize email - case insensitive
        email = email.lower().strip()
        return self.user_repo.get_by_email(email)
    
    def get_current_user(self, user_id: int) -> Optional[User]:
        """Get current user by ID."""
        return self.user_repo.get_by_id(user_id)
