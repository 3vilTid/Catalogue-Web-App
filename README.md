# Catalogue Web App

A dynamic, installable web application built with Google Apps Script for managing catalogues with customizable columns, role-based access control, and Progressive Web App (PWA) capabilities.

## Features

### Dynamic Column System
- **Fully Configurable Columns**: Define columns dynamically through the ColumnConfig sheet
- **Special Column Roles**: Assign special behaviors to columns (name, description, image, category, place, date, external link, etc.)
- **Column Management UI**: Add, edit, delete, and reorder columns (Creator only)
- **Import/Export**: Backup and restore column configurations via JSON

### Role-Based Access Control
Three user roles with different permissions:

- **Viewer**: Read-only access to the catalogue
- **Editor**: Can add items and edit/delete their own items
- **Creator**: Full access - can manage columns, edit all items, and access Google Sheet

### Progressive Web App (PWA)
- **Installable**: Install the app on desktop and mobile devices
- **Custom App Icon**: Configure app icon via Settings sheet (C6)
- **Custom App Name**: Configure app name via Settings sheet (C2)
- **Theme Color**: Blue (#2563eb) theme for consistent branding

### User Interface
- **Grid View**: Visual card-based display of catalogue items
- **Detail View**: Expandable detail cards with all configured information
- **Dynamic Filters**: Filter by any column marked as filterable (radio button selection)
- **Dynamic Sorting**: Sort by any column marked as sortable
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Image Caching**: IndexedDB-based image caching for improved performance

### Data Management
- **Add/Edit Items**: User-friendly forms generated dynamically from column configuration
- **Auto-filled Creator**: Automatically tracks who added each item
- **Permission-based Editing**: Editors can only modify their own items; Creators can modify all
- **Delete Items**: Remove items with proper permission checks

## Setup Instructions

### 1. Google Sheets Structure

Create a Google Sheet with the following sheets:

#### Main Sheet
- Contains your catalogue data
- Column headers should match the column names defined in ColumnConfig

#### ColumnConfig Sheet
Headers: `Column Name | Display Name | Type | Show in Filter | Show in Sort | Show in Detail | Special Role`

Example configuration:
```
Name          | Name          | text   | FALSE | TRUE  | TRUE  | Primary Identifier
Description   | Description   | text   | FALSE | FALSE | TRUE  | Description
Picture url   | Picture       | text   | FALSE | FALSE | TRUE  | Image URL
Category      | Category      | text   | TRUE  | TRUE  | TRUE  | Category
Place         | Location      | text   | TRUE  | TRUE  | TRUE  | Location
Date          | Date          | date   | FALSE | TRUE  | TRUE  | Date
ExternalLink  | Link          | text   | FALSE | FALSE | TRUE  | External Link
Added By      | Added By      | text   | FALSE | FALSE | TRUE  | Auto-filled Creator
```

**Special Roles Available:**
- `Primary Identifier`: Main identifier for each item (required)
- `Description`: Description text for the item
- `Image URL`: URL to the item's image
- `Category`: Category classification
- `Location`: Place/location information
- `Date`: Date field
- `External Link`: External URL link
- `Auto-filled Creator`: Automatically filled with creator's email
- `Formula (Read-only)`: For formula-based columns
- `None` or empty: Regular data column

#### Settings Sheet
Configure app settings in column C:
- **C2**: App Name (e.g., "Catalogue")
- **C3**: Catalogue Name (e.g., "My Best Underwater pics")
- **C4**: Image Base URL (optional)
- **C6**: App Icon URL (Google Drive image URL for PWA icon)
- **C7**: Google Sheet URL (link to the sheet, visible to Creators)

#### Users Sheet
Headers: `Email | Name | Profile`

Example:
```
user@example.com     | John Doe    | Creator
editor@example.com   | Jane Smith  | Editor
viewer@example.com   | Bob Jones   | Viewer
```

### 2. Google Apps Script Setup

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy the contents of `Code.gs` into the script editor
5. Copy the contents of `index.html` into a new HTML file (File > New > HTML file)
6. Enable the **People API**:
   - Click on **Services** (+ icon) in the left sidebar
   - Find "People API" and add it
7. Save the project

### 3. Deploy as Web App (TWO DEPLOYMENTS REQUIRED)

**Important**: This app requires **TWO separate deployments** for full functionality:

#### Deployment 1: Image Server (Execute as "Me")

This deployment is needed to serve images from Google Drive:

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click **Select type > Web app**
3. Configure:
   - **Description**: "Image Server"
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. Copy this web app URL - this will be used internally for image serving

#### Deployment 2: Main Web App (Execute as "User accessing")

This is the actual web app link that users will access:

1. Click **Deploy > New deployment** again
2. Click **Select type > Web app**
3. Configure:
   - **Description**: "Catalogue Web App"
   - **Execute as**: **User accessing the web app**
   - **Who has access**: **Anyone with a Google account**
4. Click **Deploy**
5. **Copy this web app URL** - this is your main app link
6. Paste this URL into your Settings sheet cell C7 (for the Sheet link feature)
7. Share this URL with your users

**Why two deployments?**
- **Deployment 1 (Execute as "Me")**: Allows the app to serve images from Google Drive using your permissions, so all users can view images regardless of their Drive access
- **Deployment 2 (Execute as "User accessing")**: Runs the app with each user's permissions, enabling proper user identification and role-based access control

### 4. First-Time Authorization

1. Visit the web app URL
2. Sign in with your Google account
3. Grant the necessary permissions
4. Ensure your email is in the Users sheet with appropriate role

## Usage Guide

### For Creators

**Manage Columns:**
1. Click the "⚙ Columns" button in the toolbar
2. Use the column management interface to:
   - Add new columns
   - Edit existing columns (display name, type, visibility, special role)
   - Delete columns (with confirmation)
   - Reorder columns using ▲▼ arrows
   - Export configuration to JSON file
   - Import configuration from JSON file

**Access Google Sheet:**
1. Click the "📊 Sheet" button to open the Google Sheet directly

**Edit Catalogue Name:**
1. Click the pencil icon next to the catalogue name in the header

### For Editors

**Add Items:**
1. Click the "+ Add item" button
2. Fill in the form (all columns except auto-filled ones)
3. Click "Save"

**Edit Your Items:**
1. Click on an item card to open detail view
2. Click "Edit" (only visible on items you created)
3. Modify the fields
4. Click "Save"

**Delete Your Items:**
1. Open detail view for an item you created
2. Click "Delete"
3. Confirm the deletion

### For Viewers

**Browse Catalogue:**
1. View items in grid layout
2. Click any item to see full details
3. Use filters and sorting to find items

**Filter & Sort:**
1. Click "🔽 Filter" to select filter criteria
2. Click "⬍ Sort" to change sorting order
3. Click "↻ Reset" to clear filters and sorting

## Installing as PWA

### On Mobile (iOS)
1. Open the web app URL in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"

### On Mobile (Android)
1. Open the web app URL in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Confirm the installation

### On Desktop (Chrome/Edge)
1. Open the web app URL
2. Look for the install icon in the address bar
3. Click it and confirm installation

## Technical Details

### Architecture
- **Backend**: Google Apps Script (JavaScript)
- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Database**: Google Sheets
- **Image Storage**: Google Drive (with IndexedDB caching)
- **Authentication**: Google OAuth via Apps Script

### Column Types Supported
- `text`: Regular text input
- `date`: Date picker
- `number`: Numeric input
- `url`: URL input

### Image Handling
- Images are served through Google Drive
- Client-side caching using IndexedDB
- Base64 encoding for efficient transfer
- Automatic fallback on error

### Security
- Access control via Users sheet
- Email-based authentication
- Role-based permissions
- Server-side validation on all operations

## Files

- **Code.gs**: Backend Google Apps Script code
- **index.html**: Frontend HTML, CSS, and JavaScript
- **README.md**: This documentation file

## Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge
- Mobile browsers (iOS Safari, Android Chrome)

## Limitations

- Requires internet connection (online-only)
- Subject to Google Apps Script quotas
- Image URLs must be from Google Drive or publicly accessible
- Maximum execution time: 6 minutes per request (Apps Script limit)

## Troubleshooting

**"Access Denied" error:**
- Ensure your email is in the Users sheet
- Check that you're signed in with the correct Google account

**Images not loading:**
- Verify Drive sharing permissions (anyone with link can view)
- Check that image URLs are correct in the Main sheet

**Changes not appearing:**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Ensure you deployed the latest version

**PWA not installing:**
- Ensure you're using HTTPS (Apps Script web apps use HTTPS)
- Check that app icon URL is valid in Settings C6
- Try a different browser

## Version History

- **Latest**: Added Google Sheet link for Creator users
- Added Progressive Web App (PWA) functionality
- Implemented dynamic column management with import/export
- Added column reordering and deletion features
- Implemented radio button filters and sorting
- Initial dynamic column configuration system

## License

This is a personal project. Feel free to use and modify as needed.

## Support

For issues or questions, please check the Google Apps Script logs:
1. Open the Apps Script editor
2. Go to Executions to see logs
3. Check for error messages

---

**Built with Google Apps Script**
