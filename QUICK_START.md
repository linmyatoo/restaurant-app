# Quick Start Guide

## 🚀 Running Locally

### Option 1: Connect to PRODUCTION Backend (Current Setup)

Your `.env.development` is set to use the Render backend.

**Start Client Only:**

```bash
cd client
npm start
```

Then open: http://localhost:3000

**Important**:

- First request to Render backend may take 30-60 seconds (free tier spin-up)
- Login with: username `admin`, password `admin123`

---

### Option 2: Run FULL LOCAL Stack

If you want to run both frontend and backend locally:

**Terminal 1 - Backend:**

```bash
cd server
npm start
```

**Terminal 2 - Client:**

```bash
cd client
# Edit .env.development and uncomment this line:
# REACT_APP_API_URL=http://localhost:3001
npm start
```

---

## 🔧 Switching Between Local and Production Backend

**Edit `client/.env.development`:**

**For Production (Render):**

```bash
REACT_APP_API_URL=https://restaurant-me21.onrender.com
```

**For Local:**

```bash
REACT_APP_API_URL=http://localhost:3001
```

**Then restart**: Stop dev server (Ctrl+C) and run `npm start` again

---

## 📝 Environment Files Explained

- **`.env.development`** - Used by `npm start` (local development)
- **`.env.production`** - Used by `npm run build` (deployment builds)
- Both files are git-ignored for security

---

## 🐛 Common Issues

### "Failed to connect to server"

**Cause**: Backend is sleeping (Render free tier)
**Solution**: Wait 30-60 seconds and try again. First request wakes it up.

### Changes to .env not working

**Cause**: Dev server caches environment variables
**Solution**: Stop server (Ctrl+C) and restart with `npm start`

### Login fails

**Cause**: Wrong backend URL or backend not running
**Solution**:

1. Check `.env.development` has correct URL
2. Test backend: `curl https://restaurant-me21.onrender.com`
3. Restart client dev server

---

## 🌐 Production Deployment

When deploying to Netlify/Vercel/Render, the `.env.production` file is used:

```bash
REACT_APP_API_URL=https://restaurant-me21.onrender.com
```

This is automatically picked up during `npm run build`.

---

## ✅ Quick Check

**Is backend running?**

```bash
curl https://restaurant-me21.onrender.com
# Should return: "Server is running!"
```

**Is client using correct URL?**
Check browser console (F12) → Network tab → Look at API request URLs
