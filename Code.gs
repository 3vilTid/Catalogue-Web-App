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
  // Verify session if token provided
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

    // Auto-fill "Added By" if column exists
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === "Added By") {
        obj["Added By"] = user.email;
        break;
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

    var headers = data[0];
    for (var r = 1; r < data.length; r++) {
      if (data[r][0] === name) {
        var obj = {};
        for (var c = 0; c < headers.length; c++) {
          obj[headers[c]] = data[r][c];
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
    var headers = ["Column Name", "Display Name", "Type", "Show in Filter", "Show in Sort", "Show in Detail", "Special Role"];

    // Clear existing data (except header)
    var lastRow = sh.getLastRow();
    if (lastRow > 1) {
      sh.deleteRows(2, lastRow - 1);
    }

    // Write new config
    var rows = [];
    for (var i = 0; i < configs.length; i++) {
      var config = configs[i];
      rows.push([
        config.columnName || "",
        config.displayName || config.columnName || "",
        config.type || "text",
        config.showInFilter || false,
        config.showInSort || false,
        config.showInDetail || false,
        config.specialRole || ""
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

function addNewColumn(columnName, displayName, type, showInFilter, showInSort, showInDetail, specialRole, token) {
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
      showInDetail || false,
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
