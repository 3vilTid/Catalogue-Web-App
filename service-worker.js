// Service Worker for Catalogue PWA
// Version 10.0.0 - Add offline mode support

const CACHE_NAME = 'catalogue-pwa-v10-0';
const RUNTIME_CACHE = 'catalogue-runtime-v10-0';
const IMAGE_CACHE = 'catalogue-images-v10-0';

// Assets to cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './api-config.js',
  './api-client.js',
  './offline-cache.js'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !currentCaches.includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle image requests from Apps Script (cache them for offline)
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('script.googleusercontent.com')) {

    // Check if this is an image request (has img= parameter)
    if (url.searchParams.has('img')) {
      event.respondWith(
        caches.open(IMAGE_CACHE)
          .then((cache) => {
            return cache.match(request)
              .then((cachedResponse) => {
                // Return cached image immediately if available
                const fetchPromise = fetch(request)
                  .then((networkResponse) => {
                    // Cache the new image
                    if (networkResponse && networkResponse.ok) {
                      cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                  })
                  .catch(() => {
                    // Network failed, return cached if available
                    return cachedResponse;
                  });

                // Return cached response immediately, or wait for network
                return cachedResponse || fetchPromise;
              });
          })
      );
      return;
    }

    // Skip other Apps Script API requests (data should use IndexedDB)
    return;
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then((response) => {
        // Don't cache non-successful responses or opaque responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the fetched response
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving from cache:', request.url);
              return cachedResponse;
            }

            // If not in cache and network failed, return offline page
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Received CLEAR_CACHE message');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('[Service Worker] Loaded');
