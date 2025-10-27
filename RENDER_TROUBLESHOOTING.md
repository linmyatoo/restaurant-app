# Render Static Site - Exact Configuration

## 🚨 If You're Getting "Not Found" Error

This usually means Render can't find your build output. Follow these EXACT steps:

## Step 1: Delete and Recreate

Sometimes it's easier to start fresh:

1. **Delete your current static site** on Render Dashboard
2. Create a new one with settings below

## Step 2: Exact Configuration

When creating the static site, use these **EXACT** values:

```
Name: restaurant-client
Branch: main
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: build
```

**CRITICAL**:

- Don't add any slashes or dots
- Just type exactly: `client` and `build`

## Step 3: Check Render Build Logs

After deployment starts:

1. Click on your static site
2. Click "Logs" tab
3. Look for these SUCCESS messages:

   ```
   ==> Installing dependencies
   ==> Running build command: npm install && npm run build
   ==> Compiled successfully
   ==> Site published successfully
   ```

4. If you see ERRORS like:
   - `ENOENT: no such file or directory` → Wrong Root Directory
   - `Build failed` → Check the exact error message
   - `Publish directory not found` → Wrong Publish Directory

## Step 4: Alternative - Use Different Root Directory Setting

If above doesn't work, try this configuration:

```
Name: restaurant-client
Branch: main
Root Directory: (leave blank)
Build Command: cd client && npm install && npm run build
Publish Directory: client/build
```

## Step 5: After Successful Deployment

Once deployed successfully, add the redirect rule:

1. Go to **Settings → Redirects/Rewrites**
2. Click "Add Rule"
3. Enter:
   ```
   Source: /*
   Destination: /index.html
   Action: Rewrite
   ```

## 🔍 Debug: What's Your Current Setup?

Tell me your EXACT Render settings so I can help:

1. What is in "Root Directory" field? (blank, client, ./client, etc?)
2. What is in "Publish Directory" field? (build, client/build, ./build, etc?)
3. What do your build logs say? (copy the last few lines)

## 🎯 Most Common Mistakes

❌ **Wrong**: Root Directory = `./client` or `/client`
✅ **Right**: Root Directory = `client`

❌ **Wrong**: Publish Directory = `./build` or `/build` or `client/build`
✅ **Right**: Publish Directory = `build`

❌ **Wrong**: Build Command = `npm run build`
✅ **Right**: Build Command = `npm install && npm run build`

## 🚀 Alternative Solution: Deploy from Build Folder

If static site keeps failing, try deploying the build folder directly:

1. Push your local `build` folder to a separate branch:

   ```bash
   cd /Users/naylin/workspace/restaurant-app/client

   # Temporarily remove build from .gitignore
   git rm --cached .gitignore
   echo "node_modules" > .gitignore

   # Add build folder
   git add build
   git commit -m "Add build folder for deployment"
   git push origin main
   ```

2. On Render:
   ```
   Root Directory: client/build
   Publish Directory: .
   Build Command: (leave blank or echo "No build needed")
   ```

This deploys the pre-built files directly.

## 💡 Better Alternative: Use Netlify Drop

If Render keeps giving issues, the fastest solution:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your entire `client/build` folder onto the page
3. Get instant deployment (30 seconds)
4. Update your backend's CLIENT_URL with the Netlify URL

Netlify Drop works 100% of the time for pre-built React apps!
