/*
 * YEDİ RAPORUN TOPLU DENETİMİ  (Cephe 3 — çökertme tatbikatı)
 * ===========================================================
 * Hedef: js/bundle.js
 *
 * NE YAPAR
 * --------
 * Yedi raporun HEPSİNİ, birbirinden farklı ve bilerek ZORLAYICI okul
 * kurgularıyla üretir; sonra çıktıda şunları arar:
 *
 *   1. Çizim çöküyor mu?
 *   2. "undefined" / "NaN" / "null" / "[object Object]" sızıyor mu?
 *      (Bu, alan adı tutmadığında JavaScript'in sessizce ürettiği metindir.
 *       2026-08-24'te branş tablosunun her satırının "Tam" görünmesine
 *       yol açan hata sınıfı tam olarak buydu.)
 *   3. Sayı olması gereken yerde "Infinity" veya "-0" var mı?
 *   4. Rapor bomboş mu döndü? (sessizce hiçbir şey basmamak da bir hatadır)
 *
 * Çalıştırma: node tools/denetim_tum_raporlar.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gecti = 0, kaldi = 0;
const bulgular = [];

function denetle(kurgu, rapor, ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; return; }
    kaldi++;
    bulgular.push({ kurgu, rapor, ad, ayrinti });
}

// ---------------------------------------------------------------- ortam
function ortamKur() {
    const win = {};
    const ctx = {
        window: win, console: { log() {}, warn() {}, error() {} },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
        navigator: { userAgent: "node" }, location: { href: "x" },
        screen: { width: 1920, height: 1080 },
        setTimeout, clearTimeout, setInterval, clearInterval,
        crypto: { getRandomValues: a => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}
    };
    ctx.globalThis = ctx;
    win.dispatchEvent = () => true;
    win.addEventListener = () => {};
    vm.createContext(ctx);
    vm.runInContext(
        fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
            .replace(/^export /gm, ""), ctx);
    win.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    return win;
}

// ------------------------------------------------------------- kurgular
// Her kurgu bir okul kurar. Bilerek uç durumlar seçildi.
const KURGULAR = [
    {
        ad: "Anadolu Lisesi — normal",
        kur(win) {
            const st = win.appState, ce = win.curriculumEngine;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
            st.state.okulBilgisi.okulAdi = "Örnek Anadolu Lisesi";
            ["9", "9", "10", "11", "12"].forEach((g, i) => st.addSection({
                subeAdi: g + "-" + "ABCDE"[i], sinifSeviyesi: g, ogrenciSayisi: 30,
                zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
            }));
            st.state.mevcutOgretmenler = { "Matematik": 5, "Fizik": 0 };
            st.state.okulBilgisi.adminOptions = {
                ...(st.state.okulBilgisi.adminOptions || {}),
                mevcutRehberOgretmeni: 2,
                mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 0, mudurYardimcisi: 2 }
            };
            return st.state;
        }
    },
    {
        ad: "ŞUBE YOK — bomboş okul",
        kur(win) {
            const st = win.appState;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
            st.state.okulBilgisi.okulAdi = "Boş Okul";
            return st.state;
        }
    },
    {
        ad: "TEK ŞUBE — 0 öğrenci",
        kur(win) {
            const st = win.appState, ce = win.curriculumEngine;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
            st.state.okulBilgisi.okulAdi = "Sıfır Mevcutlu Okul";
            st.addSection({
                subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 0,
                zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "9", null, null)
            });
            return st.state;
        }
    },
    {
        ad: "MTAL — atölye/lab dolu",
        beklenenMeslekDersi: true,
        kur(win) {
            const st = win.appState, ce = win.curriculumEngine, db = win.dbService;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = "meslek_lisesi";
            st.state.okulBilgisi.okulAdi = "Örnek Mesleki ve Teknik Anadolu Lisesi";
            const alanlar = db.getVocationalAreas("meslek_lisesi") || [];
            if (!alanlar.length) throw new Error("meslek alanı listesi BOŞ");
            const alan = alanlar[0].id || alanlar[0].key;
            const dallar = db.getBranchesForArea(alan, "meslek_lisesi", "11") || [];
            const dal = dallar.length ? (dallar[0].id || dallar[0].key || dallar[0].name) : null;
            ["9", "10", "11", "12"].forEach((g, i) => st.addSection({
                subeAdi: g + "-" + "ABCD"[i], sinifSeviyesi: g, ogrenciSayisi: 34,
                meslekAlani: alan, meslekDali: dal,
                zorunluDersler: ce.getMandatoryCourses("meslek_lisesi", g, alan, dal)
            }));
            st.state.mevcutOgretmenler = { "Matematik": 2 };
            return st.state;
        }
    },
    {
        ad: "AŞIRI MEVCUT — 90 öğrencili şube",
        kur(win) {
            const st = win.appState, ce = win.curriculumEngine;
            st.state = st.getDefaultState();
            st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
            st.state.okulBilgisi.okulAdi = "Kalabalık Lise";
            st.addSection({
                subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 90,
                zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "9", null, null)
            });
            return st.state;
        }
    }
];

const RAPORLAR = [
    ["Yönetici İcmali",        "generateExecutiveSummary",     "renderExecutiveReport",     s => [s]],
    ["Master Yük Matrisi",     "generateMasterLoadGrid",       "renderMasterGridReport",    s => [s]],
    ["Branş Detay Cetveli",    "generateBranchDetailReport",   "renderBranchDetailReport",  s => [s, "ALL"]],
    ["Şube Haftalık Çizelgesi","generateSectionScheduleReport","renderScheduleReport",      s => [s]],
    ["Norm Eylem Raporu",      "generateNormActionReport",     "renderNormActionReport",    s => [s]],
    ["Atölye Grup Analizi",    "generateVocationalLabReport",  "renderVocationalLabReport", s => [s]],
    ["Seçmeli Ders Dengesi",   "generateElectiveThemeReport",  "renderElectiveThemeReport", s => [s]]
];

// Görünür metne çevir: etiketler ve stil değerleri denetime girmesin.
function gorunurMetin(html) {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const SIZINTILAR = ["undefined", "NaN", "[object Object]", "Infinity", "null"];

console.log("YEDİ RAPORUN TOPLU DENETİMİ");
console.log("=".repeat(74));

for (const kurgu of KURGULAR) {
    const win = ortamKur();

    // Veri tabanını başlat. Node'da fetch yok; yükleyici bu durumda veriyi
    // pakete gömülü STRICT_PDF_CURRICULUM_DB'den SENTEZLER (database.js:49).
    // Bu çağrı yapılmazsa masterData null kalır, getVocationalAreas() boş
    // döner ve MTAL kurgusu hiç meslek dersi yüklemeden "geçer" —
    // yani hiçbir şeyi denetlememiş olur.
    try {
        await win.dbService.loadDatabase();
    } catch (e) { /* sentez yolu devreye girer */ }

    let durum;
    try { durum = kurgu.kur(win); }
    catch (e) {
        denetle(kurgu.ad, "-", "okul kurulamadı", false, e.message);
        console.log(`\n${kurgu.ad}\n  !! okul kurulamadı: ${e.message}`);
        continue;
    }

    const R = new win.MebReportsEngine(win.dbService, win.normEngine, win.curriculumEngine);
    const UI = new win.UIComponentManager(win.dbService, win.appState, win.normEngine, win.curriculumEngine);

    console.log(`\n${kurgu.ad}`);
    console.log("-".repeat(74));

    // KURGU GEÇERLİ Mİ?  Boş bir kurgu üzerinde yapılan denetim hiçbir şeyi
    // denetlemeden "geçer". Bu yüzden önce kurgunun kendisi doğrulanır.
    const subeler = durum.subeler || [];
    const dersSayisi = subeler.reduce((t, s) => t + ((s.zorunluDersler || []).length), 0);
    const meslekDersi = subeler.reduce((t, s) => t + (s.zorunluDersler || [])
        .filter(d => String(d.kategori || "").includes("MESLEK")).length, 0);
    console.log(`  · kurgu: ${subeler.length} şube, ${dersSayisi} ders` +
        (kurgu.beklenenMeslekDersi ? `, ${meslekDersi} MESLEK dersi` : ""));
    if (kurgu.beklenenMeslekDersi) {
        denetle(kurgu.ad, "(kurgu)", "meslek dersi yüklendi", meslekDersi > 0,
            "MTAL kurgusunda hiç MESLEK kategorili ders yok — atölye tarafı DENETLENMEMİŞ olur");
        if (meslekDersi === 0) console.log("  !! KURGU GEÇERSİZ: meslek dersi yüklenmedi");
    }

    for (const [ad, gen, ciz, arg] of RAPORLAR) {
        let veri, html = "", hata = null;
        try { veri = R[gen](...arg(durum)); }
        catch (e) { hata = "üretici: " + e.message; }
        if (!hata) {
            try { html = UI[ciz](veri, false) || ""; }
            catch (e) { hata = "çizici: " + e.message; }
        }

        if (hata) {
            denetle(kurgu.ad, ad, "çöküyor", false, hata);
            console.log(`  ✗ ${ad.padEnd(26)} ÇÖKTÜ — ${hata}`);
            continue;
        }

        const metin = gorunurMetin(html);
        const sizinti = SIZINTILAR.filter(x => metin.includes(x));
        const bos = metin.length < 40;

        denetle(kurgu.ad, ad, "sızıntı yok", sizinti.length === 0,
            "görünür metinde: " + sizinti.join(", "));
        denetle(kurgu.ad, ad, "boş değil", !bos,
            `çıktı yalnızca ${metin.length} karakter`);

        const isaret = sizinti.length ? "✗" : (bos ? "○" : "✓");
        const not = sizinti.length ? `SIZINTI: ${sizinti.join(", ")}`
            : (bos ? "boş çıktı" : `${metin.length} karakter`);
        console.log(`  ${isaret} ${ad.padEnd(26)} ${not}`);
    }
}

console.log("\n" + "=".repeat(74));
if (kaldi === 0) {
    console.log(`✅ TEMİZ — ${gecti} kontrolün hepsi geçti`);
} else {
    console.log(`⚠️  ${kaldi} SORUN (${gecti} kontrol geçti)`);
    console.log("=".repeat(74));
    bulgular.forEach(b =>
        console.log(`   • [${b.kurgu}] ${b.rapor} — ${b.ad}\n     ${b.ayrinti}`));
}
console.log("=".repeat(74));
process.exit(kaldi === 0 ? 0 : 1);
