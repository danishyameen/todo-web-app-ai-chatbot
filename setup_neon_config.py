#!/usr/bin/env python3
"""
Neon Database Configuration Setup Script
Automates the process of configuring your Todo Web Application to work with Neon database
"""

import os
import sys
import re
from pathlib import Path

def validate_neon_connection_string(connection_string: str) -> bool:
    """Validate if the connection string is a valid Neon connection string."""
    # Check if it's a PostgreSQL connection string with Neon-specific domain
    pattern = r'^postgresql://[a-zA-Z0-9_-]+:[^@]+@ep-[a-z0-9-]+\.us-[a-z0-9-]+\.aws\.neon\.tech:\d+\/[a-zA-Z0-9_-]+\?sslmode=require$'
    return bool(re.match(pattern, connection_string))

def update_backend_env(neon_connection_string: str):
    """Update the backend .env file with Neon configuration."""
    backend_path = Path("backend")
    env_file = backend_path / ".env"
    
    # Create .env file if it doesn't exist
    if not env_file.exists():
        env_example = backend_path / ".env.example"
        if env_example.exists():
            env_file.write_text(env_example.read_text())
        else:
            # Create a basic .env file
            env_content = f"""# Database settings
DATABASE_URL={neon_connection_string}

# Connection Pool Settings (Optimized for Neon Free Tier)
DB_ECHO=false
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_RECYCLE=300
DB_POOL_TIMEOUT=30
DB_SSL_REQUIRE=true

# JWT settings
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Other settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
"""
            env_file.write_text(env_content)
    
    # Read current content
    content = env_file.read_text()
    
    # Update or add the DATABASE_URL
    if 'DATABASE_URL=' in content:
        # Replace existing DATABASE_URL
        lines = content.split('\n')
        updated_lines = []
        for line in lines:
            if line.startswith('DATABASE_URL='):
                updated_lines.append(f'DATABASE_URL={neon_connection_string}')
            else:
                updated_lines.append(line)
        content = '\n'.join(updated_lines)
    else:
        # Add DATABASE_URL to the file
        content += f'\nDATABASE_URL={neon_connection_string}\n'
    
    # Ensure Neon-optimized settings are present
    neon_settings = [
        'DB_POOL_SIZE=5',
        'DB_MAX_OVERFLOW=10', 
        'DB_POOL_RECYCLE=300',
        'DB_SSL_REQUIRE=true'
    ]
    
    for setting in neon_settings:
        if setting not in content:
            content += f'\n{setting}'
    
    # Write updated content
    env_file.write_text(content)
    print(f"✓ Updated {env_file}")

def update_frontend_config(backend_url: str = "http://localhost:8000/api"):
    """Update the frontend environment configuration."""
    frontend_path = Path("frontend")
    env_file = frontend_path / ".env.local"
    
    # Create or update .env.local file
    if not env_file.exists():
        env_content = f"""# Frontend Environment Variables
NEXT_PUBLIC_BACKEND_API_URL={backend_url}
"""
        env_file.write_text(env_content)
    else:
        content = env_file.read_text()
        if 'NEXT_PUBLIC_BACKEND_API_URL=' in content:
            # Update existing URL
            lines = content.split('\n')
            updated_lines = []
            for line in lines:
                if line.startswith('NEXT_PUBLIC_BACKEND_API_URL='):
                    updated_lines.append(f'NEXT_PUBLIC_BACKEND_API_URL={backend_url}')
                else:
                    updated_lines.append(line)
            content = '\n'.join(updated_lines)
        else:
            # Add the URL to the file
            content += f'\nNEXT_PUBLIC_BACKEND_API_URL={backend_url}\n'
        
        env_file.write_text(content)
    
    print(f"✓ Updated {env_file}")

def main():
    print("🔧 Neon Database Configuration Setup")
    print("=" * 40)
    
    print("\n📋 Prerequisites:")
    print("   1. A Neon account (sign up at https://neon.tech/)")
    print("   2. A Neon project created")
    print("   3. Your Neon connection string from the Neon Console")
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
            
        if not validate_neon_connection_string(connection_string):
            print("❌ Invalid Neon connection string format. It should look like:")
            print("   postgresql://username:password@ep-xxxxxx.region.aws.neon.tech:5432/neondb?sslmode=require")
            continue
            
        break
    
    print(f"\n✅ Valid Neon connection string detected!")
    
    # Get optional backend URL
    backend_url = input(f"\n🌐 Enter your backend API URL (default: http://localhost:8000/api): ").strip()
    if not backend_url:
        backend_url = "http://localhost:8000/api"
    
    print("\n📝 Updating configuration files...")
    
    # Update configuration files
    update_backend_env(connection_string)
    update_frontend_config(backend_url)
    
    print("\n🎉 Setup complete!")
    print("\n🚀 Next steps:")
    print("   1. Run database migrations: cd backend && alembic upgrade head")
    print("   2. Install backend dependencies: cd backend && pip install -r requirements.txt")
    print("   3. Install frontend dependencies: cd frontend && npm install")
    print("   4. Start the backend: cd backend && python start_server.py")
    print("   5. In a new terminal, start the frontend: cd frontend && npm run dev")
    print("   6. Visit http://localhost:3000 to use the application")
    print()
    print("🔒 Security tip: Make sure .env files are in your .gitignore!")
    print("   Add '*.env' and '.env*' to your .gitignore file if not already there")

if __name__ == "__main__":
    main()