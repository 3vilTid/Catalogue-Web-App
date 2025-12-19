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

### Desktop (Chrome/Edge):
1. Open the web app in Chrome or Edge
2. Look for install icon in address bar (⊕ or computer icon)
3. Click to install
4. App will open in standalone window

### Mobile (Android):
1. Open in Chrome
2. Tap "Add to Home Screen" from menu
3. App icon appears on home screen
4. Opens in full-screen mode

### Mobile (iOS/Safari):
1. Open in Safari
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. App icon appears on home screen

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

### Install Button Doesn't Appear:
- App must be served over HTTPS ✓ (Apps Script provides this)
- Browser must support PWA (Chrome, Edge, Safari 11.3+)
- User may have previously dismissed the prompt
- Check browser console for errors

### Service Worker Not Registering:
- Check browser console for errors
- Ensure `sw.js` is accessible at root URL
- Clear browser cache and reload
- Check that HTTPS is working

### Icons Not Displaying:
- Verify icon files exist at specified paths
- Check file names match manifest.json
- Ensure icons are PNG format
- Clear cache and reinstall app

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
