// Othentik — service worker : la coquille de l'application s'ouvre même sans réseau ;
// les données, elles, viennent toujours du serveur (jamais mises en cache ici).
const CACHE = "othentik-coquille-v1";
const COQUILLE = ["./", "./manifest.webmanifest", "./icons/icone-192.png", "./icons/icone-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;           // API, Supabase, polices : jamais interceptés
  if (e.request.mode === "navigate") {                                                      // la page : réseau d'abord, cache en secours
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put("./", c)); return r; })
      .catch(() => caches.match("./")));
    return;
  }
  if (url.pathname.includes("/icons/") || url.pathname.endsWith("manifest.webmanifest")) {  // icônes : cache d'abord
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
