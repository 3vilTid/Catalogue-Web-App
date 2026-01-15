/**************************************************
 * Constants & Helpers
 **************************************************/

// Map human-readable item places to internal codes
var ITEM_PLACE_MAP = {
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
};

// Reverse map for display
var ITEM_PLACE_DISPLAY = {
  "name": "Primary Identifier",
  "image": "Main Image",
  "category": "SubId1",
  "place": "SubId2",
  "topcorner": "Top Corner",
  "longtextup": "Long text Up",
  "detailleft": "Detail Left",
  "detailright": "Detail Right",
  "longtextdown": "Long text Down",
  "bottom": "Bottom"
};

// Map human-readable special roles to internal codes
var SPECIAL_ROLE_MAP = {
  "Auto-filled User Mail": "addedby",
  "External Link": "externallink",
  "Formula (Read-only)": "formula",
  "Formula/External Link (Read-only)": "formulaexternallink"
};

// Reverse map for display
var SPECIAL_ROLE_DISPLAY = {
  "addedby": "Auto-filled User Mail",
  "externallink": "External Link",
  "formula": "Formula (Read-only)",
  "formulaexternallink": "Formula/External Link (Read-only)"
};

// Convert item place display name to internal code
function normalizeItemPlace_(displayPlace) {
  if (!displayPlace) return "";

  var placeStr = String(displayPlace).trim();

  // "None" means no item place
  if (placeStr === "None" || placeStr === "NONE" || placeStr === "none") {
    return "";
  }

  // If already internal code, return as-is
  if (placeStr === "name" || placeStr === "image" ||
      placeStr === "category" || placeStr === "place" ||
      placeStr === "topcorner" || placeStr === "longtextup" ||
      placeStr === "detailleft" || placeStr === "detailright" ||
      placeStr === "longtextdown" || placeStr === "bottom") {
    return placeStr;
  }

  // Convert display name to internal code
  return ITEM_PLACE_MAP[placeStr] || "";
}

// Convert special role display name to internal code
function normalizeSpecialRole_(displayRole) {
  if (!displayRole) return "";

  var roleStr = String(displayRole).trim();

  // "None" means no special role
  if (roleStr === "None" || roleStr === "NONE" || roleStr === "none") {
    return "";
  }

  // If already internal code, return as-is
  if (roleStr === "addedby" || roleStr === "externallink" || roleStr === "formula" || roleStr === "formulaexternallink") {
    return roleStr;
  }

  // Convert display name to internal code
  return SPECIAL_ROLE_MAP[roleStr] || "";
}

// Find index of a header by exact name
function indexOfHeader_(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === name) return i;
  }
  return -1;
}

function getMainSheet_(sheetName) {
  sheetName = sheetName || 'Main'; // Default to 'Main' for backwards compatibility
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    throw new Error("Sheet '" + sheetName + "' not found.");
  }
  return sh;
}

function getColumnConfigSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("ColumnConfig");
  if (!sh) {
    throw new Error("Sheet 'ColumnConfig' not found. Please create it first.");
  }
  return sh;
}

/**************************************************
 * Column Configuration
 **************************************************/

/**
 * Get column configuration from specified sheet
 * @param {string} sheetName - Name of the ColumnConfig sheet (default: 'ColumnConfig')
 */
function getColumnConfig(sheetName) {
  sheetName = sheetName || 'ColumnConfig';
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(sheetName);

    if (!sh) {
      Logger.log("ColumnConfig sheet '" + sheetName + "' not found");
      return [];
    }
    var data = sh.getDataRange().getValues();

    if (data.length < 2) return [];

    var headers = data[0];
    var configs = [];

    // Detect if "Show on Table" column exists by checking header
    var hasShowOnTableColumn = false;
    if (headers.length > 5) {
      var headerF = String(headers[5] || "").trim();
      hasShowOnTableColumn = (headerF === "Show on Table" || headerF === "Show on table" || headerF === "show on table");
    }

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rawItemPlace, rawSpecialRole, showOnTable;

      if (hasShowOnTableColumn) {
        // New structure: F=Show on Table, G=Item Place, H=Special Role
        showOnTable = row[5] === true || row[5] === "TRUE";
        rawItemPlace = String(row[6] || "").trim();
        rawSpecialRole = String(row[7] || "").trim();
      } else {
        // Old structure: F=Item Place, G=Special Role
        showOnTable = false; // Default to false if column doesn't exist
        rawItemPlace = String(row[5] || "").trim();
        rawSpecialRole = String(row[6] || "").trim();
      }

      configs.push({
        columnName: row[0] || "",
        displayName: row[1] || row[0] || "",
        type: row[2] || "text",
        showInFilter: row[3] === true || row[3] === "TRUE",
        showInSort: row[4] === true || row[4] === "TRUE",
        showOnTable: showOnTable,
        itemPlace: normalizeItemPlace_(rawItemPlace),
        itemPlaceDisplay: rawItemPlace,
        specialRole: normalizeSpecialRole_(rawSpecialRole),
        specialRoleDisplay: rawSpecialRole
      });
    }

    return configs;
  } catch (err) {
    Logger.log("Error getting column config: " + err);
    return [];
  }
}

/**************************************************
 * Entry Points
 **************************************************/

function doGet(e) {
  // Handle API function calls from GitHub Pages (GET method to avoid CORS preflight)
  if (e && e.parameter && e.parameter.function) {
    try {
      var functionName = e.parameter.function;
      var params = [];

      // Parse parameters if provided
      if (e.parameter.parameters) {
        try {
          params = JSON.parse(e.parameter.parameters);
        } catch (parseError) {
          return createApiResponse_({
            error: 'Invalid parameters JSON',
            message: parseError.toString()
          }, 400);
        }
      }

      // Use the same function routing as doPost
      return handleApiCall_(functionName, params);

    } catch (error) {
      Logger.log('doGet API error: ' + error);
      return createApiResponse_({
        error: 'Server error',
        message: error.toString()
      }, 500);
    }
  }

  // Serve PWA manifest
  if (e && e.parameter && e.parameter.manifest) {
    return serveManifest_();
  }

  // NOTE: Service worker removed due to Google Apps Script limitation
  // Google Apps Script cannot serve JavaScript files with correct MIME type
  // All responses are served as text/html, which browsers reject for service workers
  // This means true PWA installation prompts are not available
  // Users can still use "Add to Home screen" for bookmark-style shortcuts

  // Serve images
  if (e && e.parameter && e.parameter.img) {
    return serveImage_(e.parameter.img);
  }

  return serveUi_(e);
}

/**
 * Handle POST requests for API calls from GitHub Pages frontend
 * Enables CORS and routes function calls to appropriate handlers
 */
function doPost(e) {
  try {
    // Parse the request body
    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createApiResponse_({
        error: 'Invalid JSON in request body',
        message: parseError.toString()
      }, 400);
    }

    // Extract function name and parameters
    var functionName = requestData.function;
    var params = requestData.parameters || [];

    if (!functionName) {
      return createApiResponse_({
        error: 'Missing function name',
        message: 'Request must include a "function" field'
      }, 400);
    }

    return handleApiCall_(functionName, params);

  } catch (error) {
    Logger.log('doPost error: ' + error);
    return createApiResponse_({
      error: 'Server error',
      message: error.toString()
    }, 500);
  }
}

/**
 * Handle API function calls (used by both doGet and doPost)
 */
function handleApiCall_(functionName, params) {
  // Map of allowed API functions
  var allowedFunctions = {
    'requestOTP': requestOTP,
    'verifyOTP': verifyOTP,
    'verifySession': verifySession,
    'logout': logout,
    'getInitialData': getInitialData,
    'getTabData': getTabData,
    'getMainData': getMainData,
    'getHeaders': getHeaders,
    'addMainRow': addMainRow,
    'getItemByName': getItemByName,
    'editItem': editItem,
    'deleteItem': deleteItem,
    'getSettings': getSettings,
    'getLayerConfig': getLayerConfig,
    'getLayerData': getLayerData,
    'getColumnConfig': getColumnConfig,
    'getTabsConfig': getTabsConfig
  };

  // Check if function is allowed
  if (!allowedFunctions[functionName]) {
    return createApiResponse_({
      error: 'Function not found',
      message: 'The function "' + functionName + '" is not available via API'
    }, 404);
  }

  // Call the function with parameters
  var result;
  try {
    var targetFunction = allowedFunctions[functionName];
    result = targetFunction.apply(null, params);
  } catch (execError) {
    Logger.log('Error executing ' + functionName + ': ' + execError);
    return createApiResponse_({
      error: 'Function execution error',
      message: execError.toString(),
      function: functionName
    }, 500);
  }

  // Return successful response
  return createApiResponse_(result, 200);
}

/**
 * Create API response with CORS headers
 */
function createApiResponse_(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // Add CORS headers to allow requests from GitHub Pages
  // Note: Google Apps Script doesn't support custom HTTP headers in the traditional way
  // The CORS policy is handled by Google's infrastructure
  // Web apps deployed as "Anyone" or "Anyone with the link" automatically allow CORS

  return output;
}

function doGetImage(e) {
  var fileId =
    e && e.parameter && (e.parameter.img || e.parameter.fileId)
      ? e.parameter.img || e.parameter.fileId
      : "";
  return serveImage_(fileId);
}

/**************************************************
 * Image Serving
 **************************************************/

function serveImage_(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var contentType = blob.getContentType();
    var bytes = blob.getBytes();

    var base64 = Utilities.base64Encode(bytes);

    var json = {
      ok: true,
      mime: contentType,
      data: base64
    };

    return ContentService
      .createTextOutput(JSON.stringify(json))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var json = {
      ok: false,
      error: err.toString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(json))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**************************************************
 * PWA Manifest
 **************************************************/

function serveManifest_() {
  try {
    var settings = getSettings();
    var appName = settings.appName || "Catalogue Web App";
    var catalogName = settings.catalogName || "Catalogue";

    var baseUrl = ScriptApp.getService().getUrl();

    var manifest = {
      "name": appName,
      "short_name": catalogName,
      "description": catalogName + " web application for managing and browsing items",
      "start_url": baseUrl + "/",
      "scope": baseUrl + "/",
      "display": "standalone",
      "orientation": "any",
      "theme_color": "#4CAF50",
      "background_color": "#ffffff",
      "prefer_related_applications": false,
      "icons": [
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect fill='%234CAF50' width='192' height='192'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='120' fill='white'%3EC%3C/text%3E%3C/svg%3E",
          "sizes": "192x192",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        },
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect fill='%234CAF50' width='512' height='512'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='320' fill='white'%3EC%3C/text%3E%3C/svg%3E",
          "sizes": "512x512",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        }
      ],
      "categories": ["productivity", "utilities"],
      "screenshots": []
    };

    return ContentService
      .createTextOutput(JSON.stringify(manifest))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error serving manifest: " + err);
    var errorManifest = {
      "name": "Catalogue",
      "short_name": "Catalogue",
      "display": "standalone"
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorManifest))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Service worker function removed - Google Apps Script cannot serve
// service workers with correct MIME type (serves text/html instead of
// application/javascript), causing browser security rejection.
//
// PWA installation prompts require a valid service worker, which is not
// possible on Google Apps Script. Users can use "Add to Home screen" for
// bookmark-style shortcuts instead.


/**************************************************
 * UI Serving (No Access Control)
 **************************************************/

function serveUi_(e) {
  return HtmlService.createHtmlOutputFromFile("index").setTitle("Catalogue");
}

/**************************************************
 * Settings
 **************************************************/

function getSettings(layersSheetName) {
  layersSheetName = layersSheetName || 'Layers'; // Default to 'Layers' if not specified

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) {
    return {
      appName: "App",
      catalogName: "Catalogue",
      sheetUrl: "",
      deploymentUrl: "",
      dateAdjustment: 0,
      appMode: "Private with Profiles",
      layer1View: "Cards",
      layer2View: "Cards",
      layer3View: "Cards",
      mainView: "Cards",
      layer1Style: "Squared",
      layer2Style: "Squared",
      layer3Style: "Squared",
      mainStyle: "Squared",
      layersSheetName: layersSheetName
    };
  }

  var appName = sh.getRange("C2").getDisplayValue() || "App";
  var catalogName = sh.getRange("C3").getDisplayValue() || "Catalogue";
  var sheetUrl = sh.getRange("C4").getDisplayValue() || "";
  var deploymentUrl = sh.getRange("C5").getDisplayValue() || "";
  var logoUrl = sh.getRange("C6").getDisplayValue() || "";
  var dateAdjustment = parseInt(sh.getRange("F2").getValue()) || 0;
  var appMode = sh.getRange("I2").getDisplayValue() || "Private with Profiles";
  var backgroundImageUrl = sh.getRange("I5").getDisplayValue() || "";

  // Get Layers sheet for layer-specific settings (use the specified sheet name)
  var layersSheet = ss.getSheetByName(layersSheetName);

  // Read view types for each layer and main items from Layers sheet
  var layer1View = layersSheet ? (layersSheet.getRange("D2").getDisplayValue() || "Cards") : "Cards";
  var layer2View = layersSheet ? (layersSheet.getRange("D3").getDisplayValue() || "Cards") : "Cards";
  var layer3View = layersSheet ? (layersSheet.getRange("D4").getDisplayValue() || "Cards") : "Cards";
  var mainView = layersSheet ? (layersSheet.getRange("D5").getDisplayValue() || "Cards") : "Cards";

  // Read styles for each layer and main items from Layers sheet
  var layer1Style = layersSheet ? (layersSheet.getRange("E2").getDisplayValue() || "Squared") : "Squared";
  var layer2Style = layersSheet ? (layersSheet.getRange("E3").getDisplayValue() || "Squared") : "Squared";
  var layer3Style = layersSheet ? (layersSheet.getRange("E4").getDisplayValue() || "Squared") : "Squared";
  var mainStyle = layersSheet ? (layersSheet.getRange("E5").getDisplayValue() || "Squared") : "Squared";

  // Read Main Column Name (column C) for each layer to detect if layer is configured
  var layer1MainColumn = layersSheet ? (layersSheet.getRange("C2").getDisplayValue() || "") : "";
  var layer2MainColumn = layersSheet ? (layersSheet.getRange("C3").getDisplayValue() || "") : "";
  var layer3MainColumn = layersSheet ? (layersSheet.getRange("C4").getDisplayValue() || "") : "";

  return {
    appName: appName,
    catalogName: catalogName,
    sheetUrl: sheetUrl,
    deploymentUrl: deploymentUrl,
    logoUrl: logoUrl,
    dateAdjustment: dateAdjustment,
    appMode: appMode,
    backgroundImageUrl: backgroundImageUrl,
    layer1View: layer1View,
    layer2View: layer2View,
    layer3View: layer3View,
    mainView: mainView,
    layer1Style: layer1Style,
    layer2Style: layer2Style,
    layer3Style: layer3Style,
    mainStyle: mainStyle,
    layersSheetName: layersSheetName,
    layer1MainColumn: layer1MainColumn,
    layer2MainColumn: layer2MainColumn,
    layer3MainColumn: layer3MainColumn
  };
}

/**
 * Read tabs configuration from Settings sheet (rows 10-20)
 * Returns array of tab objects, skipping empty rows
 */
function getTabsConfig() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var settingsSheet = ss.getSheetByName('Settings');

    if (!settingsSheet) {
      Logger.log('Settings sheet not found');
      return [];
    }

    // Read tab configuration from B11:F20 (data rows, skipping header in row 10)
    // Column F contains showSearch setting ("Yes" = visible, anything else = hidden)
    var tabRange = settingsSheet.getRange('B11:F20');
    var tabValues = tabRange.getValues();

    var tabsConfig = [];

    for (var i = 0; i < tabValues.length; i++) {
      var row = tabValues[i];
      var tabName = row[0]; // Column B
      var layersSheetName = row[1]; // Column C
      var mainSheetName = row[2]; // Column D
      var columnConfigSheetName = row[3]; // Column E
      var showSearchValue = row[4]; // Column F

      // Skip empty rows (check if tab name is empty)
      if (!tabName || tabName.toString().trim() === '') {
        continue;
      }

      // showSearch: "Yes" = true, anything else (including blank) = false
      var showSearch = String(showSearchValue || "").trim().toLowerCase() === "yes";

      tabsConfig.push({
        tabName: tabName.toString().trim(),
        layersSheetName: layersSheetName ? layersSheetName.toString().trim() : '',
        mainSheetName: mainSheetName ? mainSheetName.toString().trim() : '',
        columnConfigSheetName: columnConfigSheetName ? columnConfigSheetName.toString().trim() : '',
        showSearch: showSearch
      });

      Logger.log('Tab ' + (i + 1) + ': ' + tabName + ' (showSearch: ' + showSearch + ')');
    }

    Logger.log('Tabs config loaded: ' + tabsConfig.length + ' tabs');
    return tabsConfig;
  } catch (e) {
    Logger.log('Error getting tabs config: ' + e.toString());
    return [];
  }
}

/**
 * Get layer configuration from Layers sheet
 * Hardcoded to read from B2:C4 (Layer 1, 2, 3)
 * @param {string} sheetName - Name of the Layers sheet (default: 'Layers')
 */
function getLayerConfig(sheetName) {
  sheetName = sheetName || 'Layers';
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var layersSheet = ss.getSheetByName(sheetName);

    if (!layersSheet) {
      Logger.log("✗ Layers sheet '" + sheetName + "' not found");
      return [];
    }

    var layers = [];

    // Hardcoded positions: B2:C4 for layer config, F2:F4 for search visibility
    // B2: Layer 1, C2: Ex Cat, F2: Show search on Layer 1
    // B3: Layer 2, C3: Category, F3: Show search on Layer 2
    // B4: Layer 3, C4: (blank), F4: Show search on Layer 3
    var layerRows = [2, 3, 4]; // Rows for Layer 1, 2, 3
    var layerCol = 2;  // Column B (1-indexed)
    var mainCol = 3;   // Column C (1-indexed)
    var showSearchCol = 6; // Column F (1-indexed)

    for (var i = 0; i < layerRows.length; i++) {
      var row = layerRows[i];
      var layerName = layersSheet.getRange(row, layerCol).getValue();
      var mainColumnName = layersSheet.getRange(row, mainCol).getValue();
      var showSearchValue = layersSheet.getRange(row, showSearchCol).getValue();

      layerName = String(layerName || "").trim();
      mainColumnName = String(mainColumnName || "").trim();

      // showSearch: "Yes" = true, anything else (including blank) = false
      var showSearch = String(showSearchValue || "").trim().toLowerCase() === "yes";

      // Only include layers that have both name and main column
      if (layerName !== "" && mainColumnName !== "") {
        layers.push({
          layerName: layerName,
          mainColumnName: mainColumnName,
          showSearch: showSearch
        });
        Logger.log("✓ Found layer: " + layerName + " -> " + mainColumnName + " (showSearch: " + showSearch + ")");
      }
    }

    Logger.log("✓ Total layers configured: " + layers.length);
    return layers;
  } catch (e) {
    Logger.log("✗ Error getting layer config: " + e.toString());
    return [];
  }
}

/**
 * Get Main Layer (Layer 4) search visibility from F5
 * @param {string} sheetName - Name of the Layers sheet (default: 'Layers')
 * @return {boolean} Whether search bar should be shown on Main Layer
 */
function getMainLayerShowSearch(sheetName) {
  sheetName = sheetName || 'Layers';
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var layersSheet = ss.getSheetByName(sheetName);

    if (!layersSheet) {
      return false;
    }

    // F5 controls search visibility for Main Layer (Layer 4)
    var showSearchValue = layersSheet.getRange(5, 6).getValue(); // Row 5, Column F
    var showSearch = String(showSearchValue || "").trim().toLowerCase() === "yes";
    Logger.log("✓ Main Layer showSearch: " + showSearch);
    return showSearch;
  } catch (e) {
    Logger.log("✗ Error getting main layer search config: " + e.toString());
    return false;
  }
}

/**
 * Get layer data from Layers sheet
 * Searches flexibly for layer table by name in ANY column
 * @param {string} layerName - Name of the layer (e.g., "Layer 1")
 * @param {string} sheetName - Name of the Layers sheet (default: 'Layers')
 */
function getLayerData(layerName, sheetName) {
  sheetName = sheetName || 'Layers';
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var layersSheet = ss.getSheetByName(sheetName);

    if (!layersSheet) {
      Logger.log("✗ Layers sheet '" + sheetName + "' not found");
      return [];
    }

    // Hardcoded positions for each layer table
    // Layer 1: H1 (column 8), Layer 2: L1 (column 12), Layer 3: Q1 (column 17)
    var startCol;
    if (layerName === "Layer 1") {
      startCol = 8; // Column H (1-indexed)
    } else if (layerName === "Layer 2") {
      startCol = 12; // Column L (1-indexed)
    } else if (layerName === "Layer 3") {
      startCol = 17; // Column Q (1-indexed)
    } else {
      Logger.log("✗ Unknown layer: " + layerName);
      return [];
    }

    var data = layersSheet.getDataRange().getValues();
    var headerRow = 0; // Row 1 (0-indexed)
    var headers = [];

    // Read headers from row 1, starting at startCol
    // Convert 1-indexed to 0-indexed
    var colIndex = startCol - 1;
    for (var j = colIndex; j < data[headerRow].length; j++) {
      var headerValue = String(data[headerRow][j] || "").trim();
      if (headerValue === "") break; // Stop at first empty header
      headers.push(headerValue);
    }

    Logger.log("✓ Found " + headers.length + " headers for '" + layerName + "': " + headers.join(", "));

    var items = [];
    var dataStartRow = 1; // Row 2 (0-indexed)

    // Read data rows until we hit an empty row
    for (var i = dataStartRow; i < data.length; i++) {
      var row = data[i];
      var firstCell = String(row[colIndex] || "").trim();

      // Stop at empty row (indicates end of this table)
      if (firstCell === "") break;

      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[colIndex + j] || "";
      }
      items.push(item);
    }

    Logger.log("✓ Loaded " + items.length + " items from '" + layerName + "'");
    return items;
  } catch (e) {
    Logger.log("✗ Error getting layer data for " + layerName + ": " + e.toString());
    return [];
  }
}

/**
 * Check if app uses layers
 */
function hasLayers() {
  var config = getLayerConfig();
  return config && config.length > 0;
}

/**
 * Check if app is in public mode
 */
function isPublicMode_() {
  var settings = getSettings();
  return settings.appMode === "Public all in Viewer";
}

/**************************************************
 * Authentication - Email OTP
 **************************************************/

// Generate 6-digit OTP code
function generateOTPCode_() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session token
function generateSessionToken_() {
  return Utilities.getUuid();
}

// Request OTP code - check if email authorized first
function requestOTP(email) {
  try {
    email = String(email).trim().toLowerCase();

    // Check if email exists in Users sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) {
      return {
        success: false,
        message: "User management not configured."
      };
    }

    var userData = usersSheet.getDataRange().getValues();
    if (userData.length < 2) {
      return {
        success: false,
        message: "No users configured."
      };
    }

    // Find user (Email is column A, Profile is column B, Status is column C)
    var userRow = null;
    for (var i = 1; i < userData.length; i++) {
      var rowEmail = String(userData[i][0] || "").trim().toLowerCase();
      var status = String(userData[i][2] || "").trim();

      if (rowEmail === email) {
        if (status === "Active") {
          userRow = userData[i];
          break;
        } else {
          return {
            success: false,
            message: "Your access has been deactivated. Contact the administrator."
          };
        }
      }
    }

    if (!userRow) {
      return {
        success: false,
        message: "Your email is not authorized to access this catalogue."
      };
    }

    // Generate OTP code
    var code = generateOTPCode_();
    var cacheKey = "otp_" + email;

    // Store code for 10 minutes
    var cache = CacheService.getScriptCache();
    cache.put(cacheKey, code, 600);

    // Send email with code
    var appName = getSettings().appName || "Catalogue";
    MailApp.sendEmail({
      to: email,
      subject: appName + " - Verification Code",
      body: "Your verification code is: " + code + "\n\n" +
            "This code expires in 10 minutes.\n\n" +
            "If you did not request this code, please ignore this email."
    });

    return {
      success: true,
      message: "Verification code sent to " + email + ". Check your email."
    };

  } catch (err) {
    Logger.log("Error in requestOTP: " + err);
    return {
      success: false,
      message: "Error sending verification code: " + err.message
    };
  }
}

// Verify OTP code and create session
function verifyOTP(email, code) {
  try {
    email = String(email).trim().toLowerCase();
    code = String(code).trim();

    // Check code from cache
    var cacheKey = "otp_" + email;
    var cache = CacheService.getScriptCache();
    var storedCode = cache.get(cacheKey);

    if (!storedCode || storedCode !== code) {
      return {
        success: false,
        message: "Invalid or expired verification code."
      };
    }

    // Code is valid - remove it from cache
    cache.remove(cacheKey);

    // Get user info
    var userInfo = getUserByEmail_(email);
    if (!userInfo) {
      return {
        success: false,
        message: "User not found."
      };
    }

    // Create session token (90 days)
    var token = generateSessionToken_();
    var sessionData = {
      email: userInfo.email,
      profile: userInfo.profile,
      name: userInfo.name
    };

    // Store session for 90 days (7,776,000 seconds)
    cache.put("session_" + token, JSON.stringify(sessionData), 7776000);

    return {
      success: true,
      message: "Login successful!",
      token: token,
      user: sessionData
    };

  } catch (err) {
    Logger.log("Error in verifyOTP: " + err);
    return {
      success: false,
      message: "Error verifying code: " + err.message
    };
  }
}

// Verify session token
function verifySession(token) {
  try {
    if (!token) {
      return { success: false, message: "No session token provided." };
    }

    var cache = CacheService.getScriptCache();
    var sessionData = cache.get("session_" + token);

    if (!sessionData) {
      return { success: false, message: "Session expired or invalid." };
    }

    var user = JSON.parse(sessionData);

    // Verify user still exists and is active
    var userInfo = getUserByEmail_(user.email);
    if (!userInfo) {
      return { success: false, message: "User no longer exists." };
    }

    return {
      success: true,
      user: userInfo
    };

  } catch (err) {
    Logger.log("Error in verifySession: " + err);
    return { success: false, message: "Error verifying session." };
  }
}

// Get user by email (internal helper)
function getUserByEmail_(email) {
  try {
    email = String(email).trim().toLowerCase();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName("Users");

    if (!usersSheet) return null;

    var userData = usersSheet.getDataRange().getValues();
    if (userData.length < 2) return null;

    for (var i = 1; i < userData.length; i++) {
      var rowEmail = String(userData[i][0] || "").trim().toLowerCase();
      var profile = String(userData[i][1] || "Viewer").trim();
      var status = String(userData[i][2] || "").trim();
      var name = String(userData[i][3] || "").trim();

      if (rowEmail === email && status === "Active") {
        return {
          email: email,
          profile: profile,
          name: name || email
        };
      }
    }

    return null;
  } catch (err) {
    Logger.log("Error in getUserByEmail_: " + err);
    return null;
  }
}

// Logout - invalidate session
function logout(token) {
  try {
    if (token) {
      var cache = CacheService.getScriptCache();
      cache.remove("session_" + token);
    }
    return { success: true, message: "Logged out successfully." };
  } catch (err) {
    return { success: false, message: "Error logging out." };
  }
}

/**************************************************
 * Data Access
 **************************************************/

function getInitialData(token) {
  // Get tabs configuration
  var tabsConfig = getTabsConfig();

  // Determine which sheets to use for initial load
  var layersSheetName = 'Layers'; // Default
  var mainSheetName = 'Main'; // Default
  var columnConfigSheetName = 'ColumnConfig'; // Default

  if (tabsConfig.length > 0) {
    var firstTab = tabsConfig[0];
    layersSheetName = firstTab.layersSheetName || 'Layers';
    mainSheetName = firstTab.mainSheetName || 'Main';
    columnConfigSheetName = firstTab.columnConfigSheetName || 'ColumnConfig';
  }

  // Get layer configuration using the determined sheet name
  var layerConfig = getLayerConfig(layersSheetName);
  var mainLayerShowSearch = getMainLayerShowSearch(layersSheetName);
  var layersData = {};

  // Load data for each configured layer
  if (layerConfig && layerConfig.length > 0) {
    for (var i = 0; i < layerConfig.length; i++) {
      var layerName = layerConfig[i].layerName;
      layersData[layerName] = getLayerData(layerName, layersSheetName);
    }
  }

  // Check if app is in public mode
  if (isPublicMode_()) {
    // Public mode: Everyone is a Viewer, no authentication required
    return {
      user: {
        email: "public@viewer",
        name: "Public Viewer",
        profile: "Viewer"
      },
      settings: getSettings(),
      headers: getHeaders(mainSheetName),
      items: getMainData(mainSheetName),
      columnConfig: getColumnConfig(columnConfigSheetName),
      layerConfig: layerConfig,
      layersData: layersData,
      tabsConfig: tabsConfig,
      mainLayerShowSearch: mainLayerShowSearch
    };
  }

  // Private mode: Verify session if token provided
  var user = null;
  if (token) {
    var sessionResult = verifySession(token);
    if (sessionResult.success) {
      user = sessionResult.user;
    }
  }

  return {
    user: user,
    settings: getSettings(),
    headers: getHeaders(mainSheetName),
    items: getMainData(mainSheetName),
    columnConfig: getColumnConfig(columnConfigSheetName),
    layerConfig: layerConfig,
    layersData: layersData,
    tabsConfig: tabsConfig,
    mainLayerShowSearch: mainLayerShowSearch
  };
}

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
  try {
    // Check if app is in public mode
    if (!isPublicMode_()) {
      // Private or "Public with Login" mode: Verify session if token provided
      // In "Public with Login" mode, allow access even without token (user will be null)
      if (token) {
        var sessionResult = verifySession(token);
        if (!sessionResult.success) {
          // Session verification failed - log it but continue gracefully
          // This allows the tab to load in viewer mode, matching getInitialData() behavior
          Logger.log('Session verification failed in getTabData, continuing in viewer mode');
        }
      }
      // Note: If no token provided or verification fails, we allow access
      // The user will simply not be authenticated (viewer mode)
    }

    // Load tab-specific configuration and data
    var layerConfig = getLayerConfig(layersSheetName);
    var mainLayerShowSearch = getMainLayerShowSearch(layersSheetName);
    var layersData = {};

    // Load data for each configured layer
    if (layerConfig && layerConfig.length > 0) {
      for (var i = 0; i < layerConfig.length; i++) {
        var layerName = layerConfig[i].layerName;
        layersData[layerName] = getLayerData(layerName, layersSheetName);
      }
    }

    var items = getMainData(mainSheetName);
    var columnConfig = getColumnConfig(columnConfigSheetName);
    var headers = getHeaders(mainSheetName);
    var tabSettings = getSettings(layersSheetName);

    return {
      layerConfig: layerConfig,
      layersData: layersData,
      items: items,
      columnConfig: columnConfig,
      headers: headers,
      settings: tabSettings,
      mainLayerShowSearch: mainLayerShowSearch
    };
  } catch (err) {
    Logger.log("Error in getTabData: " + err);
    throw new Error("Error loading tab data: " + err.message);
  }
}

/**
 * Get main data from specified sheet
 * @param {string} sheetName - Name of the Main data sheet (default: 'Main')
 */
function getMainData(sheetName) {
  sheetName = sheetName || 'Main';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);

  if (!sh) {
    Logger.log("Main sheet '" + sheetName + "' not found");
    return [];
  }

  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var rows = data.slice(1);
  var out = [];

  // Get column config to identify date columns
  var configs = getColumnConfig();
  var dateColumns = {};
  for (var i = 0; i < configs.length; i++) {
    if (configs[i].type === "date") {
      dateColumns[configs[i].columnName] = true;
    }
  }

  // Get date adjustment from settings (F2)
  var settings = getSettings();
  var dateAdjustment = settings.dateAdjustment || 0;

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    if (!row[0]) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var h = headers[c];
      if (h) {
        var val = row[c];
        // Convert Date objects to YYYY-MM-DD strings using local methods
        // Apply date adjustment from Settings F2
        if (dateColumns[h] && val instanceof Date) {
          // Apply date adjustment (add days)
          var adjustedDate = new Date(val);
          adjustedDate.setDate(adjustedDate.getDate() + dateAdjustment);

          var year = adjustedDate.getFullYear();
          var month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
          var day = String(adjustedDate.getDate()).padStart(2, '0');
          obj[h] = year + "-" + month + "-" + day;
        } else {
          obj[h] = val;
        }
      }
    }
    out.push(obj);
  }
  return out;
}

/**
 * Get headers from specified sheet
 * @param {string} sheetName - Name of the Main data sheet (default: 'Main')
 */
function getHeaders(sheetName) {
  sheetName = sheetName || 'Main';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);

  if (!sh) {
    Logger.log("Main sheet '" + sheetName + "' not found");
    return [];
  }

  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

/**************************************************
 * CRUD Operations (Requires Authentication)
 **************************************************/

function addMainRow(obj, token, mainSheetName, columnConfigSheetName) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    // Check permissions (Editor or Creator)
    if (user.profile !== "Editor" && user.profile !== "Creator") {
      throw new Error("You don't have permission to add items.");
    }

    var sh = getMainSheet_(mainSheetName);
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // Auto-fill columns with "addedby" special role
    var configs = getColumnConfig(columnConfigSheetName);
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].specialRole === "addedby") {
        obj[configs[i].columnName] = user.email;
      }
    }

    var newRow = [];
    for (var j = 0; j < headers.length; j++) {
      var h = headers[j];
      newRow.push(obj[h] || "");
    }

    sh.appendRow(newRow);
    return "Item added successfully.";

  } catch (err) {
    throw new Error("Error adding item: " + err.message);
  }
}

function getItemByName(name, token, mainSheetName, columnConfigSheetName) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var sh = getMainSheet_(mainSheetName);
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return null;

    // Get column config to identify date columns
    var configs = getColumnConfig(columnConfigSheetName);
    var dateColumns = {};
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].type === "date") {
        dateColumns[configs[i].columnName] = true;
      }
    }

    // Get date adjustment from settings (F2)
    var settings = getSettings();
    var dateAdjustment = settings.dateAdjustment || 0;

    var headers = data[0];
    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === name) {
        var obj = {};
        for (var c = 0; c < headers.length; c++) {
          var h = headers[c];
          var val = data[r][c];
          // Convert Date objects to YYYY-MM-DD strings using local methods
          // Apply date adjustment from Settings F2
          if (dateColumns[h] && val instanceof Date) {
            // Apply date adjustment (add days)
            var adjustedDate = new Date(val);
            adjustedDate.setDate(adjustedDate.getDate() + dateAdjustment);

            var year = adjustedDate.getFullYear();
            var month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
            var day = String(adjustedDate.getDate()).padStart(2, '0');
            obj[h] = year + "-" + month + "-" + day;
          } else {
            obj[h] = val;
          }
        }
        return obj;
      }
    }
    return null;

  } catch (err) {
    throw new Error("Error getting item: " + err.message);
  }
}

function editItem(name, updates, token, mainSheetName) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    var sh = getMainSheet_(mainSheetName);
    var data = sh.getDataRange().getValues();
    if (data.length < 2) throw new Error("Item not found.");

    var headers = data[0];
    var rowIndex = -1;

    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === name) {
        rowIndex = r;
        break;
      }
    }

    if (rowIndex === -1) throw new Error("Item not found.");

    // Check permissions
    if (user.profile === "Editor") {
      // Editor can only edit their own items
      var addedByIndex = indexOfHeader_(headers, "Added By");
      if (addedByIndex !== -1 && data[rowIndex][addedByIndex] !== user.email) {
        throw new Error("You can only edit items you created.");
      }
    }
    // Creator can edit all items

    // Update the row
    var updatedRow = data[rowIndex];
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      if (h in updates && h !== "Added By") {
        updatedRow[i] = updates[h];
      }
    }

    sh.getRange(rowIndex + 1, 1, 1, headers.length).setValues([updatedRow]);
    return "Item updated successfully.";

  } catch (err) {
    throw new Error("Error editing item: " + err.message);
  }
}

function deleteItem(name, token, mainSheetName) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    var sh = getMainSheet_(mainSheetName);
    var data = sh.getDataRange().getValues();
    if (data.length < 2) throw new Error("Item not found.");

    var headers = data[0];
    var rowIndex = -1;

    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === name) {
        rowIndex = r;
        break;
      }
    }

    if (rowIndex === -1) throw new Error("Item not found.");

    // Check permissions
    if (user.profile === "Editor") {
      // Editor can only delete their own items
      var addedByIndex = indexOfHeader_(headers, "Added By");
      if (addedByIndex !== -1 && data[rowIndex][addedByIndex] !== user.email) {
        throw new Error("You can only delete items you created.");
      }
    }
    // Creator can delete all items

    sh.deleteRow(rowIndex + 1);
    return "Item deleted successfully.";

  } catch (err) {
    throw new Error("Error deleting item: " + err.message);
  }
}

/**************************************************
 * Test Function - Use this to trigger authorization
 **************************************************/

// Run this function from the Apps Script editor to authorize email permissions
function testEmailPermissions() {
  Logger.log("Testing email permissions...");

  // This will trigger the authorization prompt for MailApp
  var recipient = Session.getActiveUser().getEmail();

  MailApp.sendEmail({
    to: recipient,
    subject: "Test - Email Permission Authorization",
    body: "This is a test email to authorize the email sending permission.\n\nYou can now deploy your Email OTP authentication app!"
  });

  Logger.log("Test email sent successfully to: " + recipient);
  return "Authorization successful! Email sent.";
}
