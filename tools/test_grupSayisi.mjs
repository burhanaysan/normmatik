/* ===========================================================================
   NormMatik™ — Grup sayısı seçimi testi
   ===========================================================================
   KURAL: Mevzuatın grup baremi ÜST SINIRDIR; okulun dersi fiilen kaç grupta
   okuttuğu okulun kararıdır. İdareci grup sayısını aşağı çekebilir, baremin
   üstüne çıkamaz.

   NEDEN VAR (kullanıcı bildirimi, 28.08.2026)
   -------------------------------------------
   İmam Hatip Ortaokulu'nda Kur'an-ı Kerim dersi, 30 mevcutta OTOMATİK
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

    const oto = ne.evaluateCourseMultiplier(kuran(null), 30, "imam_hatip_ortaokulu", "5", 0);
    kontrol("30 mevcutta barem 2 grup", oto.otomatikGrup === 2, String(oto.otomatikGrup));
    kontrol("seçim yokken otomatik uygulanır", oto.groupCount === 2 && oto.calculatedLoad === 4,
        oto.groupCount + " grup / " + oto.calculatedLoad + " saat");
    kontrol("seçim yokken 'elle ayarlandı' değil", oto.elleAyarlandi === false);

    const tek = ne.evaluateCourseMultiplier(kuran(1), 30, "imam_hatip_ortaokulu", "5", 0);
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
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: 9 }, 30, "imam_hatip_ortaokulu", "5", 0);
    kontrol("barem üstü seçim baremle sınırlanır", asiri.groupCount === 2,
        String(asiri.groupCount));

    const sifir = ne.evaluateCourseMultiplier(
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: 0 }, 30, "imam_hatip_ortaokulu", "5", 0);
    kontrol("0 ve altı seçim yok sayılır", sifir.groupCount === 2, String(sifir.groupCount));

    const sacma = ne.evaluateCourseMultiplier(
        { ders: "Kur'an-ı Kerim", saat: 2, grupSayisi: "abc" }, 30, "imam_hatip_ortaokulu", "5", 0);
    kontrol("sayı olmayan seçim yok sayılır", sacma.groupCount === 2, String(sacma.groupCount));
}

/* ---- 3) Gruplanmayan derste seçim etkisiz ---------------------------- */
// Kutu zaten görünmüyor; veri yine de gelirse yükü bozmamalı.
{
    const mat = ne.evaluateCourseMultiplier(
        { ders: "Matematik", saat: 6, grupSayisi: 3 }, 30, "imam_hatip_ortaokulu", "5", 0);
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
// NOT: İmam Hatip Ortaokulu'nda Kur'an-ı Kerim ZORUNLU derstir, çizelgeden
// gelir. Testin ilk yazımında ayrıca seçmeli olarak da ekleniyordu; ders adına
// göre arama İLK kaydı (zorunlu olanı) bulduğu için seçim yanlış kayda
// yazılıyordu. Fixture artık çizelgeden gelen dersi kullanıyor.
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "imam_hatip_ortaokulu";
    st.addSection({ subeAdi: "5-A", sinifSeviyesi: "5", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("imam_hatip_ortaokulu", "5", null, null),
        secmeliDersler: [] });
    const sec = st.state.subeler[0];
    const kuranDersi = () => (st.state.subeler[0].zorunluDersler || [])
        .find(d => /kur.?an/i.test(d.ders || ""));
    kontrol("Kur'an-ı Kerim çizelgeden geldi (ölçüm geçerli)", !!kuranDersi());

    st.updateCourseGroupCount(sec.id, kuranDersi().ders, 1);
    kontrol("seçim derse yazıldı", kuranDersi().grupSayisi === 1,
        String(kuranDersi().grupSayisi));

    const kopya = JSON.parse(JSON.stringify(st.state));
    st.state = kopya;
    st.sanitizeExistingState();
    kontrol("temizlik seçimi silmiyor", kuranDersi().grupSayisi === 1,
        String(kuranDersi().grupSayisi));

    st.updateCourseGroupCount(st.state.subeler[0].id, kuranDersi().ders, null);
    kontrol("seçim kaldırılınca otomatiğe dönülür",
        kuranDersi().grupSayisi === undefined);
}

/* ---- 6) SEÇİM NORM HESABINA YANSIYOR MU? ----------------------------- */
// Ekranda sayının değişmesi tek başına bir şey ifade etmez; asıl soru
// öğretmen normunun değişip değişmediğidir.
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "imam_hatip_ortaokulu";
    st.addSection({ subeAdi: "5-A", sinifSeviyesi: "5", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("imam_hatip_ortaokulu", "5", null, null),
        secmeliDersler: [] });
    const sec = st.state.subeler[0];
    const kuran = (sec.zorunluDersler || []).find(d => /kur.?an/i.test(d.ders || ""));
    kontrol("norm testi için ders bulundu (ölçüm geçerli)", !!kuran);

    const toplam = () => ne.calculateSchoolNorms(
        st.state.subeler, {}, "imam_hatip_ortaokulu", {}).totalHours;

    const once = toplam();
    st.updateCourseGroupCount(sec.id, kuran.ders, 1);
    const sonra = toplam();
    kontrol("1 grup seçilince okul yükü dersin saati kadar azalıyor",
        once - sonra === (kuran.saat || 0), once + " -> " + sonra);

    st.updateCourseGroupCount(sec.id, kuran.ders, null);
    kontrol("seçim kaldırılınca yük geri geliyor", toplam() === once, String(toplam()));
}

/* ---- 6b) GRUP BÖLÜNMESİ OLMAYAN OKUL TÜRLERİ ------------------------- */
// Norm Kadro Yönetmeliği'nin tamamı tarandı: ders yükü için grup bölünmesi
// YALNIZCA meslekî-teknik kurumlara (Md. 22/1-ç) ile spor ve güzel sanatlar
// liselerine (Md. 22/4) verilmiştir; imam hatipte çizelgenin kendi hükmüyle
// sınırlıdır; MESEM'de açıkça yasaktır (Md. 22/2). Anadolu/Fen/Sosyal
// Bilimler liseleri ve genel ortaokulda hiçbir ders bölünemez.
// (Okul müdürü bildirimi + mevzuat teyidi, 05.09.2026.)
{
    for (const tur of ["anadolu_lisesi", "fen_lisesi", "sosyal_bilimler_lisesi",
        "ortaokul_temel_egitim"]) {
        kontrol(tur + ": grup bölünmesi kapalı",
            ne.grupBolunmesiSerbestMi(tur) === false);
        const m = ne.evaluateCourseMultiplier(
            { ders: "Kur'an-ı Kerim", saat: 2 }, 30, tur, "9", 0);
        kontrol(tur + ": Kur'an-ı Kerim bölünmüyor",
            m.groupCount === 1 && m.calculatedLoad === 2,
            m.groupCount + " grup / " + m.calculatedLoad + " saat");
        const a = ne.evaluateCourseMultiplier(
            { ders: "Elektrik Atölyesi", saat: 10, isAtolye: true }, 30, tur, "9", 0);
        kontrol(tur + ": atölye işaretli ders de bölünmüyor",
            a.groupCount === 1, String(a.groupCount));
    }
    for (const tur of ["mesleki_ve_teknik_anadolu_lisesi", "spor_lisesi",
        "guzel_sanatlar_muzik", "imam_hatip_ortaokulu"]) {
        kontrol(tur + ": grup bölünmesi açık",
            ne.grupBolunmesiSerbestMi(tur) === true);
    }
    kontrol("MESEM'de bölünme kapalı (Md. 22/2)",
        ne.grupBolunmesiSerbestMi("mesleki_egitim_merkezi") === false);
}


/* ---- 7) Demo kilidi grup seçimini de kapsıyor mu? -------------------- */
// Diğer bütün değiştirici işlevler kilidi denetliyor; bu yeni işlev de
// denetlemezse, lisanssız kullanıcı kilitli şubenin ders yükünü
// değiştirebilirdi.
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "imam_hatip_ortaokulu";
    for (let i = 0; i < 6; i++) {
        st.addSection({ subeAdi: "5-" + "ABCDEF"[i], sinifSeviyesi: "5",
            ogrenciSayisi: 30, zorunluDersler: [],
            secmeliDersler: [{ ders: "Kur'an-ı Kerim", saat: 2,
                kategori: "SEÇMELİ DERSLER", atananBrans: "Din Kültürü ve Ahlak Bilgisi" }] });
    }
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: false, isDemo: true, maxSections: 3, allowExport: false };
    const kilitli = st.state.subeler[5];
    kontrol("6. şube demoda kilitli (ölçüm geçerli)",
        typeof st.subeKilitliMi === "function" && st.subeKilitliMi(kilitli.id) === true);
    st.updateCourseGroupCount(kilitli.id, "Kur'an-ı Kerim", 1);
    kontrol("kilitli şubede grup sayısı değiştirilemiyor",
        kilitli.secmeliDersler[0].grupSayisi === undefined,
        String(kilitli.secmeliDersler[0].grupSayisi));
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };
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
