# 🚀 Complete Deployment Guide - Todo AI Chatbot

## Prerequisites
- ✅ GitHub Account
- ✅ Vercel Account (connect with GitHub)
- ✅ Neon/Supabase PostgreSQL Database (free tier)
- ✅ Railway/Render Account for Backend (optional - for production)

---

## 🎯 DEPLOYMENT STEPS

### **STEP 1: Prepare GitHub Repository**

```bash
# Add all changes to git
git add .

# Commit changes
git commit -m "feat: Add multi-language AI navigation, PWA notifications, and review system"

# Push to GitHub
git push origin 1-todo-ai-chatbot
```

---

### **STEP 2: Setup Environment Variables**

#### **Frontend (.env.local)**
Create these variables in Vercel dashboard:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Better Auth (if using)
BETTER_AUTH_SECRET=your-random-secret-key-here
BETTER_AUTH_URL=https://your-app.vercel.app

# Database (for Better Auth)
DATABASE_URL=postgresql://user:password@hostname:5432/database
```

#### **Backend (.env)**
Setup these on Railway/Render:

```bash
# Database
DATABASE_URL=postgresql://user:password@hostname:5432/database

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# CORS (Important!)
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=same-as-frontend
BETTER_AUTH_URL=https://your-app.vercel.app
```

---

### **STEP 3: Deploy Frontend to Vercel**

#### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to** https://vercel.com/new
2. **Import** your GitHub repository: `danishyameen/todo-web-app-ai-chatbot`
3. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   DATABASE_URL=your-neon-db-url
   BETTER_AUTH_SECRET=random-secret-key
   BETTER_AUTH_URL=https://your-app.vercel.app
   ```

5. **Click Deploy** 🚀

#### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts and set environment variables
```

---

### **STEP 4: Deploy Backend**

#### **Option A: Railway (Recommended - Free Tier)**

1. **Go to** https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select** your repository
4. **Configure:**
   - Root Directory: `/backend`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables: Add all backend .env variables

5. **Deploy** and copy the deployment URL

#### **Option B: Render**

1. **Go to** https://render.com
2. **New Web Service**
3. **Connect** your GitHub repository
4. **Configure:**
   - Name: `todo-ai-chatbot-backend`
   - Root Directory: `backend`
   - Runtime: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables:** Add all backend .env variables
6. **Create Web Service**

---

### **STEP 5: Update Frontend with Backend URL**

After backend is deployed:

1. Copy backend URL (e.g., `https://your-backend.railway.app`)
2. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` with your backend URL
4. **Redeploy** frontend (Vercel → Deployments → Redeploy)

---

### **STEP 6: Database Setup (Neon PostgreSQL)**

1. **Go to** https://neon.tech
2. **Create** a new project (free tier)
3. **Copy** connection string
4. **Add to both:**
   - Vercel (for frontend/Better Auth)
   - Railway/Render (for backend)

5. **Run migrations:**
   ```bash
   # If using Alembic
   cd backend
   alembic upgrade head
   ```

---

### **STEP 7: Configure CORS**

Update backend `ALLOWED_ORIGINS` with your Vercel URL:

**In Railway/Render Environment Variables:**
```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-preview.vercel.app
```

---

### **STEP 8: Test Deployment** ✅

1. **Visit** your Vercel URL
2. **Test Features:**
   - ✅ PWA Install Notification appears
   - ✅ User signup/login works
   - ✅ Task creation via AI chat
   - ✅ Multi-language commands work
   - ✅ Navigation via chat works
   - ✅ Review submission works

3. **Check Console** for any errors
4. **Test API Connection:**
   ```bash
   curl https://your-backend.railway.app/health
   # Should return: {"status": "healthy"}
   ```

---

## 🔧 Troubleshooting

### **Problem: Frontend can't connect to backend**
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check CORS settings in backend
- Ensure backend is running (visit backend URL)

### **Problem: Database connection error**
**Solution:**
- Verify `DATABASE_URL` format
- Check Neon database is active
- Test connection from backend logs

### **Problem: Authentication not working**
**Solution:**
- Ensure `BETTER_AUTH_SECRET` is same in frontend & backend
- Verify `BETTER_AUTH_URL` points to Vercel URL
- Check database tables are created

### **Problem: PWA not installing**
**Solution:**
- Verify `manifest.json` is accessible
- Check `sw.js` is in `public` folder
- Must be on HTTPS (Vercel provides this)

---

## 📊 Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Database created on Neon
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] PWA manifest accessible
- [ ] Service worker registered
- [ ] All features tested on production

---

## 🌐 Useful Commands

```bash
# View Vercel logs
vercel logs

# Redeploy frontend
vercel --prod

# View Railway logs
railway logs

# Connect to Neon database
psql $DATABASE_URL

# Test backend health
curl https://your-backend-url/health
```

---

## 🎉 Success!

Your app is now live at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app

Share your app URL and enjoy! 🚀
