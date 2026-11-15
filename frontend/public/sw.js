// EduFinder CYL - Service Worker
const CACHE_VERSION = 'v1.3.0';
const CACHE_NAME = `edufinder-cyl-${CACHE_VERSION}`;
const API_CACHE_NAME = `edufinder-api-${CACHE_VERSION}`;

// Recursos estáticos principales
const STATIC_ASSETS = [
  '/',
  '/mapa',
  '/offline',
  '/manifest.json',
  '/img/logo-edufinderCYL.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => console.error('[SW] Error instalando:', error))
  );
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name.startsWith('edufinder') && name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const isApi = url.pathname.startsWith('/api/');

  // API: network-first. Las respuestas con sesión (Authorization) no se guardan en caché:
  // son datos personales y no deben quedarse en el dispositivo tras cerrar sesión
  if (isApi) {
    if (request.headers.get('Authorization')) return;
    event.respondWith(networkFirst(request));
    return;
  }

  // Otros orígenes (teselas del mapa, fuentes...): los gestiona la caché HTTP del navegador
  if (url.origin !== self.location.origin) return;

  // Recursos con hash en el nombre (inmutables) e imágenes propias: cache-first
  if (isImmutableAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navegación: network-first para que tras cada despliegue se vea la versión nueva;
  // sin conexión se sirve la copia guardada o la página offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  event.respondWith(networkFirst(request));
});

function isImmutableAsset(pathname) {
  if (pathname.startsWith('/_next/static/')) return true;
  return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2'].some(ext => pathname.endsWith(ext));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName = API_CACHE_NAME) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('/offline');
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Mensajes
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'EduFinder CYL', {
      body: data.body || 'Nueva notificación',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
