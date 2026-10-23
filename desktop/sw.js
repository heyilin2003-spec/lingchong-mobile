const CACHE = 'lc-desktop-202610231737';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isDoc) {
    // HTML 走「网络优先」：有网永远是刚发布的版本，断网才用缓存
    e.respondWith(fetch(req, { cache: 'no-store' }).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    const copy = r.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
    return r;
  }).catch(() => null)));
});
