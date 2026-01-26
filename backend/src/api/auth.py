from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlmodel import Session
from typing import Dict
import uuid

from ..db.session import get_session
from ..models.user import UserCreate, UserLogin, UserUpdate
from ..services.auth_service import AuthService
from ..utils.jwt_better_auth import JWTBearer
from ..utils.exceptions import handle_database_error

# Initialize rate limiter for this module
limiter = Limiter(key_func=get_remote_address)


router = APIRouter()

# Create JWT Bearer instance for token verification
jwt_bearer = JWTBearer()


@router.post("/register",
             response_model=Dict[str, str],
             summary="Register a new user",
             description="Create a new user account with the provided details.")
@limiter.limit("10/hour")  # Limit to 10 registrations per hour per IP
def register(request: Request, user_create: UserCreate, session: Session = Depends(get_session)):
    """Register a new user."""
    auth_service = AuthService(session)

    try:
        user = auth_service.register_user(user_create)
        tokens = auth_service.create_auth_tokens(user)

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "user_id": str(user.id),
            "email": user.email
        }
    except ValueError as e:
        # Log the specific error for debugging but return generic message to client
        import logging
        logging.error(f"User registration error: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid registration data"
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        handle_database_error(e, "user registration")


@router.post("/login",
             response_model=Dict[str, str],
             summary="Login a user",
             description="Authenticate a user and return access tokens.")
@limiter.limit("5/minute")  # Limit to 5 login attempts per minute per IP
def login(request: Request, user_login: UserLogin, session: Session = Depends(get_session)):
    """Login a user and return access tokens."""
    auth_service = AuthService(session)

    user = auth_service.authenticate_user(user_login.email, user_login.password)

    if not user:
        # Add a small delay to prevent timing attacks
        import time
        time.sleep(0.5)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = auth_service.create_auth_tokens(user)

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": tokens["token_type"],
        "user_id": str(user.id),
        "email": user.email
    }


@router.post("/refresh",
             summary="Refresh access token",
             description="Generate a new access token using a refresh token.")
def refresh_token(refresh_token: str, session: Session = Depends(get_session)):
    """Refresh an access token using a refresh token."""
    auth_service = AuthService(session)

    try:
        tokens = auth_service.refresh_access_token(refresh_token)
        return tokens
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # Log the specific error for debugging but return generic message to client
        import logging
        logging.error(f"Token refresh error: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout",
             summary="Logout a user",
             description="Logout a user (client-side token invalidation).")
def logout():
    """Logout a user (client-side token invalidation)."""
    # In a real application, you might want to add the token to a blacklist
    return {"message": "Successfully logged out"}


@router.get("/me",
            summary="Get current user info",
            description="Retrieve information about the currently authenticated user based on the provided token.")
def get_current_user(request: Request, token: str = Depends(jwt_bearer), session: Session = Depends(get_session)):
    """Get current user info based on the provided token."""
    try:
        # The token has already been verified by the JWTBearer, and user_id is in request.state
        user_id = request.state.user_id

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        auth_service = AuthService(session)
        user = auth_service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log the specific error for debugging but return generic message to client
        import logging
        logging.error(f"Get current user error: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.put("/profile",
            summary="Update user profile",
            description="Update the authenticated user's profile information.")
def update_profile(user_update: UserUpdate, request: Request, token: str = Depends(jwt_bearer), session: Session = Depends(get_session)):
    """Update user profile information."""
    try:
        # The token has already been verified by the JWTBearer, and user_id is in request.state
        current_user_id = request.state.user_id

        if not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        auth_service = AuthService(session)
        user = auth_service.get_user_by_id(current_user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update the user with provided fields
        update_data = user_update.dict(exclude_unset=True)

        # Prevent changing email to an existing one
        if 'email' in update_data:
            existing_user = auth_service.get_user_by_email(update_data['email'])
            if existing_user and str(existing_user.id) != current_user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        for field, value in update_data.items():
            setattr(user, field, value)

        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_verified": user.is_verified
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the specific error for debugging but return generic message to client
        import logging
        logging.error(f"Profile update error: {str(e)}")

        handle_database_error(e, "profile update")