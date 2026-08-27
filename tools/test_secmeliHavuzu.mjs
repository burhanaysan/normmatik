/* ===========================================================================
   NormMatik™ — Seçmeli ders havuzu testi
   ===========================================================================
   NE DENETLER: Bir şubeye seçmeli ders eklerken kullanıcıya sunulan liste,
   o okul türünün RESMÎ ÇİZELGESİYLE birebir aynı mı — hem ders adları hem
   HAFTALIK SAATLER?

   NEDEN VAR: Havuz meb_master_db.json'dan okunuyordu ve 21 çizelge dosyasını
   dolaşıp bir dersi İLK gördüğü yerden alıyordu. Anadolu Lisesi dosyası önce
   geldiği için uzmanlaşmış liselere Anadolu Lisesi'nin saatleri yazılıyordu.
   Ölçüldü (28.08.2026): 1265 karşılaştırmanın 349'unda saat yanlıştı; Spor
   Lisesi'nde her iki dersten biri. Ekranda hiçbir hata görünmüyordu — norm
   hesabı seçilen saat üzerinden yürüdüğü için sonuç sessizce yanlış çıkıyordu.
   AİHL'de ayrıca 129 seçmeliden 10'u hiç sunulmuyordu.

   Havuz artık okul türüne göre üretiliyor (tools/uret_secmeli_havuzu.py).
   Bu test, üretilen havuzun kaynağı gerçekten yansıttığını ve arayüzün onu
   doğru sunduğunu her çalıştırmada yeniden kanıtlar.

   ÖLÇÜM GEÇERLİLİĞİ: Test, ölçtüğü şeyin gerçekten ölçüldüğünü de doğrular
   (kaynak okundu mu, listeler doldu mu, kaç karşılaştırma yapıldı). Aksi
   hâlde "0 hata" sonucu, hiçbir şey denetlenmediği için de çıkabilirdi.
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const KAYNAK_KOK = path.join(KOK, "data", "kaynak_cizelgeler");

let gecen = 0;
const hatalar = [];
function kontrol(ad, kosul, ayrinti) {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
}
function olumcul(mesaj) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + mesaj);
    console.log("   (Test hiçbir şeyi denetlemedi; 'hata yok' sonucu anlamsız olurdu.)");
    process.exit(1);
}

/* ---- uygulamayı yükle ------------------------------------------------- */
const w = {};
const ctx = {
    window: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);

w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

// loadDatabase() fetch kullanır; Node'da göreli adres çalışmaz ve masterData
// boş kalır. Boş kalırsa bütün havuzlar boşalır ve test körleşir.
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;
if (!Object.keys(w.dbService.masterData.okul_turleri_ve_cizelgeler || {}).length)
    olumcul("master DB boş yüklendi.");

const HAVUZ = w.SECMELI_HAVUZU;
if (!HAVUZ || Object.keys(HAVUZ).length < 10)
    olumcul("SECMELI_HAVUZU yüklenmedi ya da eksik (build_bundle EXPORTS_CODE?).");

const UI = vm.runInContext("UIComponentManager", ctx);
if (!UI) olumcul("UIComponentManager sınıfı bulunamadı.");
const ui = new UI(w.dbService, w.appState, w.normEngine, w.curriculumEngine);
const st = w.appState, ce = w.curriculumEngine;

/* ---- karşılaştırma anahtarı ------------------------------------------- */
const ah = (x) => String(x || "").replace(/\(.*?\)/g, " ")
    .replace(/[îÎ]/g, "i").replace(/[âÂ]/g, "a").replace(/[ûÛ]/g, "u")
    .replace(/['’‘]/g, "")
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");

/* ---- 1) Havuz, kaynak çizelgeyi yansıtıyor mu? ------------------------ */
// Okul türü -> kaynak dosya -> tablo eşlemesi, üreteçle AYNI olmalı.
// Burada elle yazılmasının sebebi: bu bir TEST; üretecin kendi eşlemesini
// kullanırsa, eşleme yanlış olduğunda ikisi birlikte yanılır ve test yeşil
// kalır. Bilerek bağımsız yazıldı.
const ESLEME = [
    ["anadolu_lisesi", "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Anadolu Lisesi"],
    ["hazirlik_anadolu_lisesi", "ogm/sayi05_anadolu_fen_sosyalbilimler.json",
        "Hazırlık Sınıfı Bulunan Anadolu Lisesi"],
    ["fen_lisesi", "ogm/sayi05_anadolu_fen_sosyalbilimler.json", "Fen Lisesi"],
    ["hazirlik_fen_lisesi", "ogm/sayi05_anadolu_fen_sosyalbilimler.json",
        "Hazırlık Sınıfı Bulunan Fen Lisesi"],
    ["sosyal_bilimler_lisesi", "ogm/sayi05_anadolu_fen_sosyalbilimler.json",
        "Hazırlık Sınıfı Bulunan Sosyal Bilimler Lisesi"],
    ["guzel_sanatlar_gorsel", "ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json",
        "Güzel Sanatlar Lisesi - Görsel Sanatlar"],
    ["guzel_sanatlar_tiyatro", "ogm/sayi06_guzelsanatlar_gorsel_tiyatro.json",
        "Güzel Sanatlar Lisesi - Tiyatro"],
    ["guzel_sanatlar_muzik", "ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json",
        "Güzel Sanatlar Lisesi - Müzik"],
    ["guzel_sanatlar_turk_muzigi", "ogm/sayi07_guzelsanatlar_muzik_turkmuzigi.json",
        "Güzel Sanatlar Lisesi - Türk Müziği"],
    ["spor_lisesi", "ogm/sayi09_spor_lisesi.json", null],
    ["anadolu_imam_hatip_lisesi", "dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json", null],
    ["hazirlik_imam_hatip_lisesi", "dogm/anadolu_imam_hatip_lisesi_ve_hazirlik.json", null],
];

function saatMetni(v) {
    if (!v) return null;
    if (v.tip === "sabit") return v.saat ? String(v.saat) : null;
    if (v.tip === "secenekli") return (v.secenekler || []).join("/") || null;
    throw new Error("bilinmeyen saat tipi: " + JSON.stringify(v));
}

function kaynaktanBeklenen(dosya, tabloAdi) {
    const j = JSON.parse(fs.readFileSync(path.join(KAYNAK_KOK, dosya), "utf8"));
    const bek = {};   // sinif -> anahtar -> {ad, saat}
    const ekle = (ad, saatler) => {
        for (const [sinif, v] of Object.entries(saatler || {})) {
            const s = saatMetni(v);
            if (!s) continue;
            bek[sinif] = bek[sinif] || {};
            // Aynı ders birden çok grupta geçebilir; arayüz ilkini gösterir.
            if (!(ah(ad) in bek[sinif])) bek[sinif][ah(ad)] = { ad, saat: s };
        }
    };
    if (j.secmeli_dersler) {                       // DÖGM biçimi
        for (const g of Object.values(j.secmeli_dersler))
            for (const alt of (g.alanlar || g.programlar || []))
                for (const d of (alt.dersler || [])) ekle(d.ders_adi, d.saatler);
        return bek;
    }
    const tablolar = j.tablolar || [];             // OGM biçimi
    const t = tabloAdi ? tablolar.find((x) => x.tablo_adi === tabloAdi) : tablolar[0];
    if (!t) return bek;
    for (const g of (t.gruplar || [])) {
        const adKucuk = String(g.grup_adi || "").replace(/İ/g, "i").toLowerCase();
        if (!adKucuk.replace(/ç/g, "c").includes("secmel")) continue;
        for (const d of (g.dersler || [])) ekle(d.ders_adi, d.saatler);
    }
    return bek;
}

let toplamKarsilastirma = 0;

for (const [tur, dosya, tabloAdi] of ESLEME) {
    kontrol(tur + ": üretilmiş havuzu var", !!HAVUZ[tur]);
    if (!HAVUZ[tur]) continue;

    const beklenen = kaynaktanBeklenen(dosya, tabloAdi);
    const kaynakKayit = Object.values(beklenen).reduce((a, x) => a + Object.keys(x).length, 0);
    kontrol(tur + ": kaynaktan ders okundu", kaynakKayit > 0, dosya);
    if (!kaynakKayit) continue;

    for (const [sinif, dersler] of Object.entries(beklenen)) {
        let zorunlu = [];
        try { zorunlu = ce.getMandatoryCourses(tur, sinif, null, null) || []; } catch (e) { continue; }
        if (!zorunlu.length) continue;   // bu tür bu sınıfı okutmuyor

        st.state = st.getDefaultState();
        st.state.okulBilgisi.okulTuru = tur;
        st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif,
            ogrenciSayisi: 30, zorunluDersler: zorunlu });
        const liste = ui.getAvailableElectivesForSection(st.state.subeler[0]) || [];
        kontrol(tur + " " + sinif + ". sınıf: liste dolu", liste.length > 0);

        const sunulan = {};
        for (const c of liste) sunulan[ah(c.ders)] = (c.hoursOptions || []).join("/");

        // (a) Çizelgedeki her ders sunuluyor mu?
        const eksik = Object.entries(dersler)
            .filter(([k]) => !(k in sunulan)).map(([, v]) => v.ad);
        kontrol(tur + " " + sinif + ". sınıf: çizelgedeki her ders sunuluyor",
            eksik.length === 0, eksik.slice(0, 5).join(", "));

        // (b) Saatler birebir mi?
        for (const [k, v] of Object.entries(dersler)) {
            if (!(k in sunulan)) continue;
            toplamKarsilastirma++;
            kontrol(tur + " " + sinif + ". sınıf saat: " + v.ad,
                sunulan[k] === v.saat,
                "sunulan " + sunulan[k] + ", çizelge " + v.saat);
        }

        // (c) Kopya gösterim olmamalı. Parantez İÇERİĞİ ayırt edicidir
        //     ("Arapça (Metin-Mükâleme)" ile "Arapça (Sarf...)" ayrı derstir),
        //     bu yüzden burada parantezi koruyan anahtar kullanılıyor.
        const kopyaAnahtar = (x) => String(x || "")
            .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i").toLowerCase()
            .replace(/[‐-―]/g, "-").replace(/['’‘]/g, "").replace(/\s+/g, " ").trim();
        const sayim = {};
        for (const c of liste) {
            const kk = kopyaAnahtar(c.ders);
            (sayim[kk] = sayim[kk] || []).push(c.ders);
        }
        const kopyalar = Object.values(sayim).filter((v) => v.length > 1);
        kontrol(tur + " " + sinif + ". sınıf: kopya ders yok", kopyalar.length === 0,
            kopyalar.slice(0, 3).map((v) => v.join(" || ")).join("  ;  "));
    }
}

if (toplamKarsilastirma < 800)
    olumcul("yalnızca " + toplamKarsilastirma + " saat karşılaştırıldı (beklenen >800).");

/* ---- 2) Havuzu OLMAYAN türler eski yolunu sürdürmeli ------------------ */
// Meslek lisesi, MESEM ve ortaokul seçmelileri alan/dal üzerinden gelir.
// Havuz onlara uygulanırsa listeleri boşalır.
for (const tur of ["mesleki_ve_teknik_anadolu_lisesi", "ortaokul_temel_egitim"]) {
    kontrol(tur + ": üretilmiş havuzu yok (eski yol sürüyor)", !HAVUZ[tur]);
    let doluBulundu = false;
    for (const sinif of ["7", "9", "10", "11", "12"]) {
        let zorunlu = [];
        try { zorunlu = ce.getMandatoryCourses(tur, sinif, null, null) || []; } catch (e) { continue; }
        if (!zorunlu.length) continue;
        st.state = st.getDefaultState();
        st.state.okulBilgisi.okulTuru = tur;
        st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif,
            ogrenciSayisi: 30, zorunluDersler: zorunlu });
        if ((ui.getAvailableElectivesForSection(st.state.subeler[0]) || []).length > 0)
            doluBulundu = true;
    }
    kontrol(tur + ": seçmeli listesi doluyor", doluBulundu);
}

/* ---- 3) Listeler okul türüne göre farklılaşmalı ----------------------- */
const imzalar = new Set();
for (const tur of ["anadolu_lisesi", "fen_lisesi", "sosyal_bilimler_lisesi",
    "spor_lisesi", "guzel_sanatlar_muzik", "anadolu_imam_hatip_lisesi"]) {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = tur;
    st.addSection({ subeAdi: "11-A", sinifSeviyesi: "11", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses(tur, "11", null, null) });
    imzalar.add((ui.getAvailableElectivesForSection(st.state.subeler[0]) || [])
        .map((c) => c.ders).sort().join("|"));
}
kontrol("listeler okul türüne göre farklılaşıyor", imzalar.size === 6,
    imzalar.size + " farklı liste (6 tür denendi)");

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SEÇMELİ HAVUZU HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar.slice(0, 30)) console.log("   • " + h);
    if (hatalar.length > 30) console.log("   ... ve " + (hatalar.length - 30) + " tane daha");
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SEÇMELİ HAVUZU DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("   (" + toplamKarsilastirma + " ders saati resmî çizelgeyle birebir karşılaştırıldı)");
console.log("=".repeat(70));
