#!/usr/bin/env python3
"""
Neon Database Setup Script for Taskly Application

This script helps you configure your Taskly application to work with Neon database.
It will guide you through the setup process and update the necessary configuration files.
"""

import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


def validate_postgres_url(url):
    """Validate PostgreSQL connection URL format."""
    pattern = r'^postgresql://[a-zA-Z0-9_-]+:[^@]+@[\w\.-]+:\d+/[\w-]+(\?[^#]*)?$'
    return re.match(pattern, url) is not None


def parse_connection_string(connection_string):
    """Parse the connection string to extract components."""
    try:
        parsed = urlparse(connection_string)
        return {
            'scheme': parsed.scheme,
            'username': parsed.username,
            'password': parsed.password,
            'hostname': parsed.hostname,
            'port': parsed.port,
            'database': parsed.path.lstrip('/'),
            'query': parsed.query
        }
    except Exception:
        return None


def update_backend_env(connection_string):
    """Update the backend .env file with the Neon connection string."""
    backend_dir = Path('./backend')
    env_file = backend_dir / '.env'
    
    # Create .env file if it doesn't exist
    if not env_file.exists():
        example_file = backend_dir / '.env.example'
        if example_file.exists():
            env_file.write_text(example_file.read_text())
        else:
            env_file.touch()
    
    # Read current content
    content = env_file.read_text()
    
    # Update or add the DATABASE_URL
    if 'DATABASE_URL=' in content:
        # Replace existing DATABASE_URL
        content = re.sub(
            r'DATABASE_URL=.*$', 
            f'DATABASE_URL={connection_string}', 
            content, 
            flags=re.MULTILINE
        )
    else:
        # Add DATABASE_URL to the file
        content += f'\nDATABASE_URL={connection_string}\n'
    
    # Update pool settings for Neon
    if 'DB_POOL_SIZE=' not in content:
        content += '\n# Connection Pool Settings (Optimized for Neon Free Tier)\n'
        content += 'DB_POOL_SIZE=5\n'
        content += 'DB_MAX_OVERFLOW=10\n'
        content += 'DB_POOL_RECYCLE=300\n'
        content += 'DB_POOL_TIMEOUT=30\n'
    else:
        # Update existing pool settings
        content = re.sub(r'DB_POOL_SIZE=\d+', 'DB_POOL_SIZE=5', content)
        content = re.sub(r'DB_MAX_OVERFLOW=\d+', 'DB_MAX_OVERFLOW=10', content)
        content = re.sub(r'DB_POOL_RECYCLE=\d+', 'DB_POOL_RECYCLE=300', content)
    
    # Write updated content
    env_file.write_text(content)
    print(f"✅ Updated {env_file}")


def test_connection(connection_string):
    """Test the database connection."""
    try:
        import psycopg2
        print("\n🔍 Testing database connection...")
        
        conn = psycopg2.connect(connection_string)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"✅ Connected successfully! PostgreSQL version: {version[0][:50]}...")
        
        cur.close()
        conn.close()
        return True
    except ImportError:
        print("⚠️  psycopg2 not installed. Install it with: pip install psycopg2-binary")
        print("   Skipping connection test.")
        return True  # Assume it's valid if we can't test
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


def main():
    print("🚀 Taskly - Neon Database Setup Assistant")
    print("=" * 50)
    print()
    
    print("📋 Prerequisites:")
    print("   1. A Neon account (sign up at https://neon.tech/)")
    print("   2. A Neon project created")
    print("   3. Your Neon connection string")
    print()
    
    print("💡 Tip: You can find your connection string in the Neon Console")
    print("    under your project → Connection Details → Connection String")
    print()
    
    # Get connection string from user
    while True:
        connection_string = input("🔗 Enter your Neon database connection string: ").strip()
        
        if not connection_string:
            print("❌ Connection string cannot be empty. Please try again.")
            continue
            
        if not validate_postgres_url(connection_string):
            print("❌ Invalid connection string format. It should look like:")
            print("   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech:5432/neondb?sslmode=require")
            continue
            
        break
    
    print(f"\n✅ Valid connection string detected!")
    
    # Parse and display connection details
    details = parse_connection_string(connection_string)
    if details:
        print(f"   Host: {details['hostname']}")
        print(f"   Port: {details['port']}")
        print(f"   Database: {details['database']}")
        print(f"   Username: {details['username']}")
    
    # Test the connection
    if test_connection(connection_string):
        print("\n📝 Updating configuration files...")
        update_backend_env(connection_string)
        
        print("\n🎉 Setup complete!")
        print("\n📋 Next steps:")
        print("   1. Run database migrations: cd backend && alembic upgrade head")
        print("   2. Start the backend: cd backend && python start_server.py")
        print("   3. Start the frontend: cd frontend && npm run dev")
        print("   4. Visit http://localhost:3000 to use the application")
        print()
        print("🔐 Security tip: Make sure .env files are in your .gitignore!")
        
        # Check if .gitignore exists and suggest adding .env
        gitignore_path = Path('.gitignore')
        if gitignore_path.exists():
            gitignore_content = gitignore_path.read_text()
            if '.env' not in gitignore_content:
                print("\n⚠️  Security warning: Add '.env' to your .gitignore file!")
                print("   echo '.env' >> .gitignore")
    else:
        print("\n❌ Setup incomplete due to connection test failure.")
        print("   Please check your connection string and try again.")


if __name__ == "__main__":
    main()