# Vercel Deployment Guide - Frontend

This guide will help you deploy your Todo AI Chatbot frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git repository with your code pushed to GitHub, GitLab, or Bitbucket
3. Backend API deployed and running (e.g., on Render)

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Connect Your Repository**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your Git provider and repository
   - Select the repository containing this project

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Set Environment Variables**
   
   Click on "Environment Variables" and add the following:

   ```
   BACKEND_API_URL=https://your-backend-api.onrender.com
   NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.onrender.com/api
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=https://your-app.vercel.app
   ```

   **Important Notes:**
   - Replace `your-backend-api.onrender.com` with your actual backend URL
   - Generate a secure random string for `BETTER_AUTH_SECRET` (use: `openssl rand -base64 32`)
   - After first deployment, update `BETTER_AUTH_URL` with your actual Vercel URL

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

5. **Post-Deployment**
   - Update `BETTER_AUTH_URL` environment variable with your actual Vercel URL
   - Redeploy to apply the changes

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Frontend Directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first time)
   - Project name? Press enter or provide a name
   - In which directory is your code located? `./`

5. **Set Environment Variables**
   ```bash
   vercel env add BACKEND_API_URL
   vercel env add NEXT_PUBLIC_BACKEND_API_URL
   vercel env add BETTER_AUTH_SECRET
   vercel env add BETTER_AUTH_URL
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `BACKEND_API_URL` | Backend API URL for server-side calls | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API URL for client-side calls | `https://your-api.onrender.com/api` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session encryption | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your frontend URL | `https://your-app.vercel.app` |

## Configuration Files

### `next.config.js`
✅ Already configured for Vercel deployment (standalone mode removed)

### `vercel.json`
✅ Already configured with:
- Function memory allocation
- Build and install commands

### `package.json`
✅ All scripts configured:
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run dev` - Development server

## Troubleshooting

### Build Failures

**Error: "Module not found"**
- Solution: Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Solution: Make sure all required environment variables are set in Vercel dashboard

### Runtime Errors

**API calls failing**
- Check `BACKEND_API_URL` and `NEXT_PUBLIC_BACKEND_API_URL` are correct
- Verify CORS is enabled on your backend for your Vercel domain
- Check backend API is running and accessible

**Authentication not working**
- Verify `BETTER_AUTH_SECRET` is set and same across deployments
- Update `BETTER_AUTH_URL` to match your Vercel domain
- Check OAuth redirect URLs if using social login

## CORS Configuration for Backend

Your backend needs to allow requests from your Vercel domain. Update your backend CORS settings:

```python
# In backend/src/main.py or backend/src/config/settings.py
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app",
    "https://your-app-*.vercel.app",  # Preview deployments
]
```

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `BETTER_AUTH_URL` environment variable with new domain

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` or `master` branch
- **Preview**: Every push to other branches and pull requests

## Monitoring and Logs

- **View Logs**: Vercel Dashboard → Your Project → Deployments → Click deployment → Runtime Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Performance**: Vercel Dashboard → Your Project → Speed Insights

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ⚙️ Configure environment variables
3. 🔗 Update backend CORS to allow Vercel domain
4. 🧪 Test authentication and API calls
5. 🎨 (Optional) Set up custom domain
6. 📊 (Optional) Enable Vercel Analytics

## Quick Deploy Button

You can also add a "Deploy to Vercel" button to your README:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/yourrepo&project-name=todo-ai-chatbot&repo-name=todo-ai-chatbot&root-directory=frontend)

---

**Need Help?**
- Vercel Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Support: https://vercel.com/support
