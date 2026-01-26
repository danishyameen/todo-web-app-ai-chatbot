# Neon Database Setup Guide for Todo Web Application

This guide will help you set up and configure Neon database for your Todo Web Application.

## Prerequisites

- A Neon account (sign up at [https://neon.tech/](https://neon.tech/))
- Git installed on your system
- Python 3.8+ installed
- Node.js 18+ installed

## Step 1: Create a Neon Project

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign in or create an account
3. Click on "New Project"
4. Choose a project name (e.g., "todo-web-app")
5. Select a region closest to your users
6. Choose the "Free" plan (sufficient for development)
7. Click "Create Project"

## Step 2: Get Your Connection Details

1. After your project is created, go to the "Connection Details" section
2. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   ```
3. Copy this connection string - you'll need it for configuration

## Step 3: Configure Your Application

### Backend Configuration

1. Navigate to your backend directory:
   ```bash
   cd backend
   ```

2. Create or update your `.env` file:
   ```bash
   cp .env.example .env  # if .env doesn't exist
   ```

3. Update the `.env` file with your Neon connection string:
   ```env
   # Database settings
   DATABASE_URL=postgresql://your_username:your_password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   
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
   ```

### Frontend Configuration

1. Navigate to your frontend directory:
   ```bash
   cd frontend
   ```

2. Create or update your `.env.local` file:
   ```bash
   cp .env.local.example .env.local  # if .env.local doesn't exist
   ```

3. Update the `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api
   ```

## Step 4: Run Database Migrations

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies if you haven't already:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the database migrations:
   ```bash
   alembic upgrade head
   ```

## Step 5: Start the Application

1. Start the backend:
   ```bash
   python start_server.py
   ```

2. In a new terminal, navigate to the frontend directory and start the frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to use the application

## Neon-Specific Optimizations

### Connection Pooling Settings
The application is configured with Neon-optimized connection settings:
- Smaller pool size (5 instead of 20) to respect Neon's free tier limits
- Shorter connection recycle time (300 seconds instead of 3600)
- SSL requirement enabled for Neon compatibility
- Statement timeout configured appropriately

### Migration Configuration
The alembic configuration has been updated to work with Neon:
- Removed statement_timeout from connection args (not supported by Neon)
- Proper SSL configuration
- Connection pooling optimized for Neon

## Troubleshooting

### Common Issues

#### 1. Connection Issues
- **Problem**: Getting connection errors
- **Solution**: 
  - Verify your Neon connection string is correct
  - Ensure SSL mode is set to "require" in your connection string
  - Check that your Neon database is not suspended (free tier suspends after inactivity)

#### 2. Migration Issues
- **Problem**: Alembic migration fails
- **Solution**: 
  - Make sure you're using the correct database URL format
  - Ensure your Neon database has the necessary permissions
  - Try running `alembic upgrade head` again

#### 3. Performance Issues
- **Problem**: Slow queries or connection timeouts
- **Solution**:
  - Reduce connection pool size if on free tier
  - Optimize queries for better performance
  - Consider upgrading to a paid Neon plan for production

### Need Help?
- Check the [Neon Documentation](https://neon.tech/docs)
- Join the [Neon Discord Community](https://discord.gg/neondatabase)
- Open an issue in the repository if you encounter problems

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for your Neon database
- Regularly rotate your database credentials
- Monitor your Neon dashboard for unusual activity

## Production Deployment

For production deployment with Neon:
1. Create a production Neon project
2. Use environment variables for configuration
3. Set up proper monitoring and alerting
4. Implement backup strategies
5. Configure proper connection pooling for your traffic needs

Your Todo Web Application is now configured to work with Neon database! Enjoy the benefits of serverless PostgreSQL with automatic scaling and connection pooling.