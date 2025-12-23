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
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            function: functionName,
            parameters: args
          }),
          signal: controller.signal,
          mode: 'cors',
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
      return this;
    }

    /**
     * Set failure handler
     */
    withFailureHandler(callback) {
      this.failureHandler = callback;
      return this;
    }

    /**
     * Create a function caller
     */
    _createFunctionCaller(functionName) {
      return (...args) => {
        this.client.execute(functionName, args)
          .then((result) => {
            if (this.successHandler) {
              this.successHandler(result);
            }
          })
          .catch((error) => {
            if (this.failureHandler) {
              this.failureHandler(error);
            } else {
              console.error(`[API Client] Unhandled error in ${functionName}:`, error);
            }
          });
      };
    }
  }

  // Proxy handler to intercept function calls
  const scriptRunProxy = new Proxy({}, {
    get(target, functionName) {
      if (functionName === 'withSuccessHandler' || functionName === 'withFailureHandler') {
        const call = apiClient.createCall();
        return call[functionName].bind(call);
      }

      // Return a function that will be called with the actual arguments
      return (...args) => {
        const call = apiClient.createCall();
        const caller = call._createFunctionCaller(functionName);
        return caller(...args);
      };
    }
  });

  // Enhanced proxy that handles chaining
  const enhancedProxy = new Proxy({}, {
    get(target, prop) {
      if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
        const call = apiClient.createCall();
        return call[prop].bind(call);
      }

      // For function calls, create a bound function
      return (...args) => {
        const call = apiClient.createCall();
        return call._createFunctionCaller(prop)(...args);
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
