# Free Backend Hosting Options Guide

Yeh guide aapko multiple **FREE** platforms par backend deploy karne mein help karegi. Har platform ki apni features, limits aur deployment process hai.

## 🏆 Comparison Table - Free Tiers

| Platform | Free Tier | Database | Sleep Policy | Build Time | Best For |
|----------|-----------|----------|--------------|------------|----------|
| **Railway** | $5 credit/month | PostgreSQL Free | No sleep | Fast | Best overall |
| **Fly.io** | 3 VMs free | PostgreSQL Free | No sleep | Fast | Production ready |
| **Koyeb** | 1 service free | External DB | No sleep | Medium | Simple apps |
| **Render** | Free tier | PostgreSQL Free | Sleeps after 15min | Medium | Good balance |
| **PythonAnywhere** | 1 web app | MySQL free | No sleep | Slow | Python specific |
| **Cyclic.sh** | Unlimited | MongoDB free | No sleep | Fast | Node.js focus |

## 📊 Recommendation

**Best Choice: Railway.app** ✅
- $5 monthly credit (enough for small apps)
- No auto-sleep
- PostgreSQL included
- Fast deployments
- Good free tier limits

---

## 1️⃣ Railway.app Deployment (RECOMMENDED)

### Features:
- ✅ $5 free credits per month
- ✅ PostgreSQL database included
- ✅ No auto-sleep
- ✅ GitHub integration
- ✅ Automatic deployments

### Deployment Steps:

#### Step 1: Create Railway Account
1. Visit: https://railway.app
2. Sign up with GitHub
3. Verify your account

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Set root directory: `backend`

#### Step 3: Add PostgreSQL Database
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway will automatically create a database
3. Copy the `DATABASE_URL` from database settings

#### Step 4: Configure Environment Variables
Go to your service → Variables tab:

```bash
# Application Settings
APP_NAME=Todo Web Application API
DEBUG=false
ENVIRONMENT=production

# Database (Automatically set by Railway)
# DATABASE_URL will be auto-injected

# JWT Settings
JWT_SECRET_KEY=<generate-random-key>
JWT_REFRESH_SECRET_KEY=<generate-random-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Settings - Add Vercel domain after frontend deployment
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app

# Rate Limiting
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTHENTICATED=200/minute

# Better Auth
BETTER_AUTH_SECRET=<generate-random-key>
BETTER_AUTH_URL=https://your-backend.railway.app

# Logging
LOG_LEVEL=INFO
```

#### Step 5: Deploy
1. Railway will auto-deploy from GitHub
2. Wait for build to complete (2-3 minutes)
3. Copy your Railway URL (e.g., `https://your-app.railway.app`)

#### Step 6: Generate Secret Keys
```bash
# Generate JWT secrets
openssl rand -base64 32
```

### Railway CLI Deployment (Alternative):

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Link to project
railway link

# Add PostgreSQL
railway add

# Deploy
railway up

# Open in browser
railway open
```

---

## 2️⃣ Fly.io Deployment

### Features:
- ✅ 3 free VMs (256MB RAM each)
- ✅ PostgreSQL free tier
- ✅ No auto-sleep
- ✅ Global CDN
- ✅ Docker-based

### Prerequisites:
```bash
# Install Fly CLI
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Deployment Steps:

#### Step 1: Login
```bash
fly auth login
```

#### Step 2: Launch App
```bash
cd backend
fly launch

# Follow prompts:
# - App name: your-todo-backend
# - Region: Choose closest to you
# - PostgreSQL: Yes
# - Deploy now: No (configure first)
```

#### Step 3: Configure fly.toml
The file will be auto-created. Update if needed:

```toml
app = "your-todo-backend"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8000"
  ENVIRONMENT = "production"

[[services]]
  http_checks = []
  internal_port = 8000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

#### Step 4: Set Environment Variables
```bash
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set JWT_REFRESH_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app"
fly secrets set ENVIRONMENT="production"
fly secrets set DEBUG="false"
```

#### Step 5: Deploy
```bash
fly deploy
```

#### Step 6: Get Database URL
```bash
# If you created PostgreSQL
fly postgres connect -a your-db-name

# Set database URL
fly secrets set DATABASE_URL="postgresql://user:password@host/database"
```

---

## 3️⃣ Koyeb Deployment

### Features:
- ✅ 1 free web service
- ✅ No auto-sleep
- ✅ GitHub integration
- ✅ Easy deployment

### Deployment Steps:

#### Step 1: Create Account
1. Visit: https://koyeb.com
2. Sign up with GitHub

#### Step 2: Create Service
1. Click "Create Service"
2. Select "GitHub"
3. Select your repository
4. Set build settings:
   - **Builder**: Dockerfile
   - **Dockerfile path**: `backend/Dockerfile`
   - **Port**: 8000

#### Step 3: Environment Variables
Add in Koyeb dashboard:

```bash
DATABASE_URL=<neon-or-supabase-postgres-url>
JWT_SECRET_KEY=<generate>
JWT_REFRESH_SECRET_KEY=<generate>
BETTER_AUTH_SECRET=<generate>
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
ENVIRONMENT=production
DEBUG=false
```

#### Step 4: External Database
Koyeb doesn't provide free database, use:
- **Neon** (https://neon.tech) - Free PostgreSQL
- **Supabase** (https://supabase.com) - Free PostgreSQL
- **ElephantSQL** (https://www.elephantsql.com) - Free PostgreSQL (20MB)

#### Step 5: Deploy
Click "Deploy" and wait for build

---

## 4️⃣ Render Deployment (Existing)

Already documented, but quick recap:

### Deployment:
1. Visit: https://render.com
2. Create "New Web Service"
3. Connect GitHub repo
4. Select `backend` directory
5. Add environment variables
6. Deploy

**Note:** Free tier sleeps after 15 minutes of inactivity

---

## 5️⃣ PythonAnywhere Deployment

### Features:
- ✅ 1 free web app
- ✅ MySQL database free
- ✅ No auto-sleep
- ⚠️ PostgreSQL not free

### Deployment Steps:

#### Step 1: Create Account
1. Visit: https://www.pythonanywhere.com
2. Create free account

#### Step 2: Upload Code
```bash
# In PythonAnywhere bash console
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo/backend
```

#### Step 3: Create Virtual Environment
```bash
mkvirtualenv --python=/usr/bin/python3.10 todoenv
pip install -r requirements.txt
```

#### Step 4: Configure Web App
1. Go to "Web" tab
2. Click "Add a new web app"
3. Select "Manual configuration"
4. Python 3.10
5. Set working directory: `/home/yourusername/yourrepo/backend`
6. Edit WSGI file:

```python
import sys
path = '/home/yourusername/yourrepo/backend'
if path not in sys.path:
    sys.path.append(path)

from src.main import app as application
```

#### Step 5: Set Environment Variables
In Web tab → Environment variables section

---

## 🗄️ Free Database Options

If your hosting doesn't provide free PostgreSQL:

### Neon (RECOMMENDED)
- **URL**: https://neon.tech
- **Free Tier**: 3GB storage, 100 hours compute/month
- **Perfect for**: Production apps

### Supabase
- **URL**: https://supabase.com
- **Free Tier**: 500MB database, unlimited API requests
- **Perfect for**: Apps needing auth + database

### ElephantSQL
- **URL**: https://www.elephantsql.com
- **Free Tier**: 20MB storage
- **Perfect for**: Testing/small apps

### Aiven
- **URL**: https://aiven.io
- **Free Tier**: 30-day trial
- **Perfect for**: Evaluation

---

## 🚀 Post-Deployment Checklist

After deploying backend:

- [ ] Copy backend URL
- [ ] Test API endpoints: `https://your-backend.com/docs`
- [ ] Verify database connection
- [ ] Run database migrations if needed
- [ ] Update CORS with Vercel domain (after frontend deployment)
- [ ] Test authentication endpoints
- [ ] Monitor logs for errors

---

## 🔗 Next: Deploy Frontend to Vercel

After backend is deployed:

1. Update frontend environment variables:
   ```bash
   BACKEND_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.com/api
   ```

2. Follow Vercel deployment guide: `VERCEL_DEPLOYMENT_GUIDE.md`

3. Update backend CORS with Vercel URL

---

## 💡 Tips

1. **Railway** is the easiest and most reliable for free tier
2. **Fly.io** is best for production-grade apps
3. **Koyeb** is simple but requires external database
4. Always generate unique secrets for production
5. Use Neon for free PostgreSQL if platform doesn't provide
6. Monitor your usage to stay within free tier limits

---

## 🆘 Troubleshooting

### Build Failures
- Check Dockerfile is correct
- Verify requirements.txt has all dependencies
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is active
- Ensure SSL settings match

### CORS Errors
- Update CORS_ALLOWED_ORIGINS with your frontend URL
- Include both main and preview deployment domains

---

**Ready to deploy? Start with Railway for the best experience!** 🚀
