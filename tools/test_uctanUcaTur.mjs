/* ===========================================================================
   NormMatik™ — UÇTAN UCA TUR TESTİ (kaydet → yükle → karşılaştır)
   ===========================================================================
   NEDEN VAR (kullanıcı isteği, 05.09.2026)
   ----------------------------------------
   Kullanıcı sordu: "buna benzer sessiz yollar varsa nasıl bileceğiz? ticari
   olarak pazarladığımız bu program, hayal kırıklığı oluşturur. uçtan uca test
   mekanizmamız var mı?" Dürüst cevap: YOKTU. 20 test dosyası / ~134.000
   kontrolün neredeyse tamamı VERİ DOĞRULUĞU testiydi; hiçbiri kaydet-yükle
   turunu çalıştırmıyordu.

   Yakalayamadığımız hata tam da oradaydı (4ca5758): kod doğru, veri doğru,
   TAŞIMA KATMANI sessizce reddediyordu. Firebase nesne anahtarlarında
   ". $ # [ ] /" kabul etmiyor; branş listesindeki "Kimya / Kimya Teknolojisi"
   bir kez yazıldığında okulun BÜTÜN kayıtları reddediliyordu.

   BU TESTİN FARKI: sahte sunucu, gerçek Firebase'in İKİ kuralını da uygular:
     1) geçersiz anahtar -> 400 "Invalid data; couldn't parse key"
     2) okulAdi/okulTuru/kurumKodu okul_kayit ile birebir aynı değilse -> 403
   Böylece test, uygulamanın kendi kodunu gerçek sınırlara karşı sınar.
   Sunucunun bu kuralları GERÇEKTEN uyguladığı ayrıca doğrulanır (T3) —
   yoksa yeşil yanan bir tiyatro olurdu.

   KAPSAM SINIRI (dürüstlük için): bu test veri yolunu sınar. index.html'deki
   giriş ekranı (identitytoolkit çağrısı) kapsam dışıdır; oturum katmanı
   burada taklit edilir.

   Çalıştırma: node tools/test_uctanUcaTur.mjs
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

/* =======================================================================
   SAHTE FIREBASE SUNUCUSU
   ======================================================================= */
const GECERSIZ_ANAHTAR = /[.$#\[\]/]/;

function sunucuKur({ okulKayit = null, abonelik = null } = {}) {
    const depo = new Map();          // yol -> veri
    const gunluk = [];               // { yontem, yol } — istek sayımı için
    let gecicihataKalan = 0;         // N isteği 500 ile reddet (ağ dalgalanması)

    if (okulKayit) depo.set("okul_kayit/" + okulKayit.kurumKodu, okulKayit);
    if (abonelik) depo.set("abonelik/" + abonelik.kurumKodu, abonelik);

    // Firebase'in anahtar kuralı: nesne ANAHTARLARINDA ". $ # [ ] /" yasak.
    function bozukAnahtarBul(deger, yol = "") {
        if (deger === null || typeof deger !== "object") return null;
        if (Array.isArray(deger)) {
            for (let i = 0; i < deger.length; i++) {
                const b = bozukAnahtarBul(deger[i], yol + "[" + i + "]");
                if (b) return b;
            }
            return null;
        }
        for (const k of Object.keys(deger)) {
            if (k === "" || GECERSIZ_ANAHTAR.test(k)) return yol + "." + k;
            const b = bozukAnahtarBul(deger[k], yol + "." + k);
            if (b) return b;
        }
        return null;
    }

    const yanit = (durum, govde) => ({
        ok: durum >= 200 && durum < 300,
        status: durum,
        json: async () => govde
    });

    const fetchTaklidi = async (istekUrl, secenek = {}) => {
        const u = new URL(istekUrl);
        if (!u.searchParams.get("auth")) return yanit(401, { error: "Auth token required" });

        const yol = decodeURIComponent(u.pathname.replace(/^\//, "").replace(/\.json$/, ""))
            .split("/").map(decodeURIComponent).join("/");
        const yontem = (secenek.method || "GET").toUpperCase();
        gunluk.push({ yontem, yol });

        if (gecicihataKalan > 0) {
            gecicihataKalan--;
            return yanit(500, { error: "Internal server error" });
        }

        if (yontem === "GET") {
            return yanit(200, depo.has(yol) ? depo.get(yol) : null);
        }

        if (yontem === "PUT" || yontem === "PATCH") {
            let govde;
            try { govde = JSON.parse(secenek.body); }
            catch (e) { return yanit(400, { error: "Invalid JSON" }); }

            // KURAL 1 — anahtar geçerliliği
            const bozuk = bozukAnahtarBul(govde);
            if (bozuk) {
                return yanit(400, {
                    error: "Invalid data; couldn't parse key beginning at " + bozuk
                         + ". Key value can't be empty or contain $ # [ ] / or ."
                });
            }

            // KURAL 2 — school_data yazımı okul_kayit ile birebir eşleşmeli
            if (yol.startsWith("school_data/")) {
                const kod = yol.split("/")[1];
                const kayit = depo.get("okul_kayit/" + kod);
                if (!kayit) return yanit(403, { error: "Permission denied" });
                if (govde.kurumKodu !== kayit.kurumKodu
                    || govde.okulAdi !== kayit.okulAdi
                    || govde.okulTuru !== kayit.okulTuru) {
                    return yanit(403, { error: "Permission denied" });
                }
            }

            depo.set(yol, govde);
            return yanit(200, govde);
        }

        return yanit(405, { error: "Method not allowed" });
    };

    return {
        fetch: fetchTaklidi,
        depo,
        gunluk,
        gecicihataAyarla: (n) => { gecicihataKalan = n; },
        istekSayisi: (yontem, yolParcasi) => gunluk.filter(g =>
            g.yontem === yontem && g.yol.includes(yolParcasi)).length
    };
}

/* =======================================================================
   UYGULAMA ORTAMI
   ======================================================================= */
function ortamKur(sunucu) {
    const depo = new Map();
    const yerelDepo = {
        getItem: (k) => (depo.has(k) ? depo.get(k) : null),
        setItem: (k, v) => depo.set(k, String(v)),
        removeItem: (k) => { depo.delete(k); },
        clear: () => depo.clear()
    };
    const w = {};
    const olaylar = [];
    const ctx = {
        window: w, self: w, console: { log() {}, warn() {}, error() {} },
        localStorage: yerelDepo,
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        navigator: { userAgent: "node" }, location: { href: "x" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: (a) => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {},
        fetch: sunucu.fetch,
        URL
    };
    ctx.globalThis = ctx;
    w.localStorage = yerelDepo;
    w.fetch = sunucu.fetch;
    w.dispatchEvent = (o) => { olaylar.push(o); return true; };
    w.addEventListener = () => {};
    vm.createContext(ctx);
    vm.runInContext(
        fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

    // Oturum katmanı taklidi (giriş ekranı kapsam dışı).
    w.firebaseAuth = {
        oturumVar: () => true,
        tokenAl: async () => "sahte-jeton",
        cikisYap: () => {}
    };
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    return { w, olaylar, yerelDepo, yerelDeposu: depo };
}

const KURUM = "654321";
const OKUL_ADI = "Oltu Anadolu Lisesi";
const OKUL_TURU = "anadolu_lisesi";
const KAYIT = { kurumKodu: KURUM, okulAdi: OKUL_ADI, okulTuru: OKUL_TURU };

function okulDoldur(S, ce) {
    S.state = S.getDefaultState();
    S.state.okulBilgisi.okulAdi = OKUL_ADI;
    S.state.okulBilgisi.okulTuru = OKUL_TURU;
    S.state.okulBilgisi.kurumKodu = KURUM;
    S.state.okulBilgisi.sezon = "2026-2027";
    [["9", 34], ["9", 33], ["10", 34], ["11", 28], ["12", 24]].forEach(([g, o], i) =>
        S.addSection({
            subeAdi: g + "-" + "ABCDE"[i], sinifSeviyesi: g, ogrenciSayisi: o,
            zorunluDersler: ce.getMandatoryCourses(OKUL_TURU, g, null, null)
        }));
    // 4ca5758'in tetikleyicisi: içinde bölü işareti olan branş adı.
    S.state.mevcutOgretmenler = {
        "Matematik": 4,
        "Kimya / Kimya Teknolojisi": 1,
        "Türk Dili ve Edebiyatı": 3
    };
    S.state.koordinatorlukYukleri = { "Kimya / Kimya Teknolojisi": 10 };
    S.state.okulBilgisi.adminOptions = {
        isPansiyonluMdrYrd: true,
        isPansiyonluBasyrd: true,
        yoneticiDersYukleri: { "Kimya / Kimya Teknolojisi": 6, "Matematik": 4 },
        mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 1, mudurYardimcisi: 2 }
    };
    return S.state;
}

/* =======================================================================
   T1 — TAM TUR: kaydet → yükle → karşılaştır
   ======================================================================= */
{
    const sunucu = sunucuKur({ okulKayit: KAYIT });
    const ort = ortamKur(sunucu);
    const S = ort.w.appState, ce = ort.w.curriculumEngine, cs = ort.w.cloudDbService;

    const gonderilen = JSON.parse(JSON.stringify(okulDoldur(S, ce)));
    kontrol("T1 ölçüm geçerli: okul kuruldu",
        gonderilen.subeler.length === 5
        && (gonderilen.subeler[0].zorunluDersler || []).length > 3);

    await cs.saveSchoolData(KURUM, S.state);
    kontrol("T1 kayıt sunucuya ULAŞTI", sunucu.depo.has("school_data/" + KURUM),
        [...sunucu.depo.keys()].join(", "));

    // --- YENİ OTURUM: her şey sıfırdan, yalnızca buluttan gelen kullanılacak
    const ort2 = ortamKur(sunucu);
    const S2 = ort2.w.appState, cs2 = ort2.w.cloudDbService;
    S2.state = S2.getDefaultState();
    S2.state.okulBilgisi.okulAdi = OKUL_ADI;
    S2.state.okulBilgisi.okulTuru = OKUL_TURU;
    S2.state.okulBilgisi.kurumKodu = KURUM;

    const gelen = await cs2.loadSchoolData(KURUM);
    kontrol("T1 yükleme bir şey döndürdü", !!gelen);

    if (gelen) {
        S2.yereliUygula({
            okulBilgisi: {
                sezon: gelen.sezon,
                antet: gelen.antet,
                adminOptions: gelen.adminOptions
            },
            subeler: gelen.subeler,
            mevcutOgretmenler: gelen.mevcutOgretmenler,
            koordinatorlukYukleri: gelen.koordinatorlukYukleri
        });

        kontrol("T1 şube sayısı korundu",
            S2.state.subeler.length === gonderilen.subeler.length,
            S2.state.subeler.length + " / " + gonderilen.subeler.length);
        kontrol("T1 şubeler BİREBİR aynı",
            JSON.stringify(S2.state.subeler) === JSON.stringify(gonderilen.subeler),
            "tur kayıplı");
        kontrol("T1 mevcut öğretmenler birebir aynı",
            JSON.stringify(S2.state.mevcutOgretmenler) === JSON.stringify(gonderilen.mevcutOgretmenler),
            JSON.stringify(S2.state.mevcutOgretmenler));
        kontrol("T1 BÖLÜ İŞARETLİ branş adı bozulmadan döndü",
            S2.state.mevcutOgretmenler["Kimya / Kimya Teknolojisi"] === 1,
            "4ca5758 bu satırda yakalanırdı");
        kontrol("T1 koordinatörlük yükleri birebir aynı",
            JSON.stringify(S2.state.koordinatorlukYukleri)
            === JSON.stringify(gonderilen.koordinatorlukYukleri));
        kontrol("T1 yönetici ders yükleri (bölü işaretli anahtar) korundu",
            S2.state.okulBilgisi.adminOptions.yoneticiDersYukleri["Kimya / Kimya Teknolojisi"] === 6);
        kontrol("T1 idareci seçenekleri korundu",
            S2.state.okulBilgisi.adminOptions.isPansiyonluBasyrd === true
            && S2.state.okulBilgisi.adminOptions.mevcutIdareciler.mudurYardimcisi === 2);
        kontrol("T1 sezon korundu", S2.state.okulBilgisi.sezon === "2026-2027");
    }

    // Turun sonunda NORM da aynı çıkmalı: veri döndü ama hesap kaydıysa
    // kullanıcı için hiçbir şey kurtulmamış olur.
    const n1 = ort.w.normEngine.calculateSchoolNorms(
        gonderilen.subeler, gonderilen.mevcutOgretmenler, OKUL_TURU,
        Object.assign({}, gonderilen.koordinatorlukYukleri,
            { adminOptions: gonderilen.okulBilgisi.adminOptions }));
    const n2 = ort2.w.normEngine.calculateSchoolNorms(
        S2.state.subeler, S2.state.mevcutOgretmenler, OKUL_TURU,
        Object.assign({}, S2.state.koordinatorlukYukleri,
            { adminOptions: S2.state.okulBilgisi.adminOptions }));
    kontrol("T1 turdan sonra TOPLAM DERS YÜKÜ aynı",
        n1.totalHours === n2.totalHours, n1.totalHours + " / " + n2.totalHours);
    kontrol("T1 turdan sonra HESAPLANAN NORM aynı",
        n1.totalCalculatedNorm === n2.totalCalculatedNorm,
        n1.totalCalculatedNorm + " / " + n2.totalCalculatedNorm);
    kontrol("T1 turdan sonra İDARECİ NORMU aynı",
        JSON.stringify(n1.adminNorms) === JSON.stringify(n2.adminNorms));
}

/* =======================================================================
   T2 — DURUM KATMANINDAN TAM TUR (notify → gecikmeli kayıt → flush)
   ======================================================================= */
{
    const sunucu = sunucuKur({ okulKayit: KAYIT });
    const ort = ortamKur(sunucu);
    const S = ort.w.appState, ce = ort.w.curriculumEngine, cs = ort.w.cloudDbService;

    okulDoldur(S, ce);
    S.notify();                                   // gerçek uygulama yolu
    kontrol("T2 notify() bulut kaydını planladı", !!cs.bekleyenKayit);
    kontrol("T2 notify() yerele de yazdı",
        ort.yerelDeposu.has("normmatik_yerel_" + KURUM));

    cs.flushPendingSave();                        // sekme kapanıyor
    await new Promise(r => setTimeout(r, 60));
    kontrol("T2 kapanış boşaltması veriyi sunucuya gönderdi",
        sunucu.depo.has("school_data/" + KURUM));

    const kaydedilen = sunucu.depo.get("school_data/" + KURUM);
    kontrol("T2 sunucudaki kayıtta şubeler var",
        Array.isArray(kaydedilen && kaydedilen.subeler) && kaydedilen.subeler.length === 5);
    kontrol("T2 sunucudaki kayıtta zaman damgası var", !!(kaydedilen && kaydedilen.lastUpdated));
}

/* =======================================================================
   T3 — SAHTE SUNUCU KURALLARI GERÇEKTEN UYGULUYOR MU?
   ---------------------------------------------------
   T1 yeşilse iki sebebi olabilir: (a) uygulama anahtarları doğru kodluyor,
   (b) sahte sunucu kuralı hiç uygulamıyor. (b) ise T1 bir tiyatrodur.
   Burada kodlamayı ATLAYIP ham veri yazıyoruz: sunucu REDDETMELİ.
   ======================================================================= */
{
    const sunucu = sunucuKur({ okulKayit: KAYIT });

    const hamYaz = async (govde) => sunucu.fetch(
        "https://x.firebaseio.com/school_data/" + KURUM + ".json?auth=t",
        { method: "PUT", body: JSON.stringify(govde) });

    const r1 = await hamYaz({
        kurumKodu: KURUM, okulAdi: OKUL_ADI, okulTuru: OKUL_TURU,
        mevcutOgretmenler: { "Kimya / Kimya Teknolojisi": 1 }   // KODLANMAMIŞ
    });
    kontrol("T3 sunucu geçersiz anahtarı REDDEDİYOR", r1.status === 400, String(r1.status));
    const h1 = await r1.json();
    kontrol("T3 ret mesajı Firebase'in mesajıyla aynı sınıftan",
        /couldn't parse key/i.test(h1.error || ""), h1.error);

    const r2 = await hamYaz({
        kurumKodu: KURUM, okulAdi: "Başka Bir Lise", okulTuru: OKUL_TURU
    });
    kontrol("T3 sunucu okul adı uyuşmazlığını REDDEDİYOR", r2.status === 403, String(r2.status));

    const r3 = await hamYaz({
        kurumKodu: KURUM, okulAdi: OKUL_ADI, okulTuru: "meslek_lisesi"
    });
    kontrol("T3 sunucu okul türü uyuşmazlığını REDDEDİYOR", r3.status === 403, String(r3.status));

    const r4 = await hamYaz({
        kurumKodu: KURUM, okulAdi: OKUL_ADI, okulTuru: OKUL_TURU, subeler: []
    });
    kontrol("T3 kurallara uyan yazım KABUL EDİLİYOR", r4.status === 200, String(r4.status));
}

/* =======================================================================
   T4 — KURAL REDDİ: sebep ADIYLA söyleniyor mu? (3aecdcd)
   ======================================================================= */
{
    // okul_kayit'ta BAŞKA bir ad var: her kayıt reddedilecek.
    const sunucu = sunucuKur({
        okulKayit: { kurumKodu: KURUM, okulAdi: "Eski Lise Adı", okulTuru: OKUL_TURU },
        abonelik: { kurumKodu: KURUM, bitis: "2030-01-01" }
    });
    const ort = ortamKur(sunucu);
    const S = ort.w.appState, ce = ort.w.curriculumEngine, cs = ort.w.cloudDbService;
    okulDoldur(S, ce);

    await cs.saveSchoolData(KURUM, S.state);
    kontrol("T4 reddedilen kayıt sunucuya YAZILMADI",
        !sunucu.depo.has("school_data/" + KURUM));

    const durumOlaylari = ort.olaylar.filter(o => o && o.type === "normmatik-bulut-durum");
    kontrol("T4 başarısızlık kullanıcıya bildiriliyor",
        durumOlaylari.length > 0 && durumOlaylari.some(o => o.detail.basarili === false),
        "olaylar: " + ort.olaylar.map(o => o && o.type).join(", "));

    const son = durumOlaylari[durumOlaylari.length - 1];
    kontrol("T4 ret KALICI olarak işaretleniyor (tekrar denemek çözmez)",
        son && son.detail.kalici === true, JSON.stringify(son && son.detail));
    kontrol("T4 sebep 'okul adı' olarak ADIYLA söyleniyor",
        son && /okul adı/i.test(son.detail.mesaj || ""), son && son.detail.mesaj);

    // Kalıcı hatada YENİDEN DENENMEMELİ.
    kontrol("T4 kalıcı hatada yeniden denenmiyor",
        sunucu.istekSayisi("PUT", "school_data") === 1,
        sunucu.istekSayisi("PUT", "school_data") + " deneme");
}

/* =======================================================================
   T5 — GEÇİCİ AĞ HATASI: yeniden deneniyor mu?
   ======================================================================= */
{
    const sunucu = sunucuKur({ okulKayit: KAYIT });
    const ort = ortamKur(sunucu);
    const S = ort.w.appState, ce = ort.w.curriculumEngine, cs = ort.w.cloudDbService;
    okulDoldur(S, ce);

    sunucu.gecicihataAyarla(2);                    // ilk 2 istek 500
    await cs.saveSchoolData(KURUM, S.state);

    kontrol("T5 geçici hatadan sonra kayıt BAŞARILI",
        sunucu.depo.has("school_data/" + KURUM));
    kontrol("T5 yeniden deneme gerçekten yapıldı",
        sunucu.istekSayisi("PUT", "school_data") === 3,
        sunucu.istekSayisi("PUT", "school_data") + " deneme");
}

/* =======================================================================
   T6 — BULUT TAMAMEN ÇÖKMÜŞ: yerel kopya devrede mi?
   ---------------------------------------------------
   4ca5758'in yaşandığı gerçek durum. Uygulama veri KAYBETMEMELİ.
   ======================================================================= */
{
    const sunucu = sunucuKur({ okulKayit: KAYIT });
    // Her yazma reddedilsin: okul_kayit'ı silelim -> 403
    sunucu.depo.delete("okul_kayit/" + KURUM);

    const ort = ortamKur(sunucu);
    const S = ort.w.appState, ce = ort.w.curriculumEngine, cs = ort.w.cloudDbService;
    okulDoldur(S, ce);
    S.notify();
    cs.flushPendingSave();
    await new Promise(r => setTimeout(r, 60));

    kontrol("T6 bulut kaydı gerçekten reddedildi",
        !sunucu.depo.has("school_data/" + KURUM));
    kontrol("T6 buna rağmen YEREL kopya yazıldı",
        ort.yerelDeposu.has("normmatik_yerel_" + KURUM));

    // Ertesi gün: aynı tarayıcı, bulutta hâlâ hiçbir şey yok.
    const ort2 = ortamKur(sunucu);
    for (const [k, v] of ort.yerelDeposu) ort2.yerelDeposu.set(k, v);
    const S2 = ort2.w.appState, cs2 = ort2.w.cloudDbService;
    S2.state = S2.getDefaultState();
    S2.state.okulBilgisi.okulAdi = OKUL_ADI;
    S2.state.okulBilgisi.okulTuru = OKUL_TURU;
    S2.state.okulBilgisi.kurumKodu = KURUM;

    const bulut = await cs2.loadSchoolData(KURUM);
    const yerel = S2.yereldenOku(KURUM);
    const secim = S2.yerelBulutSecimi(bulut, yerel);
    kontrol("T6 karar: yerel kopya kullanılsın", secim.yereliKullan === true,
        JSON.stringify(secim));
    S2.yereliUygula(yerel.veri);
    kontrol("T6 VERİ KURTARILDI: 5 şube geri geldi",
        S2.state.subeler.length === 5, String(S2.state.subeler.length));
    kontrol("T6 bölü işaretli branş da kurtarıldı",
        S2.state.mevcutOgretmenler["Kimya / Kimya Teknolojisi"] === 1);
    kontrol("T6 okul kimliği yerelden EZİLMEDİ",
        S2.state.okulBilgisi.okulAdi === OKUL_ADI);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ UÇTAN UCA TUR HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ UÇTAN UCA TUR DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
