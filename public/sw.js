const CACHE_NAME = 'trouve-appart-v1';
const STATIC_ASSETS = [
  '/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', (e) => {
  console.log('[SW] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Certains assets non mis en cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (e) => {
  console.log('[SW] Activate');
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  return self.clients.claim();
});

// Fetch : stratégie Network-first avec fallback cache
self.addEventListener('fetch', (e) => {
  // Ignorer les requêtes non GET et les APIs
  if (
    e.request.method !== 'GET' ||
    e.request.url.includes('/api/') ||
    e.request.url.includes('supabase.co')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Mettre en cache les réponses réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback sur le cache en cas d'absence de réseau
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Page offline par défaut
          if (e.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});
