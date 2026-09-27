/* أذكار اليوم — كل الملفات تُحفظ على الجهاز */
const CACHE = "athkar-v6";
const PRECACHE = [
  "/",
  "/quran",
  "/adhkar",
  "/today",
  "/qibla",
  "/library",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/prayer-sky.jpg",
  "/fonts/amiri-400.woff2",
  "/fonts/amiri-quran.woff2",
  "/fonts/cairo-400.woff2",
  "/fonts/cairo-600.woff2",
  "/fonts/naskh-400.woff2",
  "/fonts/scheherazade.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

function cacheable(url) {
  const u = new URL(url);
  if (u.origin !== self.location.origin) return false;
  if (u.pathname.startsWith("/@") || u.pathname.includes("node_modules")) return false;
  if (u.searchParams.has("t")) return false;
  return true;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !cacheable(req.url)) return;
  const path = new URL(req.url).pathname;
  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const net = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit || cache.match("/"));
        return hit || net;
      }),
    );
    return;
  }
  const asset =
    path.startsWith("/assets/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/wallpapers/") ||
    /\.(?:js|css|woff2|json|png|svg|jpg|webp)$/.test(path);
  if (asset) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => hit);
        return hit || net;
      }),
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/"))),
  );
});
