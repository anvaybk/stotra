// serviceworker.js

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// ===== Cache Names =====
const CACHE_NAME = 'nitya-stotra-cache-v1';
const OFFLINE_CACHE = 'nitya-offline-cache-v1';
const PRECACHE_ASSETS = [
  '/', '/index.html', '/manifest.json',
  '/images/android-launchericon-512-512.png',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png',
  '/images/favicon-16x16.png',
  '/images/favicon.ico',
  '/css/styles.css',
  '/css/homestyles.css',
  '/js/script.js',
  // Menu Images
  '/images/Ganapati-Atharvashirsha-Menu.jpg',
  '/images/Hanuman-Chalisa.jpg',
  '/images/Ramraksha-Ramdev.jpg',
  '/images/Maruti-Stotra.webp',
  '/images/Annapurna-Devi.jpg',
  '/images/Navaratri-Aarti-Menu.webp',
  '/images/Shiv-Tandav-Stotra.jpg',
  '/images/Ashtak-Renuka-Mata-Menu.jpg',
  '/images/Shree-Sukta-Tuljabhavani-Mata-Menu.jpg',
  '/images/Shree-Lakshmi-Mata-Menu.jpg',
  '/images/Durga-Devi-Menu.jpg',
  '/images/Shree-Mohini-Raj-Newasa.jpg',
  '/images/mahishasurmardini-Mata-Menu.jpg',
  '/images/Dnyeshwar-Maharaj.jpg',
  '/images/Ghora-Kashtodharana-Menu.jpg',
  '/images/Datta-Bhavsudharasa-Stotra.jpg'
];
const OFFLINE_FALLBACK_PAGE = '/offline.html';

const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net'
];

// ===== IndexedDB Queue for Background Sync =====
const DB_NAME = 'nitya-sync-db';
const STORE_NAME = 'request-queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addRequestToQueue(url, options) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({ url, options });
  return tx.complete;
}

async function getQueuedRequests() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const all = store.getAll();
    all.onsuccess = () => resolve(all.result);
    all.onerror = () => reject(all.error);
  });
}

async function removeQueuedRequest(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  return tx.complete;
}

// ===== Utility =====
const getFixedUrl = (req) => {
  const now = Date.now();
  const url = new URL(req.url);
  url.protocol = self.location.protocol;
  if (url.hostname === self.location.hostname) {
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  }
  return url.href;
};

// ===== Install Event =====
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_FALLBACK_PAGE))
  );
  self.skipWaiting();
});

// ===== Activate Event =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![CACHE_NAME, OFFLINE_CACHE].includes(key)) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===== Fetch Handling with Full Offline Support =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle POST requests offline via background sync
  if (event.request.method === 'POST' && HOSTNAME_WHITELIST.includes(url.hostname)) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(async () => {
          const clonedReq = event.request.clone();
          let body = null;
          try { body = await clonedReq.json(); } catch { body = null; }

          await addRequestToQueue(clonedReq.url, {
            method: 'POST',
            headers: [...clonedReq.headers],
            body: body ? JSON.stringify(body) : null
          });

          if ('sync' in self.registration) {
            self.registration.sync.register('sync-new-data');
          }

          return new Response(JSON.stringify({ message: 'Request queued for sync.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Navigation requests (pages)
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        const offlineCache = await caches.open(OFFLINE_CACHE);
        return offlineCache.match(OFFLINE_FALLBACK_PAGE);
      }
    })());
    return;
  }

  // Other requests (CSS, JS, images, API)
  if (HOSTNAME_WHITELIST.includes(url.hostname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return fetch(getFixedUrl(event.request), { cache: 'no-store' })
          .then((networkResp) => {
            if (networkResp.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResp.clone()));
            }
            return networkResp;
          })
          .catch(() => cached || new Response('Offline', { status: 503, statusText: 'Offline' }));
      })
    );
  }
});

// ===== Background Sync =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-data') {
    event.waitUntil(processQueue());
  }
});

async function processQueue() {
  const requests = await getQueuedRequests();
  for (const req of requests) {
    try {
      const response = await fetch(req.url, req.options);
      if (response.ok) {
        await removeQueuedRequest(req.id);
        console.log('[SW] Successfully synced request:', req.url);
      }
    } catch {
      console.error('[SW] Failed to sync request, will retry later:', req.url);
    }
  }
}

// ===== Push Notifications =====
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nitya Stotra', body: 'New content available!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/android-launchericon-512-512.png',
      badge: '/images/favicon-32x32.png',
      data: data.url || '/'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlToOpen = new URL(event.notification.data, self.location.origin).href;
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// ===== Periodic Sync (Experimental) =====
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-content') {
    event.waitUntil(refreshContent());
  }
});

async function refreshContent() {
  try {
    const response = await fetch('/api/latest-stotras');
    const data = await response.json();
    console.log('[SW] Periodic sync fetched latest stotras:', data);
  } catch {
    console.error('[SW] Periodic sync failed');
  }
});

// ===== Workbox Caching Strategies =====
if (workbox) {
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|webp|svg)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'nitya-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
      ]
    })
  );

  workbox.routing.registerRoute(
    new RegExp('/api/.*'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'nitya-api-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 })
      ]
    })
  );

  if (workbox.navigationPreload.isSupported()) workbox.navigationPreload.enable();
}

// ===== Message Handling =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});