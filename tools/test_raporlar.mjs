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

// R14: TÜRKÇE BÜYÜK HARF
// 2026-09-06: resmî raporlarda "TÜRK DILI VE EDEBIYATI", "MÜZIK",
// "İLÇE MILLÎ EĞITIM MÜDÜRLÜĞÜ" yazıyordu. Sebep: JavaScript'in
// toUpperCase() İngilizce kurala göre i -> I yapar; Türkçe'de i -> İ olmalı.
// Bu rapor müdürlerce ilçeye/il'e gönderiliyor.
//
// Test İKİ YÖNLÜ: gösterim yerleri tr-TR kullanmalı, AMA anahtar/eşleştirme
// yerleri KULLANMAMALI. TTKB_MAP anahtarları düz toUpperCase ile üretilmiştir;
// biri onu da "düzeltirse" ders-branş eşleştirmesi sessizce bozulur.
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const re = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");

    denetle("R14a branş/alan şeridi başlığı Türkçe büyük harf kullanıyor",
            ui.includes("bName.toLocaleUpperCase('tr-TR')"));

    denetle("R14b resmî antet satırları Türkçe büyük harf kullanıyor",
            ui.includes("antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toLocaleUpperCase('tr-TR')")
            && ui.includes("antet.ilValiligi || 'ANKARA VALİLİĞİ').toLocaleUpperCase('tr-TR')")
            && !ui.includes("antet.ilceMem || 'İlçe Millî Eğitim Müdürlüğü').toUpperCase()"));

    denetle("R14c Excel sayfa başlıkları Türkçe büyük harf kullanıyor",
            ui.length > 0
            && re.includes("okulAdi.toLocaleUpperCase('tr-TR')")
            && !re.includes("okulAdi.toUpperCase()"));

    // Ters yön: anahtar üretimi DEĞİŞMEMELİ.
    const ttkbAnahtar = (ui.match(/TTKB_MAP\[String\(d\.ders\)\.toUpperCase\(\)\]/g) || []).length;
    denetle("R14d TTKB ders-branş eşleştirmesi hâlâ düz toUpperCase ile anahtarlanıyor",
            ttkbAnahtar >= 2,
            "anahtar üretimi tr-TR'ye çevrilirse ders-branş eşleştirmesi sessizce bozulur (bulunan: " + ttkbAnahtar + ")");

    denetle("R14e çalışma ortamı Türkçe büyük harf destekliyor",
            "Müzik".toLocaleUpperCase("tr-TR") === "MÜZİK"
            && "İlçe Millî Eğitim Müdürlüğü".toLocaleUpperCase("tr-TR") === "İLÇE MİLLÎ EĞİTİM MÜDÜRLÜĞÜ");
}

// R15: MASTER MATRİS DÜZENİ VE MUTABAKAT PANELİ
// 2026-09-06 (kullanıcı bildirimi + ekran görüntüsü): DERS YÜKÜ MUTABAKATI
// bloğu matrisin ALTINDAYDI ve matrisi eziyordu; 16 şubelik bir okulda
// "Branş ve Ders Dağılımı" iki satıra düşüp rapor okunamaz hâle gelmişti.
// Sonra kullanıcı: "önemli, en altta olamaz; üstte, gerekirse ayrı bir
// panelde, daha dar bir alanda ama renkli durmalı."
//
// Panel artık rapor BAŞLIĞININ SAĞINDA. Başlık satırı zaten var olduğu için
// matristen dikey yer almıyor (ölçüldü: matris 546 -> 740 px, 1080p'de).
{
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");

    const kural = (css.match(/\.master-grid-wrapper\s*\{[\s\S]*?\}/) || [""])[0];
    denetle("R15a matris kabı sıkışmıyor (flex-shrink 0)",
            /flex:\s*1\s+0\s+auto/.test(kural),
            kural.replace(/\s+/g, " ").slice(0, 140));
    denetle("R15b matris yüksekliği ölçülmüş sabiti kullanıyor",
            /max-height:\s*calc\(94vh\s*-\s*275px\)/.test(kural));

    // Panel başlıkta; alta HİÇBİR mutabakat öğesi basılmamalı.
    denetle("R15c mutabakat paneli rapor başlığının içinde",
            /mutabakat-panelli[\s\S]{0,400}renderMutabakatSerit\(data\.yukMutabakati\)/.test(ui));
    denetle("R15d matrisin altında mutabakat öğesi kalmadı",
            !/master-grid-wrapper[\s\S]*?renderMutabakat/.test(
                ui.slice(ui.indexOf("</tfoot>"), ui.indexOf("</tfoot>") + 1200)));

    denetle("R15e ayrıntı tablosu varsayılan KAPALI",
            /\.ymt-detay\s*\{\s*display:\s*none/.test(css));
    denetle("R15f açma/kapama saf CSS (raporun çizim/olay döngüsüne dokunmuyor)",
            /\.ymt-ac-kapa:checked\s*~\s*\.ymt-detay/.test(css)
            && !ui.includes('getElementById("ymt-ac-kapa")'));

    // Anahtar BAŞLIKTAN ÖNCE basılmalı: hem düğme etiketine hem tabloya
    // sade kardeş seçiciyle erişilebilsin diye. Sıra bozulursa panel kilitlenir.
    denetle("R15g açma anahtarı rapor başlığından ÖNCE basılıyor",
            ui.indexOf("renderMutabakatAnahtar(data.yukMutabakati)")
              < ui.indexOf('class="report-page-header no-print mutabakat-panelli"'));

    denetle("R15h yazdırmada ayrıntı tablosu her hâlükârda AÇIK basılıyor",
            /@media print[\s\S]*\.ymt-detay\s*\{[\s\S]{0,80}display:\s*block\s*!important/.test(css));

    denetle("R15i şerit ve kartlar sarmıyor (başlık yüksekliği sabit kalsın)",
            /\.report-page-header\.mutabakat-panelli\s*\{[\s\S]*?flex-wrap:\s*nowrap/.test(css)
            && /\.ymt-kartlar\s*\{[\s\S]*?flex-wrap:\s*nowrap/.test(css),
            "sararsa başlık büyür ve max-height sabiti tutmaz");

    denetle("R15j :has() desteğine bağlı değil",
            !/\.ymt-[^\n]*:has\(/.test(css) && !/mutabakat-panelli[^\n]*:has\(/.test(css),
            "eski tarayıcıda kural sessizce düşer ve panel kilitli kalır");

    // Diğer altı raporun ortak başlığı BOZULMAMALI: iki sütunlu düzen
    // yalnızca `mutabakat-panelli` sınıfıyla gelir.
    const ortak = (css.match(/\n\.report-page-header\s*\{[\s\S]*?\}/) || [""])[0];
    denetle("R15k ortak rapor başlığı flex'e çevrilmedi (diğer 6 rapor korunur)",
            !/display:\s*flex/.test(ortak), ortak.replace(/\s+/g, " ").slice(0, 120));

    denetle("R15l kartlar renk sınıflarıyla ayrışıyor",
            /\.ymt-kart-ham\s*\{/.test(css) && /\.ymt-kart-arti\s*\{/.test(css)
            && /\.ymt-kart-eksi\s*\{/.test(css) && /\.ymt-kart-sonuc\s*\{/.test(css));
}

// R16: SAVUNULAMAYAN İDDİA
// 2026-09-06: KVKK/mimari panelinde "Sıfır Veri Kaybı Mimarisi" ve
// "Sıfır Veri Kaybı Güvencesi" yazıyordu. Uygulama okul verisini yerelde
// HİÇ saklamıyor (state.js loadFromStorage daima false) ve bulut kaydı
// haftalarca sessizce reddedilmişti (Firebase anahtar hatası, 4ca5758).
// Kamu kurumuna satılan ücretli bir üründe savunulamayan bir taahhüt.
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    denetle("R16a 'Sıfır Veri Kaybı' iddiası uygulamada yok",
            !/Sıfır Veri Kaybı/i.test(ui));
    denetle("R16b yedeklemenin sınırı açıkça yazılıyor",
            /Kapsam sınırı:/.test(ui) && /mutlak bir taahhüt değildir/.test(ui));
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
