/* أذكار اليوم — تخزين محلي للعمل دون إنترنت */
const CACHE = "athkar-v1";
const PRECACHE = [
  "/",
  "/quran",
  "/adhkar",
  "/today",
  "/qibla",
  "/library",
  "/install",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
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
