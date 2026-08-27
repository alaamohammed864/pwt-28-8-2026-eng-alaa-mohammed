// PTW Manager - Industrial Service Worker for Offline Field Access
const CACHE_NAME = 'ptw-app-shell-v1';
const DATA_CACHE_NAME = 'ptw-permits-data-v1';

// Essential assets to cache during installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
];

// Installation: Cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PTW ServiceWorker] Pre-caching offline app shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PTW ServiceWorker] Some precache items skipped:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up old cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
          .map((name) => {
            console.log('[PTW ServiceWorker] Deleting obsolete cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with Cache fallback for navigation & data; Cache-first with Network refresh for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle synthetic permits data requests
  if (url.pathname === '/api/permits' || url.pathname.endsWith('/permits-data.json')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached permits data when offline
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(JSON.stringify({ offline: true, permits: [] }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              });
            });
          });
      })
    );
    return;
  }

  // Handle fonts, Material Symbols, and static assets with Cache-First strategy
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Refresh cache in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {/* Ignore background fetch failures */});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, fail gracefully
          return new Response('', { status: 408, statusText: 'Offline asset unavailable' });
        });
      })
    );
    return;
  }

  // Default: Network-First with Cache-Fallback for scripts, pages, and dynamic requests
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML navigation request, return cached root page
          if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
            return caches.match('/') || caches.match('/index.html');
          }
          return new Response('Offline: Resource not available in field cache', {
            status: 503,
            statusText: 'Service Unavailable Offline',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// Communication with client app for programmatic caching & diagnostics
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'CACHE_PERMITS_DATA') {
    caches.open(DATA_CACHE_NAME).then((cache) => {
      const permitsBlob = JSON.stringify(payload.permits || []);
      const response = new Response(permitsBlob, {
        headers: {
          'Content-Type': 'application/json',
          'X-PTW-Cached-At': new Date().toISOString(),
          'X-PTW-Permits-Count': String(payload.permits?.length || 0),
        },
        status: 200,
      });

      const metaInfo = JSON.stringify({
        lastSync: new Date().toISOString(),
        count: payload.permits?.length || 0,
        categories: payload.categories || {},
      });
      const metaResponse = new Response(metaInfo, {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });

      Promise.all([
        cache.put('/api/permits', response),
        cache.put('/api/offline-metadata', metaResponse),
      ]).then(() => {
        if (event.source && event.source.postMessage) {
          event.source.postMessage({
            type: 'CACHE_PERMITS_SUCCESS',
            timestamp: new Date().toISOString(),
            count: payload.permits?.length || 0,
          });
        }
      });
    });
  }

  if (type === 'GET_CACHE_DIAGNOSTICS') {
    Promise.all([
      caches.open(DATA_CACHE_NAME).then((c) => c.match('/api/offline-metadata')),
      caches.open(DATA_CACHE_NAME).then((c) => c.match('/api/permits')),
      caches.open(CACHE_NAME).then((c) => c.keys()),
    ]).then(async ([metaRes, permitsRes, shellKeys]) => {
      let meta = null;
      let count = 0;
      if (metaRes) {
        try {
          meta = await metaRes.json();
        } catch (_) {}
      }
      if (permitsRes) {
        count = Number(permitsRes.headers.get('X-PTW-Permits-Count') || 0);
      }

      if (event.source && event.source.postMessage) {
        event.source.postMessage({
          type: 'CACHE_DIAGNOSTICS_RESPONSE',
          data: {
            cacheName: CACHE_NAME,
            dataCacheName: DATA_CACHE_NAME,
            cachedPermitsCount: count,
            lastSync: meta?.lastSync || null,
            cachedShellAssetsCount: shellKeys.length,
            isServiceWorkerActive: true,
          },
        });
      }
    });
  }

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
