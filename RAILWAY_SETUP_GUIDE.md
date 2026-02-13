# Railway Deployment Setup Guide

## Step-by-Step Configuration for Simple Deployment (Option B)

### 1. **Set Root Directory**
In the Railway UI under **Source** section:
- Click **"Add Root Directory"**
- Enter: `backend`
- Click **Save**

### 2. **Configure Builder**
In the Railway UI under **Build** section:
- **Builder**: Keep as `Railpack` (Default)
- **Metal Build Environment**: ✅ Enabled (recommended)

### 3. **Set Build Command**
In the Railway UI under **Build** section:
- Click **Custom Build Command**
- Enter: `pip install -r requirements.txt`
- This will install all Python dependencies

### 4. **Set Start Command**
In the Railway UI under **Deploy** section:
- Click **Custom Start Command**
- Enter: `python start_server.py`
- **Remove** the `cd backend &&` part since root directory is already set to `backend`

### 5. **Configure Environment Variables**
In Railway UI, go to the **Variables** tab and add these essential variables:

#### Required Variables:
```bash
# Database (use your Neon PostgreSQL URL)
DATABASE_URL=postgresql://your-user:your-password@your-host.neon.tech/your-db?sslmode=require

# JWT Security (CHANGE THESE!)
JWT_SECRET_KEY=your-production-secret-key-here-make-it-long-and-random
JWT_REFRESH_SECRET_KEY=your-production-refresh-secret-key-here-also-long-and-random

# Environment
ENVIRONMENT=production
DEBUG=false

# CORS (add your frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://todo-backend-production-cf25.up.railway.app
```

#### Optional but Recommended:
```bash
# Database Pool Settings (optimized for Neon)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_RECYCLE=300

# Rate Limiting
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTHENTICATED=200/minute

# Logging
LOG_LEVEL=INFO

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_TIME=300
```

### 6. **Networking Configuration**
Your current setup shows:
- **Public URL**: `todo-backend-production-cf25.up.railway.app`
- **Private URL**: `todo-backend.railway.internal`

Make sure:
- The exposed port is set to `8000` (or leave as auto-detect)
- Your `start_server.py` binds to `0.0.0.0` (already configured ✅)

### 7. **Deployment Settings**
Current configuration (already good):
- **Restart Policy**: On Failure
- **Max Retries**: 10
- **Region**: US West (California)
- **Replicas**: 1

### 8. **Deploy**
After making the above changes:
1. Click **Deploy** in Railway UI
2. Watch the build logs for any errors
3. Once deployed, test your API at: `https://todo-backend-production-cf25.up.railway.app/docs`

---

## Quick Checklist

- [ ] Root Directory set to `backend`
- [ ] Custom Build Command: `pip install -r requirements.txt`
- [ ] Custom Start Command: `python start_server.py`
- [ ] DATABASE_URL environment variable added
- [ ] JWT_SECRET_KEY environment variable added
- [ ] JWT_REFRESH_SECRET_KEY environment variable added
- [ ] CORS_ALLOWED_ORIGINS includes your frontend URL
- [ ] ENVIRONMENT set to `production`
- [ ] DEBUG set to `false`

---

## Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://todo-backend-production-cf25.up.railway.app/`
2. **API Docs**: `https://todo-backend-production-cf25.up.railway.app/docs`
3. **OpenAPI Schema**: `https://todo-backend-production-cf25.up.railway.app/openapi.json`

---

## Troubleshooting

### Build Fails
- Check the build logs in Railway
- Verify `requirements.txt` is in the `backend` directory
- Ensure Python version compatibility (using 3.11)

### Deployment Fails to Start
- Check if `PORT` environment variable is being read correctly
- Verify `start_server.py` exists in backend directory
- Check logs for any startup errors

### Database Connection Issues
- Verify DATABASE_URL format includes `?sslmode=require`
- Check Neon database is accessible from Railway's IP range
- Verify connection pool settings aren't too high for free tier

### CORS Errors
- Add your frontend domain to CORS_ALLOWED_ORIGINS
- Include both `http://` and `https://` if needed
- For Vercel preview deployments, use wildcard: `https://your-app-*.vercel.app`

---

## Next Steps

1. **Connect Frontend**: Update your frontend's API URL to point to Railway
2. **Set up CI/CD**: Railway auto-deploys on git push to master
3. **Monitor**: Use Railway's metrics to monitor performance
4. **Database Migrations**: Run migrations using Railway's CLI or add to build command

---

## Generate Secret Keys

Use this command to generate secure secret keys:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Run it twice to get both JWT_SECRET_KEY and JWT_REFRESH_SECRET_KEY.
