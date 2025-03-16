// Last updated on 16032025

const CACHE_NAME = 'stotra-v1.0.0.1';
const INITIAL_CACHED_RESOURCES = [
     "/", // Cache the root URL
        "/index.html", // Cache HTML file
        "/css/styles.css", // Cache CSS file
        "/css/homestyles",
        "/js/script.js", // Cache JavaScript file
        "/images/Annapurna-Devi.jpg",
		"/images/Ashtak-Renuka-Mata-Menu.jpg",
        "/images/Datta-Bhavsudharasa-Stotra.jpg"
		"/images/Dnyeshwar-Maharaj.jpg",
		"/images/Durga-Devi-Menu.jpg",
		"/images/Ganapati-Atharvashirsha-Menu.jpg",
		"/images/Ghora-Kashtodharana-Menu.jpg",
		"/images/mahishasurmardini-Mata-Menu.jpg",
		"/images/Shiv-Tandav-Stotra.jpg"
		"/images/Shree-Lakshmi-Mata-Menu.jpg",
		"/images/Shree-Mohini-Raj-Newasa.jpg",
		"/images/Shree-Sukta-Tuljabhavani-Mata-Menu.jpg",
		"/images/android-launchericon-512-512.jpg",
		"/images/Nitya-Path-Icon-60x60.png"
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
		"/pages/shreesukta.html"

];
// Cached resources that match the following strings should not be periodically updated.
// These are the tips html pages themselves, and their images.
// Everything else, we try to update on a regular basis, to make sure lists of tips get updated and css/js are recent too.
const DONT_UPDATE_RESOURCES = [
    '/videos/'
    // '/audios/'
];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(INITIAL_CACHED_RESOURCES);
    })());
});

// We have a cache-first strategy, where we look for resources in the cache first
// and only on the network if this fails.
// We also periodically update the cache in the background for the main pages.
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        // Try the cache first.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse !== undefined) {
            // Cache hit, let's send the cached resource.
            return cachedResponse;
        } else {
            // Nothing in cache, let's go to the network.

            try {
                const fetchResponse = await fetch(event.request);
                if (!event.request.url.includes('google-analytics') && !event.request.url.includes('browser-sync')) {
                    // Save the new resource in the cache (responses are streams, so we need to clone in order to use it here).
                    cache.put(event.request, fetchResponse.clone());
                }

                // And return it.
                return fetchResponse;
            } catch (e) {
                // Fetching didn't work let's go to the error page.
                if (event.request.mode === 'navigate') {
                    await rememberRequestedTip(event.request.url);
                    const errorResponse = await cache.match('/offline/');
                    return errorResponse;
                }
            }
        }
    })());
});

async function rememberRequestedTip(url) {
    let tips = await localforage.getItem('bg-tips');
    if (!tips) {
        tips = [];
    }

    tips.push(url);
    await localforage.setItem('bg-tips', tips);
}

// Listen to background sync events to load requested tips that couldn't be retrieved when offline.
self.addEventListener('sync', event => {
    if (event.tag === 'bg-load-tip') {
        event.waitUntil(backgroundSyncLoadTips());
    }
});

// Fetch the requested tips now, and put them in cache.
async function backgroundSyncLoadTips() {
    const tips = await localforage.getItem('bg-tips');
    if (!tips || !tips.length) {
        return;
    }

    // Fetch and cache each tip.
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(tips);

    // Re-engage user with a notification.
    registration.showNotification(`${tips.length} DevTools Tips was/were loaded in the background and is/are ready`, {
        icon: "/images/android-chrome-192x192.png",
        body: "View the tip",
        data: tips[0]
    });

    await localforage.removeItem('bg-tips');
}

self.addEventListener('notificationclick', event => {
    // assuming only one type of notification right now
    event.notification.close();
    clients.openWindow(event.notification.data);
});

// Listen the periodic background sync events to update the cached resources.
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
            // Fetch the new version.
            const fetchResponse = await fetch(request);
            // Refresh the cache.
            await cache.put(request, fetchResponse.clone());
        } catch (e) {
            // Fail silently, we'll just keep whatever we already had in the cache.
        }
    }
}

// Find the entries that are already cached and that we do want to update. This way we only
// update these ones and let the user visit new pages when they are online to populate more things
// in the cache.
async function findCacheEntriesToBeRefreshed() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    return requests.filter(request => {
        return !DONT_UPDATE_RESOURCES.some(pattern => request.url.includes(pattern));
    });
}
