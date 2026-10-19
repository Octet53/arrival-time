const CACHE_NAME = "arrival-time-pwa-v13";
const ASSETS = ["./", "./index.html", "./manifest.json"];

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
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = req.url || "";
  if (
    url.includes("data.etabus.gov.hk") ||
    url.includes("rt.data.gov.hk") ||
    url.includes("data.etagmb.gov.hk") ||
    url.includes("data.weather.gov.hk") ||
    url.includes("api.open-meteo.com") ||
    url.includes("mapapi.geodata.gov.hk") ||
    url.includes("router.project-osrm.org") ||
    url.includes("routing.openstreetmap.de") ||
    url.includes("overpass-api.de") ||
    url.includes("data.hkbus.app") ||
    url.includes("workers.dev")
  ) {
    return;
  }
  if (req.mode === "navigate" || url.endsWith("index.html") || url.endsWith("/")) {
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
