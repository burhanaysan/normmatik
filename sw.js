// NormMatik™ — Çevrimdışı Service Worker
//
// !!! DAĞITIM KURALI !!!
// Uygulamada bir değişiklik yaptığınızda CACHE_NAME'i MUTLAKA artırın.
// Aksi halde uygulamayı daha önce açmış kullanıcılarda eski sürüm
// önbellekte kalır ve düzeltmeleriniz onlara ASLA ULAŞMAZ.
// Bu etiketi `python tools/build_bundle.py` otomatik tazeler.
//
// ================== 2026-08-24'TE DÜZELTİLEN HATA ==================
// Önbelleğe "./js/bundle.js" yazılıyordu, ama sayfa dosyayı
// "js/bundle.js?v=20260824_1423" diye istiyor. caches.match() varsayılan
// olarak sorgu dizesini de karşılaştırdığı için bu ikisi ASLA eşleşmiyordu.
// Sonuç:
//   - 5,3 MB'lık paket her kullanıcının diskine indiriliyor ama hiç
//     kullanılmıyordu (kurulumda bir kez, sayfa açılışında bir kez daha).
//   - Çevrimdışı çalışma aslında HİÇ çalışmıyordu.
// Üstüne "./app.html" önbellek listesinde yoktu; yalnızca index.html vardı,
// yani asıl uygulama sayfası zaten çevrimdışı açılamıyordu.
//
// Çözüm: eşleştirmede { ignoreSearch: true } ve app.html'in listeye
// eklenmesi. Ayrıca çalışma anında indirilen dosyalar da önbelleğe alınıyor.
// ===================================================================
const CACHE_NAME = "meb-normmatik-20260828_0321";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./app.html",
    "./yonetim.html",
    "./css/app.css",
    "./js/bundle.js",
    "./js/xlsx.full.min.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/app_icon.ico"
];

// Bu adresler ASLA önbelleğe alınmaz: canlı veri ve kimlik doğrulama.
// Önbellekten servis edilirlerse kullanıcı eski veriyi görür ya da
// süresi dolmuş bir jetonla çalışmaya devam eder.
const ONBELLEGE_ALINMAZ = [
    "identitytoolkit.googleapis.com",
    "securetoken.googleapis.com",
    "firebasedatabase.app"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            // Tek bir dosya inemezse tüm kurulum düşmesin diye her biri
            // ayrı ayrı ekleniyor. cache.addAll() "hep ya da hiç" çalışır.
            Promise.all(ASSETS_TO_CACHE.map((yol) =>
                cache.add(yol).catch(() => null)
            ))
        )
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const istek = event.request;

    // Yalnızca GET önbelleklenir. POST/PUT (kayıt, giriş) doğrudan ağa gider.
    if (istek.method !== "GET") return;

    let url;
    try {
        url = new URL(istek.url);
    } catch (e) {
        return;
    }

    // Farklı kökenli istekler ve canlı veri uçları: dokunma.
    if (url.origin !== self.location.origin) return;
    if (ONBELLEGE_ALINMAZ.some((p) => url.hostname.includes(p))) return;

    event.respondWith(
        // ignoreSearch: "?v=..." sürüm etiketi yüzünden eşleşmenin
        // kaçmasını engeller. Asıl hata buydu.
        caches.match(istek, { ignoreSearch: true }).then((onbellekten) => {
            if (onbellekten) return onbellekten;

            return fetch(istek).then((cevap) => {
                // Başarılı ve aynı kökenli yanıtları çalışma anında sakla ki
                // ilk ziyaretten sonra çevrimdışı da açılsın.
                if (cevap && cevap.status === 200 && cevap.type === "basic") {
                    const kopya = cevap.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(istek, kopya).catch(() => {});
                    });
                }
                return cevap;
            }).catch(() => {
                // Çevrimdışı ve önbellekte de yok: gezinme isteklerinde
                // uygulama kabuğunu döndür, boş hata sayfası gösterme.
                if (istek.mode === "navigate") {
                    return caches.match("./app.html", { ignoreSearch: true })
                        .then((r) => r || caches.match("./index.html", { ignoreSearch: true }));
                }
                return Response.error();
            });
        })
    );
});
