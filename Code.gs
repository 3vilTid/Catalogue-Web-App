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
 * Column Configuration
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

/**************************************************
 * Entry Points
 **************************************************/

function doGet(e) {
  // Serve images
  if (e && e.parameter && e.parameter.img) {
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
 * UI Serving (No Access Control)
 **************************************************/

function serveUi_(e) {
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
      imageBaseUrl: ""
    };
  }

  var appName = sh.getRange("C2").getDisplayValue() || "App";
  var catalogName = sh.getRange("C3").getDisplayValue() || "Catalogue";
  var imageBaseUrl = sh.getRange("C4").getDisplayValue() || "";

  return {
    appName: appName,
    catalogName: catalogName,
    imageBaseUrl: imageBaseUrl
  };
}

/**************************************************
 * Data Access (Read-Only)
 **************************************************/

function getInitialData() {
  return {
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

function getHeaders() {
  var sh;
  try {
    sh = getMainSheet_();
  } catch (err) {
    return [];
  }
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}
