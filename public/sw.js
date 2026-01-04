const CACHE_NAME = "dadi-nani-achar-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/orders.html",
  "/users.html",
  "/expenses.html",
  "/reports.html",
  "/manifest.json",
  "/src/css/style.css",
  "/src/js/firebase.js",
  "/src/js/auth.js",
  "/src/js/orders.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
