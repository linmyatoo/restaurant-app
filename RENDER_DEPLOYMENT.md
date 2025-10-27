# Render Deployment Guide

## ✅ Files Updated

- ✅ `client/src/components/ProtectedRoute.js` - Updated to use Render URL
- ✅ `client/src/services/socket.js` - Updated to use Render URL
- ✅ `server/src/server.js` - Updated CORS configuration

## 🔧 Required Environment Variables on Render

Go to your Render dashboard → Your Web Service → Environment tab and add these variables:

### Required Variables:

```
MONGO_URI_CLOUD=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=your_secure_token_here
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

### Important Notes:

1. **MONGO_URI_CLOUD**: Get this from MongoDB Atlas

   - Go to MongoDB Atlas → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual database password

2. **Cloudinary Credentials**: Get from Cloudinary Dashboard

   - Go to https://cloudinary.com/console
   - Copy Cloud Name, API Key, and API Secret

3. **ADMIN_TOKEN**: Generate a secure token

   - Use a strong random string (min 32 characters)
   - Example: `openssl rand -base64 32` (run in terminal)

4. **CLIENT_URL**: Your frontend URL
   - If hosting on Vercel: `https://your-app.vercel.app`
   - If hosting on Netlify: `https://your-app.netlify.app`
   - If testing locally: `http://localhost:3000`

## 📝 Render Configuration

### Build Command:

```
cd server && npm install
```

### Start Command:

```
cd server && npm start
```

### Root Directory:

Leave as `/` (root)

## 🚀 Deployment Steps

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **On Render Dashboard**:

   - Wait for automatic deployment to complete
   - Check the Logs tab for any errors
   - Verify all environment variables are set

3. **Test your deployment**:

   - Visit: `https://restaurant-me21.onrender.com`
   - You should see: "Server is running!"

4. **Update your frontend**:
   - All files already updated to use: `https://restaurant-me21.onrender.com`
   - Deploy your client to Vercel/Netlify
   - Update `CLIENT_URL` environment variable on Render with your frontend URL

## 🐛 Common Issues & Solutions

### Issue 1: Application Error / 503 Error

**Cause**: Environment variables not set or database connection failed
**Solution**:

- Check Render Logs
- Verify `MONGO_URI_CLOUD` is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Issue 2: CORS Errors

**Cause**: CLIENT_URL not set or incorrect
**Solution**:

- Add `CLIENT_URL` environment variable on Render
- Set it to your exact frontend URL (no trailing slash)
- Redeploy after changing environment variables

### Issue 3: Socket.IO Connection Failed

**Cause**: WebSocket not enabled or CORS issue
**Solution**:

- Render supports WebSocket by default
- Verify `CLIENT_URL` is set correctly
- Check browser console for exact error

### Issue 4: Authentication Not Working

**Cause**: ADMIN_TOKEN mismatch between server and stored token
**Solution**:

- Clear browser localStorage
- Login again with ADMIN_USERNAME and ADMIN_PASSWORD
- Verify ADMIN_TOKEN is set on Render

### Issue 5: Images Not Uploading

**Cause**: Cloudinary credentials not set
**Solution**:

- Verify all three Cloudinary environment variables are set
- Check Cloudinary dashboard for correct credentials
- Ensure API secret is copied correctly (no extra spaces)

## 🔍 Debugging on Render

### View Logs:

1. Go to your Render dashboard
2. Click on your web service
3. Click "Logs" tab
4. Look for errors in red

### Common Log Messages:

- ✅ "Server running on..." = Success!
- ✅ "MongoDB Connected..." = Database OK
- ❌ "MongooseServerSelectionError" = Check MONGO_URI_CLOUD
- ❌ "Port already in use" = Render is restarting, wait a moment

## 📱 Frontend Deployment (Vercel/Netlify)

After deploying your backend:

1. Deploy your client folder to Vercel or Netlify
2. Get your frontend URL (e.g., `https://your-app.vercel.app`)
3. Go back to Render → Environment
4. Update `CLIENT_URL` to your frontend URL
5. Trigger a manual redeploy on Render

## ✨ Final Checklist

- [ ] All environment variables set on Render
- [ ] MongoDB Atlas allows connections from anywhere
- [ ] Backend deployed successfully on Render
- [ ] Backend URL accessible in browser
- [ ] Frontend code updated with correct backend URL
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] CLIENT_URL updated on Render with frontend URL
- [ ] Test authentication (login page)
- [ ] Test Socket.IO (real-time updates)
- [ ] Test image upload (Cloudinary)
- [ ] Test order creation and kitchen view

## 🎯 Testing Your Deployment

1. **Backend Health Check**:

   ```
   https://restaurant-me21.onrender.com
   ```

   Should show: "Server is running!"

2. **Menu API**:

   ```
   https://restaurant-me21.onrender.com/api/menu
   ```

   Should return JSON array of menu items

3. **Login**:

   - Go to your frontend `/login`
   - Enter username and password
   - Should redirect to admin dashboard

4. **Create Order**:
   - Go to `/customer/:tableId`
   - Add items to cart
   - Place order
   - Check kitchen view updates in real-time

## 💡 Pro Tips

1. **Free Tier Limitations**:

   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading for production use

2. **MongoDB Atlas Free Tier**:

   - 512MB storage limit
   - Cluster pauses after extended inactivity
   - Set up alerts for usage monitoring

3. **Security for Production**:

   - Change default ADMIN_USERNAME and ADMIN_PASSWORD
   - Use strong ADMIN_TOKEN (32+ characters)
   - Consider implementing JWT tokens
   - Add rate limiting
   - Use HTTPS only (Render provides this automatically)

4. **Performance**:
   - Enable compression on Express
   - Add caching headers
   - Optimize images on Cloudinary
   - Consider CDN for static assets
