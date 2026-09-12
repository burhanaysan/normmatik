/* ===========================================================================
   NormMatik — ŞUBE KAPASİTESİ (bölme sihirbazının dayanağı)   12.09.2026

   NEDEN VAR
   ---------
   "Sınıf & Şube Bölme Sihirbazı"nda kapasite eşiği koda SABİT 34 yazılmıştı
   ve hiçbir yerde dayanağı yoktu. Kullanıcı haklı olarak "böyle bir kural
   var mı, yoksa kaldıralım" diye sordu.

   MEVZUATA BAKILDI — kural VAR, ama eşik eksikti:
   MEB Ortaöğretim Kurumları Yönetmeliği (Değişik: RG-22/2/2025-32821):
     • Merkezî sınav puanıyla öğrenci alan okul/program/alanlar ile SPOR ve
       GÜZEL SANATLAR liselerinde bir şubeye alınacak öğrenci sayısı 30.
     • Anadolu lisesi, Anadolu imam hatip lisesi, MTAL Anadolu meslek
       programı, çok programlı Anadolu lisesi ve mesleki eğitim
       merkezlerinde 34 olması esas.
     • Zorunlu hâllerde ve fiziki şartlara göre 40'a kadar artırılabilir —
       yani 34'ü aşmak tek başına bölmeyi ZORUNLU kılmaz.

   Bu yönetmelik ORTAÖĞRETİM içindir; ortaokul/ilkokul ve özel eğitim
   okulları kapsam dışıdır ve sayı UYDURULMAZ.

   ÇALIŞTIRMA: node tools/test_subeKapasitesi.mjs
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

const ne = w.normEngine;
if (!ne || typeof ne.subeKapasitesi !== "function") {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: normEngine.subeKapasitesi yok.");
    process.exit(1);
}

/* ---- 1) 30 kişilik türler --------------------------------------------- */
const OTUZ = ["fen_lisesi", "hazirlik_fen_lisesi", "sosyal_bilimler_lisesi",
    "spor_lisesi", "guzel_sanatlar_muzik", "guzel_sanatlar_gorsel",
    "guzel_sanatlar_tiyatro", "guzel_sanatlar_turk_muzigi",
    "anadolu_teknik_programi", "ozel_program_fen_lisesi",
    "ozel_program_sosyal_lisesi", "ozel_program_hazirlik_anadolu_lisesi"];
for (const t of OTUZ) {
    const k = ne.subeKapasitesi(t, 0);
    kontrol("30 sınırı: " + t, k.esas === 30, String(k.esas));
}

/* ---- 2) 34 kişilik türler --------------------------------------------- */
const OTUZDORT = ["anadolu_lisesi", "hazirlik_anadolu_lisesi",
    "anadolu_imam_hatip_lisesi", "hazirlik_imam_hatip_lisesi",
    "mesleki_ve_teknik_anadolu_lisesi", "mesleki_egitim_merkezi"];
for (const t of OTUZDORT) {
    const k = ne.subeKapasitesi(t, 0);
    kontrol("34 sınırı: " + t, k.esas === 34, String(k.esas));
}

/* ---- 3) Kapsam dışı kademeler — sayı UYDURULMAZ ----------------------- */
for (const t of ["ortaokul_temel_egitim", "imam_hatip_ortaokulu",
                 "meslek_ortaokulu", "ozel_egitim_meslek_okulu",
                 "ozel_egitim_uygulama_okulu"]) {
    const k = ne.subeKapasitesi(t, 99);
    kontrol("kapsam dışı: " + t, k.durum === "kapsamDisi" && k.esas === null,
        k.durum + "/" + k.esas);
}

/* ---- 4) Eşik davranışı ------------------------------------------------ */
{
    const al = (n) => ne.subeKapasitesi("anadolu_lisesi", n).durum;
    kontrol("34 öğrenci: uygun", al(34) === "uygun", al(34));
    kontrol("35 öğrenci: esas aşıldı", al(35) === "esasAsildi", al(35));
    kontrol("40 öğrenci: hâlâ esas aşıldı (40'a kadar izin var)",
        al(40) === "esasAsildi", al(40));
    kontrol("41 öğrenci: üst sınır aşıldı", al(41) === "ustSinirAsildi", al(41));

    const fen = (n) => ne.subeKapasitesi("fen_lisesi", n).durum;
    kontrol("fen lisesi 30: uygun", fen(30) === "uygun", fen(30));
    kontrol("fen lisesi 31: esas aşıldı (eski kod 34'e kadar uygun derdi)",
        fen(31) === "esasAsildi", fen(31));
}

/* ---- 5) Üst sınır ve kaynak ------------------------------------------- */
{
    const k = ne.subeKapasitesi("anadolu_lisesi", 0);
    kontrol("üst sınır 40", k.ustSinir === 40, String(k.ustSinir));
    kontrol("dayanak yazılı", /Ortaöğretim Kurumları Yönetmeliği/.test(k.kaynak || ""),
        k.kaynak || "(boş)");
    kontrol("dayanakta değişiklik tarihi var", /32821|22\/2\/2025/.test(k.kaynak || ""),
        k.kaynak || "");
}

/* ---- 6) Sihirbaz bu kuralı kullanıyor mu? ----------------------------- */
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    kontrol("sihirbaz motordaki kuralı çağırıyor", /subeKapasitesi\(/.test(ui));
    kontrol("sabit 34 eşiği kalmadı",
        !/totalStudents\s*>\s*34/.test(ui),
        (ui.match(/totalStudents\s*>\s*34.{0,40}/) || [""])[0]);

    const cfg = fs.readFileSync(path.join(KOK, "js", "normRulesConfig.js"), "utf8");
    kontrol("kural yapılandırmada ve kaynağıyla birlikte",
        /sectionCapacityRules/.test(cfg) && /RG-22\/2\/2025-32821/.test(cfg));
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ ŞUBE KAPASİTESİ HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ ŞUBE KAPASİTESİ DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
