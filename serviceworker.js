// serviceworker.js

const CACHE_NAME = 'nitya-stotra-cache-v1';

// ===== Assets to precache =====
const PRECACHE_ASSETS = [
    '/',  // index.html
    '/index.html',
    '/manifest.json',
    '/images/android-launchericon-512-512.png',
    '/images/apple-touch-icon.png',
    '/images/favicon-32x32.png',
    '/images/favicon-16x16.png',
    '/images/favicon.ico',
    '/css/styles.css',
    '/css/homestyles.css',
    '/js/script.js',

    // Add all menu images you have
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

// ===== Utility =====
const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
	'*.youtube.googleapis.com',
	'*.play.google.com',
	'*.googletagmanager.com',
	'drive.google.com',
    'cdn.jsdelivr.net'
];

const getFixedUrl = (req) => {
    const now = Date.now();
    const url = new URL(req.url);
    url.protocol = self.location.protocol;
    if (url.hostname === self.location.hostname) {
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
    }
    return url.href;
};

// ===== Lifecycle Events =====
self.addEventListener('install', event => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Precaching assets');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Deleting old cache:', key);
                    return caches.delete(key);
                }
            }))
        )
    );
    self.clients.claim();
});

// ===== Fetch Handling =====
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (HOSTNAME_WHITELIST.includes(url.hostname)) {
        const cached = caches.match(event.request);
        const fetched = fetch(getFixedUrl(event.request), { cache: 'no-store' });
        const fetchedCopy = fetched.then(resp => resp.clone());

        event.respondWith(
            Promise.race([fetched.catch(_ => cached), cached])
                .then(resp => resp || fetched)
                .catch(_ => new Response('Offline', { status: 503, statusText: 'Offline' }))
        );

        event.waitUntil(
            Promise.all([fetchedCopy, caches.open(CACHE_NAME)])
                .then(([response, cache]) => response.ok && cache.put(event.request, response))
                .catch(_ => { /* ignore errors */ })
        );
    }
});

// ===== Messaging =====
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    if (event.source) {
        event.source.postMessage({ received: true, original: event.data });
    }
});