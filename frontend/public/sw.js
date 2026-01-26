const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/tasks',
  '/auth/login',
  '/auth/signup',
  '/manifest.json',
  '/img/logo.png',
  '/_next/static/css/main.css',
  '/_next/static/js/main.js'
];

// Install a service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if found
        if (response) {
          return response;
        }
        
        // Clone the request and fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Background Sync Support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Function to sync messages when back online
async function syncMessages() {
  try {
    // Get offline messages from IndexedDB or localStorage
    // Since we're in the service worker context, we need to use IndexedDB
    // For now, we'll skip this implementation and rely on the app-side sync
    console.log('Background sync triggered for messages');
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}

// Activate the service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if(cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    // Trigger sync when app sends a message
    event.waitUntil(triggerAppSync());
  }
});

async function triggerAppSync() {
  // Get all clients (tabs/windows) that are using this service worker
  const clients = await self.clients.matchAll();

  // Send a message back to the clients to initiate sync
  for (const client of clients) {
    client.postMessage({ type: 'TRIGGER_SYNC' });
  }
}