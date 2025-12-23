/**
 * API Configuration for Catalogue Web App
 *
 * IMPORTANT: After deploying to GitHub Pages, you MUST update the APPS_SCRIPT_URL
 * with your Google Apps Script deployment URL.
 *
 * To get your Apps Script URL:
 * 1. Open your Google Apps Script project
 * 2. Click "Deploy" → "Manage deployments"
 * 3. Copy the "Web app" URL
 * 4. Paste it below (replace the placeholder)
 *
 * Example URL format:
 * https://script.google.com/macros/s/AKfycbx.../exec
 */

const API_CONFIG = {
  // Google Apps Script deployment URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwL3M6fJ2bixVnrJi4iY0HUtu_XcXwWCcm6Tx2S1Sn0bZESR1G0bdaiyZar2YiSREABHg/exec',

  // API timeout in milliseconds (30 seconds)
  TIMEOUT: 30000,

  // Enable debug logging
  DEBUG: false
};

// Validation check
if (API_CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE') {
  console.warn(
    '⚠️ WARNING: API_CONFIG.APPS_SCRIPT_URL is not configured!\n' +
    'Please update api-config.js with your Google Apps Script deployment URL.\n' +
    'See the comments in api-config.js for instructions.'
  );
}

// Export for use in index.html
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
