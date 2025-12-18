# Multi-Tab Implementation Guide for Google Apps Script Backend

## Overview
This guide explains the backend changes needed in Google Apps Script to support the multi-tab functionality implemented in the frontend.

## Frontend Implementation Summary
The frontend has been updated to support multiple tabs with the following features:
- Tab switcher dropdown in the header (visible only when 2+ tabs are configured)
- Per-tab navigation state preservation (position memory)
- Dynamic loading of tab-specific data (Layers, Main data, Column Config)
- Automatic tab configuration from Google Sheets rows 10-20

## Required Backend Changes

### 1. Read Tab Configuration from Settings Sheet

The backend needs to read tab configuration from the Settings sheet, rows 10-20 with the following columns:
- **Column B (B10:B20)**: Tab Name
- **Column C (C10:C20)**: Layers Sheet Name
- **Column D (D10:D20)**: Main Table Sheet Name
- **Column E (E10:E20)**: Column Config Sheet Name

#### Implementation Example:

```javascript
/**
 * Read tabs configuration from Settings sheet (rows 10-20)
 * Returns array of tab objects, skipping empty rows
 */
function getTabsConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');

  if (!settingsSheet) {
    Logger.log('Settings sheet not found');
    return [];
  }

  // Read tab configuration from B10:E20
  var tabRange = settingsSheet.getRange('B10:E20');
  var tabValues = tabRange.getValues();

  var tabsConfig = [];

  for (var i = 0; i < tabValues.length; i++) {
    var row = tabValues[i];
    var tabName = row[0]; // Column B
    var layersSheetName = row[1]; // Column C
    var mainSheetName = row[2]; // Column D
    var columnConfigSheetName = row[3]; // Column E

    // Skip empty rows (check if tab name is empty)
    if (!tabName || tabName.toString().trim() === '') {
      continue;
    }

    tabsConfig.push({
      tabName: tabName.toString().trim(),
      layersSheetName: layersSheetName ? layersSheetName.toString().trim() : '',
      mainSheetName: mainSheetName ? mainSheetName.toString().trim() : '',
      columnConfigSheetName: columnConfigSheetName ? columnConfigSheetName.toString().trim() : ''
    });
  }

  Logger.log('Tabs config loaded: ' + tabsConfig.length + ' tabs');
  return tabsConfig;
}
```

### 2. Update `getInitialData()` Function

The `getInitialData()` function needs to be updated to include the tabs configuration in the payload.

#### Implementation Example:

```javascript
function getInitialData(token) {
  // ... existing authentication and setup code ...

  // Get tabs configuration
  var tabsConfig = getTabsConfig();

  // If tabs are configured, use the first tab's configuration
  var layersSheetName = 'Layers'; // Default
  var mainSheetName = 'Main'; // Default
  var columnConfigSheetName = 'ColumnConfig'; // Default

  if (tabsConfig.length > 0) {
    var firstTab = tabsConfig[0];
    layersSheetName = firstTab.layersSheetName || 'Layers';
    mainSheetName = firstTab.mainSheetName || 'Main';
    columnConfigSheetName = firstTab.columnConfigSheetName || 'ColumnConfig';
  }

  // Load data using the first tab's configuration (or defaults)
  var layerConfig = getLayerConfig(layersSheetName);
  var layersData = getLayersData(layerConfig);
  var items = getMainData(mainSheetName);
  var columnConfig = getColumnConfig(columnConfigSheetName);
  var headers = getHeaders(mainSheetName);

  return {
    user: user,
    settings: settings,
    headers: headers,
    items: items,
    columnConfig: columnConfig,
    layerConfig: layerConfig,
    layersData: layersData,
    tabsConfig: tabsConfig  // NEW: Include tabs configuration
  };
}
```

### 3. Create New `getTabData()` Function

This new function is called when the user switches tabs. It loads tab-specific data.

#### Implementation Example:

```javascript
/**
 * Get data for a specific tab
 * Called when user switches tabs
 *
 * @param {string} layersSheetName - Name of the Layers sheet for this tab
 * @param {string} mainSheetName - Name of the Main data sheet for this tab
 * @param {string} columnConfigSheetName - Name of the ColumnConfig sheet for this tab
 * @param {string} token - Session token for authentication
 * @return {object} Tab-specific data payload
 */
function getTabData(layersSheetName, mainSheetName, columnConfigSheetName, token) {
  // Verify authentication
  var user = verifySession(token);
  if (!user) {
    throw new Error('Session expired. Please log in again.');
  }

  // Check user permissions
  var hasAccess = checkUserAccess(user);
  if (!hasAccess) {
    throw new Error('Access denied.');
  }

  // Load tab-specific configuration and data
  var layerConfig = getLayerConfig(layersSheetName);
  var layersData = getLayersData(layerConfig, layersSheetName);
  var items = getMainData(mainSheetName);
  var columnConfig = getColumnConfig(columnConfigSheetName);
  var headers = getHeaders(mainSheetName);

  return {
    layerConfig: layerConfig,
    layersData: layersData,
    items: items,
    columnConfig: columnConfig,
    headers: headers
  };
}
```

### 4. Update Helper Functions to Accept Sheet Names

Update your existing helper functions to accept optional sheet names as parameters:

#### Example Updates:

```javascript
/**
 * Get layer configuration from specified sheet
 * @param {string} sheetName - Name of the Layers sheet (default: 'Layers')
 */
function getLayerConfig(sheetName) {
  sheetName = sheetName || 'Layers';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var layersSheet = ss.getSheetByName(sheetName);

  if (!layersSheet) {
    Logger.log('Layers sheet "' + sheetName + '" not found');
    return [];
  }

  // ... rest of your existing layer config logic ...
}

/**
 * Get main data from specified sheet
 * @param {string} sheetName - Name of the Main data sheet (default: 'Main')
 */
function getMainData(sheetName) {
  sheetName = sheetName || 'Main';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = ss.getSheetByName(sheetName);

  if (!mainSheet) {
    Logger.log('Main sheet "' + sheetName + '" not found');
    return [];
  }

  // ... rest of your existing main data logic ...
}

/**
 * Get column configuration from specified sheet
 * @param {string} sheetName - Name of the ColumnConfig sheet (default: 'ColumnConfig')
 */
function getColumnConfig(sheetName) {
  sheetName = sheetName || 'ColumnConfig';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(sheetName);

  if (!configSheet) {
    Logger.log('ColumnConfig sheet "' + sheetName + '" not found');
    return [];
  }

  // ... rest of your existing column config logic ...
}
```

## Configuration Example in Google Sheets

### Settings Sheet (rows 10-20):

| Row | A | B (Tab Name) | C (Layers Sheet) | D (Main Table Sheet) | E (Column Config Sheet) |
|-----|---|--------------|------------------|---------------------|------------------------|
| 10  | Tabs | Marine Creatures of Sumba | Layers | Main | ColumnConfig |
| 11  | 1 | Dive Sites | Layers 2 | Main 2 | ColumnConfig 2 |
| 12  | 2 |  |  |  |  |
| ... | ... | (empty rows are skipped) | | | |

**Note**:
- Empty rows (where Tab Name is blank) are automatically skipped
- Only configured tabs with a Tab Name will be shown
- If only 1 tab is configured, the tab switcher will be hidden
- If 0 tabs are configured, the app will use the default sheets (Layers, Main, ColumnConfig)

## Testing

After implementing the backend changes:

1. **Test with no tabs configured**: App should work as before with default sheets
2. **Test with 1 tab configured**: Tab switcher should be hidden, uses tab's sheets
3. **Test with 2+ tabs configured**: Tab switcher should appear, switching should work
4. **Test tab switching**: Verify data loads correctly for each tab
5. **Test position memory**: Navigate in a tab, switch to another tab, switch back - position should be preserved

## Frontend API Calls

The frontend makes these calls to the backend:

```javascript
// Initial load - returns payload with tabsConfig
google.script.run
  .withSuccessHandler(function(payload) { ... })
  .getInitialData(token);

// Tab switching - returns tab-specific data
google.script.run
  .withSuccessHandler(function(tabData) { ... })
  .getTabData(layersSheetName, mainSheetName, columnConfigSheetName, token);
```

## Summary

### Backend Functions to Implement/Update:
1. ✅ `getTabsConfig()` - New function to read tab configuration
2. ✅ `getInitialData()` - Add `tabsConfig` to payload
3. ✅ `getTabData()` - New function for tab switching
4. ✅ `getLayerConfig()` - Accept optional sheet name parameter
5. ✅ `getMainData()` - Accept optional sheet name parameter
6. ✅ `getColumnConfig()` - Accept optional sheet name parameter
7. ✅ `getLayersData()` - Accept optional sheet name parameter
8. ✅ `getHeaders()` - Accept optional sheet name parameter

### Frontend Changes (Already Implemented):
- ✅ Tab switcher UI component
- ✅ Tab state management with position memory
- ✅ Dynamic tab data loading
- ✅ Auto-show/hide based on tab count
