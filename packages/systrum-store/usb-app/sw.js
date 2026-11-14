/* Systrum USB Album — Service Worker
 * Network-first for app shell so paywall/player fixes reach phones.
 * Media/data stay cacheable after first fetch.
 */

const CACHE_NAME = 'systrum-usb-v38-ykidr';

const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/app.js',
  './js/router.js',
  './js/player.js',
  './js/analytics.js',
  './js/updates.js',
  './js/media-bridge.js',
  './js/paywall.js',
  './js/dmg-turnstile.js',
  './js/turnstile-config.js'
];

function isNetworkFirst(url) {
  return (
    url.includes('/api/') ||
    url.includes('/checkout-api/') ||
    url.includes('supabase') ||
    url.includes('/data/') ||
    url.includes('/artwork/') ||
    url.includes('/audio/') ||
    url.includes('index.html') ||
    url.includes('/js/') ||
    url.includes('/css/') ||
    url.endsWith('/sw.js') ||
    url.includes('sw.js?') ||
    /usb\.dmgdistro\.com\/?(\?|#|$)/.test(url)
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        /* Partial cache OK */
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            try {
              client.postMessage({ type: 'SYSTRUM_SW_ACTIVATED', cache: CACHE_NAME });
            } catch {
              /* ignore */
            }
          });
        })
      )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYSTRUM_CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: 'SYSTRUM_CACHES_CLEARED' });
        }
      })
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = request.url;

  if (isNetworkFirst(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
