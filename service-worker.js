// service-worker.js
// 每次更新文件后，请更改 CACHE_NAME 的版本号，以确保 Service Worker 更新缓存
const CACHE_NAME = 'mahjong-scorer-cache-v46'; // 版本号已从 v39 更改为 v40
const urlsToCache = [
    '/',
    '/index.html',
    '/scoring.html', // Cache scoring page
    // '/icons/icon-192x192.png', // Uncomment and add if you have icons
    // '/icons/icon-512x512.png', // Uncomment and add if you have icons
    // You might also need to cache Tailwind CSS CDN, but browsers usually cache it themselves
];

// Install Service Worker and cache all files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing and caching assets.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache opened.');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Force Service Worker to activate immediately, skipping waiting state
                return self.skipWaiting();
            })
    );
});

// Intercept network requests, prioritize fetching from cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If found in cache, return the cached resource
                if (response) {
                    return response;
                }
                // Otherwise, fetch from network
                return fetch(event.request);
            })
    );
});

// Activate Service Worker, clear old cache, and immediately control all clients
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating.');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches not in the whitelist
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Immediately control all open clients (pages)
            return self.clients.claim();
        })
    );
    console.log('Service Worker: Activated.');
});
