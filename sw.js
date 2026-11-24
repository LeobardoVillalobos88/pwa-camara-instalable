const CACHE_STATIC_NAME = 'static-camara-v1';
const STATIC_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
  );
});

// Borra las versiones anteriores de esta app sin tocar las cachés de otras apps del mismo dominio
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key.startsWith('static-camara-') && key !== CACHE_STATIC_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
  );
});

// Primero busca en la caché y si no lo encuentra lo pide a la red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
