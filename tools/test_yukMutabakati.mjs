/* ===========================================================================
   NormMatik™ — Ders yükü mutabakatı testi
   ===========================================================================
   NEDEN VAR (kullanıcı bildirimi, 05.09.2026)
   ------------------------------------------
   Master matrisin alt satırı 640, aynı raporun başlığı 646 diyordu. İkisi de
   doğruydu ama farklı büyüklüklerdi ve aradaki köprü hiçbir yerde yazmıyordu:

       640 = ÖĞRENCİNİN gördüğü ders saati (şube çizelgelerinin ham toplamı)
       646 = ÖĞRETMENİN okuttuğu ders yükü (norm bu sayıdan hesaplanır)

   Farkı üreten mevzuat kalemleri:
       (+) bölünen ders / grup çarpanı — her öğretmen kendi grubuna tam saat
       (−) birleştirilmiş şube         — ders tek öğretmene yazılır
       (−) yönetici ders saati         — Md. 22/6
       (+) koordinatörlük              — Md. 19/1 (mesleki okullar)

   Bu test, mutabakatın SÜS OLMAMASINI garanti eder. Denetlediği değişmez:

       ham + çarpan − birleşik − yönetici + koordinatörlük === totalHours

   Motora yarın yeni bir yük kalemi eklenir ve mutabakata yansıtılmazsa
   eşitlik bozulur ve bu test kırmızı yanar. Böylece rapor, açıklayamadığı
   bir sayıyı asla açıklıyormuş gibi göstermez.

   Çalıştırma: node tools/test_yukMutabakati.mjs
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

const w = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const ne = w.normEngine;
if (typeof ne.calculateSchoolNorms !== "function") olumcul("calculateSchoolNorms yok.");

/* ---- sentetik okul kurucusu ------------------------------------------- */
const MEVCUTLAR = [[9, 34], [9, 33], [9, 34], [10, 34], [10, 34], [10, 36],
                   [11, 18], [11, 19], [11, 28], [11, 28], [11, 10],
                   [12, 24], [12, 24], [12, 23], [12, 22], [12, 10]];

const okulKur = (o = {}) => MEVCUTLAR.map(([sinif, ogr], i) => {
    const dersler = [
        { ders: "Türk Dili ve Edebiyatı", saat: 5, atananBrans: "Türk Dili ve Edebiyatı" },
        { ders: "Matematik", saat: 6, atananBrans: "Matematik" },
        { ders: "Tarih", saat: 2, atananBrans: "Tarih" },
        { ders: "Rehberlik ve Yönlendirme", saat: 1, atananBrans: "Rehberlik" },
        { ders: "İngilizce", saat: 4, atananBrans: "İngilizce" },
        { ders: "Beden Eğitimi ve Spor", saat: 2, atananBrans: "Beden Eğitimi" },
        { ders: "Coğrafya", saat: 2, atananBrans: "Coğrafya" },
        { ders: "Fizik", saat: 2, atananBrans: "Fizik" },
        { ders: "Kimya", saat: 2, atananBrans: "Kimya" },
        { ders: "Biyoloji", saat: 2, atananBrans: "Biyoloji" },
        { ders: "Felsefe", saat: 2, atananBrans: "Felsefe" },
        { ders: "Din Kültürü ve Ahlak Bilgisi", saat: 2, atananBrans: "Din Kültürü ve Ahlak Bilgisi" }
    ];
    // (+) eğik çizgili ders iki branşa bölünmüş
    dersler.push((o.bol && sinif === 9)
        ? { ders: "Görsel Sanatlar/Müzik", saat: 2, bolunenBranslar: ["Görsel Sanatlar", "Müzik"] }
        : { ders: "Görsel Sanatlar", saat: 2, atananBrans: "Görsel Sanatlar" });
    // branşı atanmamış ders — çizelgede var, hiçbir branşın normunda yok
    if (o.branssiz && i === 0) dersler.push({ ders: "Serbest Etkinlik", saat: 2, atananBrans: "" });
    // (−) birleştirilmiş şube: en küçük iki şube tek grupta
    if (o.birlesik && (i === 10 || i === 15)) {
        dersler.push({ ders: "Astronomi ve Uzay Bilimleri", saat: 2,
                       atananBrans: "Fizik", birlesikSubeler: [i === 10 ? "s15" : "s10"] });
    }
    return { id: "s" + i, ad: sinif + "-" + i, sinifSeviyesi: String(sinif),
             ogrenciSayisi: ogr, zorunluDersler: dersler, secmeliDersler: [] };
});

const hamHesapla = (subeler) => subeler.reduce((t, s) =>
    t + [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])]
        .reduce((a, c) => a + (parseInt(c.saat, 10) || 0), 0), 0);

/* ---- 1) DEĞİŞMEZ: kalemler toplamı === motor toplamı ------------------- */
const SENARYOLAR = [
    ["sade okul", "anadolu_lisesi", {}, {}],
    ["bölünmüş eğik çizgili ders", "anadolu_lisesi", { bol: true }, {}],
    ["yönetici ders saati (Md. 22/6)", "anadolu_lisesi", {},
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } } }],
    ["birleştirilmiş şube", "anadolu_lisesi", { birlesik: true }, {}],
    ["branşı atanmamış ders", "anadolu_lisesi", { branssiz: true }, {}],
    ["hepsi bir arada", "anadolu_lisesi", { bol: true, birlesik: true, branssiz: true },
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6, "Matematik": 4 } } }],
    ["mesleki lise (koordinatörlük)", "mesleki_ve_teknik_anadolu_lisesi", {},
        { "Makine Teknolojisi": 20 }],
    ["yönetici saati branş yükünden büyük", "anadolu_lisesi", {},
        { adminOptions: { yoneticiDersYukleri: { "Felsefe": 500 } } }]
];

for (const [ad, tur, opt, coord] of SENARYOLAR) {
    const subeler = okulKur(opt);
    const r = ne.calculateSchoolNorms(subeler, {}, tur, coord);
    const m = r.yukMutabakati;

    if (!m) { kontrol(ad + ": mutabakat üretiliyor", false, "yukMutabakati yok"); continue; }
    kontrol(ad + ": mutabakat üretiliyor", true);

    const hesap = m.hamCizelgeSaati + m.carpanArtisi - m.birlesikSubeDusumu
                - m.yoneticiDersDusumu + m.koordinatorlukEki;
    kontrol(ad + ": DEĞİŞMEZ tutuyor", hesap === r.totalHours,
        m.hamCizelgeSaati + " + " + m.carpanArtisi + " - " + m.birlesikSubeDusumu
        + " - " + m.yoneticiDersDusumu + " + " + m.koordinatorlukEki
        + " = " + hesap + ", motor " + r.totalHours);
    kontrol(ad + ": tutarlı bayrağı doğru", m.tutarli === true, String(m.tutarli));
    kontrol(ad + ": sonuç motor toplamıyla aynı",
        m.normaEsasYuk === r.totalHours, m.normaEsasYuk + " / " + r.totalHours);

    // Ham sayaç, matrisin alt satırıyla AYNI yöntemle hesaplanmalı; yoksa
    // rapor "640" derken mutabakat başka bir sayı gösterir.
    kontrol(ad + ": ham sayaç şube çizelgesi toplamına eşit",
        m.hamCizelgeSaati === hamHesapla(subeler),
        m.hamCizelgeSaati + " / " + hamHesapla(subeler));

    // Düşümler negatife dönemez.
    kontrol(ad + ": düşümler negatif değil",
        m.yoneticiDersDusumu >= 0 && m.birlesikSubeDusumu >= 0,
        "yönetici " + m.yoneticiDersDusumu + ", birleşik " + m.birlesikSubeDusumu);
}

/* ---- 2) Kalemler gerçekten devreye giriyor mu? ------------------------- */
/* Değişmez, bütün kalemler sıfırken de tutar. Sayaçların ÖLÇTÜĞÜNÜ de
   ayrıca doğrulamak gerekir; yoksa test hep yeşil yanan bir süs olur. */
{
    const sade = ne.calculateSchoolNorms(okulKur({}), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("sade okulda hiçbir kalem oluşmuyor",
        sade.carpanArtisi === 0 && sade.birlesikSubeDusumu === 0
        && sade.yoneticiDersDusumu === 0 && sade.koordinatorlukEki === 0,
        JSON.stringify(sade));

    const bolund = ne.calculateSchoolNorms(okulKur({ bol: true }), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("bölünme çarpanı ölçülüyor (3 şube x 2 saat = +6)",
        bolund.carpanArtisi === 6, String(bolund.carpanArtisi));
    kontrol("bölünme ham çizelgeyi DEĞİŞTİRMİYOR",
        bolund.hamCizelgeSaati === sade.hamCizelgeSaati,
        bolund.hamCizelgeSaati + " / " + sade.hamCizelgeSaati);

    const yon = ne.calculateSchoolNorms(okulKur({}), {}, "anadolu_lisesi",
        { adminOptions: { yoneticiDersYukleri: { "Türk Dili ve Edebiyatı": 6 } } }).yukMutabakati;
    kontrol("yönetici düşümü ölçülüyor (Md. 22/6, -6)",
        yon.yoneticiDersDusumu === 6, String(yon.yoneticiDersDusumu));
    kontrol("yönetici düşümü toplamı gerçekten azaltıyor",
        yon.normaEsasYuk === sade.normaEsasYuk - 6,
        yon.normaEsasYuk + " / " + sade.normaEsasYuk);

    const brl = ne.calculateSchoolNorms(okulKur({ birlesik: true }), {}, "anadolu_lisesi", {}).yukMutabakati;
    kontrol("birleşik şube düşümü ölçülüyor (-2)",
        brl.birlesikSubeDusumu === 2, String(brl.birlesikSubeDusumu));
    kontrol("birleşik şubede ham çizelge ARTIYOR ama yük yarısı kadar artıyor",
        brl.hamCizelgeSaati === sade.hamCizelgeSaati + 4
        && brl.normaEsasYuk === sade.normaEsasYuk + 2,
        "ham " + brl.hamCizelgeSaati + ", yük " + brl.normaEsasYuk);

    const mtal = ne.calculateSchoolNorms(okulKur({}), {}, "mesleki_ve_teknik_anadolu_lisesi",
        { "Makine Teknolojisi": 20 }).yukMutabakati;
    kontrol("koordinatörlük eki ölçülüyor (+20)",
        mtal.koordinatorlukEki === 20, String(mtal.koordinatorlukEki));
}

/* ---- 3) Rapor katmanı: mutabakat gerçekten taşınıyor mu? --------------- */
{
    const RE = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    kontrol("master matris verisi mutabakatı taşıyor",
        /yukMutabakati:\s*normResult\.yukMutabakati/.test(RE));
    kontrol("Excel çıktısına mutabakat satırları ekleniyor",
        /mutabakatSatirlari\(gridData\.yukMutabakati/.test(RE));
    kontrol("CSV çıktısına mutabakat satırları ekleniyor",
        /mutabakatSatirlari\(reportData\.yukMutabakati/.test(RE));

    const UI = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    // Panel 06.09.2026'da matrisin ALTINDAN rapor BAŞLIĞINA taşındı
    // ("önemli, en altta olamaz" — kullanıcı). Yerleşimin ayrıntılı
    // denetimi test_raporlar R15'te; burada yalnızca bağlantılar sınanır.
    // 06.09.2026: önce şerit, sonra köprü grafiği, en sonunda okunur DENKLEM.
    // Köprü soyut kalıyordu; kullanıcı "minimal tercih yanlış oldu" dedi.
    kontrol("mutabakat denklemi raporda basılıyor",
        /renderMutabakatDenklem\(data\.yukMutabakati\)/.test(UI));
    kontrol("denklem kutu + işaret biçiminde (grafik değil)",
        /mt-kutu/.test(UI) && /mt-islem/.test(UI));
    kontrol("ayrıntı tablosu ve açma anahtarı basılıyor",
        /renderMutabakatDetay\(data\.yukMutabakati\)/.test(UI)
        && /renderMutabakatAnahtar\(data\.yukMutabakati\)/.test(UI));
    kontrol("yönetici icmalinde tek satırlık özet var",
        /renderMutabakatOzet\(data\.yukMutabakati\)/.test(UI));
    // Branş kartı başlığındaki yük ile ders satırlarının toplamı ayrışabilir
    // (yönetici düşümü, koordinatörlük, grup bölünmesi). Sebebi YAZILMALI.
    kontrol("branş içi ayrışma kartın dipnotunda açıklanıyor",
        /kalanFark/.test(UI) && /Ders satırları toplamı/.test(UI));
    kontrol("yönetici düşümü ve koordinatörlük ayrıca yazılıyor",
        /Md\. 22\/6/.test(UI) && /Md\. 19\/1/.test(UI));

    // Tutarsız mutabakat HİÇ basılmamalı. Tek kapı: mutabakatKalemleri().
    kontrol("tutarsız mutabakat basılmıyor",
        /if \(!m \|\| m\.tutarli === false\) return null;/.test(UI));
    kontrol("üç çizicinin üçü de aynı kapıdan geçiyor",
        (UI.match(/this\.mutabakatKalemleri\(m\)/g) || []).length >= 3,
        "biri kapıyı atlarsa tutarsız mutabakat ekrana çıkar");

    const CSS = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    kontrol("mutabakat panelinin stili var",
        /\.ymt-serit\s*\{/.test(CSS) && /\.ymt-detay\s*\{/.test(CSS));
    kontrol("ayrıntı tablosu yazdırmada da görünüyor",
        /@media print[\s\S]*\.ymt-detay\s*\{[\s\S]{0,80}display:\s*block\s*!important/.test(CSS));

    const APP = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    kontrol("ana sayfa panelinin açıklaması artık 'şube saatleri toplamı' demiyor",
        !/title="Şubelerin haftalık ders saatlerinin toplamı\./.test(APP));
    kontrol("ana sayfa paneli mutabakata yönlendiriyor",
        /DERS YÜKÜ MUTABAKATI/.test(APP));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ YÜK MUTABAKATI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ YÜK MUTABAKATI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
