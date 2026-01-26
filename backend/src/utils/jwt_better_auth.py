from datetime import datetime, timezone
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config.settings import settings
import uuid


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme."
                )
            
            token = credentials.credentials
            user_id = self.verify_jwt(token)
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or expired token."
                )
            
            # Add user_id to request state so it can be accessed by route handlers
            request.state.user_id = user_id
            return user_id
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization code."
            )

    def verify_jwt(self, jwt_token: str) -> Optional[str]:
        try:
            # Decode the JWT token using the shared secret
            payload = jwt.decode(
                jwt_token,
                settings.JWT_SECRET_KEY,
                algorithms=["HS256"]
            )

            # Extract user ID from the token (using 'sub' field which is standard for subject)
            user_id = payload.get("sub")

            if user_id:
                # Validate that user_id is a valid UUID
                try:
                    uuid.UUID(user_id)
                    return user_id
                except ValueError:
                    return None

            return None
        except JWTError:
            # Catch JWT-specific exceptions
            return None
        except Exception:
            # Catch any other JWT-related exception
            return None


def get_current_user_id(request: Request) -> str:
    """
    Dependency to get the current user ID from the JWT token
    """
    # Get the authorization header
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    token = authorization[7:]  # Remove "Bearer " prefix

    try:
        # Decode the token directly
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        # Validate that user_id is a valid UUID
        try:
            uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

        return user_id
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )