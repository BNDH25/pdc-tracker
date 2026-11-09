/* PDC Tracker - mode hors ligne.
   Changer VERSION à chaque mise à jour de l'app pour forcer le rafraîchissement du cache. */
const VERSION = 'pdc-v18';
const LOCAL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(LOCAL);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // Le reste (icônes, polices, jsPDF) : cache d'abord, puis réseau et mise en cache
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    const u = req.url;
    if (r.ok || r.type === 'opaque') {
      if (u.startsWith(self.location.origin) || u.includes('fonts.g')) {
        const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp));
      }
    }
    return r;
  })));
});
