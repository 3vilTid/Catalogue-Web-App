# GitHub Pages Deployment Guide

This guide will help you deploy your Catalogue Web App to **GitHub Pages** (frontend) while keeping Google Apps Script as the backend API.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Deploy Google Apps Script Backend](#step-1-deploy-google-apps-script-backend)
4. [Step 2: Configure API Connection](#step-2-configure-api-connection)
5. [Step 3: Enable GitHub Pages](#step-3-enable-github-pages)
6. [Step 4: Test Your Deployment](#step-4-test-your-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Benefits of This Setup](#benefits-of-this-setup)

---

## 🏗️ Architecture Overview

```
┌─────────────┐         HTTPS          ┌──────────────────┐
│   User      │────────────────────────▶│  GitHub Pages    │
│  Browser    │                         │  (Frontend)      │
└─────────────┘                         │  index.html      │
       │                                │  manifest.json   │
       │                                │  service-worker  │
       │                                └──────────────────┘
       │
       │         HTTPS API Calls
       │         (fetch/POST)
       ▼
┌──────────────────────────────────────┐
│  Google Apps Script Web App          │
│  (Backend API)                       │
│  - doPost() handles API calls        │
│  - doGet() serves images             │
│  - Google Sheets data access         │
│  - Email authentication (OTP)        │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Google Sheets                       │
│  (Database)                          │
│  - Main data                         │
│  - Settings                          │
│  - Users                             │
│  - Column Config                     │
└──────────────────────────────────────┘
```

**Key Benefits:**
- ✅ **100% Free** - Both GitHub Pages and Google Apps Script are free
- ✅ **Full PWA Support** - Install on mobile/desktop with service workers
- ✅ **Better Performance** - CDN-hosted frontend
- ✅ **No Code Rewrite** - Backend stays unchanged
- ✅ **Same Functionality** - All features work exactly the same

---

## ✅ Prerequisites

- [ ] GitHub account with repository for this project
- [ ] Google account with access to Google Apps Script
- [ ] Google Sheet with your catalogue data already set up
- [ ] Basic familiarity with Git and GitHub

---

## 📤 Step 1: Deploy Google Apps Script Backend

### 1.1 Open Google Apps Script

1. Open your Google Sheet with the catalogue data
2. Go to **Extensions** → **Apps Script**
3. You should see your `Code.gs` file

### 1.2 Verify Code.gs Has doPost() Function

Make sure your `Code.gs` includes the new `doPost()` function (added in this migration). You should see:

```javascript
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    // ... rest of the code
  }
}
```

If this function is missing, you need to pull the latest code from the `claude/github-pages-migration-bDDva` branch.

### 1.3 Deploy as Web App

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description:** `GitHub Pages Backend API`
   - **Execute as:** `Me (<your-email>)`
   - **Who has access:** `Anyone` (required for GitHub Pages to access it)
4. Click **Deploy**
5. **IMPORTANT:** Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycbx.../exec`)
   - Save this URL - you'll need it in Step 2!
6. Click **Authorize access** if prompted
7. Review and grant the necessary permissions

### 1.4 Test the Deployment

Test that your backend is accessible:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"function":"getSettings","parameters":["Layers"]}'
```

You should get a JSON response with your settings.

---

## ⚙️ Step 2: Configure API Connection

### 2.1 Update api-config.js

1. Open the file `api-config.js` in this repository
2. Find this line:
   ```javascript
   APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE',
   ```
3. Replace it with your actual Web app URL from Step 1.3:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
   ```
4. Save the file

### 2.2 Optional: Enable Debug Logging

For troubleshooting, you can enable debug mode:

```javascript
const API_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
  TIMEOUT: 30000,
  DEBUG: true  // Set to true for detailed console logs
};
```

### 2.3 Commit the Configuration

```bash
git add api-config.js
git commit -m "Configure Apps Script backend URL for GitHub Pages"
git push origin claude/github-pages-migration-bDDva
```

---

## 🚀 Step 3: Enable GitHub Pages

### 3.1 Push Your Branch to GitHub

If you haven't already pushed this branch:

```bash
git push -u origin claude/github-pages-migration-bDDva
```

### 3.2 Merge to Main Branch

1. Go to your GitHub repository
2. Click **Pull requests** → **New pull request**
3. Set base: `main` (or `master`) and compare: `claude/github-pages-migration-bDDva`
4. Click **Create pull request**
5. Review the changes and click **Merge pull request**

### 3.3 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. GitHub will show your site URL: `https://YOUR_USERNAME.github.io/Catalogue-Web-App/`

### 3.4 Optional: Custom Domain

If you have a custom domain:

1. In the **Pages** settings, enter your custom domain
2. Follow GitHub's instructions to configure DNS
3. Enable **Enforce HTTPS**

---

## 🧪 Step 4: Test Your Deployment

### 4.1 Access Your Site

Open the GitHub Pages URL in your browser:
```
https://YOUR_USERNAME.github.io/Catalogue-Web-App/
```

### 4.2 Check Browser Console

Open Developer Tools (F12) and check the Console:

- ✅ You should see: `✅ API Client loaded and ready`
- ✅ You should see: `✅ Service Worker registered successfully`
- ✅ No errors about missing `api-config.js`
- ❌ If you see warnings about `YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE`, go back to Step 2

### 4.3 Test Authentication

1. Try logging in with a valid email from your Users sheet
2. Check that you receive the OTP code via email
3. Verify that you can log in successfully

### 4.4 Test Data Loading

1. After logging in, check that your catalogue items load correctly
2. Try filtering, searching, and viewing details
3. Test image loading (Google Drive images should work)

### 4.5 Test PWA Installation

**On Desktop (Chrome/Edge):**
1. Look for the install icon (⊕) in the address bar
2. Click it and install the app
3. The app should open in a standalone window

**On Mobile (Android/iOS):**
1. Open the menu (three dots)
2. Select "Add to Home screen" or "Install app"
3. The app should appear on your home screen

### 4.6 Test Offline Capability

1. With the app installed, load some pages
2. Open Developer Tools → Network → Check "Offline"
3. Refresh the page - cached content should still display
4. The service worker should serve cached assets

---

## 🔧 Troubleshooting

### Issue: "API Client Error: APPS_SCRIPT_URL not configured"

**Solution:**
- You forgot to update `api-config.js`
- Go back to [Step 2.1](#21-update-api-configjs)
- Make sure you committed and pushed the changes
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue: "Failed to fetch" or CORS errors

**Possible Causes:**
1. **Apps Script deployment not set to "Anyone"**
   - Solution: Redeploy with "Who has access" = "Anyone"

2. **Using wrong URL (edit URL instead of exec URL)**
   - ❌ Wrong: `https://script.google.com/...​/edit`
   - ✅ Correct: `https://script.google.com/macros/s/.../exec`

3. **Apps Script doPost() function missing**
   - Solution: Copy the updated `Code.gs` from this branch

---

### Issue: Images not loading

**Possible Causes:**
1. **Google Drive file permissions**
   - Solution: Make sure Drive files are shared with "Anyone with the link"

2. **Wrong Apps Script URL in api-config.js**
   - Solution: Double-check the URL matches your deployment

3. **Browser cache**
   - Solution: Clear cache and hard refresh (Ctrl+Shift+R)

---

### Issue: Service Worker not registering

**Possible Causes:**
1. **Not using HTTPS**
   - GitHub Pages automatically uses HTTPS ✅
   - If testing locally, use `http://localhost` ✅
   - Do NOT use `http://192.168.x.x` or `http://your-ip` ❌

2. **Path issues**
   - Make sure `service-worker.js` is in the root directory
   - Check the browser console for 404 errors

---

### Issue: PWA install button not showing

**Possible Causes:**
1. **Service Worker not registered** - See above
2. **Manifest issues** - Check `manifest.json` is accessible
3. **Already installed** - Uninstall and try again
4. **iOS Safari** - Use "Add to Home Screen" from Share menu instead

---

### Issue: "Cannot read property 'run' of undefined"

**Solution:**
- The `api-client.js` script failed to load
- Check that it's in the root directory
- Check browser console for 404 errors
- Make sure `<script src="/api-client.js"></script>` is in index.html

---

### Issue: OTP emails not sending

**Possible Causes:**
1. **Apps Script email quota exceeded**
   - Free accounts: 100 emails/day
   - Google Workspace: 1,500 emails/day
   - Solution: Wait until tomorrow or upgrade to Workspace

2. **Email permissions not granted**
   - Solution: Run `testEmailPermissions()` in Apps Script
   - Reauthorize if prompted

---

### Issue: GitHub Pages shows 404

**Possible Causes:**
1. **Wrong branch selected** - Should be `main` or `master`
2. **Wrong folder selected** - Should be `/ (root)`
3. **Deployment still in progress** - Wait 1-2 minutes
4. **Repository not public** - GitHub Pages free tier requires public repos

---

## 📊 Benefits of This Setup

### Before (Apps Script Only)
- ❌ No PWA installation prompts
- ❌ No service workers (MIME type limitations)
- ❌ Slower loading (server-rendered HTML)
- ❌ No offline capability
- ⚠️ Limited to Apps Script URL

### After (GitHub Pages + Apps Script)
- ✅ Full PWA support with install prompts
- ✅ Service workers for offline caching
- ✅ Fast CDN-hosted frontend
- ✅ Offline capability for cached content
- ✅ Custom domain support
- ✅ Better SEO and performance
- ✅ 100% FREE
- ✅ Same Google Sheets backend

---

## 🔄 Updating Your App

### Update Frontend (HTML/JS/CSS)
1. Make changes to `index.html`, `service-worker.js`, etc.
2. Commit and push to `main` branch
3. GitHub Pages auto-deploys in 1-2 minutes
4. Users see updates on next page refresh

### Update Backend (Apps Script)
1. Make changes in Google Apps Script editor
2. Deploy as new version or use existing deployment
3. No frontend changes needed (URL stays the same)

### Update Service Worker
After updating `service-worker.js`:
1. Change `CACHE_NAME` version (e.g., `v1` → `v2`)
2. This forces browsers to install the new worker
3. Users get updated cache on next visit

---

## 🎉 Success!

Your Catalogue Web App is now running on GitHub Pages with full PWA support!

**What to do next:**
- [ ] Share your GitHub Pages URL with users
- [ ] Test PWA installation on mobile devices
- [ ] Monitor Apps Script quotas in Google Cloud Console
- [ ] Consider setting up a custom domain
- [ ] Update your README.md with the new deployment info

**Need help?** Check the [Troubleshooting](#troubleshooting) section or create an issue on GitHub.

---

## 📝 Important Notes

1. **Google Sheets Permissions:**
   - Your Apps Script runs with YOUR Google account permissions
   - Make sure you have access to the Google Sheet
   - The script can read/write data on your behalf

2. **API Quotas:**
   - Google Apps Script: 20,000 URL fetch calls/day (free tier)
   - This should be sufficient for most use cases
   - Monitor usage in Google Cloud Console if needed

3. **Security:**
   - Your `api-config.js` contains a public URL (safe to commit)
   - Never commit actual credentials or API keys
   - The Apps Script URL is public but requires proper authentication via OTP

4. **Cost:**
   - GitHub Pages: **FREE** (unlimited bandwidth for public repos)
   - Google Apps Script: **FREE** (within quotas)
   - Google Sheets: **FREE**
   - **Total Cost: $0.00/month** ✅

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Google Apps Script Web Apps Guide](https://developers.google.com/apps-script/guides/web)
- [PWA Installation Criteria](https://web.dev/install-criteria/)
- [Service Workers Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Last Updated:** 2025-12-23
**Migration Branch:** `claude/github-pages-migration-bDDva`
