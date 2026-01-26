"""
Security Configuration for Todo Web Application
Contains security-related configurations and utilities
"""

import secrets
from typing import List
from ..config.settings import settings
from slowapi import Limiter
from slowapi.util import get_remote_address


# Security settings
class SecurityConfig:
    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGITS = True
    REQUIRE_SPECIAL_CHARS = True
    SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Rate limiting
    DEFAULT_RATE_LIMIT = "100/minute"
    AUTHENTICATED_RATE_LIMIT = "200/minute"
    LOGIN_RATE_LIMIT = "5/minute"
    PASSWORD_RESET_RATE_LIMIT = "3/hour"
    
    # Session settings
    SESSION_TIMEOUT_MINUTES = 30
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_LOCKOUT_TIME_SECONDS = 300  # 5 minutes
    
    # Input validation
    MAX_TITLE_LENGTH = 200
    MAX_DESCRIPTION_LENGTH = 2000
    MAX_EMAIL_LENGTH = 254
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }


# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[SecurityConfig.DEFAULT_RATE_LIMIT]
)


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength according to security requirements.
    
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters long"
    
    if len(password) > SecurityConfig.MAX_PASSWORD_LENGTH:
        return False, f"Password must be less than {SecurityConfig.MAX_PASSWORD_LENGTH} characters"
    
    if SecurityConfig.REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if SecurityConfig.REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if SecurityConfig.REQUIRE_DIGITS and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    
    if SecurityConfig.REQUIRE_SPECIAL_CHARS and not any(c in SecurityConfig.SPECIAL_CHARS for c in password):
        return False, f"Password must contain at least one special character ({SecurityConfig.SPECIAL_CHARS})"
    
    return True, ""


def sanitize_input(input_str: str, max_length: int = None) -> str:
    """
    Sanitize user input to prevent injection attacks.
    
    Args:
        input_str: Input string to sanitize
        max_length: Maximum allowed length (optional)
        
    Returns:
        str: Sanitized string
    """
    if input_str is None:
        return ""
    
    # Strip leading/trailing whitespace
    sanitized = input_str.strip()
    
    # Limit length if specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    # Remove potentially dangerous characters/sequences
    # This is a basic sanitization - in production, use a proper HTML sanitizer
    dangerous_patterns = [
        '<script', 'javascript:', 'vbscript:', 'onerror', 'onload', 'onclick',
        'eval(', 'expression(', 'javascript:', 'data:', 'vbscript:'
    ]
    
    lower_sanitized = sanitized.lower()
    for pattern in dangerous_patterns:
        if pattern in lower_sanitized:
            # Replace dangerous content with empty string
            sanitized = sanitized.replace(pattern, '')
    
    return sanitized


def is_valid_email_format(email: str) -> bool:
    """
    Basic email format validation.
    
    Args:
        email: Email string to validate
        
    Returns:
        bool: True if email format is valid, False otherwise
    """
    if not email or len(email) > SecurityConfig.MAX_EMAIL_LENGTH:
        return False
    
    # Basic email regex pattern
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def get_rate_limit_for_endpoint(endpoint_name: str) -> str:
    """
    Get appropriate rate limit for different endpoints.
    
    Args:
        endpoint_name: Name of the endpoint
        
    Returns:
        str: Rate limit string
    """
    rate_limits = {
        "auth.login": SecurityConfig.LOGIN_RATE_LIMIT,
        "auth.register": SecurityConfig.LOGIN_RATE_LIMIT,
        "auth.forgot_password": SecurityConfig.PASSWORD_RESET_RATE_LIMIT,
        "auth.reset_password": SecurityConfig.PASSWORD_RESET_RATE_LIMIT,
    }
    
    return rate_limits.get(endpoint_name, SecurityConfig.DEFAULT_RATE_LIMIT)