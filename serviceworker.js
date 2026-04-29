// Last updated on 29042026

const CACHE_NAME = 'stotra-v1.0.0.5';

// Dynamically determine the base path (e.g., "/stotra")
const BASE_PATH = self.location.pathname.replace(/\/serviceworker\.js$/, '');

const RESOURCE_PATHS = [
    // your existing list here...
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

// Prepend BASE_PATH to every resource
const INITIAL_CACHED_RESOURCES = RESOURCE_PATHS.map(path => `${BASE_PATH}${path}`);

const DONT_UPDATE_RESOURCES = ['/videos/'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(INITIAL_CACHED_RESOURCES);
            console.log('Resources cached successfully');
        } catch (error) {
            console.error('Failed to cache resources:', error);
        }
    })());
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Ignore non-HTTP(s) requests (e.g., chrome-extension://, file://, etc.)
    if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const fetchResponse = await fetch(event.request);
            if (
                event.request.method === 'GET' &&
                !event.request.url.includes('google-analytics') &&
                !event.request.url.includes('browser-sync')
            ) {
                cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
        } catch (e) {
            if (event.request.mode === 'navigate') {
                await rememberRequestedTip(event.request.url);
                return await cache.match(`${BASE_PATH}/offline.html`);
            }
        }
    })());
});

async function rememberRequestedTip(url) {
    let tips = await localforage.getItem('bg-tips') || [];
    tips.push(url);
    await localforage.setItem('bg-tips', tips);
}

self.addEventListener('sync', event => {
    if (event.tag === 'bg-load-tip') {
        event.waitUntil(backgroundSyncLoadTips());
    }
});

async function backgroundSyncLoadTips() {
    const tips = await localforage.getItem('bg-tips');
    if (!tips || tips.length === 0) return;

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(tips);

    registration.showNotification(`${tips.length} tips loaded`, {
        icon: `${BASE_PATH}/images/icon-256x256.png`,
        body: "Tap to view",
        data: tips[0]
    });

    await localforage.removeItem('bg-tips');
}

self.addEventListener('notificationclick', event => {
    event.notification.close();
    clients.openWindow(event.notification.data);
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cached-content') {
        event.waitUntil(updateCachedContent());
    }
});

async function updateCachedContent() {
    const requests = await findCacheEntriesToBeRefreshed();
    const cache = await caches.open(CACHE_NAME);

    for (const request of requests) {
        try {
            const fetchResponse = await fetch(request);
            await cache.put(request, fetchResponse.clone());
        } catch (e) {
            // Fail silently
        }
    }
}

async function findCacheEntriesToBeRefreshed() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    return requests.filter(request => {
        return !DONT_UPDATE_RESOURCES.some(pattern => request.url.includes(pattern));
    });
}

// ===== Push Notifications =====
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nitya Stotra', body: 'New Update available!' };
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
