# Catalogue Web App

A dynamic, multi-layered catalogue management system built with Google Apps Script. Features hierarchical navigation, multiple view types (Cards/List/Table), email authentication, role-based access control, flexible column configuration with visual layout control, responsive mobile/tablet support, and optimized image handling.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [File Structure](#file-structure)
- [Technical Details](#technical-details)
- [Responsive Design](#responsive-design)
- [Troubleshooting](#troubleshooting)
- [Browser Support](#browser-support)

---

## Features

### Hierarchical Layer Navigation
- **Multi-Level Organization**: Up to 3 configurable layers for organizing content
  - Example: Layer 1 (Categories) → Layer 2 (Subcategories) → Layer 3 (Items) → Main Items (Details)
  - Each layer can have its own view type and style
  - Flexible filtering: child layers show only items belonging to selected parent
- **Breadcrumb Navigation**: Visual navigation trail showing current position
- **Layer Data Tables**: Each layer can have its own data table in the Layers sheet
- **Configurable per Layer**: Each layer can use different view types and styles

### Multiple View Types
- **Cards View**: Visual card-based grid layout (default)
  - Large images with item information
  - Responsive grid that adapts to screen size
  - Style options: Squared, Rounded, etc.
- **List View**: Compact list layout
  - Simple: Single column list
  - Double: Two-column layout
  - Triple: Three-column layout
  - Efficient for browsing many items
- **Table View**: Spreadsheet-style data table
  - Sortable columns
  - Filterable data
  - Configurable columns via "Show on Table" setting
  - Ideal for data-heavy catalogues
- **Per-Layer Configuration**: Each layer and main items can use different view types
  - Set in Layers sheet: Layer 1 (D2), Layer 2 (D3), Layer 3 (D4), Main (D5)
  - Set styles in Layers sheet: Layer 1 (E2), Layer 2 (E3), Layer 3 (E4), Main (E5)

### Email-Based Authentication
- **OTP Verification**: Secure email-based one-time password authentication
- **Session Management**: 90-day persistent sessions with automatic token validation
- **No Password Required**: Simple, secure access via email verification codes
- **User Status Management**: Active/Inactive status control in Users sheet

### Public/Private Access Modes
- **Private with Profiles**: Full authentication required with email OTP
  - User-specific permissions based on profile (Creator/Editor/Viewer)
  - Complete access control via Users sheet
- **Public all in Viewer**: Open access for everyone as Viewer role
  - No login required - instant access to catalogue
  - All users automatically set as "Viewer" (read-only)
  - Clean interface: logout button and user email hidden
  - Perfect for public-facing catalogues or demos
- **Easy Toggle**: Switch modes via Settings sheet (cell I2)

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
- **Formula/External Link (Read-only)**: Combined role - formula that displays as clickable link

**Column Configuration** (8 columns):
1. Column Name
2. Display Name
3. Type (text, date, number, url)
4. Show in Filter (boolean)
5. Show in Sort (boolean)
6. Show on Table (boolean) - Controls visibility in Table view
7. Item Place (dropdown)
8. Special Role (dropdown)

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

### Responsive Design
- **Device Detection**: Automatic detection of Mobile, Tablet, and Desktop devices
  - iPad detection works even in "desktop mode"
  - Touch-point detection for accurate device classification
- **Orientation Support**: Portrait and landscape modes with optimized layouts
  - Automatic orientation detection and layout adjustment
  - Different UI scaling and spacing for each orientation
- **Touch Gestures** (Mobile/Tablet):
  - Swipe left/right to navigate between items in detail view
  - Pull to refresh to reload data
  - Pinch to zoom on images
  - Long press for context menus
- **Responsive UI Elements**:
  - Larger touch targets on mobile devices (2x size in portrait)
  - Adaptive font sizes and spacing
  - Optimized button placement for one-handed use
  - Hidden navigation arrows on mobile (use swipe instead)

### User Interface

**Multi-View Display**:
- **Cards**: Visual card-based grid with lazy-loaded images
  - Responsive grid layout adapts to screen size
  - SubId1 and SubId2 displayed under item name
  - Multiple style options (Squared, Rounded, etc.)
- **List**: Compact list layouts (Simple/Double/Triple column)
  - Efficient browsing for many items
  - Minimal vertical space usage
- **Table**: Spreadsheet-style data table
  - Column headers with sort controls
  - Configurable visible columns
  - Filter and search capabilities

**Detail View**:
- Two-column layout with configurable field placement
- Top corner badge display
- Long text sections (before and after grid)
- Bottom metadata section
- Progressive image loading with blur placeholder
- Clickable external links
- **Navigation Arrows**: Left/right arrows to navigate between items (hidden on mobile - use swipe)
- Clean, minimal design
- **Force Landscape Layout**: Table detail view always uses landscape-style layout (even in portrait mode)

**Navigation & Controls**:
- **Breadcrumb Navigation**: Shows current layer path (Layer 1 → Layer 2 → Main)
- Filter and Sort buttons (hidden in detail view and Table view)
- Back to List button (visible in detail view)
- Sheet, Columns, and Add Item buttons (right-aligned, role-based visibility)
- Styled scrollbars that blend with design
- **Logo Support**: Custom logo display in header (optional)

**Dynamic Filters & Sorting**:
- Filter by any column marked as filterable
- Sort by any column marked as sortable (ascending/descending)
- Client-side filtering and sorting (instant results)
- Table view has per-column filter/sort controls

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
│ Main Sheet          │  ← Catalogue data (main items)
├─────────────────────┤
│ Layers              │  ← Layer configuration + layer data tables
│                     │    • B2:C4 = Layer definitions
│                     │    • D2:E5 = View types & styles
│                     │    • H1+ = Layer 1 data table
│                     │    • L1+ = Layer 2 data table
│                     │    • Q1+ = Layer 3 data table
├─────────────────────┤
│ ColumnConfig        │  ← Column definitions (8 columns)
│                     │    • Includes "Show on Table" column
├─────────────────────┤
│ Settings            │  ← App configuration
│                     │    • C2-C6 = App name, catalogue name, URLs, logo
│                     │    • F2 = Date adjustment
│                     │    • I2 = App mode (Public/Private)
│                     │    • I5 = Background image URL
├─────────────────────┤
│ Users               │  ← Access control + user status
│                     │    • Email, Profile, Status, Name
└─────────────────────┘
```

**Apps Script (Backend)** - `Code.gs`
- Email OTP authentication system with 90-day sessions
- Session management and validation (CacheService)
- User status management (Active/Inactive)
- Access control enforcement
- CRUD operations for items
- **Layer configuration management** (getLayerConfig, getLayerData)
- Column configuration management (8 columns including Show on Table)
- Image serving (Drive file proxy)
- Settings management (app mode, date adjustment, logo, background)
- Special role handling (addedby, externallink, formula, formulaexternallink)

**HTML/CSS/JS (Frontend)** - `index.html` (8000+ lines)
- Single-page application with multi-view support
- **Device Detection**: Automatic mobile/tablet/desktop detection at page load
- **Responsive Layouts**: Portrait/landscape orientation support
- **Layer Navigation**: Hierarchical browsing with breadcrumbs
- **Multiple View Types**: Cards, List (Simple/Double/Triple), Table
- **Touch Gesture Support**: Swipe, pinch, pull-to-refresh
- Email login interface
- Dynamic form generation based on Item Place and Special Role
- Two-column detail view layout with navigation arrows
- IndexedDB image cache with lazy loading and blur placeholders
- Filter and sort logic (global and per-column in Table view)
- View-specific button visibility management
- Customizable styling (logo, background image, card styles)

### Data Flow

```
User visits app URL
    ↓
Device Detection (Mobile/Tablet/Desktop)
    ↓
Check App Mode (Public/Private)
    ↓
[If Private] Enter email address → Receive OTP → Enter code → Session token created
[If Public] Auto-login as Viewer
    ↓
Load initial data:
  • Settings (app name, logo, background, date adjustment, view types)
  • Layer configuration (Layer 1-3 definitions)
  • Layer data (data for each configured layer)
  • Main data (items with date adjustment)
  • Column configuration (8 columns)
    ↓
Render home view with configured layers (or main items if no layers)
    ↓
User navigates:
  • Click layer item → Navigate to next layer → Breadcrumb updates
  • Navigate through layers until reaching main items
  • Click main item → Show detail view with arrows/swipe navigation
    ↓
IndexedDB cache for images (progressive loading with blur)
    ↓
Render UI based on:
  • Current layer view type (Cards/List/Table)
  • Current layer style (Squared/Rounded/etc.)
  • Device type (Mobile/Tablet/Desktop)
  • Orientation (Portrait/Landscape)
  • Item Places (for detail view)
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

#### Layers Sheet (Optional - for hierarchical navigation)
**Layer Configuration (B2:C4):**
```
Layer Name | Main Column Name
-----------|------------------
Layer 1    | Category
Layer 2    | Subcategory
Layer 3    | (blank or another column)
```

**View Types & Styles (D2:E5):**
```
View Type | Style
----------|--------
Cards     | Squared    ← Layer 1 (D2:E2)
List      | Simple     ← Layer 2 (D3:E3)
Table     | -          ← Layer 3 (D4:E4)
Cards     | Rounded    ← Main Items (D5:E5)
```

**Layer Data Tables:**
- **Layer 1 Data**: Starts at H1 (Column H onwards)
  - Headers in row 1, data from row 2
  - Example: Category Name, Category Image, etc.
- **Layer 2 Data**: Starts at L1 (Column L onwards)
  - Headers in row 1, data from row 2
- **Layer 3 Data**: Starts at Q1 (Column Q onwards)
  - Headers in row 1, data from row 2

**Note:** If you don't need layers, you can skip creating this sheet and items will display directly.

#### ColumnConfig Sheet
**Headers:** `Column Name | Display Name | Type | Show in Filter | Show in Sort | Show on Table | Item Place | Special Role`

Example configuration:
```
Column Name   | Display Name | Type | Filter | Sort  | Table | Item Place        | Special Role
--------------|--------------|------|--------|-------|-------|-------------------|------------------
Name          | Name         | text | FALSE  | TRUE  | TRUE  | Primary Identifier|
Description   | Description  | text | FALSE  | FALSE | FALSE | Long text Up      |
Picture url   | Picture      | text | FALSE  | FALSE | FALSE | Main Image        |
Category      | Category     | text | TRUE   | TRUE  | TRUE  | SubId1            |
Place         | Location     | text | TRUE   | TRUE  | TRUE  | SubId2            |
Date          | Date         | date | FALSE  | TRUE  | TRUE  | Top Corner        |
ExternalLink  | Link         | text | FALSE  | FALSE | TRUE  | Detail Left       | External Link
Info1         | Info 1       | text | FALSE  | FALSE | TRUE  | Detail Left       |
Info2         | Info 2       | text | FALSE  | FALSE | TRUE  | Detail Right      |
Added By      | Added By     | text | FALSE  | FALSE | FALSE | Bottom            | Auto-filled User Mail
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
- `Formula/External Link (Read-only)`: Formula that displays as clickable link (excluded from forms)
- Leave empty for regular columns

#### Settings Sheet
Configure in columns C, F, and I:

| Cell | Setting | Example | Description |
|------|---------|---------|-------------|
| C2 | App Name | "Catalogue" | Browser title |
| C3 | Catalogue Name | "My Underwater Pics" | Header title (can be renamed from UI) |
| C4 | Sheet URL | (auto-filled) | Link to this sheet |
| C5 | Deployment URL | "https://script.google.com/.../exec" | Web app deployment URL for image loading |
| C6 | Logo URL | "https://drive.google.com/..." | Optional logo image (Google Drive URL) |
| F2 | Date Adjustment | 1 | Days to add to all dates (0 = no adjustment, 1 = +1 day) |
| I2 | App Mode | "Public all in Viewer" or "Private with Profiles" | Access mode setting |
| I5 | Background Image URL | "https://drive.google.com/..." | Optional background image (Google Drive URL) |

#### Users Sheet
**Headers:** `Email | Profile | Status | Name`

Example:
```
Email                | Profile | Status   | Name
---------------------|---------|----------|------------
admin@example.com    | Creator | Active   | Admin User
editor@example.com   | Editor  | Active   | Editor User
viewer@example.com   | Viewer  | Active   | Viewer User
blocked@example.com  | Viewer  | Inactive | Blocked User
```

**Important:**
- Only emails with "Active" status can access the app
- Set Status to "Inactive" to block access without deleting the user
- In "Public all in Viewer" mode, authentication is bypassed

**User Profiles:**
- **Creator**: Full access - manage columns, settings, edit all items, access Google Sheet
- **Editor**: Add items, edit/delete own items only
- **Viewer**: Read-only access to all items

#### OTP Storage (Cache-based)
OTP codes are stored in CacheService (in-memory, temporary storage).
- **No sheet required** - OTP codes expire after 10 minutes
- **Session tokens** are also stored in CacheService for 90 days
- **Automatic cleanup** - expired codes are automatically removed

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

#### Login (Private Mode Only)
1. Enter your email address
2. Click "Send Verification Code"
3. Check your email for the 6-digit code
4. Enter the code within 10 minutes
5. You're logged in for 90 days (or until logout)

**Note:** In "Public all in Viewer" mode, no login is required.

#### Navigate Through Layers
If layers are configured:
1. **Home Screen**: Shows Layer 1 items (e.g., Categories)
2. **Click Layer 1 item**: Navigate to Layer 2 items (e.g., Subcategories)
3. **Click Layer 2 item**: Navigate to Layer 3 or Main items
4. **Breadcrumb Trail**: Shows your path (e.g., Home → Category → Subcategory)
5. **Click breadcrumb**: Jump back to any previous layer

#### Browse & View
- **Multiple View Types**:
  - **Cards View**: Visual grid with images (swipeable on mobile)
  - **List View**: Compact text list (Simple/Double/Triple column)
  - **Table View**: Spreadsheet-style with column headers
- **View Items**: Click any item card/row to see full details
- **Detail View Navigation**:
  - **Desktop**: Use left/right arrow buttons to navigate between items
  - **Mobile/Tablet**: Swipe left/right to navigate between items
  - Click "Back to List" button to return to previous view
- **Images**: Click image in detail view for fullscreen

#### Touch Gestures (Mobile/Tablet)
- **Swipe Left/Right**: Navigate between items in detail view
- **Pull to Refresh**: Reload data (pull down from top)
- **Pinch to Zoom**: Zoom images in fullscreen view
- **Long Press**: Access context menus (where available)

#### Filter & Sort
- **Cards/List View**:
  - Click 🔍 Filter, select criteria, click Apply
  - Click ↕️ Sort, choose field and direction
- **Table View**:
  - Use column headers to sort (click column name)
  - Use filter controls in column headers
- **Note**: Filter and Sort buttons are hidden in detail view and Table view

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

#### Configure Layers
1. Open the **Layers** sheet in Google Sheets
2. **Set up layer definitions (B2:C4)**:
   - B2: "Layer 1", C2: Column name to use (e.g., "Category")
   - B3: "Layer 2", C3: Column name to use (e.g., "Subcategory")
   - B4: "Layer 3", C4: Column name to use (optional)
3. **Set view types and styles (D2:E5)**:
   - D2:E2 = Layer 1 view and style
   - D3:E3 = Layer 2 view and style
   - D4:E4 = Layer 3 view and style
   - D5:E5 = Main items view and style
   - View options: Cards, List, Table
   - Style options: Squared, Rounded, etc.
4. **Create layer data tables**:
   - Layer 1 data: Start at H1 (headers in row 1, data from row 2)
   - Layer 2 data: Start at L1
   - Layer 3 data: Start at Q1
5. **Refresh the app** to see layer navigation

#### Manage Columns
1. Click **⚙ Columns** button
2. **Add Column**:
   - Click "➕ Add Column"
   - Set Column Name, Display Name, Type
   - Set Show on Table (for Table view visibility)
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

#### Customize Appearance
- **Logo**: Set C6 in Settings sheet to Google Drive image URL
- **Background**: Set I5 in Settings sheet to Google Drive image URL
- **App Mode**: Set I2 to "Public all in Viewer" or "Private with Profiles"

#### Edit All Items
- Can edit/delete any item, regardless of creator
- Full access to all data

#### Adjust Dates
- Open Settings sheet
- Set cell F2 to number of days to adjust
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
| `doGet(e)` | Entry point - serves UI or images based on parameters |
| `requestOTP(email)` | Send verification code via email (checks user status) |
| `verifyOTP(email, code)` | Verify OTP and create 90-day session |
| `verifySession(token)` | Validate session token from CacheService |
| `logout(token)` | Invalidate session token |
| `getInitialData(token)` | Load all data (settings, layers, items, columns) |
| `getSettings()` | Get app settings (app mode, date adjustment, logo, background, view types) |
| `getLayerConfig()` | Get layer configuration from Layers sheet (B2:C4) |
| `getLayerData(layerName)` | Get data for specific layer from hardcoded positions |
| `getColumnConfig()` | Get column configuration (8 columns) with Item Places and Special Roles |
| `getMainData()` | Get all items with date adjustment applied |
| `addMainRow(obj, token)` | Add new item (auto-fills Special Role columns, requires Editor/Creator) |
| `editItem(name, updates, token)` | Edit existing item (permission-based) |
| `deleteItem(name, token)` | Delete item (permission-based) |
| `serveImage_(fileId)` | Serve Google Drive images as base64 JSON |
| `getUserByEmail_(email)` | Get user info including status (Active/Inactive) |

### Key Components in index.html

| Component | Purpose |
|-----------|---------|
| **Device Detection** | |
| `(head script)` | Detects mobile/tablet/desktop and sets body class before render |
| `updateOrientation()` | Detects and applies portrait/landscape orientation |
| **Authentication** | |
| `showLoginScreen()` | Display email login form (private mode only) |
| `sendVerificationCode()` | Request OTP via email |
| `verifyCode()` | Submit OTP for verification |
| `init()` | Initialize app - load settings, layers, items, columns |
| **Layer Navigation** | |
| `navigateToLayer()` | Navigate to specific layer with filtering |
| `navigateToLayerItem()` | Navigate to child layer or main items |
| `renderBreadcrumb()` | Render breadcrumb navigation trail |
| `backToList()` | Navigate back in layer stack |
| **View Rendering** | |
| `renderCurrentView()` | Render current layer/items with configured view type |
| `renderCardsView()` | Render cards grid with style support |
| `renderListView()` | Render list view (Simple/Double/Triple) |
| `renderTableView()` | Render table view with column controls |
| `showDetails(item)` | Show item details with Item Place layout |
| `nextItem()` / `prevItem()` | Navigate between items (arrows/swipe) |
| **Filtering & Sorting** | |
| `renderFilters()` | Generate filter UI |
| `applyFiltersAndSorting()` | Apply filters and sorting |
| `filterItemsByParent()` | Filter child layer items by parent selection |
| **Image Handling** | |
| `imageCacheDB` | IndexedDB cache manager |
| `loadImageViaProxy()` | Lazy load images with progressive blur placeholders |
| **Utilities** | |
| `formatDate()` | Format dates as dd/mm/yyyy (locale-aware) |
| `openColumnManager()` | Open column management modal |
| `detectDevice()` | User agent and touch detection |

---

## Technical Details

### Authentication System

**OTP Flow:**
1. User enters email
2. Backend checks if email exists in Users sheet with "Active" status
3. Backend generates 6-digit code
4. Code stored in CacheService (in-memory) with 10-minute expiration
5. Code emailed to user via MailApp
6. User enters code within 10 minutes
7. Backend validates code from CacheService
8. Session token (UUID) created and returned
9. Token stored in browser localStorage
10. Session stored in CacheService for 90 days
11. Token validated on each backend call

**Session Management:**
- Tokens are UUIDs stored in browser localStorage
- Backend validates token on every call via CacheService
- Sessions expire after 90 days (7,776,000 seconds)
- Users can logout to invalidate session immediately
- No password required - email OTP only

**User Status:**
- Active users can request OTP and login
- Inactive users are blocked from accessing the app
- Status change takes effect immediately

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
  "Formula (Read-only)": "formula",
  "Formula/External Link (Read-only)": "formulaexternallink"
}
```

### Layer System

**Backend Configuration (Code.gs):**
```javascript
function getLayerConfig() {
  // Hardcoded positions in Layers sheet: B2:C4
  // Returns: [{layerName: "Layer 1", mainColumnName: "Category"}, ...]
}

function getLayerData(layerName) {
  // Hardcoded table positions:
  // Layer 1: Column H (8), Layer 2: Column L (12), Layer 3: Column Q (17)
  // Returns array of items for that layer
}
```

**Frontend Navigation:**
- `navigationStack`: Array tracking navigation history
- `currentLayerIndex`: Current position in layer hierarchy (-1 = home)
- **Breadcrumb rendering**: Shows path through layers
- **Filtering**: Child layers show only items matching parent selection
- **View switching**: Each layer can have different view type/style

**Layer Data Flow:**
1. App loads layer configuration from Layers sheet (B2:C4)
2. App loads data for each configured layer from data tables (H1+, L1+, Q1+)
3. User clicks Layer 1 item → Navigate to Layer 2, filter by parent
4. User clicks Layer 2 item → Navigate to Layer 3 or Main items, filter by parent
5. Breadcrumb shows full navigation path

### Device Detection & Responsive Design

**Detection Logic (runs in `<head>` before page render):**
```javascript
// User agent detection
const hasTabletUA = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i.test(ua);

// iPad desktop mode detection (critical!)
const isiPadDesktopMode = /macintosh/i.test(ua) && touchPoints >= 1;

const isTablet = hasTabletUA || isiPadDesktopMode;
const isMobile = /android.*mobile|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

// Set device class immediately
const deviceClass = isTablet ? 'tablet-device' : (isMobile ? 'mobile-device' : 'desktop-device');
document.body.className = deviceClass;
```

**Orientation Detection:**
```javascript
const isLandscape = window.innerWidth > window.innerHeight;
document.body.classList.add(isLandscape ? 'landscape' : 'portrait');
```

**CSS Classes Applied:**
- Device: `mobile-device`, `tablet-device`, or `desktop-device`
- Orientation: `portrait` or `landscape`
- Combined: e.g., `body.mobile-device.portrait`

**Responsive Features:**
- Font sizes scale up 2x in mobile portrait mode
- Touch targets enlarged on mobile (buttons, links)
- Navigation arrows hidden on mobile (use swipe instead)
- Breadcrumbs sized 2x larger in mobile portrait
- Table view forces landscape-style layout even in portrait

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
2. Check ColumnConfig sheet has exactly 8 columns:
   - Column Name | Display Name | Type | Show in Filter | Show in Sort | Show on Table | Item Place | Special Role
3. Check Apps Script → Executions for error logs
4. Ensure Main sheet has matching column headers

### Dates Are Wrong

**Problem:** Dates showing 1 day off

**Solutions:**
1. Open Settings sheet
2. Set cell **F2** to `1` (to add 1 day)
3. Or set to `-1` (to subtract 1 day)
4. Adjust until dates display correctly
5. This compensates for timezone differences

### Layers Not Working

**Problem:** Layers not appearing or navigation not working

**Solutions:**
1. **Check Layers sheet exists** in your spreadsheet
2. **Verify layer configuration (B2:C4)**:
   - B2: "Layer 1", C2: Column name (must match a column in Main sheet)
   - B3: "Layer 2", C3: Column name (must match a column in Main sheet)
   - B4: "Layer 3", C4: Column name (optional)
3. **Check view types (D2:E5)**:
   - D2: View type for Layer 1 (Cards, List, or Table)
   - E2: Style for Layer 1 (Squared, Rounded, etc.)
4. **Verify layer data tables exist**:
   - Layer 1 data should start at column H (H1 = headers)
   - Layer 2 data should start at column L (L1 = headers)
   - Layer 3 data should start at column Q (Q1 = headers)
5. **Check data matches**:
   - Layer data values must match Main sheet column values exactly
6. **Refresh the app** after making changes

### View Not Displaying Correctly

**Problem:** Table/List/Cards view not showing properly

**Solutions:**
1. Check Layers sheet D2:E5 for view type settings
2. Verify view type is spelled correctly (Cards, List, or Table)
3. For Table view, check ColumnConfig "Show on Table" column (6th column)
4. Clear browser cache and reload
5. Check browser console for errors (F12)

### Layout Issues

**Problem:** Fields not appearing in correct positions

**Solutions:**
1. Check Item Place values in ColumnConfig
2. Verify only ONE column has "Primary Identifier"
3. Verify only ONE column has "Main Image"
4. Check spelling of Item Place values (case-sensitive)
5. Refresh page after changing ColumnConfig

### Mobile/Tablet Issues

**Problem:** UI looks wrong on mobile or tablet

**Solutions:**
1. **Check device detection**: Open browser console (F12), look for device class logs
2. **iPad desktop mode**: If iPad is detected as desktop, it should still work via touch detection
3. **Orientation issues**: Rotate device to trigger orientation update
4. **Touch gestures not working**: Ensure you're on a touch-enabled device
5. **UI too small/large**: Check if portrait/landscape classes are applied correctly
6. **Clear cache**: Hard refresh with Ctrl+Shift+R or Cmd+Shift+R

**Problem:** Swipe navigation not working

**Solutions:**
1. Ensure you're in detail view (not grid/list/table view)
2. Swipe gestures only work on mobile/tablet devices
3. On desktop, use arrow buttons instead
4. Check browser console for JavaScript errors

---

## Responsive Design

### Device Classes
The app automatically detects your device type and applies appropriate styling:

- **Mobile Device**: Phones (iPhone, Android phones, etc.)
  - Larger touch targets (2x in portrait)
  - Swipe navigation enabled
  - Navigation arrows hidden
  - Optimized for one-handed use

- **Tablet Device**: Tablets (iPad, Android tablets, etc.)
  - Medium touch targets
  - Swipe navigation enabled
  - Balanced layout for larger screen

- **Desktop Device**: Computers and laptops
  - Standard touch targets
  - Arrow button navigation
  - Full-featured layout

### Orientation Support
- **Portrait**: Vertical orientation (height > width)
  - Larger UI elements
  - Single-column layouts
  - 2x font sizes on mobile

- **Landscape**: Horizontal orientation (width > height)
  - Compact UI elements
  - Multi-column layouts when appropriate
  - Standard font sizes

### Forced Layouts
- **Table Detail View**: Always uses landscape-style layout, even in portrait mode
- This ensures readability of two-column detail layout on all devices

### UI Display Sections in index.html

The `index.html` file has **6 UI displays** for different device/orientation combinations. Each has dedicated CSS sections:

| UI Display | CSS Section Name | GitHub/Apps Script |
|------------|------------------|-------------------|
| **Desktop** | `DESKTOP DEVICE STYLES` | Same |
| **Tablet Portrait** | `TABLET PORTRAIT - Reduced sizes (75% of mobile portrait)` | Same |
| **Tablet Landscape** | Combined in `LANDSCAPE MODE` (tablet-specific selectors) | Same |
| **Mobile Portrait (Apps Script)** | `DEVICE-BASED MOBILE & TABLET STYLES` + `PORTRAIT MODE - Larger text, bigger buttons` | Apps Script only |
| **Mobile Portrait (GitHub Pages)** | `GITHUB PAGES MOBILE PORTRAIT - 50% scaled down` | GitHub Pages only |
| **Mobile Landscape** | Combined in `LANDSCAPE MODE` (mobile-specific selectors) | Same (minor GitHub fixes) |

**Important Notes:**
- The `LANDSCAPE MODE` section is **combined** for both Mobile and Tablet with different CSS selectors:
  - Mobile: `body.mobile-device.landscape`
  - Tablet: `body.tablet-device.landscape`
- The **main UI difference** between GitHub Pages and Apps Script is **Mobile Portrait only**
- GitHub Pages Mobile Landscape has minor fixes (padding, flex-direction) but essentially same UI

**Detection System (in `<head>`):**
- Device detection: Sets `mobile-device` / `tablet-device` / `desktop-device` class
- GitHub Pages detection: Sets `html.github-pages` class
- Orientation detection: Sets `portrait` / `landscape` class

---

## Browser Support

**Recommended:**
- **Mobile**: Chrome (Android), Safari (iOS), Samsung Internet
- **Tablet**: Chrome (Android tablets), Safari (iPad)
- **Desktop**: Chrome, Safari, Edge, Firefox

**Requirements:**
- JavaScript enabled
- Cookies enabled (for session storage)
- LocalStorage enabled (for session tokens)
- IndexedDB support (optional, for image caching)
- Touch support (for mobile/tablet gestures)

**Touch Gestures:**
- Swipe navigation works on all touch-enabled devices
- Desktop users can use mouse to simulate touch (limited support)
- Best experience on native mobile/tablet browsers

**Known Issues:**
- Older browsers (IE11, etc.) not supported
- Private/Incognito mode works but session is lost on close
- Date format depends on browser locale settings
- Some desktop browsers may not detect iPad in desktop mode (but touch detection provides fallback)

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

### Current Version (2025-12-18)
**Major Features:**
- ✅ **Hierarchical Layer System** (up to 3 layers)
  - Layer configuration in Layers sheet (B2:C4)
  - Per-layer data tables (H1+, L1+, Q1+)
  - Breadcrumb navigation
  - Parent-child filtering
- ✅ **Multiple View Types** per layer and main items
  - Cards View (with multiple styles: Squared, Rounded, etc.)
  - List View (Simple, Double, Triple column layouts)
  - Table View (spreadsheet-style with column controls)
  - View types configurable in Layers sheet (D2:E5)
- ✅ **Responsive Mobile/Tablet Support**
  - Automatic device detection (mobile/tablet/desktop)
  - Portrait/landscape orientation support
  - Touch gesture support (swipe, pinch, pull-to-refresh, long press)
  - iPad desktop mode detection
  - Adaptive UI scaling (2x in mobile portrait)
- ✅ **Enhanced Column Configuration**
  - Added "Show on Table" column (8th column in ColumnConfig)
  - New special role: "Formula/External Link (Read-only)"
  - Controls which columns appear in Table view
- ✅ **User Status Management**
  - Active/Inactive status in Users sheet
  - Block access without deleting users
  - Status changes take effect immediately
- ✅ **Visual Customization**
  - Logo support (Settings C6)
  - Background image support (Settings I5)
  - Multiple card styles per layer
- ✅ **Navigation Enhancements**
  - Left/right arrow navigation in detail view (desktop)
  - Swipe navigation in detail view (mobile/tablet)
  - Force landscape layout for Table detail view
- ✅ **90-Day Sessions**
  - Sessions now expire after 90 days (was unlimited)
  - CacheService-based session storage (no sheet needed)
  - OTP codes stored in CacheService (was EmailOTP sheet)

**Settings Changes:**
- 🔄 Date Adjustment moved from H2 to **F2**
- 🔄 App Mode moved from J2 to **I2**
- 🔄 App Mode renamed to "Private with Profiles" (was "Private")
- ➕ Logo URL added at **C6**
- ➕ Background Image URL added at **I5**

**Previous Updates (2025-11-25)**
- ✅ Hide logout button and user email in Public mode
- ✅ Clean public-facing interface for viewer-only access

**Previous Updates (2025-11-24)**
- ✅ Add Public/Private mode toggle
- ✅ Add deployment URL setting for image loading
- ✅ Fix image loading in public mode
- ✅ Moved Back to List button to filters bar
- ✅ Hide Filter/Sort buttons in detail view
- ✅ Remove shadow edge from detail view images
- ✅ Improve scrollbar styling
- ✅ Enhanced date input styling

**Previous Updates (2025-11-23)**
- ✅ Added Bottom item place for metadata display
- ✅ Fixed date timezone issues with adjustment setting
- ✅ Added Top Corner item place for badge-style display
- ✅ Improved date format display (dd/mm/yyyy)

**Previous Updates (2025-11-22)**
- ✅ Restructured column system: Item Place + Special Role
- ✅ Implemented two-column detail view layout
- ✅ Email OTP authentication system
- ✅ Session management with tokens

---

## Future Development Ideas

**Completed Features:**
- ✅ Layer system (hierarchical navigation)
- ✅ Multiple view types (Cards, List, Table)
- ✅ Mobile and tablet responsive design
- ✅ Touch gesture support
- ✅ Device-specific layouts

**Planned Enhancements:**
- [ ] **Installation capability** - PWA functionality for install prompts
- [ ] **Map view** - GPS-based map visualization with pins
- [ ] **Horizontal card scrolling** - Carousel-style navigation
- [ ] **Multiple tables** - Different data tables with separate configurations
- [ ] **Multiple tabs** - Tab-based content organization
- [ ] **User-specific data** - Hidden columns with personal notes/ratings
- [ ] **Data visualization** - Charts and graphs for analytics
- [ ] **Visual builder** - Drag-and-drop interface for Creators
- [ ] **Custom buttons** - Configurable actions and workflows

**Other Possible Enhancements:**
- CSV import/export for bulk operations
- Image upload to Drive from app
- More column types (checkbox, dropdown, multi-select)
- Advanced filtering (AND/OR logic, date ranges)
- User activity logs
- Email notifications for changes
- 2FA options beyond email OTP

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
- Check Settings sheet configuration (F2 for dates, I2 for app mode)
- Verify ColumnConfig structure (8 columns)
- Check Layers sheet configuration (B2:C4 for layer definitions, D2:E5 for view types)
- Check browser console (F12) for device detection and error messages

---

**Built with Google Apps Script**

Repository: https://github.com/3vilTid/Catalogue-Web-App
Last Updated: 2025-12-18
