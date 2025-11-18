// Basic service worker for PWA functionality

const CACHE_NAME = 'workshop-ai-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './auth.tsx',
  './components.tsx',
  './context.tsx',
  './firebase.ts',
  './firebaseConfig.ts',
  './services.ts',
  './types.ts',
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