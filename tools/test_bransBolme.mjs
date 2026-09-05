/* ===========================================================================
   NormMatik™ — Eğik çizgili derslerde branşa bölme testi
   ===========================================================================
   NEDEN VAR (okul müdürü bildirimi, 28.08.2026)
   ---------------------------------------------
   "Biz Anadolu Lisesi'yiz. Görsel sanatlar/müzik dersinde bir şubeyi ikiye
   bölüp yarısını görsel sanatlar, yarısını müzik öğretmenimize verebiliyoruz."

   Resmî çizelge bunu doğruluyor (TTKB Sayı 05 açıklamaları):
     "Öğrenciler ilgi, istek ve OKULUN İMKÂNLARI doğrultusunda
      'beden eğitimi ve spor/görsel sanatlar/müzik', 'görsel sanatlar/müzik'
      ... derslerinden sadece birini seçer."

   Uygulama o güne kadar saatin TAMAMINI tek branşa yazıyordu:
     9. sınıf  "Görsel Sanatlar/Müzik" 2 saat -> hepsi Görsel Sanatlar, Müzik 0
     12. sınıf "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik" -> hepsi Beden Eğ.
   Bir branş hiç görünmüyor, okulun toplam yükü de eksik çıkıyordu.

   Her öğretmen KENDİ GRUBUNA dersin tam saatini okutur; 2 saatlik ders iki
   branşa bölününce okula 4 saat yük getirir.
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
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

const ce = w.curriculumEngine, ne = w.normEngine, st = w.appState;
if (typeof ne.bolunebilirBranslar !== "function") olumcul("bolunebilirBranslar yok.");
if (typeof st.updateCourseBranchSplit !== "function") olumcul("updateCourseBranchSplit yok.");

/* ---- 1) Hangi dersler bölünebilir? ----------------------------------- */
// Kapı, parçaları uygulamanın GERÇEK branş listesine karşı doğrular.
for (const [ad, beklenen] of [
    ["Görsel Sanatlar/Müzik", ["Görsel Sanatlar", "Müzik"]],
    ["Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik",
        ["Beden Eğitimi", "Görsel Sanatlar", "Müzik"]],
    ["Beden Eğitimi ve Spor/Görsel Sanatlar", ["Beden Eğitimi", "Görsel Sanatlar"]],
]) {
    const b = ne.bolunebilirBranslar({ ders: ad });
    kontrol("bölünebilir: " + ad,
        b.length === beklenen.length && beklenen.every(x => b.includes(x)),
        b.join(", "));
}

// Bölünmemesi gerekenler. Eğik çizgi tek başına yetmez; parçalar branş olmalı.
for (const ad of [
    "Bağlama/Kanun/Ut",                    // hepsi müzik öğretmeni
    "Takım Sporları/Bireysel Sporlar",     // hepsi beden eğitimi
    "Bilgisayar Kontrollü Üretim (CNC/CAM)", // meslek atölyesi, tek branş
    "Matematik",                           // eğik çizgi yok
]) {
    kontrol("bölünmez: " + ad, ne.bolunebilirBranslar({ ders: ad }).length === 0,
        ne.bolunebilirBranslar({ ders: ad }).join(", "));
}

/* ---- 2) Norm hesabına yansıyor mu? ----------------------------------- */
function kur(sinif) {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif, ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", sinif, null, null),
        secmeliDersler: [] });
    return st.state.subeler[0];
}
function saatler() {
    const r = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {});
    return Object.fromEntries((r.branchReport || []).map(b => [b.branchName, b.totalHours]));
}

{
    const sec = kur("9");
    const once = saatler();
    kontrol("9. sınıfta Görsel Sanatlar 2 saat (ölçüm geçerli)",
        once["Görsel Sanatlar"] === 2, String(once["Görsel Sanatlar"]));
    kontrol("bölmeden önce Müzik yükü YOK", !once["Müzik"], String(once["Müzik"]));

    st.updateCourseBranchSplit(sec.id, "Görsel Sanatlar/Müzik",
        ["Görsel Sanatlar", "Müzik"]);
    const sonra = saatler();
    kontrol("bölünce Görsel Sanatlar yükü aynı kalır", sonra["Görsel Sanatlar"] === 2,
        String(sonra["Görsel Sanatlar"]));
    kontrol("bölünce Müzik 2 saat alır", sonra["Müzik"] === 2, String(sonra["Müzik"]));

    // Yan etki: yalnızca Müzik eklenmeli, başka branş değişmemeli.
    const degisen = Object.keys(Object.assign({}, once, sonra))
        .filter(k => (once[k] || 0) !== (sonra[k] || 0));
    kontrol("başka hiçbir branş etkilenmiyor",
        degisen.length === 1 && degisen[0] === "Müzik", degisen.join(", "));

    // Geri alma
    st.updateCourseBranchSplit(sec.id, "Görsel Sanatlar/Müzik", []);
    kontrol("bölme kaldırılınca Müzik yükü sıfırlanır", !saatler()["Müzik"]);
}

/* ---- 3) Üçlü ders ---------------------------------------------------- */
{
    const sec = kur("12");
    const ad = "Beden Eğitimi ve Spor/Görsel Sanatlar/Müzik";
    const once = saatler();
    kontrol("12. sınıfta ders Beden Eğitimi'ne yazılı (ölçüm geçerli)",
        once["Beden Eğitimi"] === 2, String(once["Beden Eğitimi"]));

    st.updateCourseBranchSplit(sec.id, ad, ["Beden Eğitimi", "Görsel Sanatlar", "Müzik"]);
    const s = saatler();
    kontrol("üçe bölününce üç branş da 2 saat alır",
        s["Beden Eğitimi"] === 2 && s["Görsel Sanatlar"] === 2 && s["Müzik"] === 2,
        JSON.stringify({ be: s["Beden Eğitimi"], gs: s["Görsel Sanatlar"], mz: s["Müzik"] }));
}

/* ---- 4) Aday olmayan branş kabul edilmemeli -------------------------- */
// Veri başka yoldan (yedek dosyası, içe aktarma) gelebilir; motor kendi
// kapısını uygulamalı.
{
    const g = ne.dersiGenislet({ ders: "Görsel Sanatlar/Müzik", saat: 2,
        bolunenBranslar: ["Görsel Sanatlar", "Matematik"] });
    kontrol("aday olmayan branşla bölme yok sayılır", g.length === 1,
        g.length + " kayıt");

    const t = ne.dersiGenislet({ ders: "Matematik", saat: 6,
        bolunenBranslar: ["Matematik", "Fizik"] });
    kontrol("bölünemez derste bölme yok sayılır", t.length === 1, t.length + " kayıt");
}

/* ---- 5) Seçim kaydet/yükle turunda kayboluyor mu? -------------------- */
{
    const sec = kur("9");
    st.updateCourseBranchSplit(sec.id, "Görsel Sanatlar/Müzik",
        ["Görsel Sanatlar", "Müzik"]);
    const kopya = JSON.parse(JSON.stringify(st.state));
    st.state = kopya;
    st.sanitizeExistingState();
    const ders = (st.state.subeler[0].zorunluDersler || [])
        .find(d => /Görsel Sanatlar\/Müzik/i.test(d.ders || ""));
    kontrol("ders kayıtta duruyor (ölçüm geçerli)", !!ders);
    kontrol("temizlik bölmeyi silmiyor",
        !!ders && Array.isArray(ders.bolunenBranslar) && ders.bolunenBranslar.length === 2,
        ders ? JSON.stringify(ders.bolunenBranslar) : "-");
    kontrol("yeniden yüklemede Müzik yükü korunuyor", saatler()["Müzik"] === 2,
        String(saatler()["Müzik"]));
}

/* ---- 6) Demo kilidi -------------------------------------------------- */
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    for (let i = 0; i < 6; i++) {
        st.addSection({ subeAdi: "9-" + "ABCDEF"[i], sinifSeviyesi: "9", ogrenciSayisi: 30,
            zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "9", null, null),
            secmeliDersler: [] });
    }
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: false, isDemo: true, maxSections: 3, allowExport: false };
    const kilitli = st.state.subeler[5];
    kontrol("6. şube demoda kilitli (ölçüm geçerli)", st.subeKilitliMi(kilitli.id) === true);
    st.updateCourseBranchSplit(kilitli.id, "Görsel Sanatlar/Müzik",
        ["Görsel Sanatlar", "Müzik"]);
    const d = (kilitli.zorunluDersler || [])
        .find(x => /Görsel Sanatlar\/Müzik/i.test(x.ders || ""));
    kontrol("kilitli şubede bölme yapılamıyor", !d || !d.bolunenBranslar);
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ BRANŞA BÖLME HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ BRANŞA BÖLME DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
