const CACHE_NAME = 'nityastotra-v1.0.0.3';

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Dynamically determine the base path of the service worker (e.g., "/stotra")
const BASE_PATH = self.location.pathname.replace(/\/serviceworker\.js$/, '');

// List of resources relative to the base path
const RESOURCE_PATHS = [
    "/", 
    "/index.html",
    "/css/styles.css",
    "/css/homestyles",
    "/js/script.js",
    "/favicon.ico",
	"/home.html",
	"/navratri-aarti.html",
    "/images/Annapurna-Devi.jpg",
    "/images/Shree-Lakshmi-Mata-Menu.jpg",
    "/images/Ashtak-Renuka-Mata-Menu.jpg",
    "/images/Shree-Mohini-Raj-Newasa.jpg",
    "/images/Datta-Bhavsudharasa-Stotra.jpg",
    "/images/Shree-Sukta-Tuljabhavani-Mata-Menu.jpg",
    "/images/mahishasurmardini-Mata-Menu.jpg",
    "/images/Dnyeshwar-Maharaj.jpg",
    "/images/Durga-Devi-Menu.jpg",
    "/images/Ganapati-Atharvashirsha-Menu.jpg",
    "/images/Ghora-Kashtodharana-Menu.jpg",
    "/images/Shiv-Tandav-Stotra.jpg",
    "/images/Hanuman-Chalisa.jpg",
    "/images/Ramraksha-Ramdev.jpg",	
    "/images/favicon-16x16.png",  
    "/images/favicon-32x32.png",
    "/images/icon-48x48.png",
    "/images/icon-72x72.png",
    "/images/icon-96x96.png",
    "/images/icon-128x128.png",
    "/images/icon-144x144.png",
    "/images/icon-152x152.png",
    "/images/icon-192x192.png",
    "/images/icon-256x256.png",
    "/images/icon-384x384.png",
    "/images/icon-512x512.png",
    "/images/icon-1024x1024.png",
    "/images/android-launchericon-512-512.png",
    "/images/screenshot-400x858.png",
    "/images/screenshot-540x720.png",
    "/images/screenshot-720x540.png",
    "/images/screenshot-1280x720.jpg",
    "/images/apple-touch-icon.png",
	"/images/Navaratri-Aarti-Menu.webp",
	"/images/Navaratri-Aarti-Menu.jpg",
    "/pages/annapurna-stotra.html",
    "/pages/datta-bhavsudharasa.html",
    "/pages/devi-ashtak.html",
    "/pages/dnyaneshwari.html",
    "/pages/durga-stotra.html",
    "/pages/ganapati-atharvashirsha.html",
    "/pages/ghora-kashtodharana.html",
    "/pages/lakshmi-stotra.html",
    "/pages/mahishasurmardini.html",
    "/pages/shiv-tandav-stotra.html",
    "/pages/mohiniraj-stotra.html",
    "/pages/privacy-policy.html",
    "/pages/terms-conditions.html",
    "/pages/shreesukta.html",
    "/pages/hanumanchalisa.html",
    "/pages/ramraksha.html",
    "/pages/offline.html",
	"/pages/navaratri-aarti1.html",
	"/pages/navaratri-aarti2.html",
	"/pages/navaratri-aarti3.html",
	"/pages/navaratri-aarti4.html",
	"/pages/navaratri-aarti5.html",
	"/pages/navaratri-aarti6.html",
	"/pages/navaratri-aarti7.html",
	"/pages/navaratri-aarti8.html",
	"/pages/navaratri-aarti9.html",
	"/pages/navaratri-aarti10.html",
	"/pages/navaratri-aarti11.html",
	"/pages/navaratri-aarti12.html",
	"/pages/navaratri-aarti13.html",
	"/pages/navaratri-aarti14.html"
	
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


// Added for Offline Support 20092025

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
            self.clients.claim(); // Take control immediately
            console.log('Old caches cleared, service worker activated.');
        })()
    );
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