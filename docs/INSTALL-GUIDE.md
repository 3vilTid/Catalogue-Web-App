# Installation Guide

Complete guide to set up and deploy your Catalogue Web App on GitHub Pages with Google Apps Script backend.

## Prerequisites
- Google Account
- GitHub Account
- Your catalogue data in Google Sheets

---

## Step 1: Deploy Google Apps Script

1. **Open your Google Sheet** with your catalogue data
2. Go to **Extensions → Apps Script**
3. Paste the code from `Code.gs` into the script editor
4. Click **Deploy → New deployment**
5. Configure deployment:
   - **Type**: Web app
   - **Execute as**: Me
   - **Who has access**: Anyone
6. Click **Deploy**
7. **Copy the deployment URL** (you'll need this for Step 2)
8. **Paste this URL into cell C5** of your Google Sheet settings

---

## Step 2: Configure GitHub Pages API

1. Go to your GitHub repository
2. Open the file `api-config.js`
3. Replace `YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE` with the URL you copied in Step 1:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ID/exec'
   ```
4. Commit the changes

---

## Step 3: Customize App Name

Edit the `manifest.json` file to change your app name:

```json
{
  "name": "Your App Name Here",
  "short_name": "Short Name",
  "description": "Your app description"
}
```

**Current default**: "Catalogue"

---

## Step 4: Customize App Icon

### Generate Icons
1. Go to **https://favicon.io/favicon-converter/**
2. Upload your image (PNG, JPG, or SVG)
3. Download the generated favicon package

### Replace Icon Files
Upload these files to `assets/icons/` folder on GitHub:
- **`android-chrome-192x192.png`** - Used for Android home screen icon and app drawer when installed as PWA
- **`android-chrome-512x512.png`** - Used for Android splash screen and high-resolution displays when installed as PWA (mobile app icon)
- **`apple-touch-icon.png`** - Used for iOS/iPadOS home screen icon when installed as PWA or saved to home screen
- **`favicon-32x32.png`** - Used in browser tabs and bookmarks on desktop (standard size)
- **`favicon-16x16.png`** - Used in browser tabs on smaller displays or when multiple tabs are open (browser page icon)
- **`favicon.ico`** - Fallback icon for older browsers and Windows taskbar when app is pinned

---

## Step 5: Customize Theme Color

Edit `manifest.json` to change the app theme color:

```json
{
  "theme_color": "#4CAF50"
}
```

**Color format**: Hex color code (e.g., #4CAF50 for green, #2563EB for blue)

This color appears in:
- Browser address bar on mobile
- Task switcher on Android
- Status bar on iOS (when installed as PWA)

---

## Step 6: Enable GitHub Pages

### Make Repository Public (Required)
1. Go to **Settings → General**
2. Scroll to **Danger Zone**
3. Click **Change visibility → Make public**

   ⚠️ **Note**: GitHub Pages requires a public repository (or GitHub Pro/Team for private repos)

### Enable GitHub Pages
1. Go to **Settings → Pages**
2. Under **Source**, select:
   - Branch: `main` (or your branch name)
   - Folder: `/ (root)`
3. Click **Save**
4. GitHub will provide your site URL: `https://yourusername.github.io/repository-name/`
5. Wait 1-2 minutes for deployment to complete

### Access Your App
Visit your GitHub Pages URL to access your deployed app!

---

## Step 7: Install as PWA (Progressive Web App)

### On Mobile (Android/iOS)
1. Open your GitHub Pages URL in Chrome/Safari
2. Tap the browser menu (⋮ or share icon)
3. Select **"Add to Home Screen"** or **"Install App"**
4. Confirm installation
5. The app will appear on your home screen like a native app

### On Desktop (Chrome/Edge)
1. Open your GitHub Pages URL
2. Click the install icon in the address bar (⊕ or computer icon)
3. Click **"Install"**
4. The app will open in its own window

---

## Additional Configuration

### Update Google Sheet Settings
In your Google Sheet, configure these settings:

- **C5**: Apps Script deployment URL
- **C6**: App name (displayed in header)
- **C7**: Logo URL (Google Drive link to your logo image)
- **D5**: Main items view type (cards/list/table)
- **F5**: Main items style
- **D12-D14**: Layer view types

### Service Worker Cache (Optional)
If you want to customize offline caching, edit `service-worker.js`:
```javascript
const CACHE_NAME = 'catalogue-cache-v1'; // Change version to force update
```

---

## Troubleshooting

### App doesn't load data
- ✅ Check that Apps Script deployment is set to "Execute as: Me" and "Anyone"
- ✅ Verify the URL in `api-config.js` matches your Apps Script deployment URL
- ✅ Check browser console (F12) for error messages

### Icons don't appear
- ✅ Verify icon files are in `assets/icons/` folder
- ✅ Check that paths in `index.html` and `manifest.json` are correct
- ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

### GitHub Pages not working
- ✅ Ensure repository is public
- ✅ Check Settings → Pages shows "Your site is published at..."
- ✅ Wait 1-2 minutes after enabling Pages for first deployment
- ✅ Verify branch name matches what you selected in Pages settings

### PWA install not available
- ✅ Must access via HTTPS (GitHub Pages provides this automatically)
- ✅ All icon sizes must be present in `manifest.json`
- ✅ Service worker must register successfully (check browser console)

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Apps Script Access**: Set to "Anyone" means anyone with the URL can access your data
   - Consider using "Anyone within [your organization]" for private data
   - Or implement the built-in authentication system (Public with Login mode)

2. **Public Repository**: Your code is visible to everyone
   - Don't commit sensitive data or API keys
   - Use environment-specific configuration files

3. **CORS**: Apps Script automatically handles CORS for web apps
   - No additional configuration needed

---

## Need Help?

- 📖 Check the [README](README.md) for app features and usage
- 🐛 Report issues on GitHub Issues
- 📧 Contact repository maintainer

---

**Congratulations!** 🎉 Your Catalogue Web App is now live and installable as a PWA!
