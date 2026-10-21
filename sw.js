const CACHE_NAME = "arrival-time-pwa-v16";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 實時 API 永遠直接聯網抓取最新數據
  if (
    url.hostname.includes("data.gov.hk") ||
    url.hostname.includes("etabus.gov.hk") ||
    url.hostname.includes("etagmb.gov.hk") ||
    url.hostname.includes("weather.gov.hk") ||
    url.hostname.includes("geodata.gov.hk") ||
    url.hostname.includes("open-meteo.com") ||
    url.hostname.includes("workers.dev") ||
    url.hostname.includes("project-osrm.org") ||
    url.hostname.includes("openstreetmap.de") ||
    url.hostname.includes("overpass-api.de") ||
    url.hostname.includes("hkbus.app") ||
    url.hostname.includes("mtr.com.hk")
  ) {
    return;
  }

  // HTML 主頁採用 Network-First 策略，確保更新後即時生效
  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});