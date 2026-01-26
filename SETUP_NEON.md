# Setting up Taskly with Neon Database

This guide will help you connect your Taskly application to a Neon database.

## Prerequisites

1. **Neon Account**: Sign up at [https://neon.tech/](https://neon.tech/)
2. **Neon Project**: Create a new project in the Neon Console
3. **Connection String**: Get your connection string from the Neon Console

## Step-by-Step Setup

### 1. Get Your Neon Connection String

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Click on "Connection Details" in the sidebar
4. Copy the connection string (it looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech:5432/neondb?sslmode=require`)

### 2. Run the Setup Script

1. Open your terminal/command prompt
2. Navigate to your project directory:
   ```bash
   cd path/to/todo-web-app
   ```
3. Run the setup script:
   ```bash
   python setup_neon_db.py
   ```
4. Paste your Neon connection string when prompted

### 3. Manual Setup (Alternative)

If you prefer to set it up manually:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create or update the `.env` file:
   ```bash
   cp .env.example .env  # if .env doesn't exist
   ```

3. Edit the `.env` file and update:
   ```env
   # Replace with your Neon connection string
   DATABASE_URL=postgresql://your_username:your_password@ep-polished-feather-12345678.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
   
   # Connection Pool Settings (Optimized for Neon Free Tier)
   DB_POOL_SIZE=5
   DB_MAX_OVERFLOW=10
   DB_POOL_RECYCLE=300
   DB_POOL_TIMEOUT=30
   ```

### 4. Run Database Migrations

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Run the database migrations:
   ```bash
   alembic upgrade head
   ```

### 5. Start the Application

1. Start the backend:
   ```bash
   python start_server.py
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to use the application

## Troubleshooting

### Connection Issues
- Make sure your Neon database is not suspended (free tier suspends after inactivity)
- Verify your connection string is correct
- Check that SSL mode is set to `require` in your connection string

### Migration Issues
- Ensure you're using the correct database name in your connection string
- Make sure your Neon database has the necessary permissions

### Need Help?
- Check the [Neon Documentation](https://neon.tech/docs)
- Open an issue in the repository if you encounter problems

## Security Notes

- Never commit your `.env` file to version control
- Make sure `.env` is in your `.gitignore` file
- Use strong, unique passwords for your Neon database
- Regularly rotate your database credentials

That's it! Your Taskly application is now connected to Neon database.