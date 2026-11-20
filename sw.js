/* Curly Tracker · Service Worker
   Caché básica offline + notificaciones locales y push. */
const CACHE = 'curly-tracker-v29';
const SCOPE = self.registration.scope;

const LOCAL_ASSETS = [
  './',
  './index.html',
  './app.js?v=29',
  './manifest.json',
  './icon.svg?v=5',
  './icon-192.png?v=5',
  './icon-512.png?v=5'
];

const REMOTE_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
];

let reminderState = { enabled: true, time: '08:00' };
let reminderTimer = null;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(LOCAL_ASSETS.map((url) => cache.add(new URL(url, SCOPE).href)));
    await Promise.allSettled(REMOTE_ASSETS.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isCacheable(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.hostname.includes('supabase.co')) return false;
  return url.protocol === 'http:' || url.protocol === 'https:';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheable(request)) return;

  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isRemote = url.origin !== self.location.origin;

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(new URL('./index.html', SCOPE).href, network.clone());
        return network;
      } catch (error) {
        const cache = await caches.open(CACHE);
        return (await cache.match(new URL('./index.html', SCOPE).href)) ||
               (await cache.match(new URL('./', SCOPE).href)) ||
               Response.error();
      }
    })());
    return;
  }

  // CDN y fuentes: cache-first con revalidación silenciosa.
  if (isRemote) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request).then((response) => {
        if (response && response.status === 200) cache.put(request, response.clone());
        return response;
      }).catch(() => null);
      if (cached) {
        network.catch(() => {});
        return cached;
      }
      return (await network) || Response.error();
    })());
    return;
  }

  // Recursos propios: network-first para ver cambios al recargar; caché como respaldo offline.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const network = fetch(request).then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    }).catch(() => null);
    const cached = await cache.match(request);
    const response = await network;
    if (response) return response;
    return cached || Response.error();
  })());
});

/* ---------- Notificaciones ---------- */
function minutesFromTime(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time || ''));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

async function showNotification(title, options) {
  if (self.Notification && Notification.permission === 'granted') {
    await self.registration.showNotification(title, Object.assign({
      icon: new URL('./icon.svg?v=5', SCOPE).href,
      badge: new URL('./icon.svg?v=5', SCOPE).href,
      tag: 'curly-tracker-daily',
      renotify: true
    }, options || {}));
  }
}

function scheduleReminder() {
  if (reminderTimer) clearTimeout(reminderTimer);
  if (!reminderState.enabled) return;
  const target = minutesFromTime(reminderState.time);
  if (target === null) return;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  let delay = (target - current) * 60 * 1000 - now.getSeconds() * 1000;
  if (delay < 0) delay += 24 * 60 * 60 * 1000;

  reminderTimer = setTimeout(async () => {
    await showNotification('Curly Tracker', {
      body: 'Tu rutina de hoy está lista. Ábrela para ver los pasos con lo que tienes.',
      data: { url: new URL('./?view=hoy', SCOPE).href },
      actions: [{ action: 'open-routine', title: 'Ver mi rutina' }]
    });
    scheduleReminder();
  }, Math.min(delay, 2147483647));
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SET_REMINDER') {
    reminderState = {
      enabled: Boolean(data.enabled),
      time: data.time || reminderState.time
    };
    scheduleReminder();
  } else if (data.type === 'TEST_NOTIFICATION') {
    event.waitUntil(showNotification('Curly Tracker', {
      body: data.body || 'Notificación de prueba. Todo funciona correctamente.',
      data: { url: new URL('./?view=hoy', SCOPE).href }
    }));
  } else if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (error) { payload = {}; }
  event.waitUntil(showNotification(payload.title || 'Curly Tracker', {
    body: payload.body || 'Tienes un recordatorio de tu rutina capilar.',
    data: payload.data || { url: new URL('./?view=hoy', SCOPE).href }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || new URL('./?view=hoy', SCOPE).href;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      if (client.url.includes(self.location.origin)) {
        await client.focus();
        await client.navigate(target);
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
