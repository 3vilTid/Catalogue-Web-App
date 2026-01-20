# Claude Code Instructions for Catalogue-Web-App

## Important Workflow Rules

1. **Always create a Pull Request after editing code** - After making any code changes, always create a PR and provide the PR link to the user.

---

## Codebase Structure Overview

This section provides a comprehensive map of the codebase to help you quickly locate and edit specific functionality.

### Repository File Structure

```
/Catalogue-Web-App/
├── Code.gs                    # Backend: Google Apps Script (1,445 lines)
├── index.html                 # Frontend: Complete single-page app (13,273 lines)
├── api-client.js              # GitHub Pages: API client for Apps Script backend (276 lines)
├── api-config.js              # GitHub Pages: API configuration (41 lines)
├── service-worker.js          # PWA: Service worker for offline support (143 lines)
├── manifest.json              # PWA: App manifest for installation (42 lines)
├── appsscript.json            # Apps Script configuration (26 lines)
├── CLAUDE.md                  # This file: Instructions for Claude Code
├── docs/
│   ├── README.md              # Complete documentation (1,286 lines)
│   └── INSTALL-GUIDE.md       # Installation guide (204 lines)
└── assets/
    └── icons/                 # PWA icons (6 files: various sizes)
```

---

### Backend: Code.gs (Google Apps Script)

**Purpose**: Server-side logic, authentication, data management, API endpoints

**Key Sections** (by line number):

| Lines | Section | Purpose |
|-------|---------|---------|
| 1-100 | Constants & Helpers | Item place maps, special role maps, normalizers |
| 101-187 | Column Configuration | `getColumnConfig()` - reads ColumnConfig sheet |
| 188-346 | Entry Points | `doGet()`, `doPost()`, API routing, CORS handling |
| 347-389 | Image Serving | `serveImage_()` - serves Google Drive images as base64 |
| 390-457 | PWA Manifest | `serveManifest_()` - dynamic manifest generation |
| 458-465 | UI Serving | `serveUi_()` - serves index.html |
| 466-603 | Settings | `getSettings()`, `getTabsConfig()` - app configuration |
| 604-687 | Layer Configuration | `getLayerConfig()`, `getMainLayerShowSearch()` |
| 688-767 | Layer Data | `getLayerData()`, `hasLayers()` - hierarchical navigation |
| 768-1009 | Authentication | OTP system, session management, user validation |
| 1010-1145 | Data Access | `getInitialData()`, `getTabData()`, `getMainData()` |
| 1146-1225 | Headers | `getHeaders()` - get column headers |
| 1226-1423 | CRUD Operations | Add/edit/delete items with permission checks |
| 1424-1445 | Test Function | `testEmailPermissions()` - authorize email sending |

**Key Functions to Know**:
- `getInitialData(token)` - Initial app load (settings, layers, items, columns)
- `getColumnConfig(sheetName)` - Read column configuration (8 columns)
- `getLayerConfig(sheetName)` - Read layer definitions from B2:C4
- `getLayerData(layerName, sheetName)` - Read layer data tables (H1+, L1+, Q1+)
- `requestOTP(email)` / `verifyOTP(email, code)` - Email authentication
- `addMainRow(obj, token, ...)` / `editItem(...)` / `deleteItem(...)` - CRUD operations

---

### Frontend: index.html (Single-Page Application)

**Purpose**: Complete UI, all views, device detection, responsive design

**File Structure** (by line number):

| Lines | Section | Purpose |
|-------|---------|---------|
| 1-45 | Header Comments | **CRITICAL**: 6 UI displays documentation |
| 46-62 | HTML Meta Tags | PWA configuration, viewport, theme color |
| 63-121 | API & GitHub Detection | Load API client for GitHub Pages, detect platform |
| 122-322 | Device Detection (HEAD) | **CRITICAL**: Device/orientation detection - runs FIRST |
| 323-2200 | CSS: Base Styles | Colors, scrollbars, body, shell, header, filters |
| 2201-3000 | CSS: Cards View | Grid layout, card styles (squared, rounded, circle, rectangle) |
| 3001-3500 | CSS: List View | Simple, double, triple column layouts |
| 3501-4500 | CSS: Table View | Data table, headers, column menus, expanded rows |
| 4501-5000 | CSS: Detail View | Two-column layout, item places, navigation arrows |
| 5001-5500 | CSS: Diaporama View | Horizontal/vertical full-screen navigation |
| 5501-6000 | CSS: Modals & Forms | Edit modal, confirmation, toasts, column manager |
| 6001-6500 | CSS: Breadcrumb & Bottom Bar | Navigation, tab switcher positioning |
| 6501-7500 | CSS: Mobile Portrait (Apps Script) | 2x scaling for mobile portrait |
| 7501-8000 | CSS: Mobile Portrait (GitHub Pages) | 50% scaled down version |
| 8001-8500 | CSS: Tablet Portrait | 75% of mobile portrait scaling |
| 8501-9500 | CSS: Landscape Mode | **COMBINED** mobile + tablet landscape |
| 9501-10000 | CSS: Desktop Device | Default desktop styles |
| 10001-10500 | HTML: UI Structure | Header, filters, grid, detail, modals |
| 10501-12517 | JavaScript: Setup | Global variables, session management, utility functions |
| 12517-12700 | JavaScript: Init | `init()` - app initialization, load data |
| 12701-13000 | JavaScript: Rendering | `renderList()`, `renderCardsView()`, `renderListView()`, `renderTableView()` |
| 13001-13100 | JavaScript: Detail View | `showDetails()`, navigation arrows, swipe |
| 13101-13200 | JavaScript: Filters & Sort | `applyFiltersAndSorting()`, dropdown management |
| 13201-13271 | JavaScript: Layer Navigation | `navigateToLayer()`, breadcrumb, stack management |

**Key JavaScript Functions**:
- **`init()` (line ~12517)**: Initialize app, load all data, detect public/private mode
- **`renderList(items)` (~line 12750)**: Main rendering dispatcher - calls correct view renderer
- **`renderCardsView(items, viewType)` (~line 12800)**: Render cards with styles
- **`renderListView(items, viewType)` (~line 12900)**: Render list (simple/double/triple)
- **`renderTableView(items, viewType)` (~line 13000)**: Render table with column controls
- **`showDetails(item)` (~line 13050)**: Show detail view with item places layout
- **`navigateToLayer(index, parentItemName)` (~line 13200)**: Navigate layer hierarchy
- **`applyFiltersAndSorting()` (~line 13100)**: Apply filters and sorting to current view

**Device Detection** (lines 122-322 in `<head>`):
- **CRITICAL**: This runs FIRST, before page render
- Sets `mobile-device`, `tablet-device`, or `desktop-device` class on `<body>`
- Sets `portrait` or `landscape` class on `<body>`
- Sets `github-pages` class on `<html>` if on GitHub Pages

---

### View Types System

The app supports **4 view types** (Cards, List, Table, Diaporama), each configurable per layer:

#### 1. Cards View
- **Styles**: Squared (default), Rounded, Circle, Rectangle
- **CSS**: Lines 2201-3000 in index.html
- **JS Renderer**: `renderCardsView(items, viewType)` (~line 12800)
- **Configuration**: Layers sheet D2-D5 = "Cards", E2-E5 = style

#### 2. List View
- **Styles**: Simple (1 column), Double (2 columns), Triple (3 columns)
- **CSS**: Lines 3001-3500 in index.html
- **JS Renderer**: `renderListView(items, viewType)` (~line 12900)
- **Configuration**: Layers sheet D2-D5 = "List", E2-E5 = style

#### 3. Table View
- **Features**: Sortable columns, per-column filters, expandable rows
- **CSS**: Lines 3501-4500 in index.html
- **JS Renderer**: `renderTableView(items, viewType)` (~line 13000)
- **Configuration**: Layers sheet D2-D5 = "Table"
- **Visible Columns**: ColumnConfig column F (Show on Table)

#### 4. Diaporama View
- **Styles**: Horizontal, Vertical
- **CSS**: Lines 5001-5500 in index.html
- **JS Renderer**: `renderDiaporamaView()` (~line 13150)
- **Configuration**: Layers sheet D2-D5 = "Diaporama", E2-E5 = orientation

---

### Item Places System (Detail View Layout)

**Purpose**: Control where fields appear in the detail view

**Backend Maps** (Code.gs lines 6-47):
```javascript
ITEM_PLACE_MAP = {
  "Primary Identifier": "name",        // Main title
  "Main Image": "image",                // Primary image
  "SubId1": "category",                 // First subtitle
  "SubId2": "place",                    // Second subtitle
  "Top Corner": "topcorner",            // Badge in top-right
  "Long text Up": "longtextup",         // Full-width before grid
  "Detail Left": "detailleft",          // Left column
  "Detail Right": "detailright",        // Right column
  "Long text Down": "longtextdown",     // Full-width after grid
  "Bottom": "bottom"                    // Small gray text at bottom
}
```

**Frontend Rendering** (index.html ~line 13050 in `showDetails()`):
- Uses `getColumnsByPlace()` to organize fields
- Renders two-column grid layout
- Handles special roles (external links, read-only)

**Configuration**: ColumnConfig sheet column G (Item Place)

---

### Google Sheets Structure

**Required Sheets**:

| Sheet Name | Purpose | Key Cells | Lines in Code.gs |
|------------|---------|-----------|------------------|
| **Main** | Catalogue data (items) | All rows | 1151-1208 |
| **ColumnConfig** | Column definitions (8 columns) | All rows | 128-187 |
| **Settings** | App configuration | C2-C6, F2, I2, I5 | 471-547 |
| **Layers** | Layer config + data tables | B2:C4, D2:E5, F2:F5, H1+, L1+, Q1+ | 610-767 |
| **Users** | User access control | Email, Profile, Status, Name | 792-996 |

**ColumnConfig Structure** (8 columns):
1. Column Name (internal identifier)
2. Display Name (shown to users)
3. Type (text, date, number, url)
4. Show in Filter (boolean)
5. Show in Sort (boolean)
6. **Show on Table** (boolean) - controls Table view visibility
7. **Item Place** (Primary Identifier, Main Image, SubId1, SubId2, Top Corner, Long text Up, Detail Left, Detail Right, Long text Down, Bottom)
8. **Special Role** (Auto-filled User Mail, External Link, Formula, Formula/External Link)

**Layers Sheet Structure**:
- **B2:C4**: Layer definitions (Layer 1-3 names + Main Column Names)
- **D2:E5**: View types & styles (Layer 1-3 + Main items)
- **F2:F5**: Search visibility (Yes/blank)
- **H1+**: Layer 1 data table (headers row 1, data from row 2)
- **L1+**: Layer 2 data table
- **Q1+**: Layer 3 data table

---

### Responsive Design: 6 UI Displays

**Device Detection** (lines 122-322 in index.html `<head>`):
- Sets device class: `mobile-device`, `tablet-device`, or `desktop-device`
- Sets orientation class: `portrait` or `landscape`
- iPad desktop mode detection: `/macintosh/i` + touch points ≥ 1

**CSS Sections** (in index.html):

| UI Display | CSS Section | Lines | Selectors |
|------------|-------------|-------|-----------|
| **Desktop** | `DESKTOP DEVICE STYLES` | ~9501-10000 | `body.desktop-device` |
| **Tablet Portrait** | `TABLET PORTRAIT` | ~8001-8500 | `body.tablet-device.portrait` |
| **Tablet Landscape** | `LANDSCAPE MODE` (shared) | ~8501-9500 | `body.tablet-device.landscape` |
| **Mobile Portrait (Apps Script)** | `DEVICE-BASED MOBILE & TABLET STYLES` + `PORTRAIT MODE` | ~6501-7500 | `body.mobile-device.portrait` |
| **Mobile Portrait (GitHub Pages)** | `GITHUB PAGES MOBILE PORTRAIT` | ~7501-8000 | `html.github-pages body.mobile-device.portrait` |
| **Mobile Landscape** | `LANDSCAPE MODE` (shared) | ~8501-9500 | `body.mobile-device.landscape` |

**Key Differences**:
- **Mobile Portrait**: Main difference between GitHub Pages (50% scaled) and Apps Script (2x scaled)
- **Landscape Mode**: COMBINED section for both mobile and tablet (different selectors)
- **GitHub Pages Mobile Landscape**: Minor fixes only (padding, flex-direction)

---

### Authentication System

**Flow**:
1. User enters email → `requestOTP(email)` (Code.gs line 792)
2. Backend checks Users sheet for Active status
3. 6-digit code generated, stored in CacheService (10 min expiry)
4. Code emailed via MailApp
5. User enters code → `verifyOTP(email, code)` (Code.gs line 874)
6. Session token (UUID) created, stored in CacheService (90 days)
7. Token stored in browser localStorage
8. Token validated on each API call via `verifySession(token)` (Code.gs line 931)

**Public Mode**:
- Settings sheet I2 = "Public all in Viewer"
- Bypasses authentication, everyone is Viewer
- Implemented in `getInitialData()` (Code.gs line 1045)

**User Roles**:
- **Viewer**: Read-only access
- **Editor**: Add items, edit/delete own items
- **Creator**: Full access (manage columns, settings, all items)

---

### API Client (GitHub Pages Only)

**Files**:
- `api-config.js` (lines 17-40): Configuration - Apps Script URL, timeout, debug
- `api-client.js` (lines 1-276): Mimics `google.script.run` interface via fetch()

**Usage**:
- Replaces `google.script.run` with `api.script.run` (same interface)
- Uses GET requests with URL parameters to avoid CORS preflight
- Automatically initialized on GitHub Pages (detected via hostname)

**Detection** (index.html lines 63-121):
- Loads API scripts only if `window.location.hostname.includes('github.io')`
- Sets `window.apiClientReady` flag when loaded

---

### Key Workflows

#### Adding a New View Type
1. **Backend**: Add view type to `getSettings()` (Code.gs line 471)
2. **Frontend**: Add CSS section in index.html
3. **Frontend**: Create renderer function (e.g., `renderNewView()`)
4. **Frontend**: Add to `renderList()` dispatcher (~line 12750)
5. **Sheets**: Update Layers sheet D2:E5 dropdown validation

#### Adding a New Item Place
1. **Backend**: Add to `ITEM_PLACE_MAP` (Code.gs line 6)
2. **Backend**: Add to `ITEM_PLACE_DISPLAY` (Code.gs line 20)
3. **Frontend**: Update `showDetails()` layout logic (~line 13050)
4. **Sheets**: Update ColumnConfig sheet G column dropdown validation

#### Adding a New Special Role
1. **Backend**: Add to `SPECIAL_ROLE_MAP` (Code.gs line 34)
2. **Backend**: Add to `SPECIAL_ROLE_DISPLAY` (Code.gs line 42)
3. **Backend**: Handle in `addMainRow()` (Code.gs line 1246)
4. **Frontend**: Handle in form generation (`openAdd()`, ~line 12323)
5. **Sheets**: Update ColumnConfig sheet H column dropdown validation

#### Editing Responsive CSS
1. Identify target device/orientation (see 6 UI Displays table above)
2. Find correct CSS section by line number
3. Edit using device-specific selectors
4. Test on actual devices or browser DevTools device emulation

---

## index.html UI Structure Documentation

The `index.html` file has **6 UI displays** for different device/orientation combinations:

### 1. DESKTOP (Default code)
- Section: `"DESKTOP DEVICE STYLES"`
- Same for GitHub Pages and Apps Script

### 2. TABLET PORTRAIT ORIENTATION
- Section: `"TABLET PORTRAIT - Reduced sizes (75% of mobile portrait)"`
- Same for GitHub Pages and Apps Script

### 3. TABLET LANDSCAPE ORIENTATION
- Section: Combined in `"LANDSCAPE MODE"` with tablet-specific selectors
- Same for GitHub Pages and Apps Script

### 4. MOBILE PORTRAIT ORIENTATION - Apps Script
- Sections:
  - `"DEVICE-BASED MOBILE & TABLET STYLES"`
  - `"PORTRAIT MODE - Larger text, bigger buttons"`

### 5. MOBILE PORTRAIT ORIENTATION - GitHub Pages
- Section: `"GITHUB PAGES MOBILE PORTRAIT - 50% scaled down"`
- **This is the MAIN UI difference between GitHub Pages and Apps Script**

### 6. MOBILE LANDSCAPE ORIENTATION
- Section: Combined in `"LANDSCAPE MODE"` with mobile-specific selectors
- GitHub Pages has minor fixes (padding, flex-direction) in a separate area
- Essentially same UI for GitHub Pages and Apps Script

---

## Important Notes

### Combined Landscape Section
The `LANDSCAPE MODE` section is **COMBINED** for both Mobile and Tablet. They share one section with different CSS selectors:
- Mobile: `body.mobile-device.landscape`
- Tablet: `body.tablet-device.landscape`

### Detection System (Working Correctly)
The code includes detection for:
- **Device detection**: `mobile-device` / `tablet-device` / `desktop-device` classes
- **GitHub Pages detection**: `html.github-pages` class
- **Orientation detection**: `portrait` / `landscape` classes

---

## When Editing index.html

1. Identify which UI display(s) your changes affect
2. Find the correct section(s) using the section names above
3. Remember that landscape styles are combined for mobile and tablet
4. The only major GitHub Pages difference is Mobile Portrait - other modes have only minor fixes
