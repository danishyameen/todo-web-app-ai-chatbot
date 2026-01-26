import time
import logging
from functools import wraps
from typing import Callable, Any
from sqlmodel import Session
import psutil
import os

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def log_db_operation(operation_name: str):
    """Decorator to log database operations with timing and resource usage."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            process = psutil.Process(os.getpid())
            start_memory = process.memory_info().rss / 1024 / 1024  # MB

            try:
                result = func(*args, **kwargs)

                end_time = time.time()
                end_memory = process.memory_info().rss / 1024 / 1024  # MB
                duration = end_time - start_time
                memory_used = end_memory - start_memory

                logger.info(f"DB Operation '{operation_name}' completed in {duration:.4f}s, "
                           f"memory delta: {memory_used:.2f}MB")

                return result
            except Exception as e:
                end_time = time.time()
                duration = end_time - start_time
                logger.error(f"DB Operation '{operation_name}' failed after {duration:.4f}s: {str(e)}")
                raise

        return wrapper
    return decorator


class DatabaseMonitor:
    """Class to monitor database performance and health."""

    def __init__(self, session: Session):
        self.session = session

    def get_db_stats(self):
        """Get database statistics."""
        try:
            # Get connection count and other stats
            result = self.session.exec("SELECT COUNT(*) FROM pg_stat_activity;").first() if hasattr(self.session.bind, 'name') and 'postgresql' in self.session.bind.name else None

            stats = {
                'timestamp': time.time(),
                'active_connections': result if result else 'N/A',
                'session_object': str(self.session)
            }

            logger.info(f"DB Stats: {stats}")
            return stats
        except Exception as e:
            logger.error(f"Error getting DB stats: {str(e)}")
            return {'error': str(e)}

    def health_check(self):
        """Perform a database health check."""
        try:
            start_time = time.time()

            # Simple ping to check database connectivity
            result = self.session.exec("SELECT 1;").first()

            duration = time.time() - start_time

            health_status = {
                'status': 'healthy' if result == (1,) else 'unhealthy',
                'response_time': duration,
                'timestamp': time.time()
            }

            logger.info(f"DB Health Check: {health_status}")
            return health_status
        except Exception as e:
            logger.error(f"DB Health Check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': time.time()
            }


def add_monitoring_middleware(app):
    """Add database monitoring middleware to FastAPI app."""
    @app.middleware("http")
    async def db_monitoring_middleware(request, call_next):
        start_time = time.time()

        try:
            response = await call_next(request)
        except Exception as e:
            duration = time.time() - start_time
            # Log error with timing info
            logger.error(f"Request: {request.method} {request.url.path} "
                        f"failed after {duration:.4f}s with error: {str(e)}")
            raise
        finally:
            if 'response' in locals():  # Only log if response was created successfully
                duration = time.time() - start_time
                # Log request info
                logger.info(f"Request: {request.method} {request.url.path} "
                           f"completed in {duration:.4f}s, status={response.status_code}")

        return response


# Example usage of logging queries
def log_query(query_str: str, params: dict = None):
    """Log SQL queries for monitoring and debugging."""
    logger.info(f"Executing query: {query_str}")
    if params:
        logger.debug(f"Query params: {params}")


# Query performance monitoring
class QueryProfiler:
    """Simple query profiler to identify slow queries."""

    SLOW_QUERY_THRESHOLD = 1.0  # seconds

    @staticmethod
    def profile_query(query_func: Callable) -> Callable:
        @wraps(query_func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = query_func(*args, **kwargs)
            duration = time.time() - start_time

            if duration > QueryProfiler.SLOW_QUERY_THRESHOLD:
                logger.warning(f"SLOW QUERY ALERT: {query_func.__name__} took {duration:.4f}s")

            return result
        return wrapper