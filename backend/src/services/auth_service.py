from sqlmodel import Session, select
from typing import Optional
from datetime import timedelta
import uuid

from ..models.user import User, UserCreate, UserLogin
from ..utils.jwt_utils import hash_password, verify_password, create_access_token, create_refresh_token, create_token_payload, verify_refresh_token
from ..utils.exceptions import handle_database_error
from ..config.settings import settings


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def register_user(self, user_create: UserCreate) -> User:
        """Register a new user."""
        try:
            # Validate password strength
            self._validate_password_strength(user_create.password)

            # Check if user with this email already exists
            existing_user = self.session.exec(
                select(User).where(User.email == user_create.email)
            ).first()

            if existing_user:
                raise ValueError(f"User with email {user_create.email} already exists")

            # Hash the password
            hashed_password = hash_password(user_create.password)

            # Create the user
            user = User(
                email=user_create.email,
                first_name=user_create.first_name,
                last_name=user_create.last_name,
                hashed_password=hashed_password
            )

            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)

            return user
        except Exception as e:
            self.session.rollback()
            handle_database_error(e, "user registration")

    def _validate_password_strength(self, password: str) -> bool:
        """Validate password strength requirements."""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if len(password) > 128:  # Prevent extremely long passwords
            raise ValueError("Password must be less than 128 characters")

        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)

        if not (has_upper and has_lower and has_digit and has_special):
            raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")

        return True

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        user = self.session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user or not verify_password(password, user.hashed_password):
            return None

        return user

    def create_auth_tokens(self, user: User) -> dict:
        """Create access and refresh tokens for a user."""
        token_payload = create_token_payload(user.id, user.email)

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        access_token = create_access_token(
            data=token_payload,
            expires_delta=access_token_expires
        )

        refresh_token = create_refresh_token(
            data=token_payload,
            expires_delta=refresh_token_expires
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        user = self.session.exec(
            select(User).where(User.email == email)
        ).first()

        return user

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get a user by ID."""
        user = self.session.exec(
            select(User).where(User.id == user_id)
        ).first()

        return user

    def refresh_access_token(self, refresh_token: str) -> dict:
        """Refresh an access token using a refresh token."""
        try:
            # Verify the refresh token
            payload = verify_refresh_token(refresh_token)
            user_id = payload.get("sub")

            if not user_id:
                raise ValueError("Invalid refresh token")

            # Get the user
            user = self.get_user_by_id(uuid.UUID(user_id))
            if not user:
                raise ValueError("User not found")

            # Create new tokens
            token_payload = create_token_payload(user.id, user.email)

            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            new_access_token = create_access_token(
                data=token_payload,
                expires_delta=access_token_expires
            )

            return {
                "access_token": new_access_token,
                "token_type": "bearer"
            }
        except Exception as e:
            self.session.rollback()
            handle_database_error(e, "token refresh")