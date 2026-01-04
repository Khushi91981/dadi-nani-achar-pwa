const CACHE_NAME = "dadi-nani-v1";

const ASSETS = [
  "/public/",
  "/public/index.html",
  "/public/dashboard.html",
  "/public/users.html",
  "/public/orders.html",
  "/public/expenses.html",
  "/public/reports.html",
  "/public/manifest.json",
  "/src/css/style.css",
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});
