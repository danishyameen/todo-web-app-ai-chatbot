# 🚀 Fly.io + Vercel Complete Deployment Guide

Production-ready deployment using Fly.io (backend) and Vercel (frontend).

## ⏱️ Total Time: 20-25 minutes

```
Step 1: Install CLIs           → 5 min
Step 2: Deploy Backend (Fly.io) → 10 min
Step 3: Deploy Frontend (Vercel) → 5 min
Step 4: Connect & Test          → 5 min
```

---

## Part 1️⃣: Install Required CLIs

### Install Fly.io CLI (Windows PowerShell)

```powershell
# Run as Administrator (if possible)
iwr https://fly.io/install.ps1 -useb | iex
```

**After installation:**
- Close and reopen PowerShell
- Verify: `fly version`

### Install Vercel CLI (Already Installed ✅)

```powershell
# If not installed:
npm install -g vercel
```

**Verify:** `vercel --version`

---

## Part 2️⃣: Deploy Backend to Fly.io

### Step 1: Login to Fly.io

```powershell
fly auth login
```

Browser window will open → Login with email or GitHub

### Step 2: Navigate to Backend

```powershell
cd backend
```

### Step 3: Launch App (Initialize)

```powershell
fly launch
```

**Prompts you'll see:**

```
? Choose an app name: <your-app-name>
  Example: todo-backend-xyz
  
? Choose a region: 
  Select closest to you (e.g., sjc = San Jose, lhr = London)
  
? Would you like to set up a PostgreSQL database? Yes
  
? Select configuration: Development (Free)
  
? Would you like to deploy now? No (We'll set secrets first)
```

This creates:
- ✅ `fly.toml` configuration file
- ✅ PostgreSQL database
- ✅ App on Fly.io (not deployed yet)

### Step 4: Set Environment Variables (Secrets)

```powershell
# Generate and set JWT secrets
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set JWT_REFRESH_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"

# Set other environment variables
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000"
fly secrets set ENVIRONMENT="production"
fly secrets set DEBUG="false"
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES="30"
fly secrets set REFRESH_TOKEN_EXPIRE_DAYS="7"
fly secrets set RATE_LIMIT_DEFAULT="100/minute"
fly secrets set RATE_LIMIT_AUTHENTICATED="200/minute"
```

**Note:** `DATABASE_URL` is automatically set by Fly.io PostgreSQL addon

### Step 5: Deploy Backend

```powershell
fly deploy
```

**Deployment process:**
- Builds Docker image
- Pushes to Fly.io registry
- Deploys to VMs
- Time: ~3-5 minutes

### Step 6: Get Backend URL

```powershell
fly status
```

Copy your URL: `https://your-app-name.fly.dev`

### Step 7: Test Backend

```powershell
# Open in browser
fly open

# Or visit
# https://your-app-name.fly.dev/docs
```

Should see FastAPI Swagger documentation!

---

## Part 3️⃣: Deploy Frontend to Vercel

### Step 1: Navigate to Frontend

```powershell
cd ../frontend
```

### Step 2: Login to Vercel

```powershell
vercel login
```

### Step 3: Set Environment Variables

Vercel will prompt you during deployment, but you can also set them beforehand:

**Required Variables:**
```
BACKEND_API_URL=https://your-app-name.fly.dev
NEXT_PUBLIC_BACKEND_API_URL=https://your-app-name.fly.dev/api
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_URL=https://your-app.vercel.app
```

### Step 4: Deploy to Vercel

```powershell
# First deployment (preview)
vercel

# Production deployment
vercel --prod
```

**Prompts:**

```
? Set up and deploy? Yes

? Which scope? <Select your account>

? Link to existing project? No

? What's your project's name? todo-frontend

? In which directory is your code located? ./
```

**Environment Variables (during deployment):**

```
? Add environment variables? Yes

? Name: BACKEND_API_URL
? Value: https://your-app-name.fly.dev

? Add another? Yes

? Name: NEXT_PUBLIC_BACKEND_API_URL
? Value: https://your-app-name.fly.dev/api

? Add another? Yes

? Name: BETTER_AUTH_SECRET
? Value: <paste-same-secret-from-backend>

? Add another? Yes

? Name: BETTER_AUTH_URL
? Value: https://your-app.vercel.app
```

### Step 5: Get Frontend URL

After deployment completes:
```
✅ Production: https://your-app.vercel.app
```

---

## Part 4️⃣: Connect Backend & Frontend

### Update Backend CORS

Backend needs to allow requests from Vercel domain:

```powershell
cd ../backend

# Update CORS to include Vercel URL
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app"
```

This automatically redeploys backend.

### Update Frontend BETTER_AUTH_URL (if needed)

If your Vercel URL is different from what you set:

```powershell
cd ../frontend

# Update environment variable
vercel env add BETTER_AUTH_URL production

# Then redeploy
vercel --prod
```

---

## Part 5️⃣: Testing

### Test Backend:

```powershell
# Visit API docs
start https://your-app-name.fly.dev/docs

# Test health endpoint
curl https://your-app-name.fly.dev/health
```

### Test Frontend:

```powershell
# Open in browser
start https://your-app.vercel.app
```

**Checklist:**
- [ ] Page loads without errors
- [ ] Can sign up / login
- [ ] Can create tasks
- [ ] AI chatbot responds
- [ ] No CORS errors in browser console (F12)

---

## 🎯 Final Configuration Summary

### Backend (Fly.io)

**URL:** `https://your-app-name.fly.dev`

**Environment Variables:**
```bash
DATABASE_URL=<auto-configured>
JWT_SECRET_KEY=<generated>
JWT_REFRESH_SECRET_KEY=<generated>
BETTER_AUTH_SECRET=<generated>
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
ENVIRONMENT=production
DEBUG=false
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTHENTICATED=200/minute
```

### Frontend (Vercel)

**URL:** `https://your-app.vercel.app`

**Environment Variables:**
```bash
BACKEND_API_URL=https://your-app-name.fly.dev
NEXT_PUBLIC_BACKEND_API_URL=https://your-app-name.fly.dev/api
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_URL=https://your-app.vercel.app
```

---

## 📊 Useful Commands

### Fly.io Commands

```powershell
# View logs
fly logs

# Check status
fly status

# SSH into VM
fly ssh console

# View secrets (names only)
fly secrets list

# Scale app
fly scale count 1

# View dashboard
fly dashboard

# Destroy app (careful!)
fly apps destroy <app-name>
```

### Vercel Commands

```powershell
# View deployments
vercel list

# View logs
vercel logs <deployment-url>

# Remove deployment
vercel remove <deployment-name>

# View environment variables
vercel env ls

# Pull environment variables
vercel env pull
```

---

## 🔧 Troubleshooting

### Issue: Fly.io deployment fails

**Check build logs:**
```powershell
fly logs
```

**Common issues:**
- Dockerfile errors → Check `backend/Dockerfile`
- Port issues → Ensure app listens on `0.0.0.0:8000`
- Dependencies → Check `requirements.txt`

### Issue: Database connection fails

**Check database status:**
```powershell
fly postgres list
fly postgres connect -a <db-name>
```

**Verify DATABASE_URL:**
```powershell
fly secrets list
```

### Issue: CORS errors in frontend

**Update CORS:**
```powershell
fly secrets set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app"
```

### Issue: Frontend can't connect to backend

**Verify environment variables:**
```powershell
vercel env ls
```

**Check URLs are correct:**
- Backend: `https://your-app-name.fly.dev`
- No trailing slashes
- HTTPS (not HTTP)

### Issue: Authentication not working

**Ensure BETTER_AUTH_SECRET is same in both:**
```powershell
# Check backend
fly secrets list

# Check frontend
vercel env ls
```

---

## 💰 Free Tier Limits

### Fly.io Free Tier:
- ✅ 3 shared-cpu-1x VMs (256MB RAM)
- ✅ 3GB persistent volume
- ✅ 160GB outbound data transfer/month
- ✅ PostgreSQL: 1GB storage, 100 hours compute/month

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Unlimited team members
- ✅ Automatic HTTPS

**Both are free forever!** 🎉

---

## 🚀 Next Steps

After successful deployment:

1. [ ] Set up custom domain (optional)
2. [ ] Enable Vercel Analytics
3. [ ] Set up monitoring (e.g., Sentry)
4. [ ] Configure CI/CD (auto-deploy on push)
5. [ ] Add SSL certificates (automatic on both platforms)
6. [ ] Set up database backups (Fly.io PostgreSQL)
7. [ ] Add deployment badges to README

---

## 📚 Additional Resources

**Fly.io:**
- Docs: https://fly.io/docs
- Dashboard: https://fly.io/dashboard
- Community: https://community.fly.io

**Vercel:**
- Docs: https://vercel.com/docs
- Dashboard: https://vercel.com/dashboard
- Community: https://github.com/vercel/vercel/discussions

---

## ✅ Success Checklist

- [ ] Fly.io CLI installed
- [ ] Vercel CLI installed
- [ ] Backend deployed to Fly.io
- [ ] PostgreSQL database created
- [ ] All environment variables set
- [ ] Backend accessible at `/docs`
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Authentication works
- [ ] Tasks can be created
- [ ] AI chatbot responds
- [ ] No console errors

---

**Total Cost: $0 (Free tier)** 💰

**Total Time: ~20-25 minutes** ⏱️

**Difficulty: Medium** ⭐⭐⭐☆☆

---

**Ready for production! 🎉**
