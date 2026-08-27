import { AnyPermit } from '../types';

export interface OfflineCacheDiagnostics {
  isServiceWorkerSupported: boolean;
  isServiceWorkerActive: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
  cachedPermitsCount: number;
  dataCacheName: string;
  shellCacheName: string;
  storageEstimate?: {
    usage?: number;
    quota?: number;
    usageFormatted?: string;
  };
}

const DATA_CACHE_NAME = 'ptw-permits-data-v1';
const CACHE_NAME = 'ptw-app-shell-v1';

/**
 * Register the PTW Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[PTW SW] Service workers are not supported in this browser environment.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.info('[PTW SW] Service Worker successfully registered with scope:', registration.scope);

    // Listen for updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.info('[PTW SW] New content available; please refresh.');
          }
        };
      }
    };

    return registration;
  } catch (error) {
    console.warn('[PTW SW] Service Worker registration failed (this may happen in restricted iframe sandboxes):', error);
    return null;
  }
}

/**
 * Send permits to Service Worker and directly save to CacheStorage for field offline access
 */
export async function syncPermitsToOfflineCache(permits: AnyPermit[]): Promise<{
  success: boolean;
  count: number;
  timestamp: string;
}> {
  const timestamp = new Date().toISOString();
  const count = permits.length;

  try {
    // 1. Direct CacheStorage API update (works even if SW is installing/waiting)
    if ('caches' in window) {
      const cache = await caches.open(DATA_CACHE_NAME);
      const response = new Response(JSON.stringify(permits), {
        headers: {
          'Content-Type': 'application/json',
          'X-PTW-Cached-At': timestamp,
          'X-PTW-Permits-Count': String(count),
        },
        status: 200,
      });

      const meta = new Response(
        JSON.stringify({
          lastSync: timestamp,
          count: count,
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );

      await Promise.all([
        cache.put('/api/permits', response),
        cache.put('/api/offline-metadata', meta),
      ]);
    }

    // 2. Also notify Service Worker via postMessage if active
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_PERMITS_DATA',
        payload: {
          permits,
          timestamp,
        },
      });
    }

    // Save timestamp locally for quick access
    try {
      localStorage.setItem('ptw_last_offline_sync', timestamp);
      localStorage.setItem('ptw_offline_cache_count', String(count));
    } catch (_) {}

    return { success: true, count, timestamp };
  } catch (err) {
    console.error('[PTW SW] Error caching permits offline:', err);
    return { success: false, count: 0, timestamp };
  }
}

/**
 * Fetch cached permits from CacheStorage or Service Worker
 */
export async function fetchCachedPermitsFromCache(): Promise<AnyPermit[] | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }

  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match('/api/permits');
    if (cachedResponse) {
      const data = await cachedResponse.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[PTW SW] Could not fetch cached permits from CacheStorage:', err);
  }
  return null;
}

/**
 * Retrieve diagnostic information about offline storage & Service Worker
 */
export async function getOfflineDiagnostics(): Promise<OfflineCacheDiagnostics> {
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'caches' in window;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  let isActive = false;
  let count = 0;
  let lastSyncTime: string | null = null;

  try {
    lastSyncTime = localStorage.getItem('ptw_last_offline_sync') || null;
    const storedCount = localStorage.getItem('ptw_offline_cache_count');
    if (storedCount) count = parseInt(storedCount, 10);
  } catch (_) {}

  if (isSupported) {
    isActive = !!navigator.serviceWorker.controller;
    try {
      const cache = await caches.open(DATA_CACHE_NAME);
      const metaRes = await cache.match('/api/offline-metadata');
      if (metaRes) {
        const meta = await metaRes.json();
        if (meta.lastSync) lastSyncTime = meta.lastSync;
        if (typeof meta.count === 'number') count = meta.count;
      }
    } catch (_) {}
  }

  let storageEstimate: OfflineCacheDiagnostics['storageEstimate'] = undefined;
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      const usageMB = est.usage ? (est.usage / (1024 * 1024)).toFixed(2) : '0';
      const quotaMB = est.quota ? (est.quota / (1024 * 1024)).toFixed(0) : 'Unknown';
      storageEstimate = {
        usage: est.usage,
        quota: est.quota,
        usageFormatted: `${usageMB} MB / ${quotaMB} MB`,
      };
    } catch (_) {}
  }

  return {
    isServiceWorkerSupported: isSupported,
    isServiceWorkerActive: isActive,
    isOnline,
    lastSyncTime,
    cachedPermitsCount: count,
    dataCacheName: DATA_CACHE_NAME,
    shellCacheName: CACHE_NAME,
    storageEstimate,
  };
}
