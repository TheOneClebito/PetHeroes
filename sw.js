/* Pet Heroes Companion — service worker (offline cache) */
const CACHE = "ph-companion-v43";
const CORE = [
  "./", "./index.html", "./css/styles.css", "./js/app.js",
  "./js/data/meta.js", "./js/data/pets.js", "./js/data/inv_order.js", "./js/data/sources.js",
  "./js/data/areas.js", "./js/data/rebirths.js", "./js/data/leaders.js",
  "./js/data/leaders_pve.js",
  "./js/data/types.js", "./js/data/income.js", "./js/data/events.js", "./js/data/store.js",
  "./js/data/petdex.js", "./js/data/trades.js", "./js/data/shop_rotation.js", "./js/i18n.js", "./js/translations.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./images/logo.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* network-first (so edited data shows up after redeploy), falling back to cache when offline */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
