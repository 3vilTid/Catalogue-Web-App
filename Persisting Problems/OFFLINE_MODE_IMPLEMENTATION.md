# Offline Mode Implementation - Work in Progress

**Status:** Reverted (needs more debugging time)
**Date:** January 2026
**Conclusion:** Implementation is feasible but requires more debugging to resolve remaining issues.

---

## Overview

An attempt was made to implement offline viewing mode for the GitHub Pages deployment. The goal was to allow users to view cached catalogue data when offline (as Viewer profile only).

---

## What Was Implemented

### 1. IndexedDB Cache Service (`offline-cache.js`)

A new service was created to handle offline data storage using IndexedDB:

```javascript
class OfflineCache {
  constructor() {
    this.dbName = 'CatalogueOfflineDB';
    this.dbVersion = 1;
    this.storeName = 'appData';
    this.db = null;
  }

  async init() { /* Initialize IndexedDB connection */ }
  async save(key, data) { /* Save data to IndexedDB */ }
  async get(key) { /* Retrieve data from IndexedDB */ }
  async saveAppData(data) { /* Save complete app state */ }
  async loadAppData() { /* Load complete app state */ }
  async saveTabData(tabIndex, data) { /* Save tab-specific data */ }
  async loadTabData(tabIndex) { /* Load tab-specific data */ }
  async clearCache() { /* Clear all cached data */ }
}
```

**Data cached:**
- `settings` - App settings including Type/Style configurations
- `headers` - Column headers
- `items` - All catalogue items
- `columnConfig` - Column configuration
- `layerConfig` - Layer configuration
- `layersData` - Layer-specific data
- `tabsConfig` - Tab configuration
- `user` - User information

### 2. Service Worker Updates (`service-worker.js`)

Updated to version 10.0.0 with:
- Added `offline-cache.js` to precached files
- Implemented image caching strategy for offline use
- Cache-first strategy for images from Apps Script

### 3. Main App Changes (`index.html`)

#### Offline Mode State Management
```javascript
let isOfflineMode = false;

function setOfflineMode(offline) {
  isOfflineMode = offline;
  if (offline) {
    // Show "Offline" badge instead of profile role
    // Disable edit/delete/add buttons
  }
}
```

#### Data Caching
- `cacheAppData()` - Saves current app state to IndexedDB after successful API load
- `loadFromCache()` - Loads app state from IndexedDB when offline

#### Tab Switching for Offline
Modified `loadTabData()` to be async and handle offline mode:
- Check in-memory cache first
- If offline, try IndexedDB cache
- Cache tab data to IndexedDB after API load

---

## Problems Encountered

### 1. Cache Initialization Missing
**Issue:** "No internet connection and no cached data available" error
**Cause:** `offlineCache.init()` was never called during app initialization
**Fix Applied:** Added `await window.offlineCache.init()` in the initialization sequence

### 2. Tab Switching Not Working Offline
**Issue:** Switching tabs while offline failed to load data
**Cause:** `loadTabData()` wasn't checking offline status or using IndexedDB cache
**Fix Applied:** Made function async, added offline detection, added IndexedDB fallback

### 3. Layers Not Displaying Correctly (Partially Fixed)
**Issue:** Layers (Type and Style) not displaying as they were when last online
**Cause:** `settings` and `headers` were not being saved/loaded for tab-specific data
**Fix Applied:** Added settings and headers to `saveTabData`/`loadTabData` functions

### 4. Remaining Unresolved Issues
- **First tab switch works, second doesn't** - Needs investigation into state management between tab switches
- **Refresh while offline causes bugs** - App initialization flow needs adjustment for offline-first scenario
- **Layer display inconsistencies** - Complex interaction between layerConfig, layersData, and view settings

---

## Architecture Decisions

### Why IndexedDB?
- Large storage capacity (no 5MB limit like localStorage)
- Can store complex objects without JSON serialization overhead
- Async API doesn't block main thread
- Better suited for catalogue data with images

### Why Cache After API Load?
- Ensures cached data is always valid/complete
- Simpler than trying to sync partial updates
- User must visit tabs while online to cache them

### Offline Badge Design
- Shows "Offline" in place of profile role (Creator/Editor/Viewer)
- Email still visible for user identification
- Edit/Delete/Add buttons disabled when offline

---

## Files That Were Modified

1. **offline-cache.js** (NEW) - IndexedDB cache service
2. **service-worker.js** - Updated to v10.0.0 with image caching
3. **index.html** - Offline mode state, caching functions, modified loadTabData

---

## How to Complete This Implementation

### Step 1: Debug Tab Switching
- Add detailed logging to track state changes during tab switches
- Verify tabDataCache and IndexedDB are in sync
- Check if currentTabIndex is being properly maintained

### Step 2: Fix Offline Refresh
- Ensure offlineCache.init() is called early in app startup
- Handle the case where app starts offline (no session token)
- May need to skip authentication flow when offline

### Step 3: Verify Layer Data Flow
- Log layerConfig and layersData at each step
- Compare online vs offline data structures
- Ensure initializeDisplayViewType() is called after settings are restored

### Step 4: Testing Strategy
1. Clear IndexedDB cache completely
2. Load app online, visit ALL tabs
3. Go offline and test:
   - Initial tab display
   - Tab switching (multiple times)
   - Layer navigation
   - Page refresh
   - Re-opening app

---

## Commits Made (Now Reverted)

1. `947ac82` - Add offline cache service for offline viewing mode
2. `d5ab5ca` - Implement offline viewing mode for GitHub Pages
3. `7e1b817` - Fix offline cache: add missing offlineCache.init() call
4. `99301d5` - Fix offline mode for tab switching
5. `c1d0de0` - Fix offline mode: save/restore settings and headers for tabs

---

## Conclusion

**The offline mode implementation IS feasible.** The core architecture (IndexedDB caching, service worker image caching, offline detection) is sound. The remaining issues are related to:

1. State management complexity with multiple tabs
2. Layer configuration restoration timing
3. App initialization flow when starting offline

With dedicated debugging time, these issues can be resolved. The implementation provides a good foundation to build upon when time permits.
