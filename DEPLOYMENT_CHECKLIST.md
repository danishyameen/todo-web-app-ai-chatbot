# Deployment Checklist - Frontend to Vercel

## Pre-Deployment Checklist

### ✅ Configuration Files
- [x] `next.config.js` - Optimized for Vercel (standalone mode removed)
- [x] `vercel.json` - Build and function settings configured
- [x] `package.json` - All dependencies and scripts ready
- [x] `.env.example` - Environment variables template created

### 📋 Backend Preparation (Important!)

Before deploying frontend to Vercel, update your backend CORS settings:

1. **Update Backend Environment Variables**
   
   Add your Vercel domain to `CORS_ALLOWED_ORIGINS` in your backend (Render):
   
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
   ```
   
   **Note:** The `https://your-app-*.vercel.app` pattern allows preview deployments.

2. **Where to Update:**
   - Go to your Render dashboard
   - Select your backend service
   - Go to "Environment" tab
   - Update `CORS_ALLOWED_ORIGINS` variable
   - Save and redeploy

## Deployment Steps

### Step 1: Deploy to Vercel

Choose one method:

#### Option A: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your repository
3. Set root directory to `frontend`
4. Configure environment variables (see below)
5. Click "Deploy"

#### Option B: Vercel CLI
```bash
cd frontend
vercel login
vercel
vercel --prod
```

### Step 2: Configure Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
BACKEND_API_URL=https://your-backend-api.onrender.com
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.onrender.com/api
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=https://your-app.vercel.app
```

**To generate `BETTER_AUTH_SECRET`:**
```bash
openssl rand -base64 32
```

### Step 3: Post-Deployment Updates

1. **Update BETTER_AUTH_URL**
   - After first deployment, update `BETTER_AUTH_URL` with your actual Vercel URL
   - Redeploy to apply changes

2. **Update Backend CORS** (if not done in pre-deployment)
   - Add your Vercel domain to backend's `CORS_ALLOWED_ORIGINS`
   - Redeploy backend

3. **Test the Application**
   - Visit your Vercel URL
   - Test authentication (login/signup)
   - Test task creation and AI chat
   - Check browser console for errors

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BACKEND_API_URL` | Yes | Backend API for server-side | `https://api.onrender.com` |
| `NEXT_PUBLIC_BACKEND_API_URL` | Yes | Backend API for client-side | `https://api.onrender.com/api` |
| `BETTER_AUTH_SECRET` | Yes | Auth session encryption key | Generate with openssl |
| `BETTER_AUTH_URL` | Yes | Your frontend URL | `https://app.vercel.app` |

### Backend (Render)

| Variable | Update Needed | New Value |
|----------|---------------|-----------|
| `CORS_ALLOWED_ORIGINS` | Yes | Add Vercel domains |

**Updated CORS value:**
```
http://localhost:3000,https://your-app.vercel.app,https://your-app-*.vercel.app
```

## Verification Steps

After deployment, verify:

- [ ] Frontend loads successfully at Vercel URL
- [ ] No console errors in browser DevTools
- [ ] Login/Signup works
- [ ] Tasks can be created and viewed
- [ ] AI chatbot responds
- [ ] API calls to backend succeed
- [ ] Authentication persists on page reload

## Troubleshooting

### Issue: CORS errors in browser console
**Solution:** Update backend `CORS_ALLOWED_ORIGINS` to include your Vercel domain

### Issue: Authentication not working
**Solution:** 
- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your Vercel domain
- Ensure secret is the same across all deployments

### Issue: API calls failing
**Solution:**
- Check `BACKEND_API_URL` and `NEXT_PUBLIC_BACKEND_API_URL` are correct
- Verify backend is running (visit backend URL)
- Check backend logs for errors

### Issue: Build fails on Vercel
**Solution:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Try building locally: `npm run build`

## Quick Commands

### Test local build
```bash
cd frontend
npm run build
npm run start
```

### Deploy to Vercel (CLI)
```bash
cd frontend
vercel --prod
```

### View deployment logs
```bash
vercel logs <deployment-url>
```

### Set environment variable (CLI)
```bash
vercel env add VARIABLE_NAME
```

## Next Steps After Deployment

1. [ ] Set up custom domain (optional)
2. [ ] Enable Vercel Analytics
3. [ ] Set up monitoring/alerts
4. [ ] Configure preview deployments
5. [ ] Add deployment status badge to README

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Vercel CLI:** https://vercel.com/docs/cli
- **CORS Guide:** https://vercel.com/guides/how-to-enable-cors

---

**Ready to Deploy?** Follow the steps above and your app will be live in minutes! 🚀
