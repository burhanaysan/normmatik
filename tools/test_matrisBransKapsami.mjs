/* ===========================================================================
   NormMatik™ — Master matris branş kapsamı testi
   ===========================================================================
   NEDEN VAR (ölçüldü 06.09.2026, yük mutabakatı çalışması sırasında)
   -----------------------------------------------------------------
   Master matris ham çizelgeyi okuyordu; norm motoru ise eğik çizgili dersleri
   `dersiGenislet` ile branşlara AÇIYORDU. Sonuç:

       "Görsel Sanatlar/Müzik" dersi iki branşa bölünmüş bir okulda
       MÜZİK branşı motorda 6 saat yük ve norm taşıyordu,
       ama master matriste TEK BİR SATIRI bile yoktu.

   Branş detay raporunda görünüyor, master matriste görünmüyordu: aynı
   uygulamanın iki raporu birbiriyle çelişiyordu. Müdür "Müzik öğretmenim var,
   raporda niye yok?" diye sorduğunda verecek cevap yoktu.

   İkinci kusur: birleştirilmiş şube mükerrer kontrolü anahtarı yalnızca DERS
   ADINA bakıyordu. Bir ders hem bölünmüş hem birleştirilmişse, ikinci branş
   payı "mükerrer" sanılıp sessizce düşüyordu.

   Bu test iki şeyi sabitler:
     1) Motorun yük yazdığı HER branşın matriste karşılığı vardır.
     2) Bölünme + birleştirme birlikte kullanıldığında hiçbir branş payı
        kaybolmaz.

   Çalıştırma: node tools/test_matrisBransKapsami.mjs
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

const st = w.appState, ce = w.curriculumEngine, ne = w.normEngine;
if (!st || !ce || !ne) olumcul("motorlar yüklenemedi.");
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};
const R = new w.MebReportsEngine(w.dbService, ne, ce);

/* ---- gerçek müfredatla okul kur ---------------------------------------- */
function okulKur({ bol = false, birlesik = false } = {}) {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st.state.okulBilgisi.okulAdi = "Kapsam Testi Anadolu Lisesi";
    [["9", 34], ["9", 33], ["9", 34], ["10", 34], ["11", 28], ["12", 24]]
        .forEach(([g, og], i) => st.addSection({
            subeAdi: g + "-" + "ABCDEF"[i], sinifSeviyesi: g, ogrenciSayisi: og,
            zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
        }));

    let bolunenSayisi = 0;
    if (bol) {
        st.state.subeler.forEach(sec => {
            if (String(sec.sinifSeviyesi) !== "9") return;
            (sec.zorunluDersler || []).forEach(c => {
                const ad = c.ders || c.ders_adi || "";
                if (!ad.includes("/")) return;
                const izinli = ne.bolunebilirBranslar(c);
                if (izinli.length >= 2) {
                    c.bolunenBranslar = izinli.slice(0, 2);
                    if (birlesik) {
                        // Aynı ders hem bölünmüş hem birleştirilmiş: eski
                        // anahtarın ikinci branş payını yuttuğu durum.
                        const digerleri = st.state.subeler
                            .filter(s => s.id !== sec.id && String(s.sinifSeviyesi) === "9")
                            .map(s => s.id);
                        if (digerleri.length) c.birlesikSubeler = digerleri;
                    }
                    bolunenSayisi++;
                }
            });
        });
    }
    return bolunenSayisi;
}

/* ---- 0) Ölçüm geçerli mi? ---------------------------------------------- */
const bolunen = okulKur({ bol: true });
kontrol("ölçüm geçerli: 9. sınıflarda bölünebilir eğik çizgili ders bulundu",
    bolunen >= 2, bolunen + " ders");
if (bolunen < 2) olumcul("Bölünecek ders yok; test bir şey ölçemez.");

/* ---- 1) Motorun yük yazdığı her branş matriste var mı? ----------------- */
{
    const grid = R.generateMasterLoadGrid(st.state);
    const eksik = Object.keys(grid.branchReportMap || {})
        .filter(bn => (grid.branchReportMap[bn].totalHours || 0) > 0)
        .filter(bn => !grid.branchGroups[bn]);

    kontrol("motorda yükü olan HER branşın matriste satırı var",
        eksik.length === 0,
        eksik.length ? "matriste yok: " + eksik.join(", ") : "");

    // Bölünen ders gerçekten iki branşın altında görünmeli.
    const bolunmusOlanlar = [];
    Object.entries(grid.branchGroups).forEach(([bn, g]) => {
        Object.values(g.courses).forEach(c => {
            if (c.isBolunmus) bolunmusOlanlar.push(bn + " / " + c.courseName);
        });
    });
    kontrol("bölünmüş ders birden fazla branşın altında listeleniyor",
        bolunmusOlanlar.length >= 2, bolunmusOlanlar.join(" | ") || "hiç yok");

    kontrol("bölünmüş ders kullanıcıya işaretleniyor (isBolunmus)",
        bolunmusOlanlar.length > 0 &&
        Object.values(grid.branchGroups).some(g =>
            Object.values(g.courses).some(c => c.isBolunmus && c.bolunmeParcasi)));

    // Alt satır (öğrenci saati) genişletmeden ETKİLENMEMELİ.
    const sutunToplami = grid.subeler.reduce((t, s) => t + (grid.sectionTotals[s.id] || 0), 0);
    const hamCizelge = st.state.subeler.reduce((t, s) =>
        t + [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])]
            .reduce((a, c) => a + (parseInt(c.saat || c.ders_saati || 0, 10) || 0), 0), 0);
    kontrol("matris alt satırı ham çizelge saatini göstermeye devam ediyor",
        sutunToplami === hamCizelge, sutunToplami + " / " + hamCizelge);
    kontrol("mutabakattaki ham sayaç da alt satırla aynı",
        grid.yukMutabakati && grid.yukMutabakati.hamCizelgeSaati === sutunToplami,
        grid.yukMutabakati ? String(grid.yukMutabakati.hamCizelgeSaati) : "yok");
}

/* ---- 2) Branş şeridi ile satır toplamı artık tutuyor mu? --------------- */
/* Yönetici düşümü ve koordinatörlük dışında ayrışma KALMAMALI: kalırsa
   matris yine motorla farklı bir şey anlatıyor demektir. */
{
    okulKur({ bol: true });
    const grid = R.generateMasterLoadGrid(st.state);
    const aciklanamayan = [];
    Object.keys(grid.branchGroups).forEach(bn => {
        const g = grid.branchGroups[bn];
        const r = grid.branchReportMap[bn];
        if (!r) return;                                  // Rehberlik: motorda liste dışı
        const satir = Object.values(g.courses).reduce((t, c) => t + (c.totalHours || 0), 0);
        const kalan = (r.totalHours - satir)
            + (r.adminDeductedHours || 0) - (r.coordinatorHours || 0);
        if (kalan !== 0) aciklanamayan.push(`${bn}: şerit ${r.totalHours}, satır ${satir}, kalan ${kalan}`);
    });
    kontrol("branş şeridi ile ders satırları arasında açıklanamayan fark yok",
        aciklanamayan.length === 0, aciklanamayan.join(" | "));
}

/* ---- 3) Bölünme + birleştirme birlikte: hiçbir pay kaybolmuyor --------- */
{
    okulKur({ bol: true, birlesik: true });
    const subeler = st.state.subeler;
    const r = ne.calculateSchoolNorms(subeler, {}, "anadolu_lisesi", {});

    // Birleştirme sebebiyle ders TEK KEZ sayılır, ama İKİ BRANŞA da yazılır.
    const bolunenBranslar = new Set();
    subeler.forEach(sec => (sec.zorunluDersler || []).forEach(c => {
        (c.bolunenBranslar || []).forEach(b => bolunenBranslar.add(b));
    }));
    kontrol("ölçüm geçerli: iki branşa bölünmüş birleşik ders kuruldu",
        bolunenBranslar.size >= 2, [...bolunenBranslar].join(", "));

    const yuksuz = [...bolunenBranslar].filter(b => {
        const br = r.branchReport.find(x => x.branchName === b);
        return !br || (br.totalHours || 0) <= 0;
    });
    kontrol("bölünme+birleştirme durumunda hiçbir branş payı düşmüyor",
        yuksuz.length === 0, yuksuz.length ? "yükü sıfır kalan: " + yuksuz.join(", ") : "");

    const grid = R.generateMasterLoadGrid(st.state);
    const eksik = [...bolunenBranslar].filter(b => !grid.branchGroups[b]);
    kontrol("bölünme+birleştirme durumunda her branş matriste de var",
        eksik.length === 0, eksik.join(", "));

    kontrol("mutabakat bu senaryoda da tutuyor",
        grid.yukMutabakati && grid.yukMutabakati.tutarli === true);
}

/* ---- 4) Bölünme YOKKEN birleştirme davranışı değişmedi mi? ------------- */
/* Anahtara ekleme yaptık; bölünmesiz birleşik derslerde eski sonuç
   birebir korunmalı, yoksa sessizce norm kaydırmış oluruz. */
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    [["11", 10], ["12", 10]].forEach(([g, og], i) => st.addSection({
        subeAdi: g + "-" + "AB"[i], sinifSeviyesi: g, ogrenciSayisi: og,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
    }));
    const [a, b] = st.state.subeler;
    const ayni = (a.zorunluDersler || []).find(c =>
        (b.zorunluDersler || []).some(d => (d.ders || d.ders_adi) === (c.ders || c.ders_adi)));
    if (!ayni) olumcul("İki şubede ortak ders bulunamadı; birleştirme kurulamıyor.");
    const ad = ayni.ders || ayni.ders_adi;
    const saat = parseInt(ayni.saat || ayni.ders_saati || 0, 10) || 0;

    const oncekiToplam = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {}).totalHours;
    (a.zorunluDersler || []).forEach(c => { if ((c.ders || c.ders_adi) === ad) c.birlesikSubeler = [b.id]; });
    (b.zorunluDersler || []).forEach(c => { if ((c.ders || c.ders_adi) === ad) c.birlesikSubeler = [a.id]; });
    const sonrakiToplam = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {}).totalHours;

    kontrol("bölünmesiz birleştirme dersi hâlâ TEK KEZ sayıyor",
        sonrakiToplam === oncekiToplam - saat,
        `${oncekiToplam} -> ${sonrakiToplam}, ders ${ad} (${saat}s)`);

    const grid = R.generateMasterLoadGrid(st.state);
    kontrol("bölünmesiz birleştirmede mutabakat düşümü ölçülüyor",
        grid.yukMutabakati && grid.yukMutabakati.birlesikSubeDusumu === saat,
        grid.yukMutabakati ? String(grid.yukMutabakati.birlesikSubeDusumu) : "yok");
}

/* ---- 5) Kaynak sabitleri ----------------------------------------------- */
{
    const RE = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    kontrol("matris motorla aynı genişletmeyi kullanıyor",
        /dersiGenislet\(c\)/.test(RE));
    kontrol("mükerrer anahtarı bölünme payını içeriyor (rapor)",
        /_bolunmusBrans \|\| c\._dagitilmisBrans/.test(RE));

    const NE = fs.readFileSync(path.join(KOK, "js", "normEngine.js"), "utf8");
    kontrol("mükerrer anahtarı bölünme payını içeriyor (motor)",
        /course\._bolunmusBrans \|\| course\._dagitilmisBrans/.test(NE));

    const UI = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    // Sınıf adı 06.09.2026 yeniden tasarımında değişti: pill-bolunmus -> dd-rozet bolunmus
    kontrol("bölünmüş ders arayüzde işaretleniyor", /dd-rozet bolunmus/.test(UI));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ MATRİS BRANŞ KAPSAMI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ MATRİS BRANŞ KAPSAMI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
