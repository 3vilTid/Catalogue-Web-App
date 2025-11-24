# Catalogue Web App

A dynamic, customizable catalogue management system built with Google Apps Script. Features email authentication, role-based access control, flexible column configuration with visual layout control, and optimized image handling.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [File Structure](#file-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Browser Support](#browser-support)

---

## Features

### Email-Based Authentication
- **OTP Verification**: Secure email-based one-time password authentication
- **Session Management**: Persistent sessions with automatic token validation
- **No Password Required**: Simple, secure access via email verification codes

### Dynamic Column System with Visual Layout Control

**Item Places** - Control where fields appear in the detail view:
- **Primary Identifier**: Main item name (required)
- **Main Image**: Primary item image from Google Drive
- **SubId1**: First subtitle field (displayed under main title)
- **SubId2**: Second subtitle field (displayed under main title)
- **Top Corner**: Badge-style display in top-right corner
- **Long text Up**: Full-width field before the two-column grid
- **Detail Left**: Left column of two-column grid
- **Detail Right**: Right column of two-column grid
- **Long text Down**: Full-width field after the two-column grid
- **Bottom**: Small gray text at bottom (e.g., metadata)

**Special Roles** - Add special behaviors to columns:
- **Auto-filled User Mail**: Automatically filled with creator's email
- **External Link**: Clickable link display
- **Formula (Read-only)**: Formula-based columns excluded from forms

**Column Configuration** (7 columns):
1. Column Name
2. Display Name
3. Type (text, date, number, url)
4. Show in Filter (boolean)
5. Show in Sort (boolean)
6. Item Place (dropdown)
7. Special Role (dropdown)

**Column Management** (Creator only):
- Add, edit, delete, and reorder columns
- Export/Import column configuration as JSON
- Real-time preview of layout changes

### Role-Based Access Control

Three user roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Viewer** | Read-only access to catalogue items |
| **Editor** | Add items, edit/delete own items |
| **Creator** | Full access: manage columns, settings, edit all items, access Google Sheet |

### User Interface

**Grid View**:
- Visual card-based display with lazy-loaded images
- Responsive grid layout
- SubId1 and SubId2 displayed under item name

**Detail View**:
- Two-column layout with configurable field placement
- Top corner badge display
- Long text sections (before and after grid)
- Bottom metadata section
- Progressive image loading with blur placeholder
- Clickable external links
- Clean, minimal design

**Navigation & Controls**:
- Filter and Sort buttons (hidden in detail view)
- Back to List button (replaces Filter/Sort in detail view)
- Sheet, Columns, and Add Item buttons (right-aligned)
- Styled scrollbars that blend with design

**Dynamic Filters & Sorting**:
- Filter by any column marked as filterable
- Sort by any column marked as sortable (ascending/descending)
- Client-side filtering and sorting (instant results)

### Data Management

- **Add Items**: Dynamic forms generated from column configuration
- **Edit Items**: Permission-based editing (Editors: own items, Creators: all items)
- **Delete Items**: Permission-based deletion with confirmation
- **Auto-tracking**: Automatically records who added each item
- **Date Handling**: Date adjustment setting for timezone correction
- **Image Caching**: IndexedDB-based caching for faster loading

### Visual Improvements

- **Smooth Date Inputs**: Enhanced date picker styling with hover effects
- **Styled Scrollbars**: Thin, semi-transparent scrollbars that blend with background
- **Clean Images**: No shadows or borders on detail view images
- **Optimized Layout**: No delimitation borders, seamless page transitions

---

## Architecture Overview

### Components

**Google Sheets (Database)**
```
┌─────────────────────┐
│ Main Sheet          │  ← Catalogue data
├─────────────────────┤
│ ColumnConfig        │  ← Column definitions (7 columns)
├─────────────────────┤
│ Settings            │  ← App configuration + date adjustment (H2)
├─────────────────────┤
│ Users               │  ← Access control
├─────────────────────┤
│ EmailOTP            │  ← OTP verification codes
└─────────────────────┘
```

**Apps Script (Backend)** - `Code.gs`
- Email OTP authentication system
- Session management and validation
- Access control enforcement
- CRUD operations for items
- Column configuration management
- Image serving (Drive file proxy)
- Settings management

**HTML/CSS/JS (Frontend)** - `index.html`
- Single-page application
- Email login interface
- Dynamic form generation based on Item Place and Special Role
- Two-column detail view layout
- IndexedDB image cache with lazy loading
- Filter and sort logic
- Responsive button visibility (Filter/Sort ↔ Back to List)

### Data Flow

```
User visits app URL
    ↓
Enter email address
    ↓
Receive OTP via email
    ↓
Enter OTP code
    ↓
Session token created
    ↓
Access control check (Users sheet)
    ↓
Load app with user's role
    ↓
Frontend loads data via google.script.run
    ↓
IndexedDB cache for images
    ↓
Render UI based on Item Places
```

### Deployment

**Single deployment required:**
- **Execute as**: "Me" (your email)
- **Who has access**: "Anyone"
- Purpose: Handles both authentication and image serving

---

## Setup Instructions

### 1. Create Google Sheets Structure

#### Main Sheet
Contains your catalogue data. Column headers must match ColumnConfig.

Example:
```
Name        | Description      | Picture url          | Category | Place  | Date       | Added By
------------|------------------|----------------------|----------|--------|------------|------------------
Darth Vader | Movie character  | https://drive.../... | Star Wars| Bali   | 2024-01-15 | user@example.com
```

#### ColumnConfig Sheet
**Headers:** `Column Name | Display Name | Type | Show in Filter | Show in Sort | Item Place | Special Role`

Example configuration:
```
Column Name   | Display Name | Type | Filter | Sort  | Item Place        | Special Role
--------------|--------------|------|--------|-------|-------------------|------------------
Name          | Name         | text | FALSE  | TRUE  | Primary Identifier|
Description   | Description  | text | FALSE  | FALSE | Long text Up      |
Picture url   | Picture      | text | FALSE  | FALSE | Main Image        |
Category      | Category     | text | TRUE   | TRUE  | SubId1            |
Place         | Location     | text | TRUE   | TRUE  | SubId2            |
Date          | Date         | date | FALSE  | TRUE  | Top Corner        |
ExternalLink  | Link         | text | FALSE  | FALSE | Detail Left       | External Link
Info1         | Info 1       | text | FALSE  | FALSE | Detail Left       |
Info2         | Info 2       | text | FALSE  | FALSE | Detail Right      |
Added By      | Added By     | text | FALSE  | FALSE | Bottom            | Auto-filled User Mail
```

**Column Types:**
- `text`: Text input
- `date`: Date picker with dd/mm/yyyy display (locale-dependent)
- `number`: Numeric input
- `url`: URL input

**Item Places:**
- `Primary Identifier`: Main item name (required, only one)
- `Main Image`: Primary image (only one)
- `SubId1`: First subtitle (only one)
- `SubId2`: Second subtitle (only one)
- `Top Corner`: Top-right badge display
- `Long text Up`: Full-width before grid
- `Detail Left`: Left column of grid
- `Detail Right`: Right column of grid
- `Long text Down`: Full-width after grid
- `Bottom`: Bottom metadata section

**Special Roles:**
- `Auto-filled User Mail`: Automatically filled with user's email
- `External Link`: Renders as clickable link
- `Formula (Read-only)`: Excluded from add/edit forms
- Leave empty for regular columns

#### Settings Sheet
Configure in column C and H:

| Cell | Setting | Example | Description |
|------|---------|---------|-------------|
| C2 | App Name | "Catalogue" | Browser title |
| C3 | Catalogue Name | "My Underwater Pics" | Header title (can be renamed from UI) |
| C4 | Sheet URL | (auto-filled) | Link to this sheet |
| H2 | Date Adjustment | 1 | Days to add to all dates (0 = no adjustment, 1 = +1 day) |

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

#### EmailOTP Sheet (Auto-created)
Created automatically on first login. Stores temporary OTP codes.
**Do not modify manually.**

### 2. Apps Script Setup

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code in Code.gs
4. Copy contents of `Code.gs` from this repository
5. Create new HTML file: **File > New > HTML file**, name it `index`
6. Paste contents of `index.html` from this repository
7. Save the project (Ctrl+S or Cmd+S)

### 3. Deploy

1. Click **Deploy > New deployment**
2. Click gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: `Catalogue App`
   - **Execute as**: **Me (your-email@example.com)**
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. Click **Authorize access** and complete OAuth flow
7. **Copy the Web app URL**
8. **Share this URL with your users**

### 4. First Access

1. Visit the app URL
2. Enter your email address
3. Check your email for the OTP code
4. Enter the OTP code
5. You're logged in!

**Note:** Your email must be in the Users sheet to receive access.

---

## Usage Guide

### For All Users

#### Login
1. Enter your email address
2. Click "Send Verification Code"
3. Check your email for the 6-digit code
4. Enter the code within 10 minutes
5. You're logged in for this session

#### Browse & View
- View items in grid layout
- Click any item to see full details
- Click image in detail view for fullscreen
- Use "Back to List" button to return to grid

#### Filter & Sort
- **Filter**: Click 🔍 Filter, select criteria, click Apply
- **Sort**: Click ↕️ Sort, choose field and direction
- **Note**: Filter and Sort buttons are hidden in detail view

### For Editors

#### Add Items
1. Click **+ Add item** button
2. Fill in the form (fields with "Auto-filled User Mail" role are automatic)
3. Date fields show enhanced date picker
4. Click **Save**

#### Edit Your Items
1. Click an item card you created
2. Click **✏ Edit** in detail view
3. Modify fields
4. Click **Save**

#### Delete Your Items
1. Open detail view for your item
2. Click **🗑 Delete**
3. Confirm deletion

### For Creators

#### Manage Columns
1. Click **⚙ Columns** button
2. **Add Column**:
   - Click "➕ Add Column"
   - Set Column Name, Display Name, Type
   - Choose Item Place for visual positioning
   - Choose Special Role for special behaviors
   - Set Filter/Sort visibility
3. **Edit Column**: Click Edit button on any column
4. **Reorder**: Use ▲▼ arrows to change order
5. **Delete**: Click ✖ button (with confirmation)
6. **Export/Import**: Use buttons at bottom to backup/restore configuration

#### Access Google Sheet
- Click **📊 Sheet** button to open source Google Sheet

#### Rename Catalogue
- Click pencil icon ✏ next to catalogue name in header
- Enter new name
- Changes immediately

#### Edit All Items
- Can edit/delete any item, regardless of creator
- Full access to all data

#### Adjust Dates
- Open Settings sheet
- Set cell H2 to number of days to adjust
- Example: `1` adds 1 day to all dates
- Use to compensate for timezone issues

---

## File Structure

```
Tid-Codes/
├── Code.gs           # Backend logic (Google Apps Script)
│   ├── Email OTP authentication
│   ├── Session management
│   ├── Item Place & Special Role maps
│   ├── Column management functions
│   ├── User authentication and access control
│   ├── CRUD operations
│   ├── Settings management (including date adjustment)
│   ├── Image serving
│   └── UI serving
│
├── index.html        # Frontend (HTML + CSS + JavaScript)
│   ├── Email login interface
│   ├── UI Layout with Item Places
│   ├── Dynamic form generation
│   ├── Filter and sort logic
│   ├── IndexedDB image cache
│   ├── Modal dialogs
│   ├── Button visibility management (Filter/Sort ↔ Back to List)
│   └── Event handlers
│
└── README.md         # This file
```

### Key Functions in Code.gs

| Function | Purpose |
|----------|---------|
| `doGet(e)` | Entry point for web app requests |
| `sendOTP(email)` | Send verification code via email |
| `verifyOTP(email, code)` | Verify OTP and create session |
| `verifySession(token)` | Validate session token |
| `getUserInfo(token)` | Get current user's role |
| `getInitialData(token)` | Load all data for frontend |
| `getColumnConfig()` | Get column configuration with Item Places and Special Roles |
| `saveColumnConfig(configs, token)` | Save column configuration |
| `addMainRow(obj, token)` | Add new item (auto-fills Special Role columns) |
| `editItem(name, updates, token)` | Edit existing item |
| `deleteItem(name, token)` | Delete item |
| `getSettings()` | Get app settings including date adjustment |
| `getMainData()` | Get all items with date adjustment applied |

### Key Components in index.html

| Component | Purpose |
|-----------|---------|
| `showLoginScreen()` | Display email login form |
| `sendVerificationCode()` | Request OTP via email |
| `verifyCode()` | Submit OTP for verification |
| `init()` | Initialize app after successful login |
| `renderGrid()` | Render card grid with SubId1/SubId2 |
| `showDetails(item)` | Show item details with Item Place layout |
| `backToList()` | Return to grid, toggle button visibility |
| `renderFilters()` | Generate filter UI |
| `applyFiltersAndSorting()` | Apply filters and sorting |
| `imageCacheDB` | IndexedDB cache manager |
| `loadImageViaProxy()` | Lazy load images with progressive enhancement |
| `formatDate()` | Format dates as dd/mm/yyyy |
| `openColumnManager()` | Open column management modal |

---

## Technical Details

### Authentication System

**OTP Flow:**
1. User enters email
2. Backend generates 6-digit code
3. Code stored in EmailOTP sheet with timestamp
4. Code emailed to user
5. User enters code within 10 minutes
6. Backend validates code
7. Session token created and returned
8. Token stored in localStorage
9. Token validated on each backend call

**Session Management:**
- Tokens are UUIDs stored in browser localStorage
- Backend validates token on every call
- Sessions don't expire (until logout)
- No password required

### Item Place System

**Backend (Code.gs):**
```javascript
ITEM_PLACE_MAP = {
  "Primary Identifier": "name",
  "Main Image": "image",
  "SubId1": "category",
  "SubId2": "place",
  "Top Corner": "topcorner",
  "Long text Up": "longtextup",
  "Detail Left": "detailleft",
  "Detail Right": "detailright",
  "Long text Down": "longtextdown",
  "Bottom": "bottom"
}

SPECIAL_ROLE_MAP = {
  "Auto-filled User Mail": "addedby",
  "External Link": "externallink",
  "Formula (Read-only)": "formula"
}
```

**Frontend Layout:**
```
┌─────────────────────────────────────────┐
│ Top Corner (badge, top-right)          │
│                                         │
│ Primary Identifier (large title)       │
│ SubId1 • SubId2 (gray text)            │
├─────────────────────────────────────────┤
│ Long text Up (full width)              │
├──────────────────┬──────────────────────┤
│ Detail Left      │ Detail Right         │
│ (column 1)       │ (column 2)           │
├──────────────────┴──────────────────────┤
│ Long text Down (full width)            │
├─────────────────────────────────────────┤
│ Bottom (small gray text)               │
└─────────────────────────────────────────┘
```

### Image Handling

1. Images stored in Google Drive
2. Image URLs in Main sheet (format: `https://drive.google.com/file/d/FILE_ID/view`)
3. Backend extracts FILE_ID and serves via `serveImage_(fileId)`
4. Returns JSON: `{ok: true, mime: "image/png", data: "base64..."}`
5. Frontend caches in IndexedDB
6. Lazy loading with IntersectionObserver
7. Progressive enhancement: blur placeholder → full image

### Date Handling

**Timezone Adjustment:**
- Set in Settings sheet cell H2
- Applied in `getMainData()` and `getItemByName()`
- Example: H2 = `1` adds 1 day to all dates
- Compensates for timezone display issues

**Display Format:**
- Browser determines format based on locale
- Usually dd/mm/yyyy in Europe, mm/dd/yyyy in US
- Internal storage always YYYY-MM-DD

**Enhanced Date Inputs:**
- Styled with rounded corners and smooth transitions
- Hover effects on calendar picker icon
- Consistent with other form inputs

### Access Control Logic

```javascript
// Login: Anyone can request OTP, only Users sheet emails can verify
// Viewing items: All authenticated users
// Adding items: Editors and Creators
// Editing items:
//   - Editors: Own items only (Added By matches email)
//   - Creators: All items
// Deleting items: Same as editing
// Managing columns: Creators only
// Accessing sheet: Creators only
```

### IndexedDB Schema

```javascript
Database: "ImageCache"
Object Store: "images"
Key: fileId (Google Drive file ID)
Value: {
  data: "base64...",
  mime: "image/png",
  timestamp: Date.now()
}
```

### Performance Optimizations

- **IndexedDB image caching** - Reduces Drive API calls
- **Lazy loading images** - Only loads visible images
- **Client-side filtering/sorting** - No server round-trip
- **Single data load on init** - Minimizes backend calls
- **Progressive image loading** - Blur placeholder while loading
- **Styled scrollbars** - Thin, transparent, performant

### Visual Enhancements

- **No delimitation borders** - Seamless page background
- **Clean images** - No shadows or borders on detail images
- **Smooth scrollbars** - 8px thin, semi-transparent
- **Enhanced date pickers** - Better padding, rounded corners, hover effects
- **Button visibility toggle** - Filter/Sort hidden in detail view, Back to List shown

---

## Troubleshooting

### Cannot Login

**Problem:** Not receiving OTP email

**Solutions:**
1. Check spam/junk folder
2. Verify email is in Users sheet (exact match, case-sensitive)
3. Check Apps Script quotas (max 100 emails/day for free accounts)
4. Wait 10 minutes and try again if multiple failed attempts

**Problem:** "Invalid code" error

**Solutions:**
1. Check code is exactly 6 digits
2. Verify code hasn't expired (10 minute limit)
3. Request new code if expired
4. Ensure no spaces before/after code

### Access Denied Error

**Problem:** "Access Denied" after successful OTP verification

**Solutions:**
1. Check your email is in Users sheet (exact match)
2. Verify Users sheet has "Email" column header (case-sensitive)
3. Check for typos in email address
4. Ensure Users sheet is in same spreadsheet

### Images Not Loading

**Problem:** Broken image icons or images not appearing

**Solutions:**
1. **Check image URLs** in Main sheet:
   - Must be Google Drive URLs
   - Format: `https://drive.google.com/file/d/FILE_ID/view`
   - Extract FILE_ID from URL
2. **Check Drive permissions**:
   - Open image in Drive
   - Click Share → "Anyone with the link can view"
3. **Clear cache**:
   - Open browser DevTools (F12)
   - Application tab → IndexedDB → Delete "ImageCache"
   - Refresh page
4. **Check deployment**:
   - Verify "Execute as: Me"
   - Verify "Who has access: Anyone"

### Changes Not Appearing

**Problem:** Made changes to code/sheet but not reflected in app

**Solutions:**
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache completely**
3. **Create new deployment version**:
   - Apps Script: Deploy → Manage deployments
   - Click Edit (pencil icon)
   - Change version to "New version"
   - Click Deploy
4. **Clear session**:
   - Logout and login again
   - Or clear localStorage

### Column Changes Not Saving

**Problem:** Column management changes don't persist

**Solutions:**
1. Verify you're signed in as Creator
2. Check ColumnConfig sheet has exactly 7 columns:
   - Column Name | Display Name | Type | Show in Filter | Show in Sort | Item Place | Special Role
3. Check Apps Script → Executions for error logs
4. Ensure Main sheet has matching column headers

### Dates Are Wrong

**Problem:** Dates showing 1 day off

**Solutions:**
1. Open Settings sheet
2. Set cell H2 to `1` (to add 1 day)
3. Or set to `-1` (to subtract 1 day)
4. Adjust until dates display correctly
5. This compensates for timezone differences

### Layout Issues

**Problem:** Fields not appearing in correct positions

**Solutions:**
1. Check Item Place values in ColumnConfig
2. Verify only ONE column has "Primary Identifier"
3. Verify only ONE column has "Main Image"
4. Check spelling of Item Place values (case-sensitive)
5. Refresh page after changing ColumnConfig

---

## Browser Support

**Recommended:**
- Chrome/Chromium (desktop and mobile)
- Safari (desktop and iOS)
- Edge
- Firefox

**Requirements:**
- JavaScript enabled
- Cookies enabled (for session storage)
- LocalStorage enabled (for session tokens)
- IndexedDB support (optional, for image caching)

**Known Issues:**
- Older browsers (IE11, etc.) not supported
- Private/Incognito mode works but session is lost on close
- Date format depends on browser locale settings

---

## Limitations

### Google Apps Script Quotas

Free tier limits (per day):
- **Email sends**: 100 emails/day
- **Execution time**: 6 minutes per execution
- **Script runtime**: 90 minutes total per day

### Functional Limitations

- **Online only**: Requires internet connection
- **No offline mode**: Cannot work without Google servers
- **Image formats**: Limited by Google Drive supported formats
- **Concurrent users**: Limited by Apps Script quotas
- **Sheet size**: Performance degrades with 1000+ rows
- **OTP expiration**: Codes expire after 10 minutes
- **Email-based only**: Requires Google account with email access

### Security Limitations

- **Email-based access**: Only works with Google accounts
- **OTP delivery**: Dependent on email delivery (check spam)
- **No rate limiting**: Subject to Apps Script quotas only
- **Session tokens**: Stored in browser localStorage (clear on logout)

---

## Version History

### Current Version (2025-11-24)
- ✅ Moved Back to List button to filters bar
- ✅ Hide Filter/Sort buttons in detail view
- ✅ Remove shadow edge from detail view images
- ✅ Improve scrollbar styling (thin, semi-transparent)
- ✅ Remove delimitation borders throughout app
- ✅ Enhanced date input styling

### Recent Updates (2025-11-23)
- ✅ Added Bottom item place for metadata display
- ✅ Removed automatic "Added By" display
- ✅ Fixed date timezone issues with adjustment setting (Settings H2)
- ✅ Added Top Corner item place for badge-style display
- ✅ Improved date format display (dd/mm/yyyy)

### Previous Updates (2025-11-22)
- ✅ Restructured column system: Item Place + Special Role
- ✅ Split layout control (Item Place) from behavior (Special Role)
- ✅ Reduced ColumnConfig from 8 to 7 columns
- ✅ Implemented two-column detail view layout
- ✅ Added Long text Up/Down sections
- ✅ Email OTP authentication system
- ✅ Session management with tokens
- ✅ Removed PWA code (~160 lines)
- ✅ Removed mobile-specific responsive styling

---

## Future Development Ideas

**Possible Enhancements:**
- CSV import/export for bulk operations
- Image upload to Drive from app
- More column types (checkbox, dropdown, multi-select)
- Advanced filtering (AND/OR logic, date ranges)
- User activity logs
- Email notifications for changes
- Remember me / persistent sessions
- 2FA options beyond email OTP

**Not Recommended:**
- PWA features (Apps Script limitations)
- Offline mode (requires different architecture)
- Mobile-specific layouts (single layout is simpler)

---

## Support

**For errors:**
1. Open Apps Script editor
2. Go to **Executions** (left sidebar)
3. Check recent executions for error messages
4. Look for red ❌ icons

**For questions:**
- Review this README
- Check Troubleshooting section
- Review code comments in Code.gs and index.html
- Check Settings sheet configuration
- Verify ColumnConfig structure (7 columns)

---

**Built with Google Apps Script**

Repository: https://github.com/3vilTid/Tid-Codes
Last Updated: 2025-11-24
