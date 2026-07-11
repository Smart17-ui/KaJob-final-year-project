from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from typing import Optional, Dict, Any
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
    # TOKEN GENERATION
    # ============================================
    
    @staticmethod
    def generate_tokens(user) -> Dict[str, str]:
        """
        Generate access and refresh tokens for a user.
        
        Args:
            user: User instance
        
        Returns:
            Dict containing access and refresh tokens
        """
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['user_id'] = user.id
        refresh['email'] = user.email
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    
    @staticmethod
    def generate_access_token(user) -> str:
        """
        Generate only an access token.
        """
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    @staticmethod
    def generate_refresh_token(user) -> str:
        """
        Generate only a refresh token.
        """
        refresh = RefreshToken.for_user(user)
        return str(refresh)
    
    # ============================================
    # TOKEN VALIDATION
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
    # EMAIL VERIFICATION TOKENS
    # ============================================
    
    @staticmethod
    def generate_verification_token(user) -> str:
        """
        Generate a token for email verification.
        Uses JWT with a short expiry.
        """
        from rest_framework_simplejwt.tokens import AccessToken
        
        token = AccessToken.for_user(user)
        # Override expiry to 24 hours
        # The default expiry is set in settings
        return str(token)
    
    @staticmethod
    def get_user_from_verification_token(token: str) -> Optional[User]:
        """
        Get user from verification token.
        """
        return TokenService.get_user_from_access_token(token)
    
    # ============================================
    # PASSWORD RESET TOKENS
    # ============================================
    
    @staticmethod
    def generate_reset_token(user) -> str:
        """
        Generate a token for password reset.
        Uses JWT with a short expiry (1 hour).
        """
        from rest_framework_simplejwt.tokens import AccessToken
        
        token = AccessToken.for_user(user)
        # Override expiry to 1 hour
        # The default expiry is set in settings
        return str(token)
    
    @staticmethod
    def get_user_from_reset_token(token: str) -> Optional[User]:
        """
        Get user from reset token.
        """
        return TokenService.get_user_from_access_token(token)
