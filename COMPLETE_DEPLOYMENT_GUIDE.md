# 🚀 Complete Deployment Guide - Backend + Frontend

Yeh complete guide aapko **backend** (free hosting par) aur **frontend** (Vercel par) deploy karne mein madad karegi.

## 📋 Quick Overview

```
Step 1: Backend Deploy (Railway/Fly.io/Koyeb) → 10-15 minutes
Step 2: Frontend Deploy (Vercel)             → 5 minutes
Step 3: Connect Both                         → 2 minutes
Total Time: ~20 minutes
```

---

## 🎯 Deployment Flow

```
1. Backend Deploy → Get Backend URL
2. Frontend Deploy → Configure with Backend URL
3. Update Backend CORS → Add Vercel URL
4. Test Everything → Done! 🎉
```

---

## Part 1️⃣: Backend Deployment

### Option A: Railway.app (RECOMMENDED) ⭐

**Why Railway?**
- ✅ $5 free credit/month (enough for small apps)
- ✅ PostgreSQL included
- ✅ No auto-sleep
- ✅ Fast deployments
- ✅ Easiest setup

#### Quick Deploy:

1. **Create Account**
   - Visit: https://railway.app
   - Sign in with GitHub

2. **New Project**
   ```
   Click "New Project" → "Deploy from GitHub repo"
   Select your repository
   Root directory: backend
   ```

3. **Add Database**
   ```
   Click "+ New" → "Database" → "PostgreSQL"
   Railway auto-configures DATABASE_URL
   ```

4. **Set Environment Variables**
   ```bash
   # Go to Service → Variables
   JWT_SECRET_KEY=<openssl rand -base64 32>
   JWT_REFRESH_SECRET_KEY=<openssl rand -base64 32>
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ENVIRONMENT=production
   DEBUG=false
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   RATE_LIMIT_DEFAULT=100/minute
   RATE_LIMIT_AUTHENTICATED=200/minute
   ```

5. **Deploy & Get URL**
   - Auto-deploys from GitHub
   - Copy your URL: `https://your-app.railway.app`
   - Save this URL for frontend setup

6. **Test Backend**
   ```
   Visit: https://your-app.railway.app/docs
   Should see FastAPI documentation
   ```

---

### Option B: Fly.io

**Why Fly.io?**
- ✅ 3 free VMs
- ✅ Production-grade
- ✅ Global edge network
- ✅ No auto-sleep

#### Quick Deploy:

```bash
# Install Fly CLI (Windows PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Login
fly auth login

# Navigate to backend
cd backend

# Launch (creates fly.toml)
fly launch
# Choose: PostgreSQL database? Yes

# Set secrets
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set JWT_REFRESH_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000"
fly secrets set ENVIRONMENT="production"

# Deploy
fly deploy

# Get URL
fly status
# Copy the URL: https://your-app.fly.dev
```

---

### Option C: Koyeb

**Why Koyeb?**
- ✅ Simple deployment
- ✅ No auto-sleep
- ✅ GitHub integration

#### Quick Deploy:

1. **Create Account**: https://koyeb.com
2. **New Service**: GitHub → Select repo → `backend` directory
3. **External Database** (Koyeb doesn't provide free DB):
   - Use **Neon**: https://neon.tech (Free PostgreSQL)
   - Create database, copy connection string

4. **Environment Variables**:
   ```bash
   DATABASE_URL=<neon-postgres-url>
   JWT_SECRET_KEY=<generate>
   JWT_REFRESH_SECRET_KEY=<generate>
   BETTER_AUTH_SECRET=<generate>
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ENVIRONMENT=production
   ```

5. **Deploy**: Click deploy button
6. **Copy URL**: `https://your-app.koyeb.app`

---

### Free Database Options (if needed)

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **Neon** | 3GB, 100hrs/month | Production apps |
| **Supabase** | 500MB | Apps with auth |
| **ElephantSQL** | 20MB | Testing |

**Neon Setup** (Recommended):
```
1. Visit: https://neon.tech
2. Sign in with GitHub
3. Create new project
4. Copy connection string
5. Use as DATABASE_URL
```

---

## Part 2️⃣: Frontend Deployment (Vercel)

### Quick Deploy:

1. **Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Import your GitHub repository
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)

2. **Environment Variables**
   ```bash
   # Add in Vercel dashboard
   BACKEND_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.railway.app/api
   BETTER_AUTH_SECRET=<same-as-backend>
   BETTER_AUTH_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy Vercel URL: `https://your-app.vercel.app`

### Vercel CLI (Alternative):

```bash
# Install
npm i -g vercel

# Deploy
cd frontend
vercel login
vercel --prod

# Set environment variables
vercel env add BACKEND_API_URL
vercel env add NEXT_PUBLIC_BACKEND_API_URL
vercel env add BETTER_AUTH_SECRET
vercel env add BETTER_AUTH_URL
```

---

## Part 3️⃣: Connect Backend & Frontend

### Update Backend CORS:

Backend ko frontend se requests accept karne ke liye CORS update karein:

**Railway:**
```
1. Railway Dashboard → Your Service → Variables
2. Update CORS_ALLOWED_ORIGINS:
   http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
3. Redeploy
```

**Fly.io:**
```bash
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app"
```

**Koyeb:**
```
1. Koyeb Dashboard → Your Service → Environment
2. Update CORS_ALLOWED_ORIGINS
3. Redeploy
```

### Update Frontend (if needed):

Agar first deployment ke baad Vercel URL change hua:

```
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update BETTER_AUTH_URL with actual Vercel URL
3. Redeploy
```

---

## Part 4️⃣: Testing

### Test Backend:
```
✅ Visit: https://your-backend-url/docs
✅ Check: API documentation loads
✅ Test: /health or /api/health endpoint
```

### Test Frontend:
```
✅ Visit: https://your-app.vercel.app
✅ Check: Page loads without errors
✅ Test: Login/Signup works
✅ Test: Task creation works
✅ Test: AI chatbot responds
```

### Browser Console:
```
✅ No CORS errors
✅ No 404 errors for API calls
✅ Authentication works
```

---

## 🎉 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Backend API docs working at `/docs`
- [ ] Database connected and tables created
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] Login/Signup works
- [ ] Tasks can be created
- [ ] AI chatbot responds
- [ ] No CORS errors in console
- [ ] Both apps using HTTPS

---

## 📊 Deployment Summary

### Your Deployed URLs:
```
Backend:  https://your-app.railway.app
Frontend: https://your-app.vercel.app
API Docs: https://your-app.railway.app/docs
```

### Environment Variables Setup:

**Backend (Railway/Fly.io/Koyeb):**
```bash
DATABASE_URL=<auto-or-neon>
JWT_SECRET_KEY=<generated>
JWT_REFRESH_SECRET_KEY=<generated>
BETTER_AUTH_SECRET=<generated>
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
ENVIRONMENT=production
DEBUG=false
```

**Frontend (Vercel):**
```bash
BACKEND_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.railway.app/api
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_URL=https://your-app.vercel.app
```

---

## 🔧 Troubleshooting

### Issue: CORS errors
**Fix:** Update backend `CORS_ALLOWED_ORIGINS` with your Vercel domain

### Issue: API calls fail
**Fix:** Check `BACKEND_API_URL` in Vercel matches your backend URL

### Issue: Auth not working
**Fix:** Ensure `BETTER_AUTH_SECRET` is same in both backend and frontend

### Issue: Database connection fails
**Fix:** Check `DATABASE_URL` is correct and database is active

### Issue: Build fails
**Fix:** Check logs in platform dashboard, verify all dependencies installed

---

## 📚 Detailed Guides

- **Backend Options**: `BACKEND_FREE_HOSTING_GUIDE.md`
- **Vercel Frontend**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Quick Start**: `frontend/README_DEPLOYMENT.md`

---

## 🚀 Quick Deploy Commands

### Railway + Vercel (Fastest):
```bash
# 1. Backend (Railway Dashboard)
# - Go to railway.app → New Project → Deploy from GitHub
# - Add PostgreSQL database
# - Set environment variables
# - Deploy

# 2. Frontend
cd frontend
npm i -g vercel
vercel login
vercel --prod
# Set environment variables when prompted

# 3. Update CORS in Railway dashboard

# Done! 🎉
```

### Fly.io + Vercel:
```bash
# 1. Backend
cd backend
fly launch
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly deploy

# 2. Frontend
cd ../frontend
vercel --prod

# 3. Update CORS
fly secrets set CORS_ALLOWED_ORIGINS="https://your-app.vercel.app"
```

---

## 💡 Pro Tips

1. **Always use HTTPS** in production
2. **Generate unique secrets** for each deployment
3. **Monitor free tier limits** to avoid charges
4. **Use environment variables** for all secrets
5. **Test locally first** before deploying
6. **Keep secrets safe** - never commit to Git
7. **Enable logging** to debug issues
8. **Set up monitoring** for uptime tracking

---

## 🎯 Next Steps

After successful deployment:

1. [ ] Set up custom domain (optional)
2. [ ] Enable analytics (Vercel Analytics)
3. [ ] Set up error tracking (Sentry)
4. [ ] Configure CI/CD (auto-deploy on push)
5. [ ] Add monitoring/uptime checks
6. [ ] Set up backups for database
7. [ ] Add deployment status badges to README

---

**Total Deployment Time: ~20 minutes**

**Difficulty Level: Easy** ⭐⭐☆☆☆

**Cost: $0 (Free tier)** 💰

---

**Ready to deploy? Choose Railway for easiest experience!** 🚀
