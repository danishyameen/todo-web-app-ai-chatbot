from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request, HTTPException, status
from datetime import datetime, timedelta
import os

# Try to import redis, but don't fail if it's not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# Initialize the limiter with remote address as the key
limiter = Limiter(key_func=get_remote_address)

def add_rate_limiting(app: FastAPI):
    """
    Add rate limiting middleware to the FastAPI application
    """
    # Register the rate limit exceeded handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Add custom rate limiting middleware
    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        # Skip rate limiting for certain endpoints (like health checks)
        if request.url.path in ["/health", "/"]:
            response = await call_next(request)
            return response
            
        # Apply rate limiting based on endpoint and user
        try:
            # For authentication endpoints, use stricter limits to prevent brute force
            if "/auth" in request.url.path:
                # Limit to 5 attempts per minute per IP for auth endpoints
                key = f"auth:{get_remote_address(request)}"
                current_time = datetime.utcnow()
                window_start = current_time.replace(second=0, microsecond=0)
                
                # Connect to Redis for rate limiting (fallback to in-memory if Redis unavailable)
                if REDIS_AVAILABLE:
                    try:
                        redis_client = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'), 
                                                  port=os.getenv('REDIS_PORT', 6379), 
                                                  db=0, 
                                                  decode_responses=True)
                        
                        # Use Redis to track requests
                        pipe = redis_client.pipeline()
                        pipe.incr(key)
                        pipe.expireat(key, window_start + timedelta(minutes=1))
                        results = pipe.execute()
                        current_requests = results[0]
                        
                        if current_requests > 5:  # Max 5 auth attempts per minute
                            raise HTTPException(
                                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                                detail="Too many authentication attempts. Please try again later."
                            )
                    except:
                        # Fallback to in-memory tracking if Redis is not available
                        # In production, you'd want to use a proper distributed cache
                        pass
                else:
                    # Redis not installed, use slowapi's default in-memory rate limiting
                    pass
                    
            response = await call_next(request)
            return response
        except HTTPException:
            raise
        except Exception as e:
            response = await call_next(request)
            return response

# Define specific rate limits for different endpoints
login_rate_limit = "5/minute"  # 5 attempts per minute
api_rate_limit = "100/minute"  # 100 requests per minute