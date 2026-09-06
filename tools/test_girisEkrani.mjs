/* ===========================================================================
   NormMatik™ — GİRİŞ EKRANI UÇTAN UCA TESTİ
   ===========================================================================
   NEDEN VAR (06.09.2026)
   ----------------------
   test_uctanUcaTur.mjs veri yolunu sınıyordu ama index.html'deki GİRİŞ EKRANI
   bilerek kapsam dışı bırakılmıştı; oturum katmanı taklit ediliyordu. Bu, o
   boşluğu kapatır.

   Boşluğun bedeli hemen görüldü: giriş betiğindeki `yerelIzleriTemizle()`
   HER GİRİŞTE localStorage.clear() yapıyor ve korunanlar listesinde yerel
   çalışma yedeği YOKTU. Yani bir gün önce eklenen yerel kalıcılık, giriş
   anında siliniyordu — app.html açıldığında okunacak kopya hiç kalmıyordu.
   Kurtarma yolu GERÇEK AKIŞTA hiç çalışmıyor, yalnızca testlerde işe
   yarıyordu. Aynı hata authService.logout() içinde düzeltilmiş, burası
   atlanmıştı.

   Bu test index.html'deki gerçek betiği taklit bir tarayıcıda ÇALIŞTIRIR:
   sahte fetch, sahte localStorage/sessionStorage ve küçük bir DOM.

   Çalıştırma: node tools/test_girisEkrani.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};
function olumcul(m) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + m);
    process.exit(1);
}

/* ---- index.html içindeki betiği çıkar --------------------------------- */
const html = fs.readFileSync(path.join(KOK, "index.html"), "utf8");
const m = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/);
if (!m) olumcul("index.html içinde satır içi betik bulunamadı.");
const betik = m[1];
kontrol("ölçüm geçerli: giriş betiği çıkarıldı", betik.length > 2000, betik.length + " karakter");
kontrol("ölçüm geçerli: betik giriş formunu bağlıyor",
    betik.includes("form-login") && betik.includes("signInWithPassword"));

/* ---- taklit tarayıcı --------------------------------------------------- */
function depoYap(baslangic = {}) {
    const d = new Map(Object.entries(baslangic));
    return {
        get length() { return d.size; },
        key: (i) => [...d.keys()][i],
        getItem: (k) => (d.has(k) ? d.get(k) : null),
        setItem: (k, v) => d.set(k, String(v)),
        removeItem: (k) => { d.delete(k); },
        clear: () => d.clear(),
        _map: d
    };
}

function ortamKur({ yerelBaslangic = {}, fetchTaklidi } = {}) {
    const dinleyiciler = {};          // "form-login:submit" -> fn
    const ogeler = {};
    const yeniOge = (id) => ({
        id, value: "", innerHTML: "", disabled: false, style: {},
        classList: { add() {}, remove() {}, contains: () => false },
        addEventListener: (tur, fn) => { dinleyiciler[id + ":" + tur] = fn; },
        querySelectorAll: () => [], appendChild() {}, remove() {}, focus() {}
    });
    const belge = {
        getElementById: (id) => (ogeler[id] = ogeler[id] || yeniOge(id)),
        querySelectorAll: () => [],
        createElement: () => yeniOge("yeni"),
        addEventListener: () => {},
        body: { appendChild() {}, classList: { add() {}, remove() {} } }
    };

    const yerel = depoYap(yerelBaslangic);
    const oturum = depoYap();
    const konum = { href: "index.html", _gidilen: null };
    Object.defineProperty(konum, "hedef", { get: () => konum._gidilen });

    // Giriş betiği hataları alert() ile gösteriyor; yakalayalım.
    const uyarilar = [];
    const w = {
        localStorage: yerel, sessionStorage: oturum,
        document: belge, addEventListener: () => {}, dispatchEvent: () => true,
        alert: (msj) => uyarilar.push(String(msj)), confirm: () => true, prompt: () => null
    };
    const ctx = {
        window: w, document: belge, localStorage: yerel, sessionStorage: oturum,
        console: { log() {}, warn() {}, error() {} },
        navigator: { userAgent: "node" },
        setTimeout, clearTimeout, setInterval, clearInterval,
        fetch: fetchTaklidi || (async () => ({ ok: false, status: 500, json: async () => ({}) })),
        alert: (msj) => uyarilar.push(String(msj)), CustomEvent: class { constructor(t, o) { Object.assign(this, o); } },
        URL, JSON, Date, Math, Object, Array, String, Number, Boolean, Promise, RegExp, Error
    };
    // location.href atamasını YÖNLENDİRME olarak yakala.
    let hedef = null;
    ctx.location = { get href() { return "index.html"; }, set href(v) { hedef = v; } };
    w.location = ctx.location;
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(betik, ctx);

    // Öğeler getElementById ile TEMBEL oluşuyor; testin doğrudan eriştiği
    // alanlar (auth-kurum-kodu gibi) betik onları istemeden var olmuyordu.
    // Proxy, erişildiği anda gerçek yolu kullanarak oluşturur.
    const ogeErisimi = new Proxy({}, { get: (_t, k) => belge.getElementById(String(k)) });
    return { ctx, dinleyiciler, ogeler: ogeErisimi, yerel, oturum, uyarilar, hedefAl: () => hedef };
}

const YANIT = (durum, govde) => ({
    ok: durum >= 200 && durum < 300, status: durum, json: async () => govde
});

/* =======================================================================
   G1 — BAŞARILI GİRİŞ: doğru uç nokta, doğru yük, doğru oturum
   ======================================================================= */
{
    const istekler = [];
    const ort = ortamKur({
        fetchTaklidi: async (u, s) => {
            istekler.push({ url: String(u), govde: s && s.body ? JSON.parse(s.body) : null });
            if (String(u).includes("signInWithPassword")) {
                return YANIT(200, {
                    idToken: "JETON-123", refreshToken: "YENILEME-456",
                    localId: "uid-789", expiresIn: "3600"
                });
            }
            return YANIT(200, null);          // yoneticiler/<uid> -> yönetici değil
        }
    });

    const gonder = ort.dinleyiciler["form-login:submit"];
    kontrol("G1 giriş formu bağlanmış", typeof gonder === "function");
    if (typeof gonder === "function") {
        ort.ogeler["auth-kurum-kodu"].value = " 654321 ";     // baştaki/sondaki boşluk
        ort.ogeler["auth-password"].value = "gizli-parola";
        await gonder({ preventDefault() {} });

        const giris = istekler.find(i => i.url.includes("signInWithPassword"));
        kontrol("G1 kimlik doğrulama uç noktasına gidildi", !!giris, istekler.map(i => i.url).join(" | "));
        if (giris) {
            kontrol("G1 e-posta kurum kodundan türetiliyor",
                giris.govde.email === "654321@okul.normmatik.com.tr", giris.govde.email);
            kontrol("G1 kurum kodundaki boşluk kırpılmış",
                !/\s/.test(giris.govde.email));
            kontrol("G1 parola gönderiliyor", giris.govde.password === "gizli-parola");
            kontrol("G1 güvenli jeton isteniyor", giris.govde.returnSecureToken === true);
        }

        const kimlik = JSON.parse(ort.oturum.getItem("normmatik_fb_kimlik") || "null");
        kontrol("G1 kimlik jetonu OTURUM deposuna yazıldı", !!kimlik, "yazılmadı");
        if (kimlik) {
            kontrol("G1 jeton doğru saklanıyor", kimlik.idToken === "JETON-123");
            kontrol("G1 kurum kodu jetona iliştirilmiş", kimlik.kurumKodu === "654321");
            kontrol("G1 bitiş zamanı hesaplanmış",
                typeof kimlik.bitis === "number" && kimlik.bitis > Date.now());
        }

        const oturumBilgisi = JSON.parse(ort.oturum.getItem("normmatik_active_session") || "null");
        kontrol("G1 aktif oturum yazıldı", !!oturumBilgisi);
        if (oturumBilgisi) {
            kontrol("G1 oturum demo DEĞİL", oturumBilgisi.isDemo === false);
            kontrol("G1 okul türü kilitli", oturumBilgisi.okulTuruKilitli === true);
        }
        kontrol("G1 uygulamaya yönlendirildi",
            String(ort.hedefAl() || "").includes("app.html"), String(ort.hedefAl()));
    }
}

/* =======================================================================
   G2 — YEREL ÇALIŞMA YEDEĞİ GİRİŞTE SİLİNMEMELİ
   ---------------------------------------------
   06.09.2026'da bulundu: yerelIzleriTemizle() her girişte localStorage.clear()
   yapıyordu ve yerel kalıcılık/sürüm geçmişi korunanlar listesinde yoktu.
   Kurtarma yolu gerçek akışta hiç çalışmıyordu.
   ======================================================================= */
{
    const ort = ortamKur({
        yerelBaslangic: {
            "normmatik_yerel_654321": '{"kayitZamani":"2026-09-05T20:00:00.000Z","veri":{"subeler":[1,2,3]}}',
            "normmatik_surumler_654321": '[{"id":"s1","zaman":"2026-09-05T19:00:00.000Z","veri":{"subeler":[1]}}]',
            "MEB_NORM_KADRO_LAYOUT_V1": '{"leftWidth":300}',
            "normmatik_active_session": "eski-okul-izi",
            "baska_okul_cerezi": "silinmeli"
        },
        fetchTaklidi: async (u) => String(u).includes("signInWithPassword")
            ? YANIT(200, { idToken: "T", refreshToken: "R", localId: "u", expiresIn: "3600" })
            : YANIT(200, null)
    });

    const gonder = ort.dinleyiciler["form-login:submit"];
    ort.ogeler["auth-kurum-kodu"].value = "654321";
    ort.ogeler["auth-password"].value = "p";
    await gonder({ preventDefault() {} });

    kontrol("G2 YEREL ÇALIŞMA YEDEĞİ girişten sonra DURUYOR",
        ort.yerel.getItem("normmatik_yerel_654321") !== null,
        "kalanlar: " + [...ort.yerel._map.keys()].join(", "));
    kontrol("G2 SÜRÜM GEÇMİŞİ girişten sonra DURUYOR",
        ort.yerel.getItem("normmatik_surumler_654321") !== null);
    kontrol("G2 görünüm tercihi de duruyor",
        ort.yerel.getItem("MEB_NORM_KADRO_LAYOUT_V1") !== null);
    kontrol("G2 eski okul izleri SİLİNDİ",
        ort.yerel.getItem("normmatik_active_session") === null
        && ort.yerel.getItem("baska_okul_cerezi") === null,
        "kalanlar: " + [...ort.yerel._map.keys()].join(", "));
    kontrol("G2 temizlik yeni jetonu SİLMEDİ (sıra doğru)",
        ort.oturum.getItem("normmatik_fb_kimlik") !== null,
        "temizlik jeton yazıldıktan sonra çalışırsa oturum daha doğmadan ölür");
}

/* =======================================================================
   G3 — HATALI GİRİŞ: kullanıcı sayımı sızdırılmıyor
   ======================================================================= */
{
    const senaryolar = [
        ["EMAIL_NOT_FOUND", "kayıtlı olmayan kurum kodu"],
        ["INVALID_PASSWORD", "yanlış parola"],
        ["INVALID_LOGIN_CREDENTIALS", "genel ret"]
    ];
    const mesajlar = [];
    for (const [kod] of senaryolar) {
        const ort = ortamKur({
            fetchTaklidi: async () => YANIT(400, { error: { message: kod } })
        });
        const gonder = ort.dinleyiciler["form-login:submit"];
        ort.ogeler["auth-kurum-kodu"].value = "111111";
        ort.ogeler["auth-password"].value = "yanlis";
        await gonder({ preventDefault() {} });
        mesajlar.push(ort.uyarilar.join(" | "));
        kontrol("G3 " + kod + ": oturum AÇILMADI",
            ort.oturum.getItem("normmatik_fb_kimlik") === null);
    }
    kontrol("G3 üç ret de AYNI mesajı veriyor (kurum kodu sayımı sızmıyor)",
        mesajlar[0] === mesajlar[1] && mesajlar[1] === mesajlar[2],
        JSON.stringify(mesajlar));
    kontrol("G3 mesaj kullanıcıya anlamlı",
        /kurum kodu veya şifre/i.test(mesajlar[0]), mesajlar[0]);
}

/* =======================================================================
   G4 — ÖZEL HATA DURUMLARI ayrı ayrı anlatılıyor mu?
   ======================================================================= */
{
    const beklenen = [
        ["TOO_MANY_ATTEMPTS_TRY_LATER", /çok fazla hatalı deneme/i],
        ["USER_DISABLED", /devre dışı/i],
        ["CONFIGURATION_NOT_FOUND", /hizmet veremiyor/i]
    ];
    for (const [kod, kalip] of beklenen) {
        const ort = ortamKur({
            fetchTaklidi: async () => YANIT(400, { error: { message: kod } })
        });
        const gonder = ort.dinleyiciler["form-login:submit"];
        ort.ogeler["auth-kurum-kodu"].value = "222222";
        ort.ogeler["auth-password"].value = "p";
        await gonder({ preventDefault() {} });
        const mesaj = ort.uyarilar.join(" | ");
        kontrol("G4 " + kod + " sebebi adıyla söyleniyor", kalip.test(mesaj), mesaj);
    }
}

/* =======================================================================
   G5 — AĞ HATASI: sunucuya ulaşılamıyor
   ======================================================================= */
{
    const ort = ortamKur({
        fetchTaklidi: async () => { throw new Error("network down"); }
    });
    const gonder = ort.dinleyiciler["form-login:submit"];
    ort.ogeler["auth-kurum-kodu"].value = "333333";
    ort.ogeler["auth-password"].value = "p";
    await gonder({ preventDefault() {} });

    const mesaj = ort.uyarilar.join(" | ");
    kontrol("G5 ağ hatası kullanıcıya bildiriliyor",
        /sunucuya ulaşılamadı|bağlantı/i.test(mesaj), mesaj);
    kontrol("G5 ağ hatasında oturum açılmıyor",
        ort.oturum.getItem("normmatik_fb_kimlik") === null);
    kontrol("G5 ağ hatasında uygulamaya yönlendirilmiyor",
        !String(ort.hedefAl() || "").includes("app.html"), String(ort.hedefAl()));
}

/* =======================================================================
   G6 — BOŞ ALANLA GÖNDERİM istek üretmemeli
   ======================================================================= */
{
    let istekSayisi = 0;
    const ort = ortamKur({
        fetchTaklidi: async () => { istekSayisi++; return YANIT(200, {}); }
    });
    const gonder = ort.dinleyiciler["form-login:submit"];
    ort.ogeler["auth-kurum-kodu"].value = "";
    ort.ogeler["auth-password"].value = "";
    await gonder({ preventDefault() {} });
    kontrol("G6 boş alanla sunucuya istek gitmiyor", istekSayisi === 0, String(istekSayisi));
}

/* =======================================================================
   G7 — KAYNAK SABİTLERİ
   ======================================================================= */
{
    kontrol("G7 parola yalnızca kimlik sunucusuna gidiyor, saklanmıyor",
        !/localStorage\.setItem\([^)]*password/i.test(betik)
        && !/sessionStorage\.setItem\([^)]*password/i.test(betik),
        "parola hiçbir depoya yazılmamalı");
    kontrol("G7 kurum kodu sayımı bilerek gizleniyor (yorumla sabitlenmiş)",
        /Kullanıcı yok.*parola yanlış.*ayrım|ayrım, hangi kurum kodlarının/s.test(betik));
    kontrol("G7 temizlik jetondan ÖNCE çağrılıyor",
        betik.indexOf("yerelIzleriTemizle();") <
        betik.indexOf('sessionStorage.setItem("normmatik_fb_kimlik"'),
        "sonra çağrılırsa yeni jeton da silinir");
    kontrol("G7 yerel yedek önekleri korunanlar arasında",
        /KORUNAN_ONEKLER/.test(betik) && /normmatik_yerel_/.test(betik)
        && /normmatik_surumler_/.test(betik));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ GİRİŞ EKRANI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ GİRİŞ EKRANI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
