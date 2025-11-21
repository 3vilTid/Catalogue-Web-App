/**************************************************
 * Constants & Helpers
 **************************************************/

// Map human-readable special roles to internal codes
var SPECIAL_ROLE_MAP = {
  "Primary Identifier": "name",
  "Description": "description",
  "Image URL": "image",
  "Category": "category",
  "Location": "place",
  "Date": "date",
  "External Link": "externallink",
  "Auto-filled Creator": "addedby",
  "Formula (Read-only)": "formula"
};

// Reverse map for display
var SPECIAL_ROLE_DISPLAY = {
  "name": "Primary Identifier",
  "description": "Description",
  "image": "Image URL",
  "category": "Category",
  "place": "Location",
  "date": "Date",
  "externallink": "External Link",
  "addedby": "Auto-filled Creator",
  "formula": "Formula (Read-only)"
};

// Convert display name to internal code
function normalizeSpecialRole_(displayRole) {
  if (!displayRole) return "";
  
  var roleStr = String(displayRole).trim();
  
  // "None" means no special role
  if (roleStr === "None" || roleStr === "NONE" || roleStr === "none") {
    return "";
  }
  
  // If already internal code, return as-is
  if (roleStr === "name" || roleStr === "description" || 
      roleStr === "image" || roleStr === "category" ||
      roleStr === "place" || roleStr === "date" ||
      roleStr === "externallink" || roleStr === "addedby" ||
      roleStr === "formula") {
    return roleStr;
  }
  
  // Convert display name to internal code
  return SPECIAL_ROLE_MAP[roleStr] || "";
}

// Get current user's email using People API, then Session as fallback
function getCurrentEmail_() {
  var email = "";
  try {
    var me = People.People.get("people/me", { personFields: "emailAddresses" });
    if (me.emailAddresses && me.emailAddresses.length) {
      email = me.emailAddresses[0].value;
    }
  } catch (err) {
    // ignore, fallback below
  }
  if (!email) {
    try {
      email = Session.getActiveUser().getEmail();
    } catch (e) {
      email = "";
    }
  }
  return email || "";
}

// Find index of a header by exact name
function indexOfHeader_(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === name) return i;
  }
  return -1;
}

function getMainSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Main");
  if (!sh) {
    throw new Error("Sheet 'Main' not found.");
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
 * Column Configuration Management
 **************************************************/

function getColumnConfig() {
  try {
    var sh = getColumnConfigSheet_();
    var data = sh.getDataRange().getValues();
    
    if (data.length < 2) return [];
    
    var headers = data[0];
    var configs = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rawSpecialRole = String(row[6] || "").trim();
      
      configs.push({
        columnName: row[0] || "",
        displayName: row[1] || row[0] || "",
        type: row[2] || "text",
        showInFilter: row[3] === true || row[3] === "TRUE",
        showInSort: row[4] === true || row[4] === "TRUE",
        showInDetail: row[5] === true || row[5] === "TRUE",
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

function saveColumnConfig(configs) {
  var user = getUserInfo();
  if (user.profile !== "Creator") {
    return "Only Creator can modify column configuration.";
  }
  
  try {
    var sh = getColumnConfigSheet_();
    
    // Clear existing data (except headers)
    if (sh.getLastRow() > 1) {
      sh.deleteRows(2, sh.getLastRow() - 1);
    }
    
    // Write new config
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i];
      sh.appendRow([
        config.columnName,
        config.displayName,
        config.type || "text",
        config.showInFilter || false,
        config.showInSort || false,
        config.showInDetail || false,
        config.specialRole || ""
      ]);
    }
    
    // Sync Main sheet headers
    syncMainSheetHeaders_(configs);
    
    return "Column configuration saved successfully.";
  } catch (err) {
    return "Error saving column config: " + err.toString();
  }
}

function syncMainSheetHeaders_(configs) {
  var mainSheet = getMainSheet_();
  var currentHeaders = mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues()[0];
  var newHeaders = [];
  
  for (var i = 0; i < configs.length; i++) {
    newHeaders.push(configs[i].columnName);
  }
  
  // Add new columns if needed
  if (newHeaders.length > currentHeaders.length) {
    for (var j = currentHeaders.length; j < newHeaders.length; j++) {
      mainSheet.insertColumnAfter(mainSheet.getLastColumn());
    }
  }
  
  // Update headers
  mainSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
}

function addNewColumn(columnName, displayName, type, showInFilter, showInSort, showInDetail, specialRole) {
  var user = getUserInfo();
  if (user.profile !== "Creator") {
    return "Only Creator can add columns.";
  }

  if (!columnName || columnName.trim() === "") {
    return "Column name cannot be empty.";
  }

  try {
    var sh = getColumnConfigSheet_();
    sh.appendRow([
      columnName.trim(),
      displayName || columnName.trim(),
      type || "text",
      showInFilter || false,
      showInSort || false,
      showInDetail || false,
      specialRole || ""
    ]);

    // Add column to Main sheet
    var mainSheet = getMainSheet_();
    mainSheet.insertColumnAfter(mainSheet.getLastColumn());
    var lastCol = mainSheet.getLastColumn();
    mainSheet.getRange(1, lastCol).setValue(columnName.trim());

    return "Column added successfully.";
  } catch (err) {
    return "Error adding column: " + err.toString();
  }
}

function deleteColumn(columnName) {
  var user = getUserInfo();
  if (user.profile !== "Creator") {
    return "Only Creator can delete columns.";
  }

  if (!columnName || columnName.trim() === "") {
    return "Column name cannot be empty.";
  }

  try {
    // Remove from ColumnConfig sheet
    var configSheet = getColumnConfigSheet_();
    var configData = configSheet.getDataRange().getValues();

    // Find the row with this column name
    var rowToDelete = -1;
    for (var i = 1; i < configData.length; i++) {
      if (configData[i][0] === columnName) {
        rowToDelete = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowToDelete > 0) {
      configSheet.deleteRow(rowToDelete);
    } else {
      return "Column not found in ColumnConfig sheet.";
    }

    // Remove from Main sheet
    var mainSheet = getMainSheet_();
    var headers = mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues()[0];

    var colToDelete = -1;
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === columnName) {
        colToDelete = j + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (colToDelete > 0) {
      mainSheet.deleteColumn(colToDelete);
    }

    return "Column '" + columnName + "' deleted successfully.";
  } catch (err) {
    return "Error deleting column: " + err.toString();
  }
}

/**************************************************
 * TWO ENTRY POINTS
 **************************************************/

function doGet(e) {
  // Serve manifest.json for PWA
  if (e && e.parameter && e.parameter.manifest) {
    return serveManifest_();
  }

  // Serve service worker for PWA
  if (e && e.parameter && e.parameter.sw) {
    return serveServiceWorker_();
  }

  // Serve images
  if (e && e.parameter && (e.parameter.img)) {
    return serveImage_(e.parameter.img);
  }

  return serveUi_(e);
}

function doGetImage(e) {
  var fileId =
    e && e.parameter && (e.parameter.img || e.parameter.fileId)
      ? e.parameter.img || e.parameter.fileId
      : "";
  return serveImage_(fileId);
}

/**************************************************
 * Image serving
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
 * PWA Support - Manifest and Service Worker
 **************************************************/

function serveManifest_() {
  var settings = getSettings();
  var deploymentUrl = ScriptApp.getService().getUrl();

  // Get app icon URL from settings
  var iconUrl = settings.appIcon || "";

  var manifest = {
    "name": settings.appName || "Catalogue",
    "short_name": settings.appName || "Catalogue",
    "description": "Catalogue web application",
    "start_url": deploymentUrl,
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2563eb",
    "orientation": "portrait-primary",
    "icons": []
  };

  // Add icons if icon URL is provided
  if (iconUrl) {
    manifest.icons = [
      {
        "src": iconUrl,
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": iconUrl,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ];
  }

  return ContentService
    .createTextOutput(JSON.stringify(manifest))
    .setMimeType(ContentService.MimeType.JSON);
}

function serveServiceWorker_() {
  var sw = `
// Service Worker for PWA installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let all requests pass through - no offline caching
  // (Apps Script requires online connection)
  event.respondWith(fetch(event.request));
});
`;

  return ContentService
    .createTextOutput(sw)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**************************************************
 * UI serving with access control
 **************************************************/

function serveUi_(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName("Users");
  if (!userSheet) {
    return HtmlService.createHtmlOutput(
      "<h2>Error</h2><p>Users sheet not found.</p>"
    );
  }

  var lastRow = userSheet.getLastRow();
  if (lastRow < 2) {
    return HtmlService.createHtmlOutput(
      "<h2>Access Denied</h2><p>No authorized users configured.</p>"
    );
  }

  var data = userSheet.getDataRange().getValues();
  var headers = data[0];
  var emailIndex = indexOfHeader_(headers, "Email");
  if (emailIndex === -1) {
    return HtmlService.createHtmlOutput(
      "<h2>Error</h2><p>'Email' column not found in Users sheet.</p>"
    );
  }

  var authorizedEmails = [];
  for (var r = 1; r < data.length; r++) {
    var eMail = String(data[r][emailIndex] || "").trim();
    if (eMail !== "") authorizedEmails.push(eMail);
  }

  var currentEmail = getCurrentEmail_();
  if (!currentEmail) {
    return HtmlService.createHtmlOutput(
      "<h2>Access Denied</h2><p>You must be signed in with a Google account to use this app.</p>"
    );
  }

  var allowed = false;
  for (var i = 0; i < authorizedEmails.length; i++) {
    if (authorizedEmails[i] === currentEmail) {
      allowed = true;
      break;
    }
  }
  if (!allowed) {
    return HtmlService.createHtmlOutput(
      "<h2>Access Denied</h2><p>Your email (" +
        currentEmail +
        ") is not authorized to use this app.</p>"
    );
  }

  return HtmlService.createHtmlOutputFromFile("index").setTitle("Catalogue");
}

/**************************************************
 * Settings
 **************************************************/

function getSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) {
    return {
      appName: "App",
      catalogName: "Catalogue",
      imageBaseUrl: "",
      appIcon: "",
      sheetUrl: ""
    };
  }

  var appName = sh.getRange("C2").getDisplayValue() || "App";
  var catalogName = sh.getRange("C3").getDisplayValue() || "Catalogue";
  var imageBaseUrl = sh.getRange("C4").getDisplayValue() || "";
  var appIcon = sh.getRange("C6").getDisplayValue() || "";
  var sheetUrl = sh.getRange("C7").getDisplayValue() || "";

  return {
    appName: appName,
    catalogName: catalogName,
    imageBaseUrl: imageBaseUrl,
    appIcon: appIcon,
    sheetUrl: sheetUrl
  };
}

function renameCatalogue(newName) {
  newName = String(newName || "").trim();
  if (!newName) return "Catalogue name cannot be empty.";

  var user = getUserInfo();
  if (user.profile !== "Creator") {
    return "Only a Creator can rename the catalogue.";
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Settings");
  if (!sh) return "Settings sheet not found.";

  sh.getRange("C3").setValue(newName);
  return "Catalogue name updated.";
}

/**************************************************
 * User info
 **************************************************/

function getUserInfo() {
  var email = getCurrentEmail_();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Users");
  if (!sh) {
    return {
      email: email || "Anonymous",
      name: email || "Anonymous",
      profile: "Viewer"
    };
  }

  var data = sh.getDataRange().getValues();
  var headers = data[0];

  var emailIndex = indexOfHeader_(headers, "Email");
  var nameIndex = indexOfHeader_(headers, "Name");
  var profileIndex = indexOfHeader_(headers, "Profile");

  var found = null;
  for (var r = 1; r < data.length; r++) {
    if (data[r][emailIndex] === email) {
      found = data[r];
      break;
    }
  }

  if (!found) {
    return {
      email: email || "Anonymous",
      name: email || "Anonymous",
      profile: "Viewer"
    };
  }

  return {
    email: email,
    name: found[nameIndex],
    profile: found[profileIndex]
  };
}

/**************************************************
 * Main sheet data
 **************************************************/

function getInitialData() {
  return {
    user: getUserInfo(),
    settings: getSettings(),
    headers: getHeaders(),
    items: getMainData(),
    columnConfig: getColumnConfig()
  };
}

function getMainData() {
  var sh;
  try {
    sh = getMainSheet_();
  } catch (err) {
    return [];
  }

  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var rows = data.slice(1);
  var out = [];

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    if (!row[0]) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var h = headers[c];
      if (h) obj[h] = row[c];
    }
    out.push(obj);
  }
  return out;
}

function addMainRow(obj) {
  var sh = getMainSheet_();
  var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var user = getUserInfo();
  var email = user.email;
  var config = getColumnConfig();

  if (user.profile === "Viewer") {
    return "You do not have permission to add items.";
  }

  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    
    // Find if this column has special role "addedby"
    var isAddedBy = false;
    for (var j = 0; j < config.length; j++) {
      if (config[j].columnName === h && config[j].specialRole === "addedby") {
        isAddedBy = true;
        break;
      }
    }
    
    if (isAddedBy) {
      newRow.push(email);
    } else {
      newRow.push(obj[h] != null ? obj[h] : "");
    }
  }

  sh.appendRow(newRow);
  return "Item added successfully.";
}

function getHeaders() {
  var sh;
  try {
    sh = getMainSheet_();
  } catch (err) {
    return [];
  }
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

/**************************************************
 * Single-item operations
 **************************************************/

function getItemByName(name) {
  name = String(name || "").trim();
  if (!name) return null;

  var sh = getMainSheet_();
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return null;

  var headers = data[0];
  var nameIndex = indexOfHeader_(headers, "Name");
  if (nameIndex === -1) nameIndex = 0;

  var out = null;

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][nameIndex]) === name) {
      out = {};
      for (var c = 0; c < headers.length; c++) {
        var h = headers[c];
        if (h) out[h] = data[r][c];
      }
      break;
    }
  }
  return out;
}

function editItem(name, updates) {
  name = String(name || "").trim();
  if (!name) return "Missing item name.";

  var user = getUserInfo();
  var sh = getMainSheet_();
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return "No data.";

  var headers = data[0];
  var config = getColumnConfig();
  
  var nameIndex = -1;
  var addedByIndex = -1;
  
  // Find name and addedby columns by special role
  for (var i = 0; i < config.length; i++) {
    if (config[i].specialRole === "name") {
      nameIndex = indexOfHeader_(headers, config[i].columnName);
    }
    if (config[i].specialRole === "addedby") {
      addedByIndex = indexOfHeader_(headers, config[i].columnName);
    }
  }

  if (nameIndex === -1) return "Name column not found.";
  if (addedByIndex === -1) return "Added By column not found.";

  var targetRow = -1;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][nameIndex]) === name) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) return "Item not found.";

  var addedBy = sh.getRange(targetRow, addedByIndex + 1).getValue();

  var canEdit =
    user.profile === "Creator" ||
    (user.profile === "Editor" && String(addedBy) === user.email);

  if (!canEdit) {
    return "You do not have permission to edit this item.";
  }

  for (var c = 0; c < headers.length; c++) {
    var h = headers[c];
    if (!h) continue;
    
    // Check if this column is "addedby"
    var isAddedBy = false;
    for (var j = 0; j < config.length; j++) {
      if (config[j].columnName === h && config[j].specialRole === "addedby") {
        isAddedBy = true;
        break;
      }
    }
    
    if (isAddedBy) continue;
    
    if (updates.hasOwnProperty(h)) {
      sh.getRange(targetRow, c + 1).setValue(updates[h]);
    }
  }

  return "Item updated successfully.";
}

function deleteItem(name) {
  name = String(name || "").trim();
  if (!name) return "Missing item name.";

  var user = getUserInfo();
  var sh = getMainSheet_();
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return "No data.";

  var headers = data[0];
  var config = getColumnConfig();
  
  var nameIndex = -1;
  var addedByIndex = -1;
  
  for (var i = 0; i < config.length; i++) {
    if (config[i].specialRole === "name") {
      nameIndex = indexOfHeader_(headers, config[i].columnName);
    }
    if (config[i].specialRole === "addedby") {
      addedByIndex = indexOfHeader_(headers, config[i].columnName);
    }
  }

  if (nameIndex === -1) return "Name column not found.";
  if (addedByIndex === -1) return "Added By column not found.";

  var targetRow = -1;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][nameIndex]) === name) {
      targetRow = r + 1;
      break;
    }
  }

  if (targetRow === -1) return "Item not found.";

  var addedBy = sh.getRange(targetRow, addedByIndex + 1).getValue();

  var canDelete =
    user.profile === "Creator" ||
    (user.profile === "Editor" && String(addedBy) === user.email);

  if (!canDelete) {
    return "You do not have permission to delete this item.";
  }

  sh.deleteRow(targetRow);
  return "Item deleted successfully.";
}
