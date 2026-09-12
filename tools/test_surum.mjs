/* ===========================================================================
   NormMatik — SÜRÜM NUMARASI TEK KAYNAKTAN GELİR   (13.09.2026)

   NEDEN VAR
   ---------
   Sürüm numarası İKİ ayrı yerde yazılıydı ve ikisi birbirini tutmuyordu:
       version.json        -> "2.0.1"    (19.08.2026'da donmuş)
       normRulesConfig.js  -> "2026.2.0"
   liveUpdateSyncEngine bu ikisini BİRBİRİYLE karşılaştırıyordu; "2026" > "2"
   olduğu için kod hiçbir zaman "güncelleme var" diyemezdi. Hata vermez,
   sessizce yanlış çalışırdı — projedeki üçüncü aynı sınıf hata (fiyat, ders
   saati, şimdi sürüm).

   BU TEST ŞUNLARI BAĞLAR
     1. Tek kaynak js/surum.js'tir ve biçimi ANA.EK.YAMA'dır.
     2. version.json ondan ÜRETİLİR; elle değiştirilip ayrışamaz.
     3. Mevzuat kural sürümü ile uygulama sürümü KARIŞTIRILMAZ.
     4. Numara üç yerde de görünür: başlık, rapor altbilgisi, lisans penceresi.
     5. Değişiklik listesi boş kalmaz.

   ÇALIŞTIRMA: node tools/test_surum.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const surumJs = oku("js", "surum.js");
const appJs = oku("js", "app.js");
const css = oku("css", "app.css");
const lisansJs = oku("js", "licenseClientManager.js");
const uiJs = oku("js", "uiComponents.js");
const canliJs = oku("js", "liveUpdateSyncEngine.js");
const bundle = oku("js", "bundle.js");
const vjson = JSON.parse(oku("version.json"));

/* ---- 1) Tek kaynak ve biçim ------------------------------------------- */
const mS = surumJs.match(/surum:\s*"([^"]+)"/);
const mT = surumJs.match(/yayinTarihi:\s*"([^"]+)"/);
kontrol("js/surum.js sürüm numarası taşıyor", !!mS);
kontrol("js/surum.js yayın tarihi taşıyor", !!mT);

const SURUM = mS ? mS[1] : "";
kontrol("biçim ANA.EK.YAMA (ör. 3.0.0)", /^\d+\.\d+\.\d+$/.test(SURUM), SURUM);
kontrol("yayın tarihi YYYY-AA-GG", /^\d{4}-\d{2}-\d{2}$/.test(mT ? mT[1] : ""), mT ? mT[1] : "");

/* ---- 2) version.json ondan üretiliyor --------------------------------- */
kontrol("version.json aynı sürümü söylüyor", vjson.version === SURUM,
    `surum.js=${SURUM}  version.json=${vjson.version}`);
kontrol("version.json aynı tarihi söylüyor", vjson.releaseDate === (mT ? mT[1] : null),
    String(vjson.releaseDate));
kontrol("version.json değişiklik listesi dolu",
    Array.isArray(vjson.changelog) && vjson.changelog.length > 0,
    String(vjson.changelog && vjson.changelog.length));
kontrol("minEngineVersion aynı ANA sürümün ilk yayını",
    vjson.minEngineVersion === SURUM.split(".")[0] + ".0.0", String(vjson.minEngineVersion));
kontrol("version.json'u üreten kod var",
    /def surum_json_yaz\(\)/.test(oku("tools", "build_bundle.py")));
kontrol("paket listesinde surum.js var",
    /"surum\.js"/.test(oku("tools", "build_bundle.py")));

/* ---- 3) İki numara birbirine karıştırılmıyor -------------------------- */
kontrol("version.json'da artık rulesVersion yok (karışıyordu)",
    !("rulesVersion" in vjson));
kontrol("canlı güncelleme UYGULAMA sürümünü karşılaştırıyor",
    /NORMMATIK_SURUM/.test(canliJs) && !/currentVer\s*=\s*this\.currentRules\.metadata/.test(canliJs));
kontrol("normRulesConfig'teki numaranın uygulama sürümü OLMADIĞI yazılı",
    /UYGULAMA sürümü DEĞİLDİR/.test(oku("js", "normRulesConfig.js")));

/* ---- 4) Üç yerde de görünüyor (çalışır hâlde) ------------------------- */
kontrol("başlıkta sürüm etiketi basılıyor",
    /class="logo-surum"/.test(appJs) && /\$\{surumEtiketi\}/.test(appJs));
kontrol("başlık etiketinin biçimi tanımlı", /\.logo-surum\s*\{/.test(css));
kontrol("rapor altbilgisine sürüm ekleniyor", /surumEki\(\)/.test(lisansJs));
kontrol("lisans penceresinde sürüm bölümü var",
    /Yazılım Sürümü/.test(uiJs) && /surumBilgi\.liste/.test(uiJs));
kontrol("paket yeniden üretilmiş", bundle.includes("NORMMATIK_SURUM"));

/* ---- 5) ÇALIŞTIRARAK doğrula ------------------------------------------
   Kaynakta geçmesi yetmez: paketi gerçekten çalıştırıp rapor altbilgisinin
   sürümü TAŞIDIĞINI görüyoruz. */
{
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
    vm.runInContext(bundle, ctx);

    const S = vm.runInContext("NORMMATIK_SURUM", ctx);
    kontrol("paket içinden sürüm okunuyor", !!S && S.surum === SURUM, S ? S.surum : "yok");
    kontrol("değişiklik listesi pakete girmiş",
        !!S && Array.isArray(S.degisiklikler) && S.degisiklikler.length === vjson.changelog.length,
        S ? String(S.degisiklikler.length) : "yok");

    const lm = w.licenseManager;
    if (lm && typeof lm.getReportSecurityFooter === "function") {
        lm.licenseStatus = { isMaster: false, isDemo: true };
        const demoAlt = lm.getReportSecurityFooter();
        kontrol("demo rapor altbilgisi sürümü taşıyor", demoAlt.includes("v" + SURUM), demoAlt);

        lm.licenseStatus = { isMaster: false, isDemo: false, kurumKodu: "999999", okulAdi: "Test" };
        const lisansliAlt = lm.getReportSecurityFooter();
        kontrol("lisanslı rapor altbilgisi sürümü taşıyor",
            lisansliAlt.includes("v" + SURUM), lisansliAlt.slice(-40));
    } else {
        kontrol("licenseManager paketten çıktı", false, "getReportSecurityFooter bulunamadı");
    }
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ SÜRÜM NUMARASI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ SÜRÜM TEK KAYNAKTAN GELİYOR (v" + SURUM + ") — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
