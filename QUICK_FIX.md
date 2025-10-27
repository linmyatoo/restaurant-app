# Quick Fix for Render Deployment Issues

## 🚨 Most Common Issues & Quick Fixes

### 1. "Cannot GET /" or 503 Error

**Problem**: Server not starting
**Fix**: Check these environment variables on Render:

```
✅ MONGO_URI_CLOUD (from MongoDB Atlas)
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
```

### 2. CORS Error in Browser Console

**Problem**: Frontend can't connect to backend
**Fix**: Add this environment variable on Render:

```
CLIENT_URL=https://your-frontend-url.com
```

(Replace with your actual frontend URL, no trailing slash)

### 3. Socket.IO Not Connecting

**Problem**: Real-time updates not working
**Fix**:

- Ensure `CLIENT_URL` is set on Render
- Clear browser cache
- Client files already updated to use: `https://restaurant-me21.onrender.com`

### 4. Login Not Working

**Problem**: Authentication fails
**Fix**: On Render, add:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=any_random_string_32_chars_or_more
```

### 5. "MongooseServerSelectionError"

**Problem**: Can't connect to MongoDB
**Fix**:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click Confirm

## 📋 Quick Deployment Checklist

1. [ ] Set all environment variables on Render (see above)
2. [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. [ ] Push code to GitHub: `git push origin main`
4. [ ] Wait for Render to deploy (check Logs tab)
5. [ ] Test: Visit `https://restaurant-me21.onrender.com`
6. [ ] Should see: "Server is running!"

## 🔗 Important URLs

- **Backend**: https://restaurant-me21.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cloudinary**: https://cloudinary.com/console

## 💻 Local Development

To run locally, create `/server/.env` file with your credentials (see `.env.example`).

Then run:

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
cd client
npm install
npm start
```

## 🆘 Still Not Working?

1. Check Render Logs (Dashboard → Your Service → Logs)
2. Look for red error messages
3. Common errors:
   - Missing environment variable → Add it
   - MongoDB connection failed → Check MONGO_URI_CLOUD
   - Port in use → Render is restarting, wait 1 minute
