const CACHE_NAME = 'site-cache-v1';
const CACHE_LIFETIME = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
const urlsToCache = ['/', '/index.html', '/about.html', '/contact.html', /* other resources */];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
            return response || fetchPromise;
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

setInterval(() => {
    caches.delete(CACHE_NAME).then(() => {
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache));
    });
}, CACHE_LIFETIME);
