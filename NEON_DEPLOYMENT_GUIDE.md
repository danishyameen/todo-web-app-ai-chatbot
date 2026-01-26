# Neon Database Deployment Guide for Taskly

This guide will walk you through setting up and deploying the Taskly application with Neon database.

## Table of Contents
1. [About Neon](#about-neon)
2. [Prerequisites](#prerequisites)
3. [Setting Up Neon Database](#setting-up-neon-database)
4. [Configuring Your Application](#configuring-your-application)
5. [Running Locally with Neon](#running-locally-with-neon)
6. [Deploying to Production](#deploying-to-production)
7. [Troubleshooting](#troubleshooting)

## About Neon

[Neon](https://neon.tech/) is a serverless PostgreSQL platform that offers:
- Free tier with 1GB storage and 10GB/month transfer
- Instant branching and cloning of databases
- Auto-suspend inactive databases to save resources
- Seamless scaling
- Built-in connection pooling

## Prerequisites

- Git installed on your machine
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- A Neon account (free to sign up)

## Setting Up Neon Database

### Step 1: Create a Neon Account
1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up using your GitHub account or email
3. Verify your email address

### Step 2: Create a Project
1. Click on "New Project"
2. Choose a project name (e.g., "taskly-db")
3. Select a region closest to your users
4. Choose the "Free" plan
5. Click "Create Project"

### Step 3: Get Your Connection Details
1. Once your project is created, go to the "Connection Details" section
2. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   ```
3. Copy this connection string - you'll need it for configuration

## Configuring Your Application

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/todo-web-app.git
cd todo-web-app
```

### Step 2: Configure Backend Environment
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create your environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and update the `DATABASE_URL`:
   ```env
   # Replace with your actual Neon connection string
   DATABASE_URL=postgresql://your_username:your_password@ep-polished-feather-12345678.us-east-1.amazonaws.com:5432/neondb?sslmode=require
   ```

4. Update other important settings for Neon:
   ```env
   # Connection Pool Settings (Optimized for Neon Free Tier)
   DB_ECHO=false
   DB_POOL_SIZE=5
   DB_MAX_OVERFLOW=10
   DB_POOL_RECYCLE=300
   DB_POOL_TIMEOUT=30
   ```

### Step 3: Run Database Migrations
1. Make sure you have Python and pip installed
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the database migrations:
   ```bash
   alembic upgrade head
   ```

## Running Locally with Neon

### Option 1: Using Docker
1. From the project root, run:
   ```bash
   docker-compose -f docker-compose.neon.yml up --build
   ```

### Option 2: Running Manually
1. Start the backend:
   ```bash
   cd backend
   python start_server.py
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deploying to Production

### Deploying Backend to Railway
1. Sign up at [Railway](https://railway.app/)
2. Create a new project and connect your GitHub repository
3. Add your Neon database connection string as an environment variable:
   - Variable: `DATABASE_URL`
   - Value: Your Neon connection string
4. Add other required environment variables:
   - `JWT_SECRET_KEY`
   - `JWT_REFRESH_SECRET_KEY`
   - `CORS_ALLOWED_ORIGINS`
5. Deploy the application

### Deploying Frontend to Vercel
1. Sign up at [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set environment variables:
   - `NEXT_PUBLIC_BACKEND_API_URL`: Your deployed backend URL
4. Deploy the application

### Alternative: Deploying Backend to Render
1. Sign up at [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set environment variables in the dashboard
5. Deploy the application

## Important Neon-Specific Considerations

### 1. Connection Limits
- Neon's free tier has limited concurrent connections
- Adjust your pool settings accordingly:
  ```env
  DB_POOL_SIZE=5
  DB_MAX_OVERFLOW=10
  ```

### 2. Auto-Suspend
- Neon databases auto-suspend after 5 minutes of inactivity (free tier)
- First connection after suspension may take longer
- Consider upgrading to a paid plan for production apps that require constant availability

### 3. Branching
- Neon supports instant branching - great for development environments
- You can create separate branches for development, staging, and production
- Use different connection strings for each environment

### 4. SSL Requirement
- Neon requires SSL connections
- Make sure your connection string includes `?sslmode=require`

## Troubleshooting

### Common Issues

#### 1. Connection Timeout
- **Problem**: Getting connection timeout errors
- **Solution**: 
  - Check that your Neon database is not suspended
  - Verify your connection string is correct
  - Ensure your IP is allowed (for local development)

#### 2. SSL Error
- **Problem**: SSL connection errors
- **Solution**: Make sure your connection string includes `?sslmode=require`

#### 3. Migration Failures
- **Problem**: Database migrations fail
- **Solution**: 
  - Ensure your connection string is properly URL-encoded
  - Check that your Neon database has the correct permissions
  - Verify you're using the correct database name

#### 4. Authentication Issues
- **Problem**: Authentication errors
- **Solution**: 
  - Verify your username and password in the connection string
  - Make sure the user has the necessary permissions

### Testing Your Connection

You can test your Neon connection with this simple Python script:

```python
import psycopg2
from urllib.parse import urlparse

# Replace with your Neon connection string
conn_string = "postgresql://username:password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"

try:
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"Connected successfully! PostgreSQL version: {version[0]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
```

## Performance Tips

1. **Use Smaller Pool Sizes**: Neon's free tier has limited connections, so use smaller pool sizes
2. **Implement Retry Logic**: Add retry logic for database operations to handle auto-suspension
3. **Monitor Usage**: Keep an eye on your monthly transfer limits
4. **Use Branches**: Leverage Neon's branching for different environments

## Security Best Practices

1. **Never Commit Credentials**: Keep your Neon connection string in environment variables only
2. **Use Strong Passwords**: Generate strong, random passwords for your Neon database
3. **Rotate Credentials**: Periodically rotate your database credentials
4. **Limit Permissions**: Use roles with minimal required permissions

## Need Help?

- Neon Documentation: [https://neon.tech/docs](https://neon.tech/docs)
- Neon Discord: Join the community for support
- Application Issues: Open an issue in the repository

---

Your Taskly application is now configured to work with Neon database! Enjoy the benefits of serverless PostgreSQL with automatic scaling and connection pooling.