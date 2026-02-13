# 🚀 Quick Start - 20 Minutes to Deploy

## ⚡ Fastest Path to Deployment

### Choice 1: Railway + Vercel (EASIEST) ⭐

```
Time: 15 minutes
Difficulty: ⭐⭐☆☆☆
Cost: Free ($5 credit/month)
```

**Backend (Railway):**
1. Go to https://railway.app → Sign in with GitHub
2. New Project → Deploy from GitHub → Select repo → `backend` folder
3. Add PostgreSQL: Click "+ New" → Database → PostgreSQL
4. Set variables: JWT_SECRET_KEY, BETTER_AUTH_SECRET, CORS_ALLOWED_ORIGINS
5. Deploy → Copy URL

**Frontend (Vercel):**
1. Go to https://vercel.com/new → Import repo → `frontend` folder
2. Set variables: BACKEND_API_URL, NEXT_PUBLIC_BACKEND_API_URL, BETTER_AUTH_SECRET
3. Deploy → Copy URL
4. Update Railway CORS with Vercel URL

**Done! 🎉**

---

### Choice 2: Fly.io + Vercel (PRODUCTION READY)

```
Time: 20 minutes
Difficulty: ⭐⭐⭐☆☆
Cost: Free (3 VMs)
```

**Backend (Fly.io):**
```bash
# Install CLI
iwr https://fly.io/install.ps1 -useb | iex

# Deploy
cd backend
fly auth login
fly launch
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly deploy
```

**Frontend:** Same as above (Vercel)

---

## 🎯 Use Helper Script (RECOMMENDED)

```powershell
.\tmp_rovodev_deploy_helper.ps1
```

**This script will:**
- ✅ Guide you through platform selection
- ✅ Generate all secret keys automatically
- ✅ Provide step-by-step instructions
- ✅ Save environment variables to files
- ✅ Open necessary dashboards

---

## 📋 Environment Variables Cheat Sheet

### Backend (Railway/Fly.io/Koyeb)

```bash
# Generate these:
JWT_SECRET_KEY=<openssl rand -base64 32>
JWT_REFRESH_SECRET_KEY=<openssl rand -base64 32>
BETTER_AUTH_SECRET=<openssl rand -base64 32>

# Set these:
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
ENVIRONMENT=production
DEBUG=false
```

### Frontend (Vercel)

```bash
BACKEND_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.railway.app/api
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_URL=https://your-app.vercel.app
```

---

## ✅ Success Checklist

- [ ] Backend deployed and accessible at `/docs`
- [ ] Frontend deployed and loads
- [ ] Login/signup works
- [ ] Tasks can be created
- [ ] AI chat responds
- [ ] No CORS errors in browser console

---

## 🆘 Common Issues

**CORS Error?**
→ Add Vercel URL to backend CORS_ALLOWED_ORIGINS

**API calls failing?**
→ Check BACKEND_API_URL in Vercel matches backend URL

**Auth not working?**
→ Ensure BETTER_AUTH_SECRET is same in backend and frontend

---

## 📚 Need More Details?

- **Platform Comparison**: `BACKEND_FREE_HOSTING_GUIDE.md`
- **Complete Guide**: `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Vercel Details**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Full Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

**Start Now:**
```powershell
.\tmp_rovodev_deploy_helper.ps1
```
