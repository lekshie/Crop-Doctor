const CACHE_NAME = 'leaf-scanner-cache-v1';
const urlsToCache = [
    './', // Caches the main index.html file
    'index.html',
    'https://cdn.tailwindcss.com', // Caches the Tailwind library
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap', // Caches the font
    // Include paths to your deployed icon files (e.g., '/icons/leaf-icon-192.png')
];

// Install event: caches the core app shell files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: serves content from the cache first, then falls back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request/response to allow it to be read once for the cache, and once for the browser.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        // Cache dynamic assets if they are successful HTTP GET requests
                        if (event.request.method === 'GET' && !event.request.url.includes('googleapis.com')) {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    }
                );
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
