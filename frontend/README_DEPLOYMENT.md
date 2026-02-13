# 🚀 Quick Deployment Guide

## Deploy to Vercel in 3 Steps

### Step 1: Prepare Backend (5 minutes)

Your backend on Render needs to allow requests from Vercel:

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Click "Environment" tab
4. Find `CORS_ALLOWED_ORIGINS` variable
5. Update it to include your Vercel domain:
   ```
   http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
   ```
6. Click "Save Changes" and wait for redeploy

### Step 2: Deploy Frontend (2 minutes)

#### Option A: Using Vercel Dashboard (Easiest)

1. Visit: https://vercel.com/new
2. Click "Import Project"
3. Select your Git repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
5. Add Environment Variables:
   ```
   BACKEND_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.onrender.com/api
   BETTER_AUTH_SECRET=<generate-random-32-char-string>
   BETTER_AUTH_URL=https://your-app.vercel.app
   ```
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Step 3: Post-Deployment (2 minutes)

After your first deployment:

1. Copy your Vercel URL (e.g., `https://your-app-abc123.vercel.app`)
2. Update environment variables:
   - Update `BETTER_AUTH_URL` with your actual Vercel URL
3. Update backend CORS with your actual Vercel domain
4. Redeploy if needed

## Environment Variables Quick Reference

Generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

Or use Node.js:
```javascript
require('crypto').randomBytes(32).toString('base64')
```

## Verify Deployment

Visit your Vercel URL and test:
- ✅ Page loads
- ✅ Login works
- ✅ Tasks can be created
- ✅ AI chatbot responds
- ✅ No CORS errors in console

## Troubleshooting

**CORS Error?**
→ Update backend `CORS_ALLOWED_ORIGINS` on Render

**Auth not working?**
→ Check `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are set correctly

**API calls failing?**
→ Verify `BACKEND_API_URL` points to your Render backend

## Need More Help?

📖 Full Guide: See `VERCEL_DEPLOYMENT_GUIDE.md` in project root
✅ Checklist: See `DEPLOYMENT_CHECKLIST.md` in project root

---

**Total Time: ~10 minutes** ⏱️
