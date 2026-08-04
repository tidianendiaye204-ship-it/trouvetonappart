// Basic Service Worker pour satisfaire les navigateurs PWA
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Optionnel: On peut ajouter du cache ici plus tard
  // Pour l'instant, on laisse passer toutes les requêtes
});
