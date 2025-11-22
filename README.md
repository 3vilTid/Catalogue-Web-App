# Catalogue Web App

A dynamic web application built with Google Apps Script for managing catalogues with customizable columns, role-based access control, and image caching.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [File Structure](#file-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Aborted Features](#aborted-features)
- [Browser Support](#browser-support)

---

## Features

### Dynamic Column System
- **Fully Configurable Columns**: Define columns dynamically through the ColumnConfig sheet
- **Special Column Roles**: Assign special behaviors to columns:
  - `Primary Identifier`: Main item name (required)
  - `Description`: Item description
  - `Image URL`: URL to item image (Google Drive)
  - `Category`: Classification/category
  - `Location`: Place/location information
  - `Date`: Date field
  - `External Link`: External URL
  - `Auto-filled Creator`: Automatically filled with user's email
  - `Formula (Read-only)`: Formula-based columns
- **Column Management UI**: Add, edit, delete, and reorder columns (Creator only)
- **Import/Export**: Export column configuration as JSON and import it back

### Role-Based Access Control
Three user roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Viewer** | Read-only access to catalogue items |
| **Editor** | Add items, edit/delete own items |
| **Creator** | Full access: manage columns, edit all items, access Google Sheet |

### User Interface
- **Grid View**: Visual card-based display with images
- **Detail View**: Expandable cards showing all configured fields
- **Dynamic Filters**: Filter by any column marked as filterable (radio buttons)
- **Dynamic Sorting**: Sort by any column marked as sortable (ascending/descending)
- **Search**: Quick search across items
- **Image Caching**: IndexedDB-based caching for faster image loading
- **Responsive**: Works on desktop and mobile browsers

### Data Management
- **Add Items**: Dynamic forms generated from column configuration
- **Edit Items**: Permission-based editing (Editors: own items, Creators: all items)
- **Delete Items**: Permission-based deletion with confirmation
- **Auto-tracking**: Automatically records who added each item

---

## Architecture Overview

### Components

**Google Sheets (Database)**
```
┌─────────────────────┐
│ Main Sheet          │  ← Catalogue data
├─────────────────────┤
│ ColumnConfig        │  ← Column definitions
├─────────────────────┤
│ Settings            │  ← App configuration
├─────────────────────┤
│ Users               │  ← Access control
└─────────────────────┘
```

**Apps Script (Backend)**
- `Code.gs`: Server-side logic
  - User authentication via People API
  - Access control enforcement
  - CRUD operations for items
  - Column configuration management
  - Image serving (base64 encoded JSON)

**HTML/CSS/JS (Frontend)**
- `index.html`: Single-page application
  - UI rendering and interactions
  - Dynamic form generation
  - IndexedDB image cache
  - Filter and sort logic

### Data Flow

```
User Request
    ↓
Google Apps Script (doGet)
    ↓
Access Control Check (Users sheet)
    ↓
Serve index.html
    ↓
Frontend loads data via google.script.run
    ↓
IndexedDB cache for images
    ↓
Render UI
```

### Deployments Required

**Two separate deployments are needed:**

1. **Image Server** (Execute as "Me")
   - Purpose: Serve images from your Google Drive
   - Why: Allows all users to view images without Drive permissions
   - Settings cell C4: Paste this deployment URL

2. **Main App** (Execute as "User accessing")
   - Purpose: Main application with user authentication
   - Why: Runs with user's identity for access control
   - Share this URL with users

---

## Setup Instructions

### 1. Create Google Sheets Structure

#### Main Sheet
Contains your catalogue data. Column headers must match ColumnConfig.

Example:
```
Name        | Description      | Picture url          | Category | Place  | Date       | Added By
------------|------------------|----------------------|----------|--------|------------|------------------
Darth Vader | Movie character  | https://drive.../... | Movies   | Space  | 2024-01-15 | user@example.com
```

#### ColumnConfig Sheet
**Headers:** `Column Name | Display Name | Type | Show in Filter | Show in Sort | Show in Detail | Special Role`

Example configuration:
```
Column Name   | Display Name | Type | Filter | Sort  | Detail | Special Role
--------------|--------------|------|--------|-------|--------|------------------
Name          | Name         | text | FALSE  | TRUE  | TRUE   | Primary Identifier
Description   | Description  | text | FALSE  | FALSE | TRUE   | Description
Picture url   | Picture      | text | FALSE  | FALSE | TRUE   | Image URL
Category      | Category     | text | TRUE   | TRUE  | TRUE   | Category
Place         | Location     | text | TRUE   | TRUE  | TRUE   | Location
Date          | Date         | date | FALSE  | TRUE  | TRUE   | Date
ExternalLink  | Link         | text | FALSE  | FALSE | TRUE   | External Link
Added By      | Added By     | text | FALSE  | FALSE | TRUE   | Auto-filled Creator
```

**Column Types:**
- `text`: Text input
- `date`: Date picker
- `number`: Numeric input
- `url`: URL input

**Special Roles:**
- Use exact names from the table above
- `None` or empty for regular columns
- Only one column should have `Primary Identifier`

#### Settings Sheet
Configure in column C:

| Cell | Setting | Example | Description |
|------|---------|---------|-------------|
| C2 | App Name | "Catalogue" | Shown in browser title |
| C3 | Catalogue Name | "My Underwater Pics" | Shown in header |
| C4 | Image Base URL | (deployment URL) | URL from Image Server deployment |
| C6 | App Icon URL | (Google Drive link) | Icon for app (not currently used) |
| C7 | Sheet URL | (sheet URL) | Link to this sheet (shown to Creators) |

#### Users Sheet
**Headers:** `Email | Name | Profile`

Example:
```
Email                | Name        | Profile
---------------------|-------------|--------
admin@example.com    | Admin User  | Creator
editor@example.com   | Editor User | Editor
viewer@example.com   | Viewer User | Viewer
```

**Important:** Only emails listed here can access the app.

### 2. Apps Script Setup

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code in Code.gs
4. Copy contents of `Code.gs` from this repository
5. Create new HTML file: **File > New > HTML file**, name it `index`
6. Paste contents of `index.html` from this repository
7. Enable **People API**:
   - Click **Services** (+ icon) in left sidebar
   - Find "People API"
   - Click "Add"
8. Save the project (Ctrl+S or Cmd+S)

### 3. Create Deployments

#### Deployment 1: Image Server

1. Click **Deploy > New deployment**
2. Click gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: `Image Server`
   - **Execute as**: **Me (your-email@example.com)**
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. **Copy the Web app URL**
7. Paste this URL into Settings sheet **cell C4**

#### Deployment 2: Main Application

1. Click **Deploy > New deployment** (again)
2. Click gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: `Catalogue Main App`
   - **Execute as**: **User accessing the web app**
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. Click **Authorize access** and complete OAuth flow
7. **Copy the Web app URL**
8. **Share this URL with your users**
9. Optionally paste into Settings sheet **cell C7**

### 4. First Access

1. Visit the Main App URL
2. Sign in with your Google account
3. Grant permissions when prompted
4. Ensure your email is in the Users sheet

---

## Usage Guide

### For Creators

#### Manage Columns
1. Click **⚙ Columns** button
2. Add new columns with "➕ Add Column"
3. Edit column properties (name, type, visibility, special role)
4. Reorder with ▲▼ arrows
5. Delete columns with ✖ button
6. Export/Import configuration with buttons at bottom

#### Access Google Sheet
- Click **📊 Sheet** button to open Google Sheet directly

#### Rename Catalogue
- Click pencil icon ✏ next to catalogue name in header

#### Edit All Items
- Can edit/delete any item, regardless of who created it

### For Editors

#### Add Items
1. Click **+ Add item** button
2. Fill in the form (auto-filled fields are automatic)
3. Click **Save**

#### Edit Your Items
1. Click an item card you created
2. Click **Edit** in detail view
3. Modify fields
4. Click **Save**

#### Delete Your Items
1. Open detail view for your item
2. Click **Delete**
3. Confirm deletion

### For Viewers

#### Browse
- View items in grid layout
- Click any item to see full details
- Use filters and sorting to find items

#### Filter & Sort
- **Filter**: Click 🔍 Filter, select criteria, click Apply
- **Sort**: Click ↕️ Sort, choose field and direction
- **Reset**: Click ↻ Reset to clear all filters and sorting

---

## File Structure

```
Tid-Codes/
├── Code.gs           # Backend logic (Google Apps Script)
│   ├── Column management functions
│   ├── User authentication and access control
│   ├── CRUD operations (getMainData, addMainRow, editItem, deleteItem)
│   ├── Settings management
│   ├── Image serving (serveImage_)
│   └── UI serving (serveUi_)
│
├── index.html        # Frontend (HTML + CSS + JavaScript)
│   ├── UI Layout
│   ├── Dynamic form generation
│   ├── Filter and sort logic
│   ├── IndexedDB image cache
│   ├── Modal dialogs
│   └── Event handlers
│
└── README.md         # This file
```

### Key Functions in Code.gs

| Function | Purpose |
|----------|---------|
| `doGet(e)` | Entry point for web app requests |
| `serveImage_(fileId)` | Serve images as base64 JSON |
| `serveUi_(e)` | Serve HTML with access control |
| `getUserInfo()` | Get current user's role |
| `getInitialData()` | Load all data for frontend |
| `getColumnConfig()` | Get column configuration |
| `saveColumnConfig(configs)` | Save column configuration |
| `addMainRow(obj)` | Add new item |
| `editItem(name, updates)` | Edit existing item |
| `deleteItem(name)` | Delete item |
| `getSettings()` | Get app settings |

### Key Components in index.html

| Component | Purpose |
|-----------|---------|
| `init()` | Initialize app, load data |
| `renderGrid()` | Render card grid |
| `showDetailView(item)` | Show item details |
| `renderFilters()` | Generate filter UI |
| `applyFiltersAndSorting()` | Apply filters and sorting |
| `imageCacheDB` | IndexedDB cache manager |
| `setupLazyLoading()` | Lazy load images |
| `showAddItemModal()` | Show add item form |
| `showEditItemModal(item)` | Show edit item form |

---

## Technical Details

### Authentication
- Uses Google People API for user email
- Fallback to Session.getActiveUser()
- Email matched against Users sheet

### Image Handling
1. Images stored in Google Drive
2. Image Server deployment serves them via `doGet(e)` with `?img=fileId`
3. Returns JSON: `{ok: true, mime: "image/png", data: "base64..."}`
4. Frontend caches in IndexedDB
5. Lazy loading for performance

### Access Control Logic

```javascript
// Viewing items: All authenticated users
// Adding items: Editors and Creators
// Editing items:
//   - Editors: Own items only (Added By matches email)
//   - Creators: All items
// Deleting items: Same as editing
// Managing columns: Creators only
```

### IndexedDB Schema

```javascript
Database: "ImageCache"
Object Store: "images"
Key: fileId (Google Drive file ID)
Value: {
  data: "base64...",
  mime: "image/png",
  timestamp: 1234567890
}
```

### Performance Optimizations
- IndexedDB image caching (reduces Drive API calls)
- Lazy loading images (only load visible images)
- Client-side filtering and sorting (no server round-trip)
- Single data load on init

---

## Troubleshooting

### Access Denied Error

**Problem:** "Access Denied" message when visiting app

**Solutions:**
1. Check your email is in Users sheet (exact match)
2. Verify you're signed in with correct Google account
3. Check Users sheet has "Email" column header (case-sensitive)
4. Try signing out and signing back in

### Images Not Loading

**Problem:** Broken image icons or images not appearing

**Solutions:**
1. **Check image URLs** in Main sheet:
   - Must be Google Drive URLs
   - Format: `https://drive.google.com/file/d/FILE_ID/view`
2. **Check Drive permissions**:
   - Open image in Drive
   - Click Share
   - Set to "Anyone with the link can view"
3. **Verify Image Server deployment**:
   - Settings cell C4 should have Image Server URL
   - URL should end with `/exec`
   - Test: Visit `IMAGE_URL?img=FILE_ID` (should return JSON)
4. **Clear cache**:
   - Open browser DevTools (F12)
   - Application tab → IndexedDB → Delete "ImageCache"
   - Refresh page

### Changes Not Appearing

**Problem:** Made changes to code/sheet but not reflected in app

**Solutions:**
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**
3. **Check deployment**:
   - Apps Script: Deploy → Manage deployments
   - Click Edit (pencil icon) on Main App
   - Change version to "New version"
   - Click Deploy
4. **Verify you're editing correct deployment**:
   - You may have multiple "Untitled" deployments
   - Check the URL you're visiting matches active deployment

### Column Changes Not Saving

**Problem:** Column management changes don't persist

**Solutions:**
1. Verify you're signed in as Creator
2. Check ColumnConfig sheet exists and is spelled correctly
3. Open Apps Script → Executions to see error logs
4. Make sure Main sheet has matching column headers

### Permission Errors in Logs

**Problem:** "You do not have permission..." errors in Apps Script logs

**Solutions:**
1. **Image Server deployment**: Must be "Execute as: Me"
2. **Main App deployment**: Must be "Execute as: User accessing the web app"
3. **Re-authorize**: Deploy → Manage deployments → Edit → Deploy (triggers re-auth)

---

## Aborted Features

This section documents features that were attempted but ultimately removed due to technical limitations with Google Apps Script.

### ❌ PWA (Progressive Web App) Installation

**What was attempted:**
- Add "Install App" button
- Create PWA manifest endpoint (`?manifest=true`)
- Create service worker endpoint (`?sw=true`)
- Enable installation on mobile and desktop

**Why it failed:**
1. **Google Apps Script URL Issues:**
   - Apps Script serves content from `script.googleusercontent.com` domain
   - Browser redirects through OAuth layer create multiple URLs
   - Actual deployment URL differs from served URL
   - PWA manifest `start_url` must match exact domain

2. **Service Worker Limitations:**
   - Service workers require consistent origin
   - Apps Script OAuth flow changes the origin mid-session
   - Can't reliably register service worker due to redirect chain

3. **Manifest Detection Problems:**
   - Chrome DevTools showed "No manifest detected"
   - Even with valid manifest JSON at endpoint
   - Browser couldn't match manifest URL to app URL due to OAuth redirects

**Code removed:**
- ~74 lines from `Code.gs`: `serveManifest_()`, `serveServiceWorker_()`
- ~88 lines from `index.html`: PWA meta tags, manifest link, PWA initialization code
- Test endpoints and error handling
- `updatePWAWithSettings()` function

**Conclusion:** PWA installation is not feasible with Google Apps Script web apps due to OAuth redirection architecture. Apps remain accessible via browser bookmarks or standard browser "Add to Home Screen" (which just creates a bookmark, not a true PWA).

### ❌ Mobile-Specific Responsive Design

**What was attempted:**
- Create `@media (max-width: 780px)` CSS rules
- Increase button sizes to 48px for touch targets
- Larger fonts (14-15px for buttons, 15px for card names)
- Simplified layouts (single column, full-width dropdowns)
- Prevent input zoom with 16px font minimum

**Why it failed:**
1. **Viewport Reporting Issues:**
   - Some mobile browsers reported incorrect viewport width (980px instead of actual device width like 360px)
   - This prevented media queries from activating
   - Even with correct viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`

2. **Google Apps Script iframe wrapping:**
   - Apps Script sometimes wraps content in iframes for OAuth
   - This interferes with viewport detection
   - Causes inconsistent behavior across different mobile browsers

3. **User Preference:**
   - User preferred consistent desktop layout on all devices
   - Easier to maintain single layout vs. responsive breakpoints
   - Zooming in on mobile is acceptable alternative

**Code removed:**
- ~180 lines of mobile-specific CSS rules
- Viewport debug display
- Media query variations

**Conclusion:** Removed all mobile-specific styling. App now uses same layout on desktop and mobile. Users can zoom/pan on mobile as needed.

### Lessons Learned

1. **Google Apps Script Limitations:**
   - Web apps are served through complex OAuth redirect chain
   - Not suitable for PWA or other features requiring consistent URL origin
   - iframe wrapping can interfere with frontend features

2. **Simplicity is Better:**
   - Removing 200+ lines of unused code made codebase more maintainable
   - Single layout easier to test and debug
   - Fewer browser compatibility issues

3. **Alternative Approaches:**
   - For true PWA: Deploy frontend separately (GitHub Pages, Netlify, etc.) with Apps Script as API
   - For mobile: Consider native Google Drive sharing instead of custom solution
   - For installation: Browser bookmarks sufficient for most users

---

## Browser Support

**Recommended:**
- Chrome (desktop and mobile)
- Safari (desktop and iOS)
- Edge

**Supported:**
- Firefox
- Opera
- Samsung Internet

**Requirements:**
- JavaScript enabled
- Cookies enabled (for Google OAuth)
- IndexedDB support (optional, for image caching)

**Known Issues:**
- Older browsers (IE11, etc.) not supported
- Private/Incognito mode may have session issues

---

## Limitations

### Google Apps Script Quotas
- **Execution time**: Max 6 minutes per request
- **Triggers**: 90 minutes of runtime per day (for triggers, not applicable here)
- **URL Fetch calls**: 20,000 per day

### Functional Limitations
- **Online only**: Requires internet connection
- **No offline mode**: Cannot work without connection to Google servers
- **Image formats**: Limited by Google Drive supported formats
- **Concurrent users**: Limited by Apps Script quotas
- **Sheet size**: Performance degrades with 1000+ rows

### Security Limitations
- **Email-based access**: Only works with Google accounts
- **No API authentication**: All access through OAuth
- **No rate limiting**: Subject to Apps Script quotas only

---

## Version History

### Current Version (2025-11-22)
- ✅ Removed all PWA code (~160 lines)
- ✅ Removed mobile-specific responsive styling
- ✅ Cleaned up Code.gs (removed test endpoints)
- ✅ Simplified to essential functionality only

### Previous Updates
- Added Google Sheet link for Creator users
- Attempted PWA functionality (aborted)
- Attempted mobile-responsive design (aborted)
- Implemented dynamic column management with import/export
- Added column reordering and deletion
- Implemented radio button filters and sorting
- Initial dynamic column configuration system

---

## Future Development Ideas

**Possible Enhancements:**
- Export catalogue data to CSV
- Bulk import items from CSV
- Image upload to Drive from app
- More column types (checkbox, dropdown, multi-select)
- Search within specific columns
- Advanced filtering (AND/OR logic, date ranges)
- User activity logs
- Email notifications for changes

**Note:** PWA and mobile-specific features are not recommended due to Apps Script limitations (see Aborted Features section).

---

## Support

**For errors:**
1. Open Apps Script editor
2. Go to **Executions** (left sidebar)
3. Check recent executions for error messages
4. Look for red ❌ icons

**For questions:**
- Review this README carefully
- Check Troubleshooting section
- Review code comments in Code.gs and index.html

---

**Built with Google Apps Script**

Last Updated: 2025-11-22
