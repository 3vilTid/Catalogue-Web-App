# Claude Code Instructions for Catalogue-Web-App

## Important Workflow Rules

1. **Always create a Pull Request after editing code** - After making any code changes, always create a PR and provide the PR link to the user.

---

## Branch Strategy Guidelines

### Branch Types

#### 1. Specialized Branches (Major Features)
**Use for:** Significant feature work with multiple related changes

**Naming:** `claude/[feature-area]-modifications-[session-id]`

**Examples:**
- `claude/diaporama-ui-modifications-brZU3` - All Diaporama View UI work
- `claude/cards-ui-modifications-brZU3` - All Cards View work
- `claude/list-ui-modifications-brZU3` - All List View work
- `claude/table-ui-modifications-brZU3` - All Table View work
- `claude/auth-improvements-brZU3` - Authentication system overhaul
- `claude/mobile-responsive-fixes-brZU3` - Mobile responsive improvements

**Benefits:**
- Clean separation of features
- Independent PRs and merges
- Parallel work on multiple features in different discussions
- Focused code review
- Easy to track feature progress

**When to use:**
- Working on a complete view type (Cards, List, Table, Diaporama)
- Overhauling a system (Authentication, API, Layer Navigation)
- Multiple related changes across different sections
- Ongoing work that may span multiple sessions

---

#### 2. Quick-Fix Branches (Small Changes)
**Use for:** Isolated, small changes that don't need specialized tracking

**Naming:** `claude/fix-[description]-[session-id]` or `claude/quick-[description]-[session-id]`

**Examples:**
- `claude/fix-mobile-logo-bg-brZU3` - Fix mobile logo background color
- `claude/quick-button-color-brZU3` - Adjust button color
- `claude/tweak-header-spacing-brZU3` - Small spacing adjustment
- `claude/fix-typo-diaporama-brZU3` - Fix typo in Diaporama code

**Benefits:**
- Fast iteration
- No overhead of specialized branch management
- Quick merge and close
- Perfect for one-off changes

**When to use:**
- Single small change (one color, one padding value, one element)
- Bug fixes (typos, incorrect values, small logic errors)
- One-time adjustments that don't fit a feature area
- Cross-cutting changes that are still small in scope

---

#### 3. Documentation Branches
**Use for:** Documentation-only changes (no code modifications)

**Naming:** `claude/[doc-type]-[session-id]`

**Examples:**
- `claude/codebase-review-brZU3` - Codebase understanding and documentation improvements
- `claude/update-readme-brZU3` - Update README documentation

**When to use:**
- Updating CLAUDE.md, README.md, INSTALL-GUIDE.md
- Adding code comments for clarity
- Creating new documentation files

---

### Decision Guide: Which Branch Type?

```
┌─────────────────────────────────────────────────┐
│ How many changes are you making?                │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    One small              Multiple related
    change                 changes
        │                       │
        ▼                       ▼
  Quick-Fix Branch      Specialized Branch
```

**Ask yourself:**
- **Is this a complete feature area?** → Specialized Branch
- **Will I make multiple related changes?** → Specialized Branch
- **Do I want to work on this in parallel with other features?** → Specialized Branch
- **Is this a single small tweak?** → Quick-Fix Branch
- **Is this a one-off bug fix?** → Quick-Fix Branch
- **Am I only updating documentation?** → Documentation Branch

---

### Branch Specialization Enforcement

When working in a **specialized branch** discussion, the branch focus should be respected:

**✅ Correct Usage:**
- On `claude/diaporama-ui-modifications-brZU3` → Modifying Diaporama View CSS/JS
- On `claude/cards-ui-modifications-brZU3` → Modifying Cards View styles
- On `claude/fix-mobile-logo-bg-brZU3` → Fixing mobile logo background

**❌ Incorrect Usage:**
- On `claude/diaporama-ui-modifications-brZU3` → Trying to modify Cards View
- On `claude/cards-ui-modifications-brZU3` → Trying to change authentication

**What happens if there's a mismatch?**
1. Claude should recognize the mismatch
2. Stop before making changes
3. Inform you of the branch/work mismatch
4. Suggest the correct branch to use or creating a new one
5. Ask if you want to switch branches or start a new discussion

---

### Scope Boundaries for Specialized Branches

| Branch Type | Allowed Changes | Search Patterns |
|-------------|----------------|-----------------|
| **diaporama-ui-modifications** | Only Diaporama CSS/JS | `/* ========== 1. DIAPORAMA - DESKTOP`, `function renderDiaporamaView()` |
| **cards-ui-modifications** | Only Cards CSS/JS | `/* Cards -------`, `function renderCardsView(` |
| **list-ui-modifications** | Only List CSS/JS | `/* List View -------`, `function renderListView(` |
| **table-ui-modifications** | Only Table CSS/JS | `/* Table View -------`, `function renderTableView(` |
| **auth-improvements** | Only authentication code | `function requestOTP(`, `function verifyOTP(`, `function verifySession(` |
| **mobile-responsive-fixes** | Only mobile/tablet responsive CSS | `/* ========== DEVICE-BASED MOBILE`, `/* ========== TABLET PORTRAIT` |

---

### Currently Available Branches

**Active Specialized Branches:**
- `claude/codebase-review-brZU3` - Documentation only (current main discussion)
- `claude/diaporama-ui-modifications-brZU3` - Diaporama View UI modifications

**To Create More:**
Simply create a new branch when starting work on a new feature area. Use the naming conventions above.

---

### No Wrong Choice!

The branch system is **flexible** - use what makes sense for your work:
- **Overthinking it?** → Just use a quick-fix branch
- **Not sure if it's "big enough" for specialized?** → Start with quick-fix, can always create specialized later
- **Want maximum organization?** → Create specialized branches for each feature area
- **Want simplicity?** → Use quick-fix branches for everything

The goal is to **help you organize work**, not to create barriers. Choose the approach that fits your workflow!

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

**Key Sections** (search for these comment markers):

| Section Header | Search Pattern | Purpose |
|----------------|----------------|---------|
| Constants & Helpers | `/** Constants & Helpers **/` | Item place maps, special role maps, normalizers |
| Column Configuration | `/** Column Configuration **/` | `getColumnConfig()` - reads ColumnConfig sheet |
| Entry Points | `/** Entry Points **/` | `doGet()`, `doPost()`, API routing, CORS handling |
| Image Serving | Search: `function serveImage_()` | Serves Google Drive images as base64 |
| PWA Manifest | Search: `function serveManifest_()` | Dynamic manifest generation |
| UI Serving | Search: `function serveUi_()` | Serves index.html |
| Settings | Search: `function getSettings()` | App configuration, `getTabsConfig()` |
| Layer Configuration | Search: `function getLayerConfig()` | Layer definitions from B2:C4 |
| Layer Data | Search: `function getLayerData()` | Hierarchical navigation data |
| Authentication | Search: `function requestOTP(` | OTP system, session management |
| Data Access | Search: `function getInitialData(` | Load settings, layers, items, columns |
| Headers | Search: `function getHeaders()` | Get column headers |
| CRUD Operations | Search: `function addMainRow(` | Add/edit/delete with permissions |
| Test Function | Search: `function testEmailPermissions()` | Authorize email sending |

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

**File Structure** (search for these comment markers):

| Section | Search Pattern | Purpose |
|---------|----------------|---------|
| Header Comments | `<!-- 6 UI DISPLAYS -->` (top of file) | **CRITICAL**: 6 UI displays documentation |
| PWA Meta Tags | `<!-- PWA Meta Tags -->` | PWA configuration, viewport, theme color |
| API & GitHub Detection | `<!-- API Configuration and Client -->` | Load API client for GitHub Pages |
| Device Detection (HEAD) | `<!-- CRITICAL: Device Detection -->` | **CRITICAL**: Runs FIRST, sets device/orientation classes |
| CSS: Base Styles | After `<style>` tag | Colors, scrollbars, body, shell, header, filters |
| CSS: Cards View | `/* Cards -------` | Grid layout, card styles (squared, rounded, circle, rectangle) |
| CSS: List View | `/* List View -------` | Simple, double, triple column layouts |
| CSS: Table View | `/* Table View -------` | Data table, headers, column menus, expanded rows |
| CSS: Detail View | `/* Detail view -------` | Two-column layout, item places, navigation arrows |
| CSS: Diaporama View | `/* ========== 1. DIAPORAMA - DESKTOP` | Horizontal/vertical full-screen navigation (6 variants) |
| CSS: Modals & Forms | `/* Add/Edit & Columns modals -------` | Edit modal, confirmation, toasts |
| CSS: Loading Screen | `/* ========== LOADING SCREEN ==========` | Loading overlay styles |
| CSS: Responsive Design | `/* ========== RESPONSIVE DESIGN ==========` | Media queries for tablets |
| CSS: Mobile/Tablet Styles | `/* ========== DEVICE-BASED MOBILE & TABLET` | Device detection-based styles |
| CSS: Tablet Portrait | `/* ========== TABLET PORTRAIT` | 75% of mobile portrait scaling |
| CSS: Landscape Mode | `/* ========== LANDSCAPE MODE` | **COMBINED** mobile + tablet landscape |
| CSS: Portrait Mode | `/* ========== PORTRAIT MODE` | Larger text, bigger buttons |
| CSS: Bottom Bar | `/* ========== BOTTOM BAR FOR PORTRAIT` | Tab switcher positioning |
| CSS: Desktop Device | `/* ========== DESKTOP DEVICE STYLES` | Default desktop styles |
| CSS: PWA Install Banner | `/* ========== PWA INSTALL BANNER` | GitHub Pages install prompt |
| CSS: GitHub Pages Mobile | `/* ========== GITHUB PAGES MOBILE PORTRAIT` | 50% scaled down version |
| HTML: UI Structure | `<!-- Top header -->` | Header, filters, grid, detail, modals |
| JavaScript: Setup | After `<script>` tag | Global variables, session management |
| JavaScript: Init | `async function init()` | App initialization, load data |
| JavaScript: Rendering | `function renderList(` | Main rendering dispatcher |
| JavaScript: Detail View | `function showDetails(` | Detail view with item places |
| JavaScript: Filters & Sort | `function applyFiltersAndSorting()` | Filter and sort logic |
| JavaScript: Layer Navigation | `function navigateToLayer(` | Breadcrumb, layer stack |

**Key JavaScript Functions** (search for these):
- **`async function init()`**: Initialize app, load all data, detect public/private mode
- **`function renderList(items)`**: Main rendering dispatcher - calls correct view renderer
- **`function renderCardsView(items, viewType)`**: Render cards with styles
- **`function renderListView(items, viewType)`**: Render list (simple/double/triple)
- **`function renderTableView(items, viewType)`**: Render table with column controls
- **`function showDetails(item)`**: Show detail view with item places layout
- **`function navigateToLayer(index, parentItemName)`**: Navigate layer hierarchy
- **`function applyFiltersAndSorting()`**: Apply filters and sorting to current view

**Device Detection** (search: `<!-- CRITICAL: Device Detection -->`):
- **CRITICAL**: This runs FIRST in `<head>`, before page render
- Sets `mobile-device`, `tablet-device`, or `desktop-device` class on `<body>`
- Sets `portrait` or `landscape` class on `<body>`
- Sets `github-pages` class on `<html>` if on GitHub Pages

---

### View Types System

The app supports **4 view types** (Cards, List, Table, Diaporama), each configurable per layer:

#### 1. Cards View
- **Styles**: Squared (default), Rounded, Circle, Rectangle
- **CSS**: Search `/* Cards -------` in index.html
- **JS Renderer**: Search `function renderCardsView(items, viewType)`
- **Configuration**: Layers sheet D2-D5 = "Cards", E2-E5 = style

#### 2. List View
- **Styles**: Simple (1 column), Double (2 columns), Triple (3 columns)
- **CSS**: Search `/* List View -------` in index.html
- **JS Renderer**: Search `function renderListView(items, viewType)`
- **Configuration**: Layers sheet D2-D5 = "List", E2-E5 = style

#### 3. Table View
- **Features**: Sortable columns, per-column filters, expandable rows
- **CSS**: Search `/* Table View -------` in index.html
- **JS Renderer**: Search `function renderTableView(items, viewType)`
- **Configuration**: Layers sheet D2-D5 = "Table"
- **Visible Columns**: ColumnConfig column F (Show on Table)

#### 4. Diaporama View
- **Styles**: Horizontal, Vertical
- **CSS**: Search `/* ========== 1. DIAPORAMA - DESKTOP` in index.html (6 device-specific sections)
- **JS Renderer**: Search `function renderDiaporamaView()`
- **Configuration**: Layers sheet D2-D5 = "Diaporama", E2-E5 = orientation
- **Device Variants**: Desktop, Tablet Portrait, Tablet Landscape, Mobile Portrait (Apps Script), Mobile Portrait (GitHub Pages), Mobile Landscape

---

### Item Places System (Detail View Layout)

**Purpose**: Control where fields appear in the detail view

**Backend Maps** (Code.gs - Search `var ITEM_PLACE_MAP`):
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

**Frontend Rendering** (index.html - Search `function showDetails(`):
- Uses `getColumnsByPlace()` to organize fields
- Renders two-column grid layout
- Handles special roles (external links, read-only)

**Configuration**: ColumnConfig sheet column G (Item Place)

---

### Google Sheets Structure

**Required Sheets**:

| Sheet Name | Purpose | Key Cells | Code.gs Function |
|------------|---------|-----------|------------------|
| **Main** | Catalogue data (items) | All rows | Search `function getMainData(` |
| **ColumnConfig** | Column definitions (8 columns) | All rows | Search `function getColumnConfig(` |
| **Settings** | App configuration | C2-C6, F2, I2, I5 | Search `function getSettings()` |
| **Layers** | Layer config + data tables | B2:C4, D2:E5, F2:F5, H1+, L1+, Q1+ | Search `function getLayerConfig(` |
| **Users** | User access control | Email, Profile, Status, Name | Search `function requestOTP(` |

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

**Device Detection** (Search `<!-- CRITICAL: Device Detection -->` in index.html `<head>`):
- Sets device class: `mobile-device`, `tablet-device`, or `desktop-device`
- Sets orientation class: `portrait` or `landscape`
- iPad desktop mode detection: `/macintosh/i` + touch points ≥ 1

**CSS Sections** (search for these in index.html):

| UI Display | Search Pattern | Selectors |
|------------|----------------|-----------|
| **Desktop** | `/* ========== DESKTOP DEVICE STYLES` | `body.desktop-device` |
| **Tablet Portrait** | `/* ========== TABLET PORTRAIT` | `body.tablet-device.portrait` |
| **Tablet Landscape** | `/* ========== LANDSCAPE MODE` (shared) | `body.tablet-device.landscape` |
| **Mobile Portrait (Apps Script)** | `/* ========== DEVICE-BASED MOBILE` + `/* ========== PORTRAIT MODE` | `body.mobile-device.portrait` |
| **Mobile Portrait (GitHub Pages)** | `/* ========== GITHUB PAGES MOBILE PORTRAIT` | `html.github-pages body.mobile-device.portrait` |
| **Mobile Landscape** | `/* ========== LANDSCAPE MODE` (shared) | `body.mobile-device.landscape` |

**Key Differences**:
- **Mobile Portrait**: Main difference between GitHub Pages (50% scaled) and Apps Script (2x scaled)
- **Landscape Mode**: COMBINED section for both mobile and tablet (different selectors)
- **GitHub Pages Mobile Landscape**: Minor fixes only (padding, flex-direction)

---

### Authentication System

**Flow**:
1. User enters email → `requestOTP(email)` (Code.gs - Search `function requestOTP(`)
2. Backend checks Users sheet for Active status
3. 6-digit code generated, stored in CacheService (10 min expiry)
4. Code emailed via MailApp
5. User enters code → `verifyOTP(email, code)` (Code.gs - Search `function verifyOTP(`)
6. Session token (UUID) created, stored in CacheService (90 days)
7. Token stored in browser localStorage
8. Token validated on each API call via `verifySession(token)` (Code.gs - Search `function verifySession(`)

**Public Mode**:
- Settings sheet I2 = "Public all in Viewer"
- Bypasses authentication, everyone is Viewer
- Implemented in `getInitialData()` (Code.gs - Search `function getInitialData(`)

**User Roles**:
- **Viewer**: Read-only access
- **Editor**: Add items, edit/delete own items
- **Creator**: Full access (manage columns, settings, all items)

---

### API Client (GitHub Pages Only)

**Files**:
- `api-config.js`: Configuration - Apps Script URL, timeout, debug (Search `APPS_SCRIPT_URL:`)
- `api-client.js`: Mimics `google.script.run` interface via fetch() (Search `window.api =`)

**Usage**:
- Replaces `google.script.run` with `api.script.run` (same interface)
- Uses GET requests with URL parameters to avoid CORS preflight
- Automatically initialized on GitHub Pages (detected via hostname)

**Detection** (index.html - Search `<!-- API Configuration and Client -->`):
- Loads API scripts only if `window.location.hostname.includes('github.io')`
- Sets `window.apiClientReady` flag when loaded

---

### Key Workflows

#### Adding a New View Type
1. **Backend**: Add view type to `getSettings()` (Code.gs - Search `function getSettings()`)
2. **Frontend**: Add CSS section in index.html (after existing view type sections)
3. **Frontend**: Create renderer function (e.g., `renderNewView()`)
4. **Frontend**: Add to `renderList()` dispatcher (index.html - Search `function renderList(`)
5. **Sheets**: Update Layers sheet D2:E5 dropdown validation

#### Adding a New Item Place
1. **Backend**: Add to `ITEM_PLACE_MAP` (Code.gs - Search `var ITEM_PLACE_MAP`)
2. **Backend**: Add to `ITEM_PLACE_DISPLAY` (Code.gs - Search `var ITEM_PLACE_DISPLAY`)
3. **Frontend**: Update `showDetails()` layout logic (index.html - Search `function showDetails(`)
4. **Sheets**: Update ColumnConfig sheet G column dropdown validation

#### Adding a New Special Role
1. **Backend**: Add to `SPECIAL_ROLE_MAP` (Code.gs - Search `var SPECIAL_ROLE_MAP`)
2. **Backend**: Add to `SPECIAL_ROLE_DISPLAY` (Code.gs - Search `var SPECIAL_ROLE_DISPLAY`)
3. **Backend**: Handle in `addMainRow()` (Code.gs - Search `function addMainRow(`)
4. **Frontend**: Handle in form generation (index.html - Search `function openAdd(`)
5. **Sheets**: Update ColumnConfig sheet H column dropdown validation

#### Editing Responsive CSS
1. Identify target device/orientation (see 6 UI Displays table above)
2. Find correct CSS section using search patterns (e.g., `/* ========== DESKTOP DEVICE STYLES`)
3. Edit using device-specific selectors (e.g., `body.mobile-device.portrait`)
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
