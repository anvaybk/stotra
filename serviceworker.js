// Last updated on 27012025

const CACHE_NAME = 'stotra-v1.0.0.0';
const INITIAL_CACHED_RESOURCES = [
        "/", // Cache the root URL
        "/index.html", // Cache HTML file
        "/css/styles.css", // Cache CSS file
        "/css/homestyles",
        "/js/script.js", // Cache JavaScript file
        "/images/shree_gurucharitra_saramrut.jpg",
        "/images/shree_gurucharitra_saramrut.webp",
        "/chapters.html",
        "/home.html",
	"/nityapathhome.html",
        "/pages/chapters1.html",
        "/pages/chapters2.html",
        "/pages/chapters3.html",
        "/pages/chapters4.html",
        "/pages/chapters5.html",
        "/pages/chapters6.html",
        "/pages/chapters7.html",
        "/pages/chapters8.html",
        "/pages/chapters9.html",
        "/pages/chapters10.html",
        "/pages/chapters11.html",
        "/pages/chapters12.html",
        "/pages/chapters13.html",
        "/pages/chapters14.html",
        "/pages/chapters15.html",
        "/pages/chapters16.html",
        "/pages/sankalp.html",
        "/pages/shreedattamantra.html",
        "/pages/saptahikparayan.html",
        "/pages/socialmedia.html",
        "/pages/annualevents.html",
        "/pages/videogallery.html",
        "/pages/audiogallery.html",
        "/pages/photogallery.html",
        "/pages/sangeetsevaparayan.html",
        "/pages/visheshsevaparayan.html",
        "/pages/granthvachanseva.html",
        "/pages/donations.html",
	"/pages/gurucharitra-audio-gallery.html",
	"/pages/kathamrutnondani.html",
	"/pages/nityapath1.html",
	"/pages/nityapath2.html",
	"/pages/nityapath3.html",
	"/pages/nityapath4.html",
	"/pages/nityapath5.html",
	"/pages/nityapath6.html",
	"/pages/nityapath7.html",
	"/pages/nityapath8.html",
	"/pages/nityapath9.html",
	"/pages/nityapath10.html",
	"/pages/nityapath11.html",
	"/pages/nityapath12.html",
	"/pages/nityapath13.html",
	"/pages/nityapath14.html",
	"/pages/nityapath15.html",
	"/pages/nityapath16.html",
	"/pages/nityapath17.html",
	"/pages/nityapath18.html",
	"/pages/nityapath19.html",
	"/pages/nityapath-bhiksha.html",
	"/pages/nityapath-bhiksha1.html",
	"/pages/nityapath-bhiksha2.html",
	"/images/YTube-Icon-40x40.png",
        "/images/Instagram-Icon-40x40.png",
        "/images/Whatsapp-Icon-40x40.png",
        "/images/Google-maps-Icon-40x40.png",
        "/images/Facebook-Icon-40x40.png",
        "/images/Granth-Vachan-Icon-40x40.png",
        "/images/Registration-Icon-40x40.png",
        "/images/Video-Gallery-Icon-40x40.png",
        "/images/Audio-Gallery-Icon-40x40.png",
        "/images/Photo-Gallery-Icon-40x40.png",
        "/images/Social-Media-Icon-40x40.png",
        "/images/AnnualEvent-Icon-40x40.png",
        "/images/Donations-Icon-40x40.png",
        "/images/ContactUs-Icon-40x40.png",
	"/images/Audio-Sangrah-Icon-60x60.png",
	"/images/Google_play_store.svg",
	"/images/icon-256x256.png",
        "/images/hd-datta_photo1.jpg", // Cache images
	"/audios/Gurucharitra-Adhyay-1.mp3",
	"/audios/Gurucharitra-Adhyay-2.mp3",
	"/audios/Gurucharitra-Adhyay-3.mp3",
	"/audios/Gurucharitra-Adhyay-4.mp3",
	"/audios/Gurucharitra-Adhyay-5.mp3",
	"/audios/Gurucharitra-Adhyay-6.mp3",
	"/audios/Gurucharitra-Adhyay-7.mp3",
	"/audios/Gurucharitra-Adhyay-8.mp3",
	"/audios/Gurucharitra-Adhyay-9.mp3",
	"/audios/Gurucharitra-Adhyay-10.mp3",
	"/audios/Gurucharitra-Adhyay-11.mp3",
	"/audios/Gurucharitra-Adhyay-12.mp3",
	"/audios/Gurucharitra-Adhyay-13.mp3",
	"/audios/Gurucharitra-Adhyay-14.mp3",
	"/audios/Gurucharitra-Adhyay-15.mp3",
	"/audios/Gurucharitra-Adhyay-16.mp3"
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
