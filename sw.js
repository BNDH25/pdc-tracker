/* PDC Tracker - mode hors ligne.
   Changer VERSION à chaque mise à jour de l'app pour forcer le rafraîchissement du cache.
   SÉCURITÉ : seuls les fichiers de l'app elle-même (même site) sont mis en cache ; rien d'extérieur. */
const VERSION = 'pdc-v27';
const LOCAL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'fonts/barlow-400.woff', 'fonts/barlow-500.woff', 'fonts/barlow-600.woff', 'fonts/barlow-700.woff'];

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
  if (new URL(req.url).origin !== self.location.origin) return; // jamais de contenu extérieur
  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      if (r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); }
      return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  // Le reste (icônes, polices) : cache d'abord, puis réseau
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
