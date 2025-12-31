/**
 * API Client for Google Apps Script Backend
 *
 * This client mimics the google.script.run interface but uses fetch() to
 * communicate with the Google Apps Script backend deployed as a web app.
 *
 * Migration from google.script.run to api.script.run:
 * - Replace: google.script.run
 * - With: api.script.run
 *
 * The interface is identical, so no other code changes are needed.
 */

(function(window) {
  'use strict';

  // API Client class
  class AppsScriptClient {
    constructor() {
      this.baseUrl = null;
      this.timeout = 30000; // 30 seconds default timeout
      this.debug = false;
    }

    /**
     * Initialize the client with configuration
     */
    init(config) {
      this.baseUrl = config.APPS_SCRIPT_URL;
      this.timeout = config.TIMEOUT || 30000;
      this.debug = config.DEBUG || false;

      if (this.debug) {
        console.log('[API Client] Initialized with URL:', this.baseUrl);
      }

      // Validate URL
      if (!this.baseUrl || this.baseUrl === 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE') {
        console.error(
          '❌ API Client Error: APPS_SCRIPT_URL not configured!\n' +
          'Please update api-config.js with your Google Apps Script deployment URL.'
        );
      }
    }

    /**
     * Create a function call object that mimics google.script.run
     */
    createCall() {
      return new AppsScriptCall(this);
    }

    /**
     * Execute an API call to the Apps Script backend
     * Uses GET with URL parameters to avoid CORS preflight issues
     */
    async execute(functionName, args) {
      if (!this.baseUrl) {
        throw new Error('API Client not initialized. Please configure api-config.js');
      }

      if (this.debug) {
        console.log(`[API Client] Calling ${functionName}(`, args, ')');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        // Encode function call as URL parameters to avoid CORS preflight
        const params = new URLSearchParams({
          function: functionName,
          parameters: JSON.stringify(args)
        });

        const url = `${this.baseUrl}?${params.toString()}`;

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (this.debug) {
          console.log(`[API Client] ${functionName} response:`, result);
        }

        return result;

      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }

        throw error;
      }
    }

    /**
     * Special handler for image requests
     */
    async getImage(fileId) {
      if (!this.baseUrl) {
        throw new Error('API Client not initialized. Please configure api-config.js');
      }

      // Extract base URL without /exec
      const baseUrl = this.baseUrl.replace(/\/exec$/, '');
      const imageUrl = `${baseUrl}/exec?img=${encodeURIComponent(fileId)}`;

      if (this.debug) {
        console.log('[API Client] Fetching image:', imageUrl);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }

        throw error;
      }
    }
  }

  // API Call class that mimics google.script.run behavior
  class AppsScriptCall {
    constructor(client) {
      this.client = client;
      this.successHandler = null;
      this.failureHandler = null;
    }

    /**
     * Set success handler
     */
    withSuccessHandler(callback) {
      this.successHandler = callback;
      return this._createProxy();
    }

    /**
     * Set failure handler
     */
    withFailureHandler(callback) {
      this.failureHandler = callback;
      return this._createProxy();
    }

    /**
     * Create a proxy that intercepts function calls
     */
    _createProxy() {
      const self = this;
      return new Proxy(this, {
        get(target, functionName) {
          // Allow chaining of withSuccessHandler and withFailureHandler
          if (functionName === 'withSuccessHandler' || functionName === 'withFailureHandler') {
            return target[functionName].bind(target);
          }

          // For any other property, treat it as an API function call
          return (...args) => {
            self.client.execute(functionName, args)
              .then((result) => {
                if (self.successHandler) {
                  self.successHandler(result);
                }
              })
              .catch((error) => {
                if (self.failureHandler) {
                  self.failureHandler(error);
                } else {
                  console.error(`[API Client] Unhandled error in ${functionName}:`, error);
                }
              });
          };
        }
      });
    }
  }

  // Enhanced proxy that handles the initial google.script.run call
  const enhancedProxy = new Proxy({}, {
    get(target, prop) {
      // Create a new call for each access
      const call = apiClient.createCall();

      if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
        return call[prop].bind(call);
      }

      // Direct function call without handlers
      return (...args) => {
        apiClient.execute(prop, args)
          .then((result) => {
            console.log(`[API Client] ${prop} completed:`, result);
          })
          .catch((error) => {
            console.error(`[API Client] ${prop} failed:`, error);
          });
      };
    }
  });

  // Create global API client instance
  const apiClient = new AppsScriptClient();

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.API_CONFIG) {
        apiClient.init(window.API_CONFIG);
      }
    });
  } else {
    if (window.API_CONFIG) {
      apiClient.init(window.API_CONFIG);
    }
  }

  // Export the API object that mimics google.script
  window.api = {
    script: {
      run: enhancedProxy
    },
    client: apiClient // Export client for direct access if needed
  };

  // Also create a google.script.run compatible shim for backward compatibility
  if (!window.google) {
    window.google = {};
  }
  if (!window.google.script) {
    window.google.script = {};
  }

  // You can choose to replace google.script.run entirely (recommended for migration)
  // or keep both api.script.run and google.script.run
  window.google.script.run = enhancedProxy;

  console.log('✅ API Client loaded and ready');

})(window);
