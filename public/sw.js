/**
 * Service Worker pour WakeDock PWA
 * Gère la mise en cache, le mode hors ligne et les notifications push
 */

const CACHE_NAME = 'wakedock-v0.5.2';
const API_CACHE_NAME = 'wakedock-api-v0.5.2';
const STATIC_CACHE_NAME = 'wakedock-static-v0.5.2';

// Ressources à mettre en cache
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/containers',
    '/monitoring',
    '/settings',
    '/offline.html',
    '/manifest.json',
    '/favicon.png',
    '/icon-192.png',
    '/icon-512.png'
];

// URLs API à mettre en cache
const API_CACHE_PATTERNS = [
    /\/api\/v1\/health/,
    /\/api\/v1\/containers/,
    /\/api\/v1\/metrics/,
    /\/api\/v1\/user\/preferences/
];

// URLs à ne jamais mettre en cache
const NEVER_CACHE_PATTERNS = [
    /\/api\/v1\/auth/,
    /\/api\/v1\/websocket/,
    /\/_next\/static\/chunks\/pages/,
    /\/hot-update/
];

self.addEventListener('install', (event) => {
    console.log('[SW] Installation du service worker v0.5.2');

    event.waitUntil(
        Promise.all([
            // Cache des ressources statiques
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('[SW] Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            }),

            // Skip waiting pour activer immédiatement
            self.skipWaiting()
        ])
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activation du service worker');

    event.waitUntil(
        Promise.all([
            // Nettoyage des anciens caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (
                            cacheName !== CACHE_NAME &&
                            cacheName !== API_CACHE_NAME &&
                            cacheName !== STATIC_CACHE_NAME
                        ) {
                            console.log('[SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Claim tous les clients
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorer les URLs à ne jamais mettre en cache
    if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        return;
    }

    // Stratégie pour les ressources statiques (Cache First)
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static/')) {
        event.respondWith(handleStaticAssets(request));
        return;
    }

    // Stratégie pour les APIs (Network First avec cache fallback)
    if (url.pathname.startsWith('/api/') && API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(handleApiRequests(request));
        return;
    }

    // Stratégie pour les pages (Network First avec fallback)
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(request));
        return;
    }

    // Par défaut: Network First
    event.respondWith(handleDefault(request));
});

// Gestion des ressources statiques (Cache First)
async function handleStaticAssets(request) {
    try {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            // Mise à jour en arrière-plan
            fetch(request).then(response => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            }).catch(() => {
                // Ignore les erreurs de réseau
            });

            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Erreur ressources statiques:', error);

        // Fallback pour les images
        if (request.destination === 'image') {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#9ca3af">Image</text></svg>', {
                headers: { 'Content-Type': 'image/svg+xml' }
            });
        }

        throw error;
    }
}

// Gestion des requêtes API (Network First avec cache)
async function handleApiRequests(request) {
    try {
        const cache = await caches.open(API_CACHE_NAME);

        // Essayer d'abord le réseau
        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                // Mettre en cache seulement les GET réussis
                if (request.method === 'GET') {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }

            throw new Error(`Network response not ok: ${networkResponse.status}`);
        } catch (networkError) {
            console.log('[SW] Réseau indisponible, utilisation du cache pour:', request.url);

            // Fallback vers le cache
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                // Ajouter un header pour indiquer que c'est du cache
                const response = cachedResponse.clone();
                response.headers.set('X-From-Cache', 'true');
                return response;
            }

            // Réponse par défaut pour les APIs critiques
            if (request.url.includes('/health')) {
                return new Response(JSON.stringify({
                    status: 'offline',
                    message: 'Application en mode hors ligne'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            throw networkError;
        }
    } catch (error) {
        console.error('[SW] Erreur API:', error);
        throw error;
    }
}

// Gestion de la navigation (Network First avec page offline)
async function handleNavigation(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }

        throw new Error(`Navigation response not ok: ${networkResponse.status}`);
    } catch (error) {
        console.log('[SW] Navigation hors ligne:', request.url);

        // Essayer le cache d'abord
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback vers la page offline
        const offlineResponse = await cache.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }

        // Page offline minimaliste en dernier recours
        return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WakeDock - Mode Hors Ligne</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
          .container { max-width: 500px; margin: 0 auto; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { color: #374151; margin-bottom: 1rem; }
          p { color: #6b7280; margin-bottom: 2rem; }
          button { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>Mode Hors Ligne</h1>
          <p>Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.</p>
          <button onclick="window.location.reload()">Réessayer</button>
        </div>
      </body>
      </html>
    `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Gestion par défaut (Network First)
async function handleDefault(request) {
    try {
        return await fetch(request);
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nouvelle notification WakeDock',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: data.tag || 'wakedock-notification',
            data: data.data || {},
            actions: data.actions || [
                {
                    action: 'view',
                    title: 'Voir',
                    icon: '/icon-192.png'
                },
                {
                    action: 'dismiss',
                    title: 'Ignorer'
                }
            ],
            vibrate: [200, 100, 200],
            requireInteraction: data.requireInteraction || false
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'WakeDock', options)
        );
    } catch (error) {
        console.error('[SW] Erreur notification push:', error);
    }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    if (action === 'dismiss') {
        return;
    }

    // Action par défaut ou 'view'
    const urlToOpen = data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Chercher une fenêtre existante avec la bonne URL
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }

            // Ouvrir une nouvelle fenêtre si aucune n'est trouvée
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    try {
        console.log('[SW] Synchronisation en arrière-plan');

        // Synchroniser les données critiques
        const healthResponse = await fetch('/api/v1/health');
        if (healthResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put('/api/v1/health', healthResponse.clone());
        }

        // Autres synchronisations...

    } catch (error) {
        console.error('[SW] Erreur synchronisation:', error);
    }
}

// Gestion des mises à jour du cache
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.payload;
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(urls);
            })
        );
    }
});
