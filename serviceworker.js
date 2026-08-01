// ===============================
// NITYA STOTRA SERVICE WORKER
// ===============================

// Last updated: 01-08-2026

const VERSION = '01082028-1007';
const CACHE_NAME = `nityastotra-${VERSION}`;

// Detect base path dynamically
const BASE_PATH = self.location.pathname.replace(/\/serviceworker\.js$/, '');

// ===============================
// FILES TO PRE-CACHE
// ===============================

const RESOURCE_PATHS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',

    // CSS
    '/css/style.css',

    // JS
    '/js/app.js',

    // Icons
    '/images/icon-192x192.png',
    '/images/icon-256x256.png'
];

// Convert to full paths
const INITIAL_CACHED_RESOURCES =
    RESOURCE_PATHS.map(path => `${BASE_PATH}${path}`);

// Files/folders excluded from auto-refresh
const DONT_UPDATE_RESOURCES = [
    '/videos/'
];

// ===============================
// INSTALL
// ===============================

self.addEventListener('install', event => {

    console.log('Service Worker Installing...');

    // Activate immediately
    self.skipWaiting();

    event.waitUntil((async () => {

        try {

            const cache = await caches.open(CACHE_NAME);

            await cache.addAll(INITIAL_CACHED_RESOURCES);

            console.log('Pre-cache completed');

        } catch (error) {

            console.error('Pre-cache failed:', error);

        }

    })());

});

// ===============================
// ACTIVATE
// ===============================

self.addEventListener('activate', event => {

    console.log('Service Worker Activating...');

    event.waitUntil((async () => {

        // Remove old caches
        const cacheNames = await caches.keys();

        await Promise.all(
            cacheNames.map(cache => {

                if (cache !== CACHE_NAME) {

                    console.log('Deleting old cache:', cache);

                    return caches.delete(cache);
                }

            })
        );

        // Take control immediately
        await clients.claim();

        console.log('Service Worker Activated');

    })());

});

// ===============================
// FETCH
// ===============================

self.addEventListener('fetch', event => {

    // Only GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);

    // Ignore unsupported protocols
    if (
        requestUrl.protocol !== 'http:' &&
        requestUrl.protocol !== 'https:'
    ) {
        return;
    }

    // Ignore analytics
    if (
        requestUrl.href.includes('google-analytics') ||
        requestUrl.href.includes('browser-sync')
    ) {
        return;
    }

    const acceptHeader =
        event.request.headers.get('accept') || '';

    const isHTML =
        acceptHeader.includes('text/html');

    event.respondWith((async () => {

        const cache = await caches.open(CACHE_NAME);

        // ==========================================
        // NETWORK FIRST FOR HTML PAGES
        // ==========================================

        if (isHTML) {

            try {

                // Try latest from network
                const networkResponse =
                    await fetch(event.request);

                // Save latest version
                cache.put(
                    event.request,
                    networkResponse.clone()
                );

                return networkResponse;

            } catch (error) {

                console.log('Offline HTML fallback');

                // Offline fallback
                return (
                    await cache.match(event.request)
                ) || (
                    await cache.match(`${BASE_PATH}/offline.html`)
                );
            }
        }

        // ==========================================
        // CACHE FIRST + BACKGROUND UPDATE
        // FOR STATIC FILES
        // ==========================================

        const cachedResponse =
            await cache.match(event.request);

        if (cachedResponse) {

            // Update in background
            fetch(event.request)
                .then(networkResponse => {

                    if (
                        networkResponse &&
                        networkResponse.status === 200
                    ) {

                        cache.put(
                            event.request,
                            networkResponse.clone()
                        );
                    }

                })
                .catch(() => {
                    // Ignore update failures
                });

            return cachedResponse;
        }

        // ==========================================
        // NOT IN CACHE → FETCH FROM NETWORK
        // ==========================================

        try {

            const networkResponse =
                await fetch(event.request);

            // Cache valid responses
            if (
                networkResponse &&
                networkResponse.status === 200
            ) {

                const shouldCache =
                    !DONT_UPDATE_RESOURCES.some(pattern =>
                        event.request.url.includes(pattern)
                    );

                if (shouldCache) {

                    cache.put(
                        event.request,
                        networkResponse.clone()
                    );
                }
            }

            return networkResponse;

        } catch (error) {

            console.log('Fetch failed:', event.request.url);

            // Optional image fallback
            if (
                event.request.destination === 'image'
            ) {
                return cache.match(
                    `${BASE_PATH}/images/offline-image.png`
                );
            }

            // Offline page for navigation
            if (event.request.mode === 'navigate') {

                return cache.match(
                    `${BASE_PATH}/offline.html`
                );
            }

            return new Response('Offline', {
                status: 503,
                statusText: 'Offline'
            });
        }

    })());

});

// ===============================
// BACKGROUND SYNC
// ===============================

self.addEventListener('sync', event => {

    if (event.tag === 'bg-load-tip') {

        event.waitUntil(
            backgroundSyncLoadTips()
        );
    }

});

// ===============================
// LOAD SAVED PAGES
// ===============================

async function backgroundSyncLoadTips() {

    try {

        const tips =
            await localforage.getItem('bg-tips');

        if (!tips || tips.length === 0) {
            return;
        }

        const cache =
            await caches.open(CACHE_NAME);

        await cache.addAll(tips);

        registration.showNotification(
            `${tips.length} tips loaded`,
            {
                icon: `${BASE_PATH}/images/icon-256x256.png`,
                body: 'Tap to view',
                data: tips[0]
            }
        );

        await localforage.removeItem('bg-tips');

    } catch (error) {

        console.error(
            'Background sync failed:',
            error
        );
    }

}

// ===============================
// NOTIFICATION CLICK
// ===============================

self.addEventListener('notificationclick', event => {

    event.notification.close();

    event.waitUntil(
        clients.openWindow(
            event.notification.data
        )
    );

});

// ===============================
// OPTIONAL MANUAL CACHE REFRESH
// ===============================

async function refreshCachedContent() {

    const cache =
        await caches.open(CACHE_NAME);

    const requests =
        await cache.keys();

    for (const request of requests) {

        try {

            const shouldUpdate =
                !DONT_UPDATE_RESOURCES.some(pattern =>
                    request.url.includes(pattern)
                );

            if (!shouldUpdate) {
                continue;
            }

            const response =
                await fetch(request);

            if (response.status === 200) {

                await cache.put(
                    request,
                    response.clone()
                );
            }

        } catch (error) {

            console.log(
                'Refresh failed:',
                request.url
            );
        }
    }
}

console.log('Service Worker Loaded');