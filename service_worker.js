// Define the cache name based on the current version of the PWA shell
const CACHE_NAME = 'ai-crop-doctor-v2';

// List of files that form the "app shell" and should be cached on install
// Note: External libraries are included for robust offline support, but ensure
// you update the CACHE_NAME if these URLs change in index.html!
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    // Placeholder image
    'https://placehold.co/600x400/bbf7d0/16a34a?text=Upload+a+Leaf'
];

// --- INSTALL EVENT ---
// Caches all the core assets
self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching App Shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// --- ACTIVATE EVENT ---
// Cleans up old caches to ensure only the latest version is used
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure the service worker takes control of the page immediately
    self.clients.claim();
});

// --- FETCH EVENT ---
// Intercepts network requests and serves content from the cache if available (Cache-First strategy)
self.addEventListener('fetch', (event) => {
    // Only intercept requests for resources, not API calls (like Gemini or Firestore)
    const isApiCall = event.request.url.includes('generativelanguage.googleapis.com') || event.request.url.includes('firestore.googleapis.com');
    
    if (isApiCall) {
        // For dynamic API calls, go straight to the network
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return the cached response if it exists
                if (response) {
                    return response;
                }
                
                // If not in cache, fetch from the network
                return fetch(event.request)
                    .catch(() => {
                        // This catch block handles network failures.
                        // You could serve an offline page here if you had one.
                        console.log('[ServiceWorker] Fetch failed for:', event.request.url);
                        // Fallback response for images or other assets if desired
                    });
            })
    );
});
