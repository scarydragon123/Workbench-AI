// Basic service worker for PWA functionality

const CACHE_NAME = 'workshop-ai-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  // Note: We can't cache external resources from cdns in a simple setup
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});