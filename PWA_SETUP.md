# PWA Setup Documentation

## Overview

The Catalogue Web App has been configured with Progressive Web App (PWA) features to enable users to add it to their devices. However, due to **Google Apps Script platform limitations**, full PWA installation is not possible.

### Current State ✅
- ✅ Web App Manifest with app metadata and icons
- ✅ "Add to Home Screen" functionality (creates bookmark-style shortcut)
- ✅ Mobile-responsive with home screen icon support
- ❌ No Service Worker (Google Apps Script limitation)
- ❌ No true PWA "Install" prompt (requires service worker)
- ❌ No offline functionality (requires service worker)

## Google Apps Script Limitation: Why No Service Worker?

### The Technical Issue

**Google Apps Script cannot serve service workers** due to a fundamental platform limitation:

1. **MIME Type Problem**:
   - Browsers require service workers to be served with MIME type `application/javascript` or `text/javascript`
   - Google Apps Script serves **all responses** with MIME type `text/html`
   - Even when using `ContentService.MimeType.JAVASCRIPT`, the actual HTTP response is still `text/html`

2. **Browser Security**:
   - Modern browsers reject service workers with incorrect MIME types for security reasons
   - Error: `"The script has an unsupported MIME type ('text/html')"`
   - This is a hard browser requirement that cannot be bypassed

3. **No Workaround**:
   - This is a Google Apps Script platform limitation
   - No configuration or code change can fix this
   - The only solution is to host the app on a platform that properly serves static files

### What This Means for Users

**You CAN:**
- ✅ Use "Add to Home Screen" from browser menu
- ✅ Get a nice icon on your home screen
- ✅ Quick access to the app
- ✅ App displays with custom icon and name

**You CANNOT:**
- ❌ Get a Chrome/Edge "Install app" prompt
- ❌ Use the app offline
- ❌ Have the app open in true standalone mode (may show browser UI)
- ❌ Get automatic background updates

**In short**: The app functions as a **web bookmark with a nice icon**, not a full Progressive Web App.

## What Was Implemented

### 1. Web App Manifest (Served from `Code.gs`)
- Defines app metadata (name, description, icons, colors)
- Configures display mode as "standalone"
- Sets theme color to `#4CAF50` (green)
- Uses inline SVG icons (no external files needed)
- **Status**: ✅ Working - Manifest is properly served as JSON

### 2. Service Worker
- **Status**: ❌ Removed due to Google Apps Script limitation
- Cannot be registered due to MIME type issue
- Code removed from both `Code.gs` and `index.html`
- See "Google Apps Script Limitation" section above

### 3. PWA Meta Tags (in `index.html`)
- Theme color for browser chrome
- Apple-specific meta tags for iOS support
- Manifest link
- **Status**: ✅ Working

### 4. Installation Method

**Only Option: "Add to Home Screen"**

This is the **only way** to add the app on Google Apps Script:
- Creates a bookmark-style shortcut
- App opens in the browser (may show URL bar and browser UI)
- No true standalone mode
- No offline functionality
- Still provides quick access with a nice icon

## Installation Instructions

### Android (Chrome)

1. Open the web app URL in Chrome
2. Tap the three-dot menu (⋮)
3. Select **"Add to Home screen"**
   - Note: You will NOT see "Install app" option (that requires service worker)
4. Enter a name for the shortcut (or keep default)
5. Tap "Add"
6. Icon appears on your home screen
7. **Note**: When you tap the icon, it will open in Chrome with browser UI visible

### iOS (Safari)

1. Open the web app URL in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap **"Add to Home Screen"**
4. Enter a name for the shortcut (or keep default)
5. Tap "Add" in the top right
6. Icon appears on your home screen
7. **Note**: Opens with minimal Safari UI (better than Android, but not true standalone)

### Desktop (Chrome/Edge)

1. Open the web app in Chrome or Edge
2. **Note**: You will NOT see an install icon in the address bar
3. You can manually bookmark the page
4. Consider using browser's "Create shortcut" feature:
   - Chrome: Menu (⋮) → More tools → Create shortcut → Check "Open as window"

## What Users Will Experience

### Mobile Experience
- Tap home screen icon → Opens in browser
- Browser UI may be visible (URL bar, navigation buttons)
- App functions normally as a web page
- Must be online to use (no offline mode)
- **This is expected behavior** on Google Apps Script

### Desktop Experience
- Click bookmark/shortcut → Opens in browser tab
- Standard web app experience
- Must be online to use

## Deploying to Google Apps Script

When deploying to Google Apps Script:

1. **Required Files:**
   - ✅ `Code.gs` - Serves manifest and handles image serving
   - ✅ `index.html` - Main HTML file with PWA meta tags

2. **NOT Needed:**
   - ❌ No service worker file (won't work)
   - ❌ No separate manifest.json file (served from Code.gs)
   - ❌ No icon files (inline SVG in manifest)

3. **Deployment Steps:**
   - Deploy as "Web App"
   - Set access to "Anyone" for public apps
   - HTTPS is automatically provided by Google Apps Script ✓

## Browser Console Logs

The current implementation includes helpful console messages:

```
ℹ️ PWA Note: Service worker not available on Google Apps Script
ℹ️ Use "Add to Home screen" from browser menu for a shortcut
```

Previous errors like `"unsupported MIME type ('text/html')"` should no longer appear.

## Customization

### Changing Theme Color:
1. Update theme color in `Code.gs` in the `serveManifest_()` function
2. Find the line: `"theme_color": "#4CAF50"`
3. Change to your desired color

### Changing App Name:
1. Update in `Code.gs` in the `serveManifest_()` function
2. The manifest pulls from Settings sheet:
   - `appName` → Full app name
   - `catalogName` → Short name for icon

### Changing Icons:
The manifest currently uses inline SVG icons (green square with "C"):
1. Edit `Code.gs` in the `serveManifest_()` function
2. Update the `icons` array with new SVG or data URLs

## Limitations Summary

| Feature | Status | Reason |
|---------|--------|--------|
| Web Manifest | ✅ Working | Served as JSON from Code.gs |
| Custom Icons | ✅ Working | Inline SVG in manifest |
| Add to Home Screen | ✅ Working | Browser native feature |
| Service Worker | ❌ Not Possible | Google Apps Script MIME type limitation |
| Install Prompt | ❌ Not Possible | Requires service worker |
| Offline Mode | ❌ Not Possible | Requires service worker |
| True Standalone Mode | ⚠️ Limited | Depends on browser/platform |
| Background Sync | ❌ Not Possible | Requires service worker |
| Push Notifications | ❌ Not Possible | Requires service worker |

## Frequently Asked Questions

### Q: Why don't I see an "Install" button?
**A:** Google Apps Script cannot serve service workers with the correct MIME type. Browsers require service workers for the install prompt. Use "Add to Home Screen" instead.

### Q: Why does the URL bar still show when I open the app?
**A:** Without a service worker, browsers cannot run the app in true standalone mode. This is expected behavior on Google Apps Script.

### Q: Can this be fixed?
**A:** Not while hosting on Google Apps Script. To get full PWA features, you would need to:
- Host the frontend on a platform that serves static files (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.)
- Use Google Apps Script only for backend API calls
- Serve the service worker from the static hosting platform

### Q: Is the app broken?
**A:** No! The app works perfectly as a web application. It just doesn't have the enhanced PWA features like offline mode and standalone installation.

### Q: Should I migrate to another platform?
**A:** Only if you need:
- True standalone app experience (no browser UI)
- Offline functionality
- PWA install prompts
- Push notifications

If you just want a web app with quick home screen access, Google Apps Script is fine.

## Alternative: Full PWA Hosting

If you need full PWA capabilities, consider this architecture:

### Option 1: Frontend Migration
1. **Frontend** → GitHub Pages / Netlify / Vercel
   - Host `index.html`, manifest, service worker
   - Full PWA support ✅

2. **Backend** → Keep Google Apps Script
   - Use `doGet()` and `doPost()` as API endpoints only
   - Frontend makes AJAX calls to Apps Script

### Option 2: Complete Migration
1. Move to a platform that supports both frontend and backend
2. Options: Firebase, AWS, Heroku, Railway, etc.
3. Full control over MIME types and service workers

## Troubleshooting

### Icon Doesn't Show on Home Screen
- The manifest uses inline SVG (should always work)
- Try clearing browser cache and re-adding to home screen
- Check browser console for manifest errors

### Manifest Not Loading
- Check that URL includes the proper query parameter handling
- Verify `?manifest=true` returns JSON in browser
- Check browser console for errors

### App Opens in Browser Instead of Standalone
- This is **expected behavior** without a service worker
- Google Apps Script limitation - not a bug
- Use "Add to Home Screen" for best experience available

## Browser Support

| Browser | Add to Home Screen | Notes |
|---------|-------------------|-------|
| Chrome (Android) | ✅ Yes | Opens in Chrome (browser UI visible) |
| Safari (iOS) | ✅ Yes | Better standalone experience than Android |
| Chrome (Desktop) | ⚠️ Manual | Use "Create shortcut" from menu |
| Edge (Desktop) | ⚠️ Manual | Use "Create shortcut" from menu |
| Firefox | ✅ Yes | Limited PWA support |

## Resources

- [Google Apps Script Web Apps Documentation](https://developers.google.com/apps-script/guides/web)
- [MDN: Add to Home Screen](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen)
- [Web.dev: Service Worker MIME Types](https://web.dev/articles/service-worker-lifecycle#mime-type)

---

**Current Status**: ✅ Web App with Manifest
**PWA Level**: Basic (Add to Home Screen only)
**Limitation**: Google Apps Script cannot serve service workers
**User Impact**: App works as bookmark-style shortcut (not full PWA)
**Last Updated**: 2025-12-19
