# 🚀 Deployment Guide - Restaurant App

## Overview

- **Frontend**: React app deployed on Netlify with CI/CD
- **Backend**: Node.js/Express deployed on Render
- **Database**: MongoDB Atlas

---

## 📦 Frontend Deployment (Netlify)

### Prerequisites

1. GitHub account with repository: `linmyatoo/restaurant-app`
2. Netlify account (free tier works): https://app.netlify.com
3. Netlify CLI installed: `npm install -g netlify-cli`

### Initial Setup

#### Option A: Via Netlify Dashboard (Recommended for first-time)

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Setup Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **GitHub** → Authorize → Choose `linmyatoo/restaurant-app`
3. **Configure build settings**

   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
   - Click **"Deploy site"**

4. **Set custom domain (optional)**
   - Site settings → Domain management → Add custom domain

#### Option B: Via Netlify CLI

```bash
cd client
netlify login
netlify init
```

Follow prompts to create/link site.

### Environment Variables

Environment variables are configured in `client/netlify.toml`:

```toml
[build.environment]
  REACT_APP_API_URL = "https://restaurant-ycyh.onrender.com"
  NODE_VERSION = "18"
```

**For sensitive values**, use Netlify Dashboard instead:

1. Site settings → Environment variables
2. Add `REACT_APP_API_URL` = `https://restaurant-ycyh.onrender.com`
3. Select scopes: Production + Deploy previews + Branch deploys

### Automatic Deployments (CI/CD)

Once connected to GitHub:

✅ **Production deploys**: Every push to `main` branch  
✅ **Deploy previews**: Automatic preview URLs for pull requests  
✅ **Branch deploys**: Deploy other branches for testing

**Trigger a deployment:**

```bash
git add .
git commit -m "Update app"
git push origin main
```

Netlify will automatically:

1. Pull code from GitHub
2. Install dependencies (`npm install`)
3. Build the app (`npm run build`)
4. Deploy to CDN
5. Notify you via email/Slack (if configured)

### Manual Deployment

```bash
cd client
npm run build
netlify deploy --prod
```

### View Logs

```bash
netlify logs
```

Or view in dashboard: https://app.netlify.com → Your site → Deploys → Logs

---

## 🖥️ Backend Deployment (Render)

### Current Setup

- **Service**: https://restaurant-ycyh.onrender.com
- **Type**: Web Service (Node.js)
- **Auto-deploy**: Enabled from GitHub

### Environment Variables (Set in Render Dashboard)

```
CLIENT_URL=https://restaurant-eaint.netlify.app
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=3001
```

### Manual Deployment

Push to GitHub → Render auto-deploys:

```bash
cd server
git add .
git commit -m "Update backend"
git push origin main
```

Or manually in Render dashboard: Services → restaurant-ycyh → Manual Deploy

---

## 🔄 Full Deployment Workflow

### Development → Production

1. **Make changes locally**

   ```bash
   # Client
   cd client
   npm start

   # Server (separate terminal)
   cd server
   npm start
   ```

2. **Test locally**

   - Client: http://localhost:3000
   - Server: http://localhost:3001

3. **Commit and push**

   ```bash
   git add .
   git commit -m "Feature: description"
   git push origin main
   ```

4. **Automatic deployment**

   - Netlify builds & deploys frontend (~1-2 min)
   - Render builds & deploys backend (~2-3 min)

5. **Verify production**
   - Frontend: https://restaurant-eaint.netlify.app
   - Backend: https://restaurant-ycyh.onrender.com

### Rollback (if needed)

**Netlify:**

- Dashboard → Deploys → Select previous deploy → "Publish deploy"

**Render:**

- Dashboard → Service → Deploys → Redeploy older version

---

## 🔐 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** for secrets (API keys, DB credentials)
3. **Rotate credentials** if accidentally committed
4. **Use HTTPS** - Both Netlify and Render provide free SSL

---

## 🐛 Troubleshooting

### Build fails on Netlify

**Check build logs:**

```bash
netlify logs
```

Common issues:

- Missing dependencies: Check `package.json`
- Build command wrong: Verify `netlify.toml`
- Environment variables missing: Add in Netlify dashboard

### App shows blank screen

1. Check console errors (F12)
2. Verify `REACT_APP_API_URL` is set correctly
3. Check that backend is running: `curl https://restaurant-ycyh.onrender.com`

### Socket.IO not connecting

1. Verify CORS settings on backend
2. Check `CLIENT_URL` env var on Render
3. Ensure WebSocket protocol is enabled (Netlify supports this)

### Backend sleeping (Render free tier)

- First request takes 30-60 seconds to wake up
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 5 minutes and keep it awake

---

## 📊 Deployment Status

| Service                  | Status  | URL                                    |
| ------------------------ | ------- | -------------------------------------- |
| Frontend (Netlify)       | ✅ Live | https://restaurant-eaint.netlify.app   |
| Backend (Render)         | ✅ Live | https://restaurant-ycyh.onrender.com   |
| Database (MongoDB Atlas) | ✅ Live | [Connection string in Render env vars] |

---

## 🎯 Next Steps

- [ ] Set up custom domain on Netlify
- [ ] Configure Slack/email notifications for deployments
- [ ] Set up UptimeRobot to keep backend alive
- [ ] Add staging environment (separate Netlify site)
- [ ] Configure branch previews for testing PRs
- [ ] Set up error monitoring (Sentry, LogRocket)

---

## 📚 Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Environment Variables in React](https://create-react-app.dev/docs/adding-custom-environment-variables/)
