# Railway GitHub Auto-Deploy Setup Guide

## Railway pe GitHub se automatic deployment enable karne ka tareeqa:

### Step 1: Railway Dashboard kholo
1. https://railway.app/dashboard pe jao
2. Apna `todo-backend` project select karo

### Step 2: GitHub Repository Connect karo
1. Project settings mein jao
2. **"Connect GitHub Repository"** button dhundo
3. GitHub authorize karo (agar pehli baar hai)
4. Repository select karo: `danishyameen/todo-web-app-ai-chatbot`
5. Branch select karo: `1-todo-ai-chatbot`
6. Root directory set karo: `backend/` (important!)

### Step 3: Build & Deploy Settings
Railway automatically detect kar lega:
- **Build Command**: (Automatically detected)
- **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- **Install Command**: `pip install -r requirements.txt`

### Step 4: Environment Variables
Pehle se jo variables set kiye the wo rahenge:
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ALLOWED_ORIGINS` (yeh add karna hai agar nahi kiya)

### Step 5: Deploy Triggers
Settings mein check karo:
- ✅ Auto-deploy on push to `1-todo-ai-chatbot` branch
- ✅ PR previews (optional)

---

## ✨ Benefits of GitHub Connection:

1. **Automatic Deployment**: Har commit pe auto-deploy
2. **Rollback**: Purani deployments pe easily rollback
3. **Preview Deployments**: Pull requests ka automatic preview
4. **Build Logs**: GitHub commits ke saath linked

---

## 🚨 Important Notes:

1. **Root Directory**: Railway ko batana padega ke backend code `backend/` folder mein hai
2. **Environment Variables**: Pehle se set variables persist rahenge
3. **Branch**: `1-todo-ai-chatbot` branch ko production branch set karo
4. **CORS**: GitHub connect karne ke baad, CORS_ALLOWED_ORIGINS check karo

---

## 📝 Current Setup vs GitHub Setup:

| Feature | Manual Deploy | GitHub Auto-Deploy |
|---------|---------------|-------------------|
| Deploy on git push | ❌ No | ✅ Yes |
| Rollback to previous | ❌ Hard | ✅ Easy |
| Build logs | ✅ Yes | ✅ Yes + Git history |
| Environment sync | Manual | Automatic |
| Deploy previews | ❌ No | ✅ Yes (PRs) |

---

## 🔗 Railway CLI Alternative:

Agar CLI se connect karna chahte ho:

```bash
# Railway login karo
railway login

# Backend folder mein jao
cd backend

# Railway project se link karo
railway link

# GitHub repo connect karo
railway connect

# Environment variables sync karo (optional)
railway variables
```

---

## ⚡ Quick Summary:

**Vercel**: Already auto-deploying ✅  
**Railway**: Manual setup needed ❌

**Recommendation**: Railway dashboard se GitHub connect karo for automatic deployments!
