/* ===========================================================================
   NormMatik — HAFTALIK HEDEF SAAT ÇİZELGEDEN GELİR   (12.09.2026)

   NEDEN VAR
   ---------
   Uygulama haftalık hedef saati UYDURUYORDU. database.js içinde elle
   yazılmış bir tablo vardı:

        meslek/teknik ise:  9. sınıf -> 44,  diğerleri -> 45

   Resmî çerçeve programlarında STANDART AMP/ATP çizelgelerinde 9. sınıf
   45'tir; 44 hiçbirine uymuyordu. (PROTOKOL çizelgeleri ayrıdır: ör.
   Gazetecilik protokol ATP satırı "40 44 45 45" — onlar olduğu gibi okunur.)
   Sonuç ekranda "3 saat eksik seçmeli ders" olarak görünüyordu, oysa çizelge
   4 saat istiyor. Uygulamayı dinleyen okul her şubede 1 saat eksik yük
   oluşturuyordu — 20 şubede 20 saat, yaklaşık bir norm.

   Kullanıcının koyduğu ilke (12.09.2026): "önce toplam kaç yazıyor çizelgede,
   bunların kaçı ortak olmalı… teyitli gidilmeli. Uydurma sayı mı olur."

   BU TEST ŞUNLARI BAĞLAR
     1. Hedef, çizelgenin kendi TOPLAM DERS SAATİ satırından gelir.
     2. Standart 9. sınıf çizelgelerinde toplam 45; protokol çizelgeleri
        kendi değeriyle okunur, 45'e zorlanmaz.
     3. Çizelge bulunamazsa sayı UYDURULMAZ (null döner).
     4. Veri tabanındaki her çizelge kendi toplamlarını taşır ve derslerin
        kategori toplamı bu sayılarla TUTAR.

   ÇALIŞTIRMA: node tools/test_hedefSaat.mjs
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

const ce = w.curriculumEngine, db = w.dbService;
const DB = vm.runInContext("STRICT_PDF_CURRICULUM_DB", ctx);
if (!ce || typeof ce.cizelgeToplamlari !== "function") {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: curriculumEngine.cizelgeToplamlari yok.");
    process.exit(1);
}

/* ---- 1) Bilinen örnek: Sağlık Bakım Teknisyenliği --------------------- */
{
    const TUR = "mesleki_ve_teknik_anadolu_lisesi";
    const DAL = "SAĞLIK BAKIM TEKNİSYENLİĞİ DALI";
    const t9 = ce.cizelgeToplamlari(TUR, "9", "saglik_hizmetleri", DAL);
    kontrol("9. sınıf çizelge toplamı okunuyor", !!t9, String(t9));
    if (t9) {
        kontrol("9. sınıf toplam 45", t9.toplam === 45, String(t9.toplam));
        kontrol("9. sınıf ortak 28", t9.ortak === 28, String(t9.ortak));
        kontrol("9. sınıf meslek 12", t9.meslek === 12, String(t9.meslek));
        kontrol("9. sınıf seçmeli 4", t9.secmeli === 4, String(t9.secmeli));
        kontrol("9. sınıf rehberlik 1", t9.rehberlik === 1, String(t9.rehberlik));
        kontrol("ortak+meslek+seçmeli+rehberlik = toplam",
            (t9.ortak + t9.meslek + t9.secmeli + t9.rehberlik) === t9.toplam,
            `${t9.ortak}+${t9.meslek}+${t9.secmeli}+${t9.rehberlik} != ${t9.toplam}`);
    }
    const hedef9 = db.getOfficialTargetHours(TUR, "9", "saglik_hizmetleri", DAL);
    kontrol("hedef saat 45 (eski kod 44 derdi)", hedef9 === 45, String(hedef9));
}

/* ---- 2) Standart 9. sınıf çizelgelerinde toplam 45 --------------------
   ÖLÇÜLDÜ (12.09.2026): standart AMP/ATP çizelgelerinde 9. sınıf toplamı
   45'tir; eski koddaki 44 tahmini hiçbir çizelgeye uymuyordu.
   İSTİSNA: PROTOKOL çizelgeleri (sektörle protokollü programlar) farklıdır —
   ör. Gazetecilik protokol ATP satırı "40 44 45 45". Onlar olduğu gibi
   okunur, 45'e zorlanmaz. Test bu ayrımı bilerek yapar. */
{
    let standart = 0, sapan = [], protokol = 0;
    for (const alan of Object.keys(DB)) {
        const liste = DB[alan] && DB[alan]["9"];
        if (!liste) continue;
        for (const c of liste) {
            const t = (c.chartTotals || {}).toplam;
            if (t == null) continue;
            if (/PROTOKOL/i.test(c.title || "")) { protokol++; continue; }
            standart++;
            if (t !== 45) sapan.push(alan + " / " + (c.title || "").slice(0, 38) + " = " + t);
        }
    }
    kontrol("standart 9. sınıf çizelgeleri okundu", standart > 100, String(standart));
    kontrol("standart 9. sınıf çizelgelerinde toplam 45", sapan.length === 0,
        sapan.slice(0, 3).join(" | "));
    kontrol("protokol çizelgeleri ayrı tutuldu", protokol > 0, String(protokol));
}

/* ---- 3) Sayı uydurulmuyor -------------------------------------------- */
{
    const yok = db.getOfficialTargetHours("mesleki_ve_teknik_anadolu_lisesi", "9",
        "olmayan_bir_alan_kimligi", "OLMAYAN DAL");
    kontrol("bilinmeyen alanda hedef UYDURULMUYOR", yok === null, String(yok));

    const src = fs.readFileSync(path.join(KOK, "js", "database.js"), "utf8");
    kontrol("eski sabit 44 tahmini kodda yok",
        !/if\s*\(gStr === "9"\)\s*return 44/.test(src));
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    kontrol("arayüzdeki 'hedef yoksa 40 say' varsayımı kaldırıldı",
        !/getTargetWeeklyHours\(section, schoolType\)\s*\n\s*:\s*40;/.test(ui));
}

/* ---- 4) Veri tabanı: toplamlar var ve derslerle TUTUYOR --------------- */
{
    let cizelge = 0, toplamsiz = 0, tutmayan = 0;
    for (const alan of Object.keys(DB)) {
        for (const sinif of Object.keys(DB[alan])) {
            for (const c of DB[alan][sinif]) {
                cizelge++;
                const t = c.chartTotals;
                if (!t || t.toplam == null) { toplamsiz++; continue; }
                if (c.totalsMismatch) tutmayan++;
                // ortak dersler toplamı çizelgenin ortak satırıyla aynı olmalı
                if (t.ortak != null) {
                    const ortak = (c.courses || [])
                        .filter(x => x.kategori === "ORTAK DERSLER")
                        .reduce((s, x) => s + x.saat, 0);
                    if (ortak !== t.ortak) tutmayan++;
                }
            }
        }
    }
    kontrol("çizelgeler sayıldı", cizelge > 1000, String(cizelge));
    // BİLİNEN AÇIK (12.09.2026): iki çizelgede toplam satırı okunamıyor —
    // Radyo-Televizyon PROTOKOL ATP, 9. sınıf. Sebebi ölçüldü: o çizelgede
    // HAZIRLIK sütunu da var (satır "TOPLAM 37 28 27 25 10", beş değer),
    // ayrıştırıcı ise dört sütun okuyor. Sayı UYDURULMUYOR; bu iki çizelgede
    // hedef gösterilmiyor. Mandal: sayı ARTAMAZ.
    kontrol("toplamsız çizelge sayısı artmadı (bilinen açık: 2)", toplamsiz <= 2,
        String(toplamsiz));
    kontrol("ders toplamları çizelgeyle TUTUYOR", tutmayan === 0, String(tutmayan));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ HEDEF SAAT HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ HEDEF SAAT ÇİZELGEDEN GELİYOR — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
