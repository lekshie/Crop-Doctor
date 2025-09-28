// Service Worker for caching and offline support
const CACHE_NAME = 'leaf-scanner-cache-v1';
const urlsToCache = [
    './index.html',
    '/', // Cache the root path
    './manifest.json', // Cache the manifest
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    // Firebase required scripts for initialization/auth/firestore
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
    // Note: Placeholder icons like 'placeholder-icon-192.png' are not included 
    // as we cannot generate the image files themselves.
];

// Install event: cache all necessary assets
self.addEventListener('install', (event) => {
    // Force the service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cached core assets');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Service Worker: Failed to cache assets during install:', err);
            })
    );
});

// Fetch event: serve content from cache first, then fall back to network (Cache-First strategy)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
