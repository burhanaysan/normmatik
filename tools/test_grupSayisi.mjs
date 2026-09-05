/* ===========================================================================
   NormMatik™ — Grup sayısı seçimi testi
   ===========================================================================
   KURAL: Mevzuatın grup baremi ÜST SINIRDIR; okulun dersi fiilen kaç grupta
   okuttuğu okulun kararıdır. İdareci grup sayısını aşağı çekebilir, baremin
   üstüne çıkamaz.

   NEDEN VAR (kullanıcı bildirimi, 28.08.2026)
   -------------------------------------------
   Anadolu Lisesi'nde seçmeli Kur'an-ı Kerim dersi, 30 mevcutta OTOMATİK
   2 gruba bölünüyor ve ders yükü 2 saatten 4 saate çıkıyordu. Ekranda sabit
   bir "(2 Grup)" etiketi vardı; değiştirilemiyordu. Okul dersi tek grupta
   okutuyorsa bu yük gerçek değildi ve norm fazla çıkıyordu.

   Grup sayısı artık seçilebilir. Bu test hem hesabı hem de seçimin
   KAYBOLMAMASINI denetler: müfredat tazelendiğinde seçim silinseydi, ders
   yükü sessizce iki katına dönerdi — ekranda hiçbir uyarı çıkmadan.
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

const ne = w.normEngine, st = w.appState, ce = w.curriculumEngine;
if (typeof ne.evaluateCourseMultiplier !== "function")
    olumcul("evaluateCourseMultiplier bulunamadı.");
if (typeof st.updateCourseGroupCount !== "function")
    olumcul("updateCourseGroupCount bulunamadı.");

/* ---- 1) Kullanıcının bildirdiği somut vaka ---------------------------- */
{
    const kuran = (g) => Object.assign(
        { ders: "Kur'an-ı Kerim", saat: 2, kategori: "SEÇMELİ DERSLER" },
        g ? { grupSayisi: g } : {});

    const oto = ne.evaluateCourseMultiplier(kuran(null), 30, "anadolu_lisesi", "9", 0);
    kontrol("30 mevcutta barem 2 grup", oto.otomatikGrup === 2, String(oto.otomatikGrup));
    kontrol("seçim yokken otomatik uygulanır", oto.groupCount === 2 && oto.calculatedLoad === 4,
        oto.groupCount + " grup / " + oto.calculatedLoad + " saat");
    kontrol("seçim yokken 'elle ayarlandı' değil", oto.elleAyarlandi === false);

    const tek = ne.evaluateCourseMultiplier(kuran(1), 30, "anadolu_lisesi", "9", 0);
    kontrol("1 grup seçilince yük yarıya iner",
        tek.groupCount === 1 && tek.calculatedLoad === 2,
        tek.groupCount + " grup / " + tek.calculatedLoad + " saat");
    kontrol("1 grup seçimi 'elle ayarlandı' işaretlenir", tek.elleAyarlandi === true);
    kontrol("elle seçimde barem bilgisi korunur", tek.otomatikGrup === 2);
}

/* ---- 2) Barem üstüne çıkılamaz ---------------------------------------- */
// Mevzuat üst sınırı verir. Kutuda zaten baremden büyük seçenek yok, ama
// veri başka yoldan (içe aktarma, elle düzenlenmiş yedek) gelebilir.
{
    const asiri = ne.evaluateCourseMultiplier(
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: 9 }, 30, "anadolu_lisesi", "9", 0);
    kontrol("barem üstü seçim baremle sınırlanır", asiri.groupCount === 2,
        String(asiri.groupCount));

    const sifir = ne.evaluateCourseMultiplier(
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: 0 }, 30, "anadolu_lisesi", "9", 0);
    kontrol("0 ve altı seçim yok sayılır", sifir.groupCount === 2, String(sifir.groupCount));

    const sacma = ne.evaluateCourseMultiplier(
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: "abc" }, 30, "anadolu_lisesi", "9", 0);
    kontrol("sayı olmayan seçim yok sayılır", sacma.groupCount === 2, String(sacma.groupCount));
}

/* ---- 3) Gruplanmayan derste seçim etkisiz ---------------------------- */
// Kutu zaten görünmüyor; veri yine de gelirse yükü bozmamalı.
{
    const mat = ne.evaluateCourseMultiplier(
        { ders: "Matematik", saat: 6, grupSayisi: 3 }, 30, "anadolu_lisesi", "9", 0);
    kontrol("gruplanmayan derste barem 1", mat.otomatikGrup === 1);
    kontrol("gruplanmayan derste yük değişmez",
        mat.groupCount === 1 && mat.calculatedLoad === 6,
        mat.groupCount + " grup / " + mat.calculatedLoad + " saat");
}

/* ---- 4) Atölye dersinde de çalışıyor mu? ----------------------------- */
// "Grup oluşturulabilen TÜM dersler" — kural tek bir derse özel değil.
{
    const atolye = (g) => Object.assign(
        { ders: "Elektrik Atölyesi", saat: 10, kategori: "MESLEK DERSLERİ", isAtolye: true },
        g ? { grupSayisi: g } : {});
    const oto = ne.evaluateCourseMultiplier(
        atolye(null), 30, "mesleki_ve_teknik_anadolu_lisesi", "9", 0);
    kontrol("atölyede barem 1'den büyük (ölçüm geçerli)", oto.otomatikGrup > 1,
        String(oto.otomatikGrup));
    const tek = ne.evaluateCourseMultiplier(
        atolye(1), 30, "mesleki_ve_teknik_anadolu_lisesi", "9", 0);
    kontrol("atölyede de seçim uygulanır",
        tek.groupCount === 1 && tek.calculatedLoad === 10,
        tek.groupCount + " grup / " + tek.calculatedLoad + " saat");
}

/* ---- 5) Seçim şubede saklanıyor ve KAYBOLMUYOR ----------------------- */
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    const z = ce.getMandatoryCourses("anadolu_lisesi", "9", null, null) || [];
    st.addSection({ subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: z,
        secmeliDersler: [{ ders: "Kur'an-ı Kerim", saat: 2,
            kategori: "SEÇMELİ DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi" }] });
    const sec = st.state.subeler[0];
    kontrol("seçmeli ders şubede duruyor (ölçüm geçerli)",
        (sec.secmeliDersler || []).length === 1);

    st.updateCourseGroupCount(sec.id, "Kur'an-ı Kerim", 1);
    const ders = st.state.subeler[0].secmeliDersler[0];
    kontrol("seçim derse yazıldı", ders.grupSayisi === 1, String(ders.grupSayisi));

    // Kaydet/yükle turu: seçim JSON'da hayatta kalmalı.
    const kopya = JSON.parse(JSON.stringify(st.state));
    st.state = kopya;
    st.sanitizeExistingState();
    const sonra = st.state.subeler[0].secmeliDersler[0];
    kontrol("temizlik seçimi silmiyor", sonra.grupSayisi === 1, String(sonra.grupSayisi));

    // Seçimi kaldırınca otomatik hesaba dönmeli.
    st.updateCourseGroupCount(st.state.subeler[0].id, "Kur'an-ı Kerim", null);
    kontrol("seçim kaldırılınca otomatiğe dönülür",
        st.state.subeler[0].secmeliDersler[0].grupSayisi === undefined);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ GRUP SAYISI SEÇİMİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ GRUP SAYISI SEÇİMİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
