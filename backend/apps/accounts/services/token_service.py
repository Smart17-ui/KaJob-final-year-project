# apps/accounts/services/token_service.py

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from typing import Optional, Dict, Any, List
from django.contrib.auth import get_user_model
from django.conf import settings
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class TokenService:
    """
    Service for managing JWT tokens.
    Single Responsibility: Token generation, validation, refresh, blacklist.
    """
    
    # ============================================
    # TOKEN GENERATION (UPDATED WITH ROLES)
    # ============================================
    
    @staticmethod
    def generate_tokens(user, selected_role: str = None) -> Dict[str, str]:
        """
        Generate access and refresh tokens for a user.
        
        Args:
            user: User instance
            selected_role: Optional role to set as current role
        
        Returns:
            Dict containing access and refresh tokens
        """
        refresh = RefreshToken.for_user(user)
        
        # Get user's roles
        user_roles = user.get_roles_names() if hasattr(user, 'get_roles_names') else []
        
        # Add custom claims
        refresh['user_id'] = user.id
        refresh['email'] = user.email
        refresh['roles'] = user_roles
        
        # ✅ Add selected role (for role switching)
        if selected_role:
            refresh['current_role'] = selected_role
        else:
            refresh['current_role'] = user_roles[0] if user_roles else None
        
        # ✅ Add is_verified flag for quick access
        refresh['is_verified'] = user.is_verified
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    
    @staticmethod
    def generate_access_token(user, selected_role: str = None) -> str:
        """
        Generate only an access token with role context.
        """
        refresh = RefreshToken.for_user(user)
        
        user_roles = user.get_roles_names() if hasattr(user, 'get_roles_names') else []
        
        refresh['user_id'] = user.id
        refresh['email'] = user.email
        refresh['roles'] = user_roles
        refresh['current_role'] = selected_role or (user_roles[0] if user_roles else None)
        refresh['is_verified'] = user.is_verified
        
        return str(refresh.access_token)
    
    @staticmethod
    def generate_refresh_token(user) -> str:
        """
        Generate only a refresh token.
        """
        refresh = RefreshToken.for_user(user)
        return str(refresh)
    
    # ============================================
    # TOKEN VALIDATION (UPDATED WITH ROLES)
    # ============================================
    
    @staticmethod
    def validate_access_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Validate an access token and return its payload.
        
        Args:
            token: Access token string
        
        Returns:
            Token payload if valid, None otherwise
        """
        try:
            access_token = AccessToken(token)
            return {
                'user_id': access_token.get('user_id'),
                'email': access_token.get('email'),
                'roles': access_token.get('roles', []),
                'current_role': access_token.get('current_role'),
                'is_verified': access_token.get('is_verified', False),
                'exp': access_token.get('exp'),
                'iat': access_token.get('iat'),
            }
        except InvalidToken:
            logger.warning("Invalid access token provided")
            return None
        except Exception as e:
            logger.error(f"Error validating access token: {e}")
            return None
    
    @staticmethod
    def validate_refresh_token(token: str) -> bool:
        """
        Validate a refresh token.
        
        Args:
            token: Refresh token string
        
        Returns:
            True if valid, False otherwise
        """
        try:
            RefreshToken(token)
            return True
        except TokenError:
            logger.warning("Invalid refresh token provided")
            return False
        except Exception as e:
            logger.error(f"Error validating refresh token: {e}")
            return False
    
    @staticmethod
    def get_user_from_access_token(token: str) -> Optional[User]:
        """
        Get user from access token.
        
        Args:
            token: Access token string
        
        Returns:
            User instance if valid, None otherwise
        """
        payload = TokenService.validate_access_token(token)
        if not payload:
            return None
        
        try:
            return User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            logger.warning(f"User {payload['user_id']} not found for token")
            return None
    
    @staticmethod
    def get_current_role_from_token(token: str) -> Optional[str]:
        """
        Get the current role from an access token.
        
        Args:
            token: Access token string
        
        Returns:
            Current role if present, None otherwise
        """
        payload = TokenService.validate_access_token(token)
        if not payload:
            return None
        return payload.get('current_role')
    
    # ============================================
    # TOKEN REFRESH
    # ============================================
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Get a new access token using a refresh token.
        
        Args:
            refresh_token: Refresh token string
        
        Returns:
            Dict with new access token if valid, None otherwise
        """
        try:
            refresh = RefreshToken(refresh_token)
            return {
                'access': str(refresh.access_token),
            }
        except TokenError:
            logger.warning("Invalid refresh token for refresh attempt")
            return None
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            return None
    
    # ============================================
    # TOKEN BLACKLIST
    # ============================================
    
    @staticmethod
    def blacklist_token(refresh_token: str) -> bool:
        """
        Blacklist a refresh token (logout).
        
        Args:
            refresh_token: Refresh token string
        
        Returns:
            True if blacklisted successfully, False otherwise
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("Token blacklisted successfully")
            return True
        except TokenError:
            logger.warning("Invalid token for blacklist attempt")
            return False
        except Exception as e:
            logger.error(f"Error blacklisting token: {e}")
            return False
    
    # ============================================
    # PHASE 2: EMAIL VERIFICATION TOKENS
    # ============================================
    
    @staticmethod
    def generate_email_verification_token(user) -> str:
        """
        Generate a token for email verification (Phase 2).
        
        Args:
            user: User instance
        
        Returns:
            JWT token string with email verification claim
        """
        token = AccessToken.for_user(user)
        
        token['verification_type'] = 'email'
        token['purpose'] = 'email_verification'
        token['expires_in'] = 86400  # 24 hours in seconds
        
        return str(token)
    
    @staticmethod
    def get_user_from_email_verification_token(token: str) -> Optional[User]:
        """
        Get user from email verification token.
        Validates that the token is specifically for email verification.
        
        Args:
            token: Email verification token string
        
        Returns:
            User instance if valid, None otherwise
        """
        try:
            access_token = AccessToken(token)
            
            if access_token.get('verification_type') != 'email':
                logger.warning("Token is not an email verification token")
                return None
            
            if access_token.get('purpose') != 'email_verification':
                logger.warning("Token purpose is not email verification")
                return None
            
            user_id = access_token.get('user_id')
            return User.objects.get(id=user_id)
            
        except InvalidToken:
            logger.warning("Invalid email verification token provided")
            return None
        except User.DoesNotExist:
            logger.warning(f"User not found for email verification token")
            return None
        except Exception as e:
            logger.error(f"Error validating email verification token: {e}")
            return None
    
    # ============================================
    # PHASE 1: PHONE OTP VERIFICATION
    # ============================================
    
    @staticmethod
    def generate_phone_otp(user) -> str:
        """
        Generate a 6-digit OTP for phone verification (Phase 1).
        
        Args:
            user: User instance
        
        Returns:
            6-digit OTP string
        """
        import random
        return f"{random.randint(100000, 999999)}"
    
    # ============================================
    # PHASE 3: DOCUMENT VERIFICATION TOKENS
    # ============================================
    
    @staticmethod
    def generate_document_upload_token(user) -> str:
        """
        Generate a token for document upload session.
        
        Args:
            user: User instance
        
        Returns:
            JWT token string with document upload claim
        """
        token = AccessToken.for_user(user)
        token['purpose'] = 'document_upload'
        token['expires_in'] = 3600  # 1 hour
        
        return str(token)
    
    @staticmethod
    def get_user_from_document_token(token: str) -> Optional[User]:
        """
        Get user from document upload token.
        
        Args:
            token: Document token string
        
        Returns:
            User instance if valid, None otherwise
        """
        try:
            access_token = AccessToken(token)
            
            if access_token.get('purpose') != 'document_upload':
                return None
            
            user_id = access_token.get('user_id')
            return User.objects.get(id=user_id)
            
        except Exception:
            return None
    
    # ============================================
    # PASSWORD RESET TOKENS
    # ============================================
    
    @staticmethod
    def generate_reset_token(user) -> str:
        """
        Generate a token for password reset.
        Uses JWT with a short expiry (1 hour).
        """
        token = AccessToken.for_user(user)
        token['purpose'] = 'password_reset'
        return str(token)
    
    @staticmethod
    def get_user_from_reset_token(token: str) -> Optional[User]:
        """
        Get user from reset token.
        """
        try:
            access_token = AccessToken(token)
            
            if access_token.get('purpose') != 'password_reset':
                return None
            
            user_id = access_token.get('user_id')
            return User.objects.get(id=user_id)
            
        except Exception:
            return None
    
    # ============================================
    # DEPRECATED METHODS (Backward Compatibility)
    # ============================================
    
    @staticmethod
    def generate_verification_token(user) -> str:
        """
        DEPRECATED: Use generate_email_verification_token instead.
        Kept for backward compatibility.
        """
        logger.warning("generate_verification_token is deprecated, use generate_email_verification_token instead")
        return TokenService.generate_email_verification_token(user)
    
    @staticmethod
    def get_user_from_verification_token(token: str) -> Optional[User]:
        """
        DEPRECATED: Use get_user_from_email_verification_token instead.
        Kept for backward compatibility.
        """
        logger.warning("get_user_from_verification_token is deprecated, use get_user_from_email_verification_token instead")
        return TokenService.get_user_from_email_verification_token(token)
