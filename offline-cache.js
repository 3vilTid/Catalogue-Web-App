/**
 * Offline Cache Service for Catalogue Web App
 *
 * Uses IndexedDB to store catalogue data for offline viewing.
 * When offline, the app loads from cache in read-only mode.
 */

(function(window) {
  'use strict';

  const DB_NAME = 'CatalogueOfflineDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'appData';

  class OfflineCacheService {
    constructor() {
      this.db = null;
      this.isOnline = navigator.onLine;
      this.lastUpdated = null;
      this.onStatusChange = null; // Callback for online/offline status changes

      // Listen for online/offline events
      window.addEventListener('online', () => this._handleOnlineStatus(true));
      window.addEventListener('offline', () => this._handleOnlineStatus(false));
    }

    /**
     * Initialize the IndexedDB database
     */
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('❌ Failed to open IndexedDB:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          console.log('✅ Offline cache initialized (IndexedDB)');
          this._loadLastUpdated();
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          // Create object store for app data
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            console.log('📦 Created IndexedDB object store');
          }
        };
      });
    }

    /**
     * Handle online/offline status change
     */
    _handleOnlineStatus(online) {
      const wasOnline = this.isOnline;
      this.isOnline = online;

      console.log(`📡 Network status: ${online ? 'ONLINE' : 'OFFLINE'}`);

      if (this.onStatusChange && wasOnline !== online) {
        this.onStatusChange(online);
      }
    }

    /**
     * Check if we're currently online
     */
    getOnlineStatus() {
      return this.isOnline;
    }

    /**
     * Get last updated timestamp
     */
    getLastUpdated() {
      return this.lastUpdated;
    }

    /**
     * Load last updated timestamp from cache
     */
    async _loadLastUpdated() {
      try {
        const meta = await this.get('_metadata');
        if (meta && meta.lastUpdated) {
          this.lastUpdated = new Date(meta.lastUpdated);
        }
      } catch (e) {
        // Ignore errors
      }
    }

    /**
     * Save data to IndexedDB
     */
    async save(key, data) {
      if (!this.db) {
        console.warn('⚠️ IndexedDB not initialized');
        return false;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const record = {
          key: key,
          data: data,
          timestamp: new Date().toISOString()
        };

        const request = store.put(record);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.error('❌ Failed to save to cache:', request.error);
          reject(request.error);
        };
      });
    }

    /**
     * Get data from IndexedDB
     */
    async get(key) {
      if (!this.db) {
        console.warn('⚠️ IndexedDB not initialized');
        return null;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error('❌ Failed to read from cache:', request.error);
          reject(request.error);
        };
      });
    }

    /**
     * Save complete app data (all items, config, settings)
     */
    async saveAppData(data) {
      try {
        // Save each piece of data separately for flexibility
        await this.save('settings', data.settings);
        await this.save('headers', data.headers);
        await this.save('items', data.items);
        await this.save('columnConfig', data.columnConfig);
        await this.save('layerConfig', data.layerConfig);
        await this.save('layersData', data.layersData);
        await this.save('tabsConfig', data.tabsConfig);
        await this.save('user', data.user);

        // Save metadata
        this.lastUpdated = new Date();
        await this.save('_metadata', {
          lastUpdated: this.lastUpdated.toISOString(),
          version: 1
        });

        console.log('💾 App data cached for offline use');
        return true;
      } catch (error) {
        console.error('❌ Failed to cache app data:', error);
        return false;
      }
    }

    /**
     * Load complete app data from cache
     */
    async loadAppData() {
      try {
        const [settings, headers, items, columnConfig, layerConfig, layersData, tabsConfig, user] = await Promise.all([
          this.get('settings'),
          this.get('headers'),
          this.get('items'),
          this.get('columnConfig'),
          this.get('layerConfig'),
          this.get('layersData'),
          this.get('tabsConfig'),
          this.get('user')
        ]);

        // Check if we have cached data
        if (!items || items.length === 0) {
          console.log('📭 No cached data available');
          return null;
        }

        console.log('📂 Loaded app data from cache');
        return {
          settings,
          headers,
          items,
          columnConfig,
          layerConfig,
          layersData,
          tabsConfig,
          user
        };
      } catch (error) {
        console.error('❌ Failed to load cached data:', error);
        return null;
      }
    }

    /**
     * Save tab-specific data
     */
    async saveTabData(tabIndex, data) {
      try {
        await this.save(`tab_${tabIndex}_items`, data.items);
        await this.save(`tab_${tabIndex}_columnConfig`, data.columnConfig);
        await this.save(`tab_${tabIndex}_layerConfig`, data.layerConfig);
        await this.save(`tab_${tabIndex}_layersData`, data.layersData);
        console.log(`💾 Tab ${tabIndex} data cached`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to cache tab ${tabIndex} data:`, error);
        return false;
      }
    }

    /**
     * Load tab-specific data from cache
     */
    async loadTabData(tabIndex) {
      try {
        const [items, columnConfig, layerConfig, layersData] = await Promise.all([
          this.get(`tab_${tabIndex}_items`),
          this.get(`tab_${tabIndex}_columnConfig`),
          this.get(`tab_${tabIndex}_layerConfig`),
          this.get(`tab_${tabIndex}_layersData`)
        ]);

        if (!items) {
          return null;
        }

        return { items, columnConfig, layerConfig, layersData };
      } catch (error) {
        console.error(`❌ Failed to load tab ${tabIndex} from cache:`, error);
        return null;
      }
    }

    /**
     * Check if cache has data
     */
    async hasCache() {
      const items = await this.get('items');
      return items && items.length > 0;
    }

    /**
     * Clear all cached data
     */
    async clearCache() {
      if (!this.db) return false;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          this.lastUpdated = null;
          console.log('🗑️ Cache cleared');
          resolve(true);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    }

    /**
     * Format last updated time for display
     */
    getLastUpdatedFormatted() {
      if (!this.lastUpdated) return 'Never';

      const now = new Date();
      const diff = now - this.lastUpdated;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      return this.lastUpdated.toLocaleDateString();
    }
  }

  // Create global instance
  const offlineCache = new OfflineCacheService();

  // Export to window
  window.offlineCache = offlineCache;

  console.log('✅ Offline Cache Service loaded');

})(window);
