/* ===========================================================================
   NormMatik™ — Rehberlik ve Yönlendirme dersi testi
   ===========================================================================
   KURAL (kullanıcı kararı, 28.08.2026): "Çizelgelerde rehberlik varsa var,
   yoksa yok." Ders ne eklenir ne silinir — resmî haftalık ders çizelgesi ne
   diyorsa o.

   NEDEN VAR
   ---------
   state.js'te "12. sınıfsa rehberliği tamamen kaldır" diye bir kural vardı.
   Resmî çizelgelerle karşılaştırıldığında (28.08.2026) yanlış olduğu görüldü:
   elimizdeki 16 ortaöğretim çizelgesinin HEPSİ 12. sınıfta bu dersi 1 saat
   veriyor. Kural muhtemelen eski çizelgelerden kalmıştı ve 2024 Maarif Modeli
   çizelgeleriyle sessizce yanlışa döndü. Etkisi: her 12. sınıf şubesinde
   1 saat, okulun toplam yükünden eksik. Ekranda hiçbir uyarı yoktu.

   Ayrıca saat değeri kodda sabitti (`d.saat = 1`). Bütün çizelgeler 1 saat
   dediği için zararı görünmüyordu, ama karar çizelgede değil koddaydı.

   AŞAĞIDAKİ BEKLENTİLER PDF'TEN DOĞRULANMIŞTIR
   --------------------------------------------
   Her hücre, kaynak PDF'in kendi koordinatlarından okundu: etiket ile
   değerlerin aynı satırda olduğu (komşu satırlar 9-13 punto uzakta) ve
   değerlerin sınıf başlıklarının altına düştüğü tek tek doğrulandı.

   Şaşırtıcı ama GERÇEK olanlar — bunlar hata değildir, çizelge böyledir:
     • Spor Lisesi          9. sınıfta YOK
     • Güzel Sanatlar Görsel 10 ve 11. sınıfta YOK
     • Sosyal Bilimler      11. sınıfta YOK
     • Anadolu İmam Hatip   10, 11 ve 12. sınıfta YOK (yalnızca hazırlık ve 9)

   AİHL'i başta ölçmeden 1/1/1/1 varsaymıştım; PDF sütun hizasıyla bakınca
   dersin yalnızca HAZIRLIK ve 9. SINIF sütunlarında olduğu görüldü. Bu
   yüzden beklentiler burada varsayım değil, ölçüm olarak duruyor.
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
    console.log("   (Test hiçbir şeyi denetlemedi; 'hata yok' anlamsız olurdu.)");
    process.exit(1);
}

/* ---- uygulamayı yükle ------------------------------------------------- */
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
if (!Object.keys(w.dbService.masterData.okul_turleri_ve_cizelgeler || {}).length)
    olumcul("master DB boş yüklendi.");
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

const st = w.appState, ce = w.curriculumEngine;
const rehberlikMi = (d) => /rehberl/i.test(d.ders || d.ders_adi || "");

/* PDF'ten doğrulanmış: okul türü -> sınıf -> saat (0 = çizelgede yok) */
const CIZELGE = {
    anadolu_lisesi:            { "9": 1, "10": 1, "11": 1, "12": 1 },
    hazirlik_anadolu_lisesi:   { "9": 1, "10": 1, "11": 1, "12": 1 },
    fen_lisesi:                { "9": 1, "10": 1, "11": 1, "12": 1 },
    sosyal_bilimler_lisesi:    { "9": 1, "10": 1, "11": 0, "12": 1 },
    guzel_sanatlar_gorsel:     { "9": 1, "10": 0, "11": 0, "12": 1 },
    guzel_sanatlar_tiyatro:    { "9": 1, "10": 1, "11": 1, "12": 1 },
    guzel_sanatlar_muzik:      { "9": 1, "10": 1, "11": 1, "12": 1 },
    guzel_sanatlar_turk_muzigi:{ "9": 1, "10": 1, "11": 1, "12": 1 },
    spor_lisesi:               { "9": 0, "10": 1, "11": 1, "12": 1 },
    anadolu_imam_hatip_lisesi: { "9": 1, "10": 0, "11": 0, "12": 0 },
};

function subeKur(tur, sinif, dersler) {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = tur;
    st.addSection({ subeAdi: sinif + "-A", sinifSeviyesi: sinif, ogrenciSayisi: 30,
        zorunluDersler: dersler, secmeliDersler: [] });
    return st.state.subeler[0];
}

/* ---- 1) Her okul türü / sınıf çizelgesine uyuyor mu? ------------------ */
let karsilastirma = 0;
for (const [tur, beklenen] of Object.entries(CIZELGE)) {
    for (const [sinif, bekSaat] of Object.entries(beklenen)) {
        const z = ce.getMandatoryCourses(tur, sinif, null, null) || [];
        kontrol(tur + " " + sinif + ": müfredat dolu geldi", z.length > 0);
        if (!z.length) continue;
        const sec = subeKur(tur, sinif, z);
        const r = (sec.zorunluDersler || []).filter(rehberlikMi);
        karsilastirma++;
        kontrol(tur + " " + sinif + ". sınıf rehberlik saati",
            (r.length ? r[0].saat : 0) === bekSaat,
            "çizelge " + bekSaat + ", uygulama " + (r.length ? r[0].saat : 0));
        kontrol(tur + " " + sinif + ". sınıf: mükerrer rehberlik yok", r.length <= 1,
            r.length + " kayıt");
    }
}
if (karsilastirma < 30)
    olumcul("yalnızca " + karsilastirma + " karşılaştırma yapıldı (beklenen >30).");

/* ---- 2) Kayıtlı veride EKSİKSE geri gelmeli --------------------------- */
// Eski sürüm 12. sınıf rehberliğini silmişti. Yalnızca kuralı kaldırmak
// yetmez: zaten kaydedilmiş okullarda ders kendiliğinden geri gelmezdi ve
// okul, şubeyi elle yeniden kurana kadar 1 saat eksik hesaplanırdı.
{
    const tam = ce.getMandatoryCourses("anadolu_lisesi", "12", null, null) || [];
    const eksik = tam.filter(d => !rehberlikMi(d));
    kontrol("eksik fixture gerçekten eksik (ölçüm geçerli)",
        tam.length > eksik.length, "fixture'da rehberlik zaten yoktu");
    const sec = subeKur("anadolu_lisesi", "12", eksik);
    const r = (sec.zorunluDersler || []).filter(rehberlikMi);
    kontrol("kayıtlı 12. sınıf şubesinde rehberlik geri geliyor", r.length === 1,
        r.length + " kayıt");
    if (r.length) kontrol("geri gelen dersin saati çizelgeden", r[0].saat === 1,
        String(r[0].saat));
}

/* ---- 3) Çizelgede YOKSA kayıtlı veriden silinmeli --------------------- */
// Karşı yön de denetlenmeli; yoksa "ekle" kuralı tek yönlü çalışır ve
// çizelgede olmayan bir ders şubede kalmaya devam eder.
{
    const z = ce.getMandatoryCourses("spor_lisesi", "9", null, null) || [];
    kontrol("Spor Lisesi 9 müfredatı dolu (ölçüm geçerli)", z.length > 0);
    const fazladan = z.concat([{ ders: "Rehberlik ve Yönlendirme", saat: 1,
        kategori: "ORTAK DERSLER", atananBrans: "Rehberlik" }]);
    const sec = subeKur("spor_lisesi", "9", fazladan);
    kontrol("çizelgede olmayan rehberlik siliniyor (Spor Lisesi 9)",
        (sec.zorunluDersler || []).filter(rehberlikMi).length === 0);
}

/* ---- 4) Mükerrer kayıt teke iniyor mu? -------------------------------- */
{
    const z = ce.getMandatoryCourses("anadolu_lisesi", "10", null, null) || [];
    const cift = z.concat([{ ders: "REHBERLİK", saat: 3, kategori: "ORTAK DERSLER" }]);
    const sec = subeKur("anadolu_lisesi", "10", cift);
    const r = (sec.zorunluDersler || []).filter(rehberlikMi);
    kontrol("mükerrer rehberlik teke iniyor", r.length === 1, r.length + " kayıt");
    if (r.length) kontrol("kalan kaydın saati çizelgeden", r[0].saat === 1, String(r[0].saat));
}

/* ---- 5) İdarecinin branş seçimi korunuyor mu? ------------------------- */
// Bu ders tek bir branşa ait değildir; çizelge "okutulduğu kurumda görev
// yapan bütün alan öğretmenleri tarafından okutulur" der. İdarecinin geçerli
// seçimi ezilmemeli (kullanıcı bildirimi, 27.08.2026).
{
    const z = (ce.getMandatoryCourses("anadolu_lisesi", "11", null, null) || [])
        .map(d => rehberlikMi(d) ? { ...d, atananBrans: "Matematik" } : d);
    const sec = subeKur("anadolu_lisesi", "11", z);
    const r = (sec.zorunluDersler || []).filter(rehberlikMi);
    kontrol("idarecinin geçerli branş seçimi korunuyor",
        r.length === 1 && r[0].atananBrans === "Matematik",
        r.length ? r[0].atananBrans : "ders yok");
}

/* ---- 6) Okul türü bilinmiyorsa dokunulmamalı -------------------------- */
// Motor karar veremediğinde "çizelgede yok" sanıp dersi silmek, sessizce
// veri kaybettirirdi.
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "";
    st.addSection({ subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Rehberlik ve Yönlendirme", saat: 1,
            kategori: "ORTAK DERSLER", atananBrans: "Rehberlik" },
            { ders: "Matematik", saat: 5, kategori: "ORTAK DERSLER", atananBrans: "Matematik" }],
        secmeliDersler: [] });
    const sec = st.state.subeler[0];
    kontrol("okul türü yokken rehberlik silinmiyor",
        (sec.zorunluDersler || []).filter(rehberlikMi).length === 1);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ REHBERLİK DERSİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar.slice(0, 25)) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ REHBERLİK DERSİ ÇİZELGEYE UYGUN — " + gecen + " kontrol başarılı, 0 hata");
console.log("   (" + karsilastirma + " okul türü/sınıf, resmî çizelgeyle karşılaştırıldı)");
console.log("=".repeat(70));
