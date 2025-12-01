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
      var rawItemPlace = String(row[5] || "").trim();
      var rawSpecialRole = String(row[6] || "").trim();

      configs.push({
        columnName: row[0] || "",
        displayName: row[1] || row[0] || "",
        type: row[2] || "text",
        showInFilter: row[3] === true || row[3] === "TRUE",
        showInSort: row[4] === true || row[4] === "TRUE",
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
      sheetUrl: "",
      deploymentUrl: "",
      dateAdjustment: 0,
      appMode: "Private with Profiles"
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

  return {
    appName: appName,
    catalogName: catalogName,
    sheetUrl: sheetUrl,
    deploymentUrl: deploymentUrl,
    logoUrl: logoUrl,
    dateAdjustment: dateAdjustment,
    appMode: appMode,
    backgroundImageUrl: backgroundImageUrl
  };
}

/**
 * Get layer configuration from Settings sheet
 * Searches flexibly for "Column Layers" table anywhere in the sheet
 */
function getLayerConfig() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var settingsSheet = ss.getSheetByName("Settings");

    if (!settingsSheet) {
      Logger.log("Settings sheet not found");
      return [];
    }

    // Get all data from Settings sheet
    var data = settingsSheet.getDataRange().getValues();
    var tableStartRow = -1;
    var tableStartCol = -1;

    // Search for "Column Layers" anywhere in the sheet
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        var cellValue = String(data[i][j]).trim();
        if (cellValue === "Column Layers") {
          tableStartRow = i;
          tableStartCol = j;
          Logger.log("✓ Found 'Column Layers' at row " + (i + 1) + ", col " + (j + 1));
          break;
        }
      }
      if (tableStartRow !== -1) break;
    }

    if (tableStartRow === -1) {
      Logger.log("✗ 'Column Layers' not found in Settings sheet");
      return [];
    }

    // Skip the header row (Layer | Main Column Name)
    var dataStartRow = tableStartRow + 2;

    var layers = [];

    // Read up to 10 rows of layer data (flexible for future expansion)
    for (var i = dataStartRow; i < dataStartRow + 10 && i < data.length; i++) {
      var layerName = String(data[i][tableStartCol] || "").trim();
      var mainColumnName = String(data[i][tableStartCol + 1] || "").trim();

      // Stop if we hit an empty row
      if (layerName === "" && mainColumnName === "") {
        break;
      }

      // Only include layers that have both name and main column
      if (layerName !== "" && mainColumnName !== "") {
        layers.push({
          layerName: layerName,
          mainColumnName: mainColumnName
        });
        Logger.log("✓ Found layer: " + layerName + " -> " + mainColumnName);
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
 * Get layer data from Layers sheet
 * Searches flexibly for layer table by name in ANY column
 */
function getLayerData(layerName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var layersSheet = ss.getSheetByName("Layers");

    if (!layersSheet) {
      Logger.log("✗ Layers sheet not found");
      return [];
    }

    var data = layersSheet.getDataRange().getValues();
    var startRow = -1;
    var startCol = -1;
    var headers = [];

    // Search for layer name in ANY column (not just first column)
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        var cellValue = String(data[i][j]).trim();
        if (cellValue === layerName) {
          startRow = i;
          startCol = j;
          headers = data[i + 1]; // Next row is headers
          Logger.log("✓ Found '" + layerName + "' table at row " + (i + 1) + ", col " + (j + 1));
          break;
        }
      }
      if (startRow !== -1) break;
    }

    if (startRow === -1) {
      Logger.log("✗ '" + layerName + "' table not found in Layers sheet");
      return [];
    }

    var items = [];
    var dataStartRow = startRow + 2; // Skip layer name and headers

    // Read until we hit an empty row or another layer
    for (var i = dataStartRow; i < data.length; i++) {
      var row = data[i];

      // Check first column of table for empty or new layer
      var firstCell = String(row[startCol] || "").trim();

      // Stop if empty row or new layer table
      if (firstCell === "" ||
          firstCell === "Layer 1" ||
          firstCell === "Layer 2" ||
          firstCell === "Layer 3") {
        break;
      }

      var item = {};
      for (var j = 0; j < headers.length; j++) {
        if (headers[j]) {
          item[headers[j]] = row[j] || "";
        }
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
  // Get layer configuration
  var layerConfig = getLayerConfig();
  var layersData = {};

  // Load data for each configured layer
  if (layerConfig && layerConfig.length > 0) {
    for (var i = 0; i < layerConfig.length; i++) {
      var layerName = layerConfig[i].layerName;
      layersData[layerName] = getLayerData(layerName);
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
      headers: getHeaders(),
      items: getMainData(),
      columnConfig: getColumnConfig(),
      layerConfig: layerConfig,
      layersData: layersData
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
    headers: getHeaders(),
    items: getMainData(),
    columnConfig: getColumnConfig(),
    layerConfig: layerConfig,
    layersData: layersData
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
 * CRUD Operations (Requires Authentication)
 **************************************************/

function addMainRow(obj, token) {
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

    var sh = getMainSheet_();
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];

    // Auto-fill columns with "addedby" special role
    var configs = getColumnConfig();
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

function getItemByName(name, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var sh = getMainSheet_();
    var data = sh.getDataRange().getValues();
    if (data.length < 2) return null;

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

function editItem(name, updates, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    var sh = getMainSheet_();
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

function deleteItem(name, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    var sh = getMainSheet_();
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
 * Column Management (Creator Only)
 **************************************************/

function saveColumnConfig(configs, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    // Only Creator can manage columns
    if (user.profile !== "Creator") {
      throw new Error("Only Creator can manage columns.");
    }

    var sh = getColumnConfigSheet_();
    var headers = ["Column Name", "Display Name", "Type", "Show in Filter", "Show in Sort", "Item Place", "Special Role"];

    // Clear existing data (except header)
    var lastRow = sh.getLastRow();
    if (lastRow > 1) {
      sh.deleteRows(2, lastRow - 1);
    }

    // Write new config
    var rows = [];
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i];
      var itemPlaceToSave = config.itemPlaceDisplay || config.itemPlace || "";
      var specialRoleToSave = config.specialRoleDisplay || config.specialRole || "";

      rows.push([
        config.columnName || "",
        config.displayName || config.columnName || "",
        config.type || "text",
        config.showInFilter || false,
        config.showInSort || false,
        itemPlaceToSave,
        specialRoleToSave
      ]);
    }

    if (rows.length > 0) {
      sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    return "Column configuration saved successfully.";

  } catch (err) {
    throw new Error("Error saving column config: " + err.message);
  }
}

function addNewColumn(columnName, displayName, type, showInFilter, showInSort, itemPlace, specialRole, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    // Only Creator can manage columns
    if (user.profile !== "Creator") {
      throw new Error("Only Creator can manage columns.");
    }

    // Add column to ColumnConfig sheet
    var configSheet = getColumnConfigSheet_();
    configSheet.appendRow([
      columnName,
      displayName || columnName,
      type || "text",
      showInFilter || false,
      showInSort || false,
      itemPlace || "",
      specialRole || ""
    ]);

    // Add column to Main sheet
    var mainSheet = getMainSheet_();
    var lastCol = mainSheet.getLastColumn();
    mainSheet.getRange(1, lastCol + 1).setValue(columnName);

    return "Column added successfully.";

  } catch (err) {
    throw new Error("Error adding column: " + err.message);
  }
}

function deleteColumn(columnName, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    // Only Creator can manage columns
    if (user.profile !== "Creator") {
      throw new Error("Only Creator can manage columns.");
    }

    // Remove from ColumnConfig sheet
    var configSheet = getColumnConfigSheet_();
    var configData = configSheet.getDataRange().getValues();
    for (var i = 1; i < configData.length; i++) {
      if (configData[i][0] === columnName) {
        configSheet.deleteRow(i + 1);
        break;
      }
    }

    // Remove from Main sheet
    var mainSheet = getMainSheet_();
    var headers = mainSheet.getRange(1, 1, 1, mainSheet.getLastColumn()).getValues()[0];
    var colIndex = indexOfHeader_(headers, columnName);
    if (colIndex !== -1) {
      mainSheet.deleteColumn(colIndex + 1);
    }

    return "Column deleted successfully.";

  } catch (err) {
    throw new Error("Error deleting column: " + err.message);
  }
}

/**************************************************
 * Settings Management (Creator Only)
 **************************************************/

function renameCatalogue(newName, token) {
  try {
    // Verify session
    var sessionResult = verifySession(token);
    if (!sessionResult.success) {
      throw new Error("Authentication required.");
    }

    var user = sessionResult.user;

    // Only Creator can rename catalogue
    if (user.profile !== "Creator") {
      throw new Error("Only Creator can rename the catalogue.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Settings");
    if (!sh) throw new Error("Settings sheet not found.");

    sh.getRange("C3").setValue(newName);
    return "Catalogue renamed successfully.";

  } catch (err) {
    throw new Error("Error renaming catalogue: " + err.message);
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
