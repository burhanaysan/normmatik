/*
 * RAPOR TESTİ
 * ===========
 * Hedef: js/bundle.js
 *
 * NEDEN VAR
 * ---------
 * 2026-08-24: Kullanıcı "en çok ihtiyaç duyduğum rapor kayboldu" dedi —
 * branş branş ders yükü, mevcut kadro, ihtiyaç ve fazlalık listesi.
 *
 * Rapor kaybolmamıştı. Motor doğru hesaplıyordu (Matematik 4 fazla,
 * İngilizce 1 ihtiyaç) ama ÇİZİCİ YANLIŞ ALAN ADLARINI okuyordu:
 *
 *     çizicinin aradığı      veride gerçekte
 *     ------------------     ---------------
 *     b.difference           b.diff
 *     b.statusClass          b.statusType
 *     b.formulaBreakdown     b.formulaExplanation
 *
 * `b.difference` tanımsız olduğu için `> 0` ve `< 0` kontrollerinin ikisi
 * de yanlış çıkıyor ve HER BRANŞ "Tam" görünüyordu. İhtiyaç ve fazlalık
 * hiç görünmüyordu — yani raporun tek işi yapılmıyordu.
 *
 * Bu, sessiz bir hata sınıfı: JavaScript tanımsız alanı hata vermeden
 * geçer. Bu yüzden test, HTML çıktısındaki SAYILARI motorun hesabıyla
 * karşılaştırır; alan adlarına güvenmez.
 *
 * Çalıştırma: node tools/test_raporlar.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gecti = 0, kaldi = 0;
const hatalar = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [GEÇTİ] " + ad); }
    else { kaldi++; hatalar.push(ad + "   " + ayrinti);
           console.log("  [KALDI] " + ad + "   " + ayrinti); }
}

// ---------------------------------------------------------------- ortam
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

const st = win.appState, ce = win.curriculumEngine;
win.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};

// Bilerek DENGESİZ bir okul: bir branşta fazlalık, birkaçında ihtiyaç,
// birinde tam. Hepsi "Tam" görünürse test yakalar.
st.state = st.getDefaultState();
st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
st.state.okulBilgisi.okulAdi = "Test Anadolu Lisesi";
["9", "9", "10", "10", "11", "12"].forEach((g, i) =>
    st.addSection({
        subeAdi: g + "-" + "ABCDEF"[i], sinifSeviyesi: g, ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
    }));
st.state.mevcutOgretmenler = { "Matematik": 5, "Türk Dili ve Edebiyatı": 1, "Fizik": 0 };

const R = new win.MebReportsEngine(win.dbService, win.normEngine, win.curriculumEngine);
// uiComponents örneği app.js içinde, tarayıcı açılışında kuruluyor.
// Testte aynı bağımlılıklarla kendimiz kuruyoruz — çizici işlevleri
// DOM'a dokunmuyor, saf HTML metni üretiyor.
const UI = new win.UIComponentManager(win.dbService, st, win.normEngine, win.curriculumEngine);

console.log("RAPOR TESTİ");
console.log("=".repeat(70));

// ------------------------------------------------- veri katmanı doğru mu
console.log("\nMotor hesabı");
const veri = R.generateBranchDetailReport(st.state, "ALL");
const branslar = veri.branches || [];
denetle("R1  branş listesi üretiliyor", branslar.length >= 5,
        `${branslar.length} branş`);

const fazla = branslar.filter(b => b.diff > 0);
const ihtiyac = branslar.filter(b => b.diff < 0);
denetle("R2  en az bir FAZLALIK hesaplanıyor", fazla.length > 0);
denetle("R3  en az bir İHTİYAÇ hesaplanıyor", ihtiyac.length > 0);
denetle("R4  her branşta zorunlu alanlar var",
        branslar.every(b => b.branchName && typeof b.totalHours === "number"
            && typeof b.calculatedNorm === "number"
            && typeof b.currentTeachers === "number"
            && typeof b.diff === "number" && b.statusText && b.statusType));

// ------------------------------------------------- çizici katmanı doğru mu
// ASIL KONTROL: HTML çıktısı motorun hesabını gerçekten gösteriyor mu?
console.log("\nEkrana basılan HTML");

function html(fn, ...arg) {
    try { return UI[fn](...arg) || ""; }
    catch (e) { return "__HATA__" + e.message; }
}

for (const [ad, ciz, uret, arg] of [
    ["Yönetici İcmali", "renderExecutiveReport", "generateExecutiveSummary", [st.state]],
    ["Branş Detay Cetveli", "renderBranchDetailReport", "generateBranchDetailReport", [st.state, "ALL"]],
]) {
    const d = R[uret](...arg);
    const cikti = html(ciz, d, false);

    denetle(`R5  ${ad}: çizim hata vermiyor`,
            !cikti.startsWith("__HATA__"), cikti.slice(0, 90));
    if (cikti.startsWith("__HATA__")) continue;

    denetle(`R6  ${ad}: "undefined" metni sızmıyor`,
            !cikti.includes("undefined"),
            "çıktıda 'undefined' geçiyor — alan adı tutmuyor olabilir");

    // Fazlalık ve ihtiyaç ÇIKTIDA görünüyor mu?
    const fazlaGorunuyor = fazla.some(b => cikti.includes(b.statusText) ||
        cikti.includes("+" + b.diff));
    const ihtiyacGorunuyor = ihtiyac.some(b => cikti.includes(b.statusText) ||
        cikti.includes(Math.abs(b.diff) + " İhtiyaç"));
    denetle(`R7  ${ad}: FAZLALIK ekranda görünüyor`, fazlaGorunuyor,
            `beklenen ör. "${fazla[0] && fazla[0].statusText}"`);
    denetle(`R8  ${ad}: İHTİYAÇ ekranda görünüyor`, ihtiyacGorunuyor,
            `beklenen ör. "${ihtiyac[0] && ihtiyac[0].statusText}"`);

    // Her branş "Tam" görünüyorsa bu tam da bildirilen hatadır.
    const tamSayisi = (cikti.match(/>Tam</g) || []).length;
    denetle(`R9  ${ad}: hepsi "Tam" görünmüyor  <-- bildirilen hata`,
            tamSayisi < branslar.length,
            `${tamSayisi}/${branslar.length} satır "Tam"`);

    // Durum rozetinin CSS sınıfı gerçek bir sınıf olmalı.
    denetle(`R10 ${ad}: durum rozeti sınıfı geçerli`,
            !/status-badge-lg\s*(?:"|status-undefined)/.test(cikti),
            "status-undefined ya da boş sınıf var");
}

// ------------------------------------------- bütün raporlar çiziliyor mu
console.log("\nDiğer raporlar");
for (const [ad, uret, ciz, arg] of [
    ["Master Yük Matrisi", "generateMasterLoadGrid", "renderMasterGridReport", [st.state, "ALL"]],
    ["Şube Ders Çizelgeleri", "generateSectionScheduleReport", "renderScheduleReport", [st.state, "ALL", "ALL"]],
    ["Norm İhtiyaç/Fazla", "generateNormActionReport", "renderNormActionReport", [st.state]],
    ["Atölye & Grup", "generateVocationalLabReport", "renderVocationalLabReport", [st.state]],
    ["Seçmeli Tema", "generateElectiveThemeReport", "renderElectiveThemeReport", [st.state]],
]) {
    let d, cikti;
    try { d = R[uret](...arg); } catch (e) {
        denetle(`R11 ${ad}: veri üretiliyor`, false, e.message); continue;
    }
    cikti = html(ciz, d, false);
    denetle(`R11 ${ad}: çiziliyor ve "undefined" sızmıyor`,
            !cikti.startsWith("__HATA__") && !cikti.includes("undefined"),
            cikti.startsWith("__HATA__") ? cikti.slice(0, 80) : "çıktıda 'undefined' var");
}

// ------------------------------------------------- yerleşim koruması
// R12: .reports-modal-body bir FLEX SÜTUN. Çocukları shrink edebilirse,
// `overflow: auto` taşıyan .table-responsive-container SIFIRA kadar ezilir
// ve branş tablosu ekranda görünmez olur — yazdırmada görünmeye devam
// ettiği için fark edilmesi zordur. Ölçüldü (2026-08-24): 478 piksellik
// tablo 2 piksele düşüyordu. Koruma kuralı silinirse bu test kırılır.
console.log("\nYerleşim koruması");
{
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    const kural = /\.reports-modal-body\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0/.test(css);
    denetle("R12 rapor gövdesi çocukları ezilmeye karşı korunuyor", kural,
            ".reports-modal-body > * { flex-shrink: 0 } kuralı bulunamadı");
}

// R13: Yazdırırken YALNIZCA rapor penceresi kâğıda gitmeli.
// 2026-08-24: yazdırma çıktısının 1. sayfası uygulamanın kendi ekranı /
// arkada açık kalmış başka bir pencereydi; rapor 2. sayfada başlıyordu.
// Sebep: print stilleri `.modal-overlay`in TAMAMINI yazdırılabilir
// yapıyordu. Artık yazdırma düğmesi gövdeye `yazdir-rapor` koyuyor ve
// o sınıf varken rapor dışındaki her şey gizleniyor.
{
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const kuralVar = /body\.yazdir-rapor\s*>\s*\*:not\(#reports-center-modal\)\s*\{[^}]*display:\s*none/.test(css);
    const sinifKonuyor = /classList\.add\("yazdir-rapor"\)/.test(ui);
    denetle("R13 yazdırmada yalnızca rapor penceresi basılıyor",
            kuralVar && sinifKonuyor,
            `css kuralı: ${kuralVar}, sınıf ekleme: ${sinifKonuyor}`);
}

console.log("\n" + "=".repeat(70));
if (kaldi === 0) {
    console.log(`✅ RAPORLAR DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
    process.exit(0);
} else {
    console.log(`❌ ${kaldi} HATA / ${gecti + kaldi} kontrol`);
    hatalar.forEach(h => console.log("   × " + h));
    process.exit(1);
}
