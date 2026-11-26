
const V = "lich-ot-v4";

const F = [
  "./",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(F))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== V).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  // Luôn ưu tiên tải HTML mới từ Netlify
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(V).then(c => c.put("./", copy));
          }
          return response;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }

  // Cache First cho tài nguyên tĩnh
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request))
  );
});
