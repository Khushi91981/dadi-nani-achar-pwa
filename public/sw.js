const CACHE_NAME = "dadi-nani-achar-v2";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/orders.html",
  "/users.html",
  "/expenses.html",
  "/products.html",
  "/reports.html",
  "/manifest.json",
  "/src/css/style.css"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  const req = event.request;

  // 🔴 NEVER cache JS files
  if (req.url.includes("/src/js/")) {
    event.respondWith(fetch(req));
    return;
  }

  // 🔴 NEVER cache Firebase / Google APIs
  if (req.url.includes("firebase") || req.url.includes("googleapis")) {
    event.respondWith(fetch(req));
    return;
  }

  // ✅ Cache-first only for static assets
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
