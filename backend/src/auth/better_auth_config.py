from better_auth import create_auth, jwt_plugin
from better_auth.plugins import bearer
import os

# Initialize Better Auth with JWT plugin
auth = create_auth(
    secret=os.getenv("BETTER_AUTH_SECRET", "your-super-secret-key-change-in-production"),
    plugins=[
        jwt_plugin(
            secret=os.getenv("BETTER_AUTH_SECRET", "your-super-secret-key-change-in-production"),
            # Optional: customize JWT options
            algorithm="HS256",
            expiry_time=60 * 60 * 24 * 7,  # 7 days
        ),
        bearer(),  # This enables Bearer token authentication
    ],
    # Database configuration will be handled separately
)

# Export the auth instance
__all__ = ["auth"]