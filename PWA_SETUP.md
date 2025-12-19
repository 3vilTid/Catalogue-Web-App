# PWA Setup Documentation

## Overview

The Catalogue Web App has been configured as a Progressive Web App (PWA), enabling users to install it on their devices (desktop, mobile, and tablet) for quick access and offline functionality.

## What Was Implemented

### 1. Web App Manifest (`manifest.json`)
- Defines app metadata (name, description, icons, colors)
- Configures display mode as "standalone" (looks like a native app)
- Sets theme color to `#4CAF50` (green)
- Allows any orientation (portrait/landscape)

### 2. Service Worker (`sw.js`)
- Caches essential files for offline access
- Implements cache-first strategy with network fallback
- Handles app updates automatically
- Version: 1.0.0

### 3. PWA Meta Tags (in `index.html`)
- Theme color for browser chrome
- Apple-specific meta tags for iOS support
- Manifest link
- Icon links

### 4. Service Worker Registration (in `index.html`)
- Automatically registers service worker on page load
- Handles service worker updates
- Logs status to console for debugging

### 5. Install Prompt Banner
- Attractive green gradient banner at bottom of screen
- Shows when PWA can be installed
- "Install" and "Not now" buttons
- Remembers user's choice (doesn't show again if dismissed)
- Mobile-responsive design

## Required Icons

**IMPORTANT:** You need to provide app icons for full PWA functionality. The manifest currently references these files:

### Required Icon Files:
1. **icon-192.png** - 192x192 pixels
   - Minimum required size
   - Used for app icon on mobile devices

2. **icon-512.png** - 512x512 pixels
   - High-resolution icon
   - Used for splash screens and high-DPI devices

### Creating Icons:

You can create these icons in several ways:

1. **Design Tool (Recommended)**
   - Use Figma, Adobe Illustrator, Canva, etc.
   - Create a square logo/icon (1024x1024px)
   - Export as PNG at 192x192 and 512x512

2. **From Existing Logo**
   - If you have a logo, resize it to square format
   - Ensure it looks good at small sizes
   - Add padding/background if needed

3. **Icon Generator Tools**
   - Use online PWA icon generators
   - Upload your logo and download all sizes

### Icon Guidelines:
- Use simple, recognizable design
- Ensure good contrast with background
- Test at small sizes (icons appear small on home screens)
- Consider using your app logo or a representative symbol
- PNG format with transparency (if desired)
- Square aspect ratio (1:1)

### Temporary Workaround:
Until you provide real icons, you can create simple colored placeholder icons:
```bash
# On a system with ImageMagick installed:
convert -size 192x192 xc:#4CAF50 -pointsize 80 -fill white -gravity center -annotate +0+0 "C" icon-192.png
convert -size 512x512 xc:#4CAF50 -pointsize 200 -fill white -gravity center -annotate +0+0 "C" icon-512.png
```

## Deploying to Google Apps Script

When deploying this PWA to Google Apps Script:

1. **Upload All Files:**
   - Upload `manifest.json` as a separate file
   - Upload `sw.js` as a separate file
   - Upload icon files (icon-192.png, icon-512.png)
   - Keep `index.html` as the main HTML file

2. **Configure Apps Script Project:**
   - Ensure all files are accessible at the root URL
   - Service worker and manifest must be served from the same origin
   - Icons should be accessible via relative paths

3. **Google Apps Script Specifics:**
   - Google Apps Script URLs are HTTPS by default ✓
   - Make sure to deploy as "Web App" with public access
   - The service worker should work with Apps Script's URL structure

## Testing the PWA

### IMPORTANT: Before Installing
**If you previously added this app to your home screen and the URL bar is still showing:**
1. **Remove the old shortcut** from your home screen (long press → Remove/Delete)
2. **Clear browser cache**:
   - Android Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - iOS Safari: Settings → Safari → Clear History and Website Data
3. **Close and reopen your browser**
4. **Follow the installation steps below**

### Desktop (Chrome/Edge):
1. Open the web app in Chrome or Edge
2. Look for install icon in address bar (⊕ or computer icon)
3. Click to install
4. App will open in standalone window (no URL bar)

### Mobile (Android):
1. Open in Chrome
2. Tap the three-dot menu (⋮) → "Install app" or "Add to Home Screen"
3. Tap "Install" when prompted
4. App icon appears on home screen
5. When you tap the icon, it should open **WITHOUT the URL bar** (full-screen standalone mode)

### Mobile (iOS/Safari):
1. Open in Safari
2. Tap Share button (square with arrow pointing up)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. App icon appears on home screen
6. When you tap the icon, it should open **WITHOUT the Safari UI** (standalone mode)

## Browser Console Logs

The PWA implementation includes comprehensive logging. Open browser console to see:
- ✅ Service Worker registration success
- 💾 PWA install prompt availability
- 🔄 Service Worker updates
- 📢 Install banner display
- ✅ App installation confirmation

## Customization

### Changing Theme Color:
1. Update `theme_color` in `manifest.json`
2. Update `<meta name="theme-color">` in `index.html`
3. Update CSS gradient in `.install-banner` style

### Changing App Name:
1. Update `name` and `short_name` in `manifest.json`
2. Update `<meta name="apple-mobile-web-app-title">` in `index.html`

### Updating Service Worker:
1. Make changes to `sw.js`
2. Update `CACHE_NAME` version (e.g., 'catalogue-v1.0.1')
3. Service worker will auto-update on next page load

## Offline Functionality

The service worker caches:
- Main HTML file (index.html)
- Manifest file
- App icons

When offline:
- App loads from cache
- Previously viewed content is available
- Shows offline message for new network requests

## Troubleshooting

### ⚠️ URL Bar Still Showing (App Opens as Bookmark, Not PWA)
**Problem**: When you tap the home screen icon, the browser URL bar is still visible at the top.

**This means**: The app was added as a bookmark shortcut, NOT installed as a proper PWA.

**Solution**:
1. **Remove the current shortcut** from your home screen:
   - Long press the app icon
   - Select "Remove" or "Delete"

2. **Clear your browser cache**:
   - **Android Chrome**: Menu (⋮) → Settings → Privacy and security → Clear browsing data → Check "Cached images and files" → Clear data
   - **iOS Safari**: iPhone Settings app → Safari → Clear History and Website Data

3. **Close your browser completely** (swipe away from recent apps)

4. **Reopen the browser** and navigate to your app URL

5. **Install properly**:
   - **Android Chrome**: Look for a banner at the bottom saying "Install app" OR tap Menu (⋮) → "Install app" / "Add to Home Screen"
   - **iOS Safari**: Tap Share button (□↑) → "Add to Home Screen"

6. **Verify installation**: When you tap the icon, the app should open **WITHOUT any browser UI** (no URL bar, no browser buttons)

**Note**: Due to Google Apps Script limitations, the service worker may not work perfectly, but the app should still install in standalone mode without the URL bar.

### Install Button Doesn't Appear:
- App must be served over HTTPS ✓ (Apps Script provides this)
- Browser must support PWA (Chrome, Edge, Safari 11.3+)
- User may have previously dismissed the prompt
- Check browser console for errors
- Try the manual "Add to Home Screen" method from the browser menu

### Service Worker Not Registering:
- Check browser console for errors
- Due to Google Apps Script's URL structure, service worker scope may be limited
- The app will still work as a PWA even if service worker fails
- Clear browser cache and reload
- Check that HTTPS is working

### Icons Not Displaying:
- Icons are embedded as inline SVG in the manifest
- If icons don't show, try clearing cache and reinstalling
- Icons should display automatically (green square with "C")

## Browser Support

- ✅ **Chrome/Edge (Desktop & Android)**: Full support
- ✅ **Safari (iOS 11.3+)**: Good support (some limitations)
- ✅ **Firefox (Desktop & Android)**: Full support
- ⚠️ **iOS Safari limitations**:
  - No install banner (users must manually "Add to Home Screen")
  - 50MB cache limit
  - Cache can be cleared by iOS

## Next Steps

1. **Create and add app icons** (icon-192.png, icon-512.png)
2. **Deploy to Google Apps Script** with all files
3. **Test installation** on different devices
4. **Customize theme colors** if desired
5. **Monitor console logs** for any issues

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Icon Generator](https://www.pwabuilder.com/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

---

**Status**: PWA implementation complete ✅
**Pending**: Icon files need to be created and added
