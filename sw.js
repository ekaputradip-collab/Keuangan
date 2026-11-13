// Naikkan angka versi ini setiap kali file aplikasi diubah.
var CACHE = "keuangan-v4";
var FILES = ["./", "index.html", "manifest.json", "jspdf.umd.min.js", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Online: selalu ambil versi terbaru dari server lalu simpan. Offline: pakai simpanan.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(new Request(e.request, { cache: "no-cache" })).then(function (res) {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
        return hit || (e.request.mode === "navigate" ? caches.match("index.html") : undefined);
      });
    })
  );
});
