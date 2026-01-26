from sqlmodel import create_engine, Session
from ..config.settings import settings
from typing import Generator
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import urllib.parse

# Parse the database URL to handle special characters in credentials
def get_neon_database_url():
    """Get the database URL with proper URL encoding for Neon."""
    if settings.DATABASE_URL.startswith("postgresql://"):
        # For Neon, we need to ensure proper URL encoding
        return settings.DATABASE_URL
    return settings.DATABASE_URL

# Create the database engine with connection pooling optimized for Neon
def create_engine_with_settings():
    database_url = get_neon_database_url()

    # Different connection args for different database types
    if database_url.startswith("sqlite"):
        # SQLite doesn't support most of these parameters
        connect_args = {}
        poolclass = None
        pool_size = 5
        max_overflow = 0
    else:
        # PostgreSQL-specific connection parameters
        connect_args = {
            "connect_timeout": 10,
            "sslmode": "require"  # Required for Neon
        }
        poolclass = QueuePool
        pool_size = settings.DB_POOL_SIZE
        max_overflow = settings.DB_MAX_OVERFLOW

    return create_engine(
        database_url,
        echo=settings.DB_ECHO,
        pool_pre_ping=True,
        pool_size=pool_size,
        max_overflow=max_overflow,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        poolclass=poolclass,
        connect_args=connect_args
    )

engine = create_engine_with_settings()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

@contextmanager
def get_db_session():
    """
    Context manager for database sessions that ensures proper cleanup
    and automatic rollback on exceptions.
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()