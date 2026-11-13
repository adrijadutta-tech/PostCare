/**
 * PostCare Service Worker
 * Enables offline caching, zero-network load, and PWA installation.
 * Relative asset paths ensure seamless compatibility with GitHub Pages subdirectory deployments.
 */

const CACHE_NAME = "postcare-v1.0.0";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/vendor/qrcode.min.js",
  "./js/data/questions.js",
  "./js/data/epds.js",
  "./js/data/education.js",
  "./js/triageRules.js",
  "./js/db.js",
  "./js/pwa.js",
  "./js/router.js",
  "./js/app.js",
  "./assets/logo.svg",
  "./assets/icons/icon.svg"
];

// Install event: Pre-cache all core static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching core application assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[ServiceWorker] Asset caching warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Cache-first strategy with network fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, fetch fresh copy in background (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Offline, ignore network error
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).catch(() => {
        // If navigation request fails while offline, return cached index.html
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
