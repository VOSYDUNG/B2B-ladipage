// This service worker immediately unregisters itself.
// It exists to replace any previously-cached service worker
// from a different app that was hosted on this same domain.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => caches.delete(name)))
    ).then(() => self.registration.unregister())
  );
});
