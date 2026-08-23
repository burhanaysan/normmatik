// MEB Norm Kadro PWA - Offline Service Worker
//
// !!! DAĞITIM KURALI !!!
// Uygulamada bir değişiklik yaptığınızda CACHE_NAME'i MUTLAKA artırın
// (v2 -> v3 gibi). Aksi halde uygulamayı daha önce açmış kullanıcılarda
// eski sürüm önbellekte kalır ve düzeltmeleriniz onlara ASLA ULAŞMAZ.
// "activate" olayı, adı farklı olan tüm eski önbellekleri siler.
const CACHE_NAME = "meb-normmatik-20260823_2134";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/bundle.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/app_icon.ico"
];
// NOT: "./js/embedded_data.js" (16,5 MB) bu listeden ÇIKARILDI.
// Bu dosya app.html tarafından yüklenmiyor ve pakete de dâhil değil; yalnızca
// her kullanıcının diskinde 16,5 MB yer kaplıyordu.

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => caches.match("./index.html"));
        })
    );
});
