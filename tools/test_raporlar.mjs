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

    // 06.09.2026 yeniden tasarımı: branş adı kart başlığında OLDUĞU GİBİ
    // yazılıyor, büyük harfe çevrilmiyor — Türkçe büyük harf tuzağı bu
    // yüzden burada artık hiç doğmuyor. Antet ve Excel'de çevirme sürüyor
    // (R14b/R14c) ve orada tr-TR şart.
    denetle("R14a branş adı büyük harfe çevrilmiyor (tuzak ortadan kalktı)",
            !/bName\.toUpperCase\(\)/.test(ui),
            "düz toUpperCase geri gelirse 'MÜZIK' yazar");

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

    // 06.09.2026: tek geniş matris yerine BRANŞ KARTLARI. Sabit yükseklikli
    // tek bir kap yok; her kart kendi boyunda ve rapor gövdesi kaydırılıyor.
    denetle("R15a branş kartları düzeni kullanılıyor",
            /\.dd-brans\s*\{/.test(css) && /class="dd-liste"/.test(ui),
            "tek uzun matris okunmuyordu");
    denetle("R15b kart içi tablo kendi içinde yatay kaydırılıyor",
            /\.dd-kaydir\s*\{[\s\S]{0,60}overflow-x:\s*auto/.test(css),
            "sayfa gövdesi yana kaymamalı");

    // Panel başlıkta; alta HİÇBİR mutabakat öğesi basılmamalı.
    denetle("R15c mutabakat denklemi raporda basılıyor",
            /renderMutabakatDenklem\(data\.yukMutabakati\)/.test(ui));
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
    denetle("R15g açma anahtarı ayrıntı tablosundan ÖNCE basılıyor",
            ui.indexOf("renderMutabakatAnahtar(data.yukMutabakati)") > 0
            && ui.indexOf("renderMutabakatAnahtar(data.yukMutabakati)")
               < ui.indexOf("renderMutabakatDetay(data.yukMutabakati)"),
            "sıra bozulursa saf CSS açma/kapama çalışmaz");

    denetle("R15h yazdırmada ayrıntı tablosu her hâlükârda AÇIK basılıyor",
            /@media print[\s\S]*\.ymt-detay\s*\{[\s\S]{0,80}display:\s*block\s*!important/.test(css));

    denetle("R15i denklem kutu + işaret biçiminde (soyut grafik değil)",
            /\.mt-kutu\s*\{/.test(css) && /\.mt-islem\s*\{/.test(css)
            && /class="mt-kutu \$\{tur\}"/.test(ui),
            "köprü grafiği soyut kalıyordu; kullanıcı okunur denklem istedi");

    denetle("R15j :has() desteğine bağlı değil",
            !/\.ymt-[^\n]*:has\(/.test(css) && !/mutabakat-panelli[^\n]*:has\(/.test(css),
            "eski tarayıcıda kural sessizce düşer ve panel kilitli kalır");

    // Diğer altı raporun ortak başlığı BOZULMAMALI: iki sütunlu düzen
    // yalnızca `mutabakat-panelli` sınıfıyla gelir.
    const ortak = (css.match(/\n\.report-page-header\s*\{[\s\S]*?\}/) || [""])[0];
    denetle("R15k ortak rapor başlığı flex'e çevrilmedi (diğer 6 rapor korunur)",
            !/display:\s*flex/.test(ortak), ortak.replace(/\s+/g, " ").slice(0, 120));

    denetle("R15l denklem kutuları renk sınıflarıyla ayrışıyor",
            /\.mt-kutu\.bas\s*\{/.test(css) && /\.mt-kutu\.arti\s*\{/.test(css)
            && /\.mt-kutu\.eksi\s*\{/.test(css) && /\.mt-kutu\.son\s*\{/.test(css));

    denetle("R15m ölü mutabakat şeridi çizicisi kaldırıldı",
            !/renderMutabakatSerit/.test(ui),
            "kullanılmayan çizici ileride yanlış teşhis üretir");
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

// R17: ROZET İLE LİSTE TUTMALI  (b.diff / b.difference)
// 2026-09-06 kullanıcı bildirimi + ekran görüntüsü: "Norm İhtiyaç/Fazla
// Eylem" sekmesinde rozet "Toplam İhtiyaç: 2 Öğretmen" derken sayfada
// "Okulda norm kadro açığı / ihtiyacı olan branş bulunmamaktadır" yazıyordu.
//
// Sebep: motor bu alanı `diff` adıyla üretir, `difference` DEĞİL. Tanımsız
// alanda `< 0` ve `> 0` karşılaştırmalarının İKİSİ DE false çıktığı için
// listeler her zaman boş dönüyordu; rozet ise motorun totalNeeded değerini
// doğrudan okuduğu için doğruydu. JavaScript tanımsız alanı hata vermeden
// geçer — sessiz hata sınıfı.
//
// Aynı hata 2026-08-24'te İcmal ve Branş Detay ÇİZİCİLERİNDE düzeltilmişti
// (bkz. R1-R10 başlığı); DÖRT yer atlanmıştı: bu rapor, Excel, CSV ve
// master matrisin branş rozeti. Matriste Norm 2 / Mevcut 0 olan branş bile
// "Tam" görünüyordu.
{
    const RE = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
    const UI2 = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");

    // Kaynak koruması: motor `difference` diye bir alan ÜRETMİYOR; okuyan
    // her satır tanımsızla çalışır. Yorum satırları hariç hiç geçmemeli.
    const kodSatirlari = (metin) => metin.split("\n")
        .filter(l => !l.trim().startsWith("//") && !l.trim().startsWith("*")
                     && !l.trim().startsWith("<!--"));
    const difVar = (metin) => kodSatirlari(metin).filter(l => l.includes(".difference"));
    denetle("R17a raporlarda .difference okuması kalmadı",
            difVar(RE).length === 0, difVar(RE).join(" | ").slice(0, 160));
    denetle("R17b arayüzde .difference okuması kalmadı",
            difVar(UI2).length === 0, difVar(UI2).join(" | ").slice(0, 160));

    // Davranış: rozet ile listenin toplamı AYNI olmalı. Asıl koruma bu —
    // biri alan adını yine değiştirse bile bu kontrol yakalar.
    const rapor = R.generateNormActionReport(st.state);
    const ihtToplam = rapor.neededList.reduce((t, x) => t + x.neededCount, 0);
    const fazToplam = rapor.surplusList.reduce((t, x) => t + x.surplusCount, 0);

    denetle("R17c ihtiyaç rozeti ile liste toplamı aynı",
            ihtToplam === rapor.totalNeeded,
            `rozet ${rapor.totalNeeded}, liste ${ihtToplam}`);
    denetle("R17d fazlalık rozeti ile liste toplamı aynı",
            fazToplam === rapor.totalSurplus,
            `rozet ${rapor.totalSurplus}, liste ${fazToplam}`);
    denetle("R17e ihtiyaç varsa liste boş kalmıyor",
            rapor.totalNeeded === 0 || rapor.neededList.length > 0,
            `rozet ${rapor.totalNeeded}, kayıt ${rapor.neededList.length}`);
    denetle("R17f fazlalık varsa liste boş kalmıyor",
            rapor.totalSurplus === 0 || rapor.surplusList.length > 0,
            `rozet ${rapor.totalSurplus}, kayıt ${rapor.surplusList.length}`);
    denetle("R17g ölçüm geçerli: dengesiz okulda hem ihtiyaç hem fazlalık var",
            rapor.totalNeeded > 0 && rapor.totalSurplus > 0,
            "test okulu dengeli kurulmuşsa R17c-f bir şey ölçmez");

    // Master matris branş rozeti: norm > mevcut olan branş "Tam" diyemez.
    const gridData = R.generateMasterLoadGrid(st.state);
    const gridHtml = UI.renderMasterGridReport(gridData, false, true);
    const yanlisTam = (gridData.branchReport || Object.values(gridData.branchReportMap || {}))
        .filter(b => b.diff < 0)
        .filter(b => new RegExp("badge-metric status-[a-z]+\">Tam<").test(gridHtml)
                     && !gridHtml.includes(`${b.diff} İhtiyaç`));
    denetle("R17h açığı olan branşa 'kadro tam' denmiyor",
            (gridData.branchReport || Object.values(gridData.branchReportMap || {}))
                .filter(b => b.diff < 0)
                .every(b => gridHtml.includes(Math.abs(b.diff) + " öğretmen açık")),
            "açığı olan branş 'kadro tam' görünüyorsa alan adı kaymıştır");
    denetle("R17i branş kartı durumunda açık/fazla gerçekten görünüyor",
            /öğretmen açık/.test(gridHtml) || / fazla</.test(gridHtml),
            "dengesiz okulda hepsi 'kadro tam' çıkıyorsa alan adı yine kaymıştır");
}

// R18: BRANŞ DETAY CETVELİ — STİL VE DERS DÖKÜMÜ
// 2026-09-06 kullanıcı sorusu: "2 görselde de aynı şeyler yazılı, niye 2.ye
// ihtiyaç duyulsun ki?" Ölçüldüğünde iki ayrı kusur çıktı:
//
//   1) Çizici kart düzeni olarak yazılmış (branch-detail-card, b-stats-row,
//      b-rule-box ...) ama SEKİZ SINIFIN EKRAN STİLİ HİÇ YOKTU; ikisi
//      yalnızca @media print içinde geçiyordu. Kartlar biçimsiz düz metin
//      olarak akıyor, rapor İcmal tablosunun kötü bir kopyası gibi
//      görünüyordu.
//   2) Motor her branş için şube şube ders dökümü üretiyor
//      (branchCourseDetails) ama HİÇBİR ÇİZİCİ okumuyordu — hesaplanıp
//      atılıyordu. İcmalin yapamadığı tek iş buydu.
{
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");

    // Ekran stilleri: @media print DIŞINDA tanımlı olmalı.
    // DİKKAT: indexOf("@media print") yanlış yer bulur — o ifade CSS'te bir
    // YORUMUN içinde de geçiyor ve kesme noktası çok yukarı kayıyordu.
    // İKİ KEZ YANLIŞ KURULDU, ÜÇÜNCÜSÜ DOĞRU:
    //   1) indexOf("@media print") -> o ifade bir YORUMUN içinde de geçiyor,
    //      kesme noktası çok yukarı kayıyordu.
    //   2) İlk gerçek blokta KESMEK -> dosyaya yukarıda yeni bir print bloğu
    //      eklenince, ondan SONRA gelen ekran stilleri "yok" sanıldı.
    // Doğrusu kesmek değil AYIKLAMAK: bütün print blokları çıkarılır, kalan
    // her şey ekran stilidir. İç içe blok olabileceği için parantez dengesi.
    const printBloklariniAyikla = (metin) => {
        let sonuc = "", i = 0;
        const re = /@media\s+print\s*\{/g;
        let m;
        while ((m = re.exec(metin)) !== null) {
            sonuc += metin.slice(i, m.index);
            let d = 1, j = m.index + m[0].length;
            while (j < metin.length && d > 0) {
                if (metin[j] === "{") d++;
                else if (metin[j] === "}") d--;
                j++;
            }
            i = j;
            re.lastIndex = j;
        }
        return sonuc + metin.slice(i);
    };
    const ekranCss = printBloklariniAyikla(css);
    const eksik = ["branch-detail-cards-container", "branch-detail-card",
                   "branch-card-header", "branch-card-body", "b-stats-row",
                   "b-stat", "b-title", "b-rule-box", "status-badge-lg"]
        .filter(k => !new RegExp("\\." + k + "[\\s,{.:]").test(ekranCss));
    denetle("R18a branş kartlarının EKRAN stilleri tanımlı",
            eksik.length === 0, "stilsiz sınıf: " + eksik.join(", "));

    denetle("R18b durum rozetinin üç hâli de renklendirilmiş",
            /\.status-badge-lg\.status-tam/.test(ekranCss)
            && /\.status-badge-lg\.status-ihtiyac/.test(ekranCss)
            && /\.status-badge-lg\.status-fazla/.test(ekranCss));

    denetle("R18c ders dökümü çizicisi var ve çağrılıyor",
            /renderBransDersDokumu\(b\)/.test(ui) && /renderBransDersDokumu\(b\) \{/.test(ui));

    // DAVRANIŞ: döküm gerçekten basılıyor ve toplamı branş yüküyle tutuyor.
    const detay = R.generateBranchDetailReport(st.state, "ALL");
    denetle("R18d ölçüm geçerli: motor branş başına ders dökümü üretiyor",
            detay.branches.length > 0
            && detay.branches.every(b => Array.isArray(b.courses) && b.courses.length > 0),
            "courses boşsa R18e bir şey ölçmez");

    const tutmayan = detay.branches.filter(b =>
        (b.courses || []).reduce((t, k) => t + (parseInt(k.calculatedLoad, 10) || 0), 0)
        !== b.totalHours);
    denetle("R18e her branşta döküm toplamı = branş ders yükü",
            tutmayan.length === 0,
            tutmayan.map(b => b.branchName).join(", "));

    const detayHtml = UI.renderBranchDetailReport(detay, false);
    denetle("R18f döküm HTML'e gerçekten basılıyor",
            (detayHtml.match(/bd-dokum"/g) || []).length === detay.branches.length,
            (detayHtml.match(/bd-dokum"/g) || []).length + " / " + detay.branches.length);
    denetle("R18g dökümde şube ve ders adı görünüyor",
            /bd-sube/.test(detayHtml) && /bd-ders/.test(detayHtml));
    denetle("R18h uyuşmazlık olsaydı sessiz kalınmazdı (uyarı yolu var)",
            /bd-uyari/.test(ui));
    denetle("R18i tutarlı okulda uyarı rozeti ÇIKMIYOR",
            !/bd-uyari/.test(detayHtml));
}

// R19: KARAR PANOSU + YENİDEN TASARLANAN MATRİS
// 2026-09-06 kullanıcı bildirimi: "renkleri, satırları, dizaynı... neyin ne
// olduğu ilk anda anlaşılamıyor." Ölçüldü: 272 hücrenin %44'ü boş çizgiydi ve
// 15 branşın yalnızca 5'i dikkat gerektiriyordu. Ekran mürekkebinin çoğunu
// hiçbir şeye harcayıp asıl satırları arada gömüyordu.
//
// Rapor artık iki bölmeli: üstte KARAR PANOSU, altta ders dağılım matrisi.
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");
    const re = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");

    // Ayrı "karar panosu" KALDIRILDI: aynı bilgiyi kart başlıkları zaten
    // taşıyor (ad + yük + norm + kadro + durum yan yana). İki yerde
    // göstermek, kullanıcının "niye iki tane var" dediği kalıbın kendisiydi.
    denetle("R19a norm bilgisi branş adının YANINDA",
            /class="dd-ad">\$\{b\.ad\}[\s\S]{0,400}class="dd-durum/.test(ui),
            "rozetler satırın ucunda kalırsa hangi branşa ait olduğu takip edilemez");

    denetle("R19b panelin sayıları motordan taşınıyor (ayrıca hesaplanmıyor)",
            /kpi:\s*\{[\s\S]{0,500}totalCalculatedNorm:\s*normResult\.totalCalculatedNorm/.test(re),
            "panel kendi toplamını hesaplarsa icmalle ayrışır");

    denetle("R19c bütün branşlar TEK biçimde (aynı kart) listeleniyor",
            /class="dd-brans/.test(ui) && !/kp-brans/.test(ui),
            "ayrı 'dikkat'/'dengede' bileşenleri ekranın şeklini veriyle değiştirirdi");

    denetle("R19d öncelik ayrı kutuyla değil SIRALAMAYLA veriliyor",
            /puan\(a\) - puan\(b\) \|\| Math\.abs\(b\.fark\) - Math\.abs\(a\.fark\)/.test(ui));

    denetle("R19e durum renkleri tanımlı",
            /\.dd-durum\.acik\s*\{/.test(css) && /\.dd-durum\.fazla\s*\{/.test(css));

    denetle("R19f boş hücreye artık '—' basılmıyor",
            !/matrix-dash/.test(ui),
            "272 hücrenin 121'i çizgiydi; tabloyu okunmaz yapıyordu");

    denetle("R19g şube başlıkları DÜZ ve kademe yazısı tekrarlanmıyor",
            /dd-sube-ad/.test(ui) && !/vertical-sec-header/.test(ui)
            && !/kademe-et/.test(ui),
            "'9. sınıf' başlığı '9-A' adının üstünde aynı bilgiyi tekrarlıyordu");

    // Saat yoğunluğuna göre koyulaştırma KALDIRILDI: kullanıcı "bazıları neden
    // koyu yeşil?" diye sordu — anlamı olmayan renk, olmayan renkten kötüdür.
    // Kart düzeninde bir branşta 1-3 satır var; taranacak yoğunluk yok.
    denetle("R19h hücre rengi saat sayısına göre değişmiyor",
            !/\.dd-cip\.g2\s*\{/.test(css) && !/\.dd-cip\.g3\s*\{/.test(css)
            && !/kademe = v >= 5/.test(ui),
            "açıklaması olmayan renk kademesi kafa karıştırıyordu");
    denetle("R19h2 renk yalnızca anomali işaretliyor (birleşik ders)",
            /\.dd-cip\.birlesik\s*\{/.test(css) && /birlesik \? " birlesik"/.test(ui));

    denetle("R19i yazdırmada renk zemini kalkıyor",
            /@media print[\s\S]*\.dd-cip[^{]*\{[^}]*background:\s*transparent/.test(css),
            "kâğıtta renk zemini okunmaz; sayı yeterli");

    // DAVRANIŞ: panel gerçekten çiziliyor ve motorun sayılarını gösteriyor mu?
    const gridVeri = R.generateMasterLoadGrid(st.state);
    const gridHtml = html("renderMasterGridReport", gridVeri, false, true);
    denetle("R19j her branş için bir kart basılıyor",
            (gridHtml.match(/class="dd-brans/g) || []).length
                === gridVeri.sortedBranchNames.length,
            (gridHtml.match(/class="dd-brans/g) || []).length + " kart / "
                + gridVeri.sortedBranchNames.length + " branş");
    denetle("R19k kartlar aciliyete göre sıralı (açığı olan önce)",
            (() => {
                const sira = [...gridHtml.matchAll(/class="dd-durum (acik|fazla|tam)"/g)]
                    .map(m => ({acik:0, fazla:1, tam:2})[m[1]]);
                return sira.every((v, i) => i === 0 || sira[i - 1] <= v);
            })(),
            "sıralama bozulursa öncelik kaybolur");
    denetle("R19l genel toplam şeridinde motorun normu yazıyor",
            gridHtml.includes(">" + gridVeri.kpi.totalCalculatedNorm + " öğretmen</span>"),
            "beklenen norm: " + gridVeri.kpi.totalCalculatedNorm);
    denetle("R19s branş içi ayrışma dipnotta açıklanıyor",
            !/Ders satırları toplamı/.test(gridHtml)
            || /grup\/branş bölünmesinden|diğer düzeltmelerden/.test(gridHtml),
            "ayrışma varsa sebebi yazılmalı");
    // Köprü YALNIZCA fark varsa çizilir (çizecek bir geçiş yoksa grafik de
    // yok). Bu test okulunda kalem oluşmuyor; farkı bilerek üretiyoruz.
    denetle("R19m fark yokken denklem çizilmiyor",
            !gridHtml.includes("mt-denklem"),
            "gösterilecek bir geçiş yoksa denklem de yok");

    const eskiSecenek = st.state.okulBilgisi.adminOptions;
    st.state.okulBilgisi.adminOptions = Object.assign({}, eskiSecenek || {},
        { yoneticiDersYukleri: { "Matematik": 6 } });
    const farkliVeri = R.generateMasterLoadGrid(st.state);
    const farkliHtml = html("renderMasterGridReport", farkliVeri, false, true);
    st.state.okulBilgisi.adminOptions = eskiSecenek;

    denetle("R19n ölçüm geçerli: fark gerçekten oluştu",
            farkliVeri.yukMutabakati
            && farkliVeri.yukMutabakati.normaEsasYuk !== farkliVeri.yukMutabakati.hamCizelgeSaati);
    denetle("R19o fark varken denklem basılıyor",
            farkliHtml.includes("mt-denklem") && farkliHtml.includes("mt-kutu"));
    denetle("R19p denklemde başlangıç ve sonuç kutusu var",
            /mt-kutu bas/.test(farkliHtml) && /mt-kutu son/.test(farkliHtml));
    denetle("R19r denklem kalem kutusu da içeriyor",
            /mt-kutu (arti|eksi)/.test(farkliHtml));
}

// R20: BİLDİRİM (TOAST)
// 06.09.2026 yeniden tasarımı — sağ üst, süre çubuklu, kapatılabilir.
// Aynı çalışmada iki eski kusur bulundu ve düzeltildi:
//   • "error" ve "info" türlerinin HİÇ rengi yoktu; koyu varsayılana
//     düşüyorlardı. Kod 4 yerde "error" gönderiyor ve biri "VERİLER
//     KAYDEDİLEMEDİ" — yani en kritik bildirim sıradan görünüyordu.
//   • white-space: nowrap uzun mesajları tek satıra dizip taşırıyordu.
{
    const ui = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
    const css = fs.readFileSync(path.join(KOK, "css", "app.css"), "utf8");

    // showToast'un GÖNDERDİĞİ her tür için bir renk kuralı olmalı.
    const gonderilenTurler = [...new Set(
        [...ui.matchAll(/showToast\([^;]*?["'](success|info|warning|error|danger)["']\s*\)/g)]
            .map(m => m[1])
    )];
    denetle("R20a ölçüm geçerli: birden çok bildirim türü kullanılıyor",
            gonderilenTurler.length >= 3, gonderilenTurler.join(", "));

    const renksiz = gonderilenTurler.filter(t =>
        !new RegExp("\\.toast\\.toast-" + t + "\\b|\\.toast\\." + t + "\\b").test(css));
    denetle("R20b kullanılan HER bildirim türünün rengi tanımlı",
            renksiz.length === 0,
            "renksiz tür: " + renksiz.join(", ") + " — koyu varsayılana düşerler");

    // 06.09.2026 son tasarım: dört tür de KOYU CAM. Ayrım dolguda değil,
    // VURGU renginde — kenar, ikon ve süre çubuğu. Hata en doygun vurguyu
    // alır (kırmızı), çünkü kullanıcıyı durdurması gereken tek tür odur.
    // Denetim rengin kodunu değil, hatanın AYRIŞTIĞINI korur.
    {
        const hataKurali = (css.match(/\.toast\.toast-error,[\s\S]*?\{([^}]*)\}/) || ["", ""])[1];
        denetle("R20c hata bildirimi kırmızı vurguyla ayrışıyor",
                /rgba\(248,\s*113,\s*113/.test(hataKurali)
                && /rgba\(239,\s*68,\s*68/.test(hataKurali),
                "hata türü diğerlerinden ayrışmalı")
    }

    // KONUM: iki kez taşındı, ikisi de kullanıcı gözlemiyle.
    //  1) top:1rem  -> üst çubuğun (72-90px) ÜSTÜNE biniyordu, fark edilmiyordu.
    //  2) sağ üst   -> sağdaki Norm Kadro panelini örtüyordu; o panel yeşil
    //     rozet dolu olduğu için yeşil kutu KAMUFLE oluyordu. Kullanıcı:
    //     "silik, okunmayan, ekrana bakan birisi asla onun çıktığını görmez."
    // Karar: ALT ORTA + koyu cam. Denetim eski değeri değil bu değişmezi
    // korur: bildirim üst şeride ya da sağ panele geri taşınmasın.
    {
        const kapsayici = (css.match(/\.toast-container\s*\{([^}]*)\}/) || ["", ""])[1];
        denetle("R20d bildirim ALT ORTADA (üst şeritte veya sağ panelde değil)",
                /bottom:\s*1\.5rem/.test(kapsayici)
                && /left:\s*50%/.test(kapsayici)
                && /top:\s*auto/.test(kapsayici)
                && /right:\s*auto/.test(kapsayici),
                "sağ üst denendi ve bırakıldı: Norm Kadro panelini örtüyordu");
    }

    // DİKKAT: [\s\S]*? kural SINIRLARINI aşıp başka bir kuraldaki nowrap'i
    // buluyordu. Yalnızca `.toast {` kuralının GÖVDESİNE bakıyoruz.
    const toastKurali = (css.match(/\n\.toast\s*\{([^}]*)\}/) || ["", ""])[1];
    denetle("R20e uzun mesaj sarıyor (nowrap kaldırıldı)",
            /white-space:\s*normal/.test(toastKurali)
            && !/white-space:\s*nowrap/.test(toastKurali),
            "nowrap uzun hata mesajlarını ekrandan taşırıyordu");

    denetle("R20f süre çubuğu var ve süreye bağlı",
            /\.toast-sure\s*\{/.test(css) && /--toast-sure/.test(css)
            && /toast\.style\.setProperty\("--toast-sure"/.test(ui));

    denetle("R20g üzerine gelince sayaç duruyor",
            /toast-duraklat[\s\S]{0,120}animation-play-state:\s*paused/.test(css)
            && /mouseenter/.test(ui) && /mouseleave/.test(ui),
            "uzun bir hata mesajını okumaya vakit kalmalı");

    denetle("R20h kapatma düğmesi var ve erişilebilir",
            /class="toast-kapat" aria-label=/.test(ui));

    denetle("R20i ızgara sütunları AÇIKÇA veriliyor",
            /\.toast-metin\s*\{[^}]*grid-column:\s*2/.test(css)
            && /\.toast-kapat\s*\{[^}]*grid-column:\s*3/.test(css),
            "otomatik yerleştirme kapatma düğmesini metnin ÖNÜNE koyuyordu");

    denetle("R20j hata bildirimi ekran okuyucuya öncelikli duyuruluyor",
            /aria-live[\s\S]{0,140}assertive/.test(ui));

    // 06.09.2026 kullanıcı kararı, aynen: "sağa sola sürüklenerek değil.
    // solup gitsin." Kaydırmalı giriş/çıkış, silme süpürmesi ve duman
    // efekti tek tek denendi ve REDDEDİLDİ. Bildirim yerinden kımıldamaz;
    // yalnızca saydamlığı değişir. Biri transform eklerse burası kırmızı yanar.
    {
        const gir = (css.match(/@keyframes toastGir\s*\{([\s\S]*?)\}\s*\n/) || ["", ""])[1];
        const cik = (css.match(/@keyframes toastCik\s*\{([\s\S]*?)\}\s*\n/) || ["", ""])[1];
        denetle("R20l bildirim yerinden KIMILDAMIYOR (yalnızca solma)",
                gir.length > 0 && cik.length > 0
                && !/transform|translate|scale/.test(gir)
                && !/transform|translate|scale/.test(cik),
                "kullanıcı kaydırmayı açıkça reddetti; yalnızca opacity değişmeli");
    }

    denetle("R20k hata bildirimi başarıdan UZUN duruyor",
            (() => {
                // Alan adı `sure` -> `bekle` oldu: artık toplam ömür değil,
                // TAM GÖRÜNÜR kalma süresi. Beliriş/solma ayrı değişkenlerde.
                const b = ui.match(/success:\s*\{[^}]*bekle:\s*(\d+)/);
                const h = ui.match(/error:\s*\{[^}]*bekle:\s*(\d+)/);
                return b && h && Number(h[1]) > Number(b[1]);
            })(),
            "kritik uyarı okunacak kadar kalmalı");
}

// R21: DURUM DEĞİŞTİREN İŞLEMLER SESSİZ KALMAMALI
// 2026-09-06 kullanıcı bildirimi: "şube sildim, o kutucuk gelmedi."
// Ölçüldü: şube SİLME ve KOPYALAMA dinleyicilerinde hiç showToast yoktu.
// Kullanıcı işlemin olup olmadığını ancak listeye bakarak anlıyordu.
//
// Ayrıca iki işlev de HİÇBİR ŞEY döndürmüyordu: demo kilidi ya da lisans
// şube sınırı devredeyse işlem reddediliyor, ama çağıran taraf bunu
// bilemediği için "silindi" demek yalan olabilirdi. Artık true/false dönüyor.
{
    const app = fs.readFileSync(path.join(KOK, "js", "app.js"), "utf8");
    const stt = fs.readFileSync(path.join(KOK, "js", "state.js"), "utf8");

    denetle("R21a şube silme sonucu bildiriliyor",
            /appState\.deleteSection\([^)]*\)\)\s*\{[\s\S]{0,220}showToast/.test(app),
            "silme sessiz kalıyordu");
    denetle("R21b şube kopyalama sonucu bildiriliyor",
            /appState\.duplicateSection\([^)]*\)\)\s*\{[\s\S]{0,220}showToast/.test(app));

    denetle("R21c bildirim yalnızca işlem GERÇEKLEŞTİYSE gösteriliyor",
            /if \(appState\.deleteSection\(/.test(app)
            && /if \(appState\.duplicateSection\(/.test(app),
            "koşulsuz gösterilirse demo kilidinde 'silindi' yalanı çıkar");

    denetle("R21d deleteSection sonuç döndürüyor",
            /deleteSection\(sectionId\) \{[\s\S]*?return false;[\s\S]*?return true;/.test(stt));
    denetle("R21e duplicateSection sonuç döndürüyor",
            /duplicateSection\(sectionId\) \{[\s\S]*?return false;[\s\S]*?return true;/.test(stt));

    denetle("R21f silme bildirimi geri almayı hatırlatıyor",
            /Geri almak için Ctrl\+Z/.test(app),
            "silme geri alınabilir; kullanıcı bunu bilmeli");

    // DAVRANIŞ: motor gerçekten doğru sonucu döndürüyor mu?
    const oncekiDurum = JSON.stringify(st.state);
    st.addSection({
        subeAdi: "TEST-Z", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "9", null, null)
    });
    const yeni = st.state.subeler[st.state.subeler.length - 1];
    denetle("R21g kopyalama true döndürüyor", st.duplicateSection(yeni.id) === true);
    denetle("R21h silme true döndürüyor", st.deleteSection(yeni.id) === true);
    denetle("R21i olmayan şubede false döndürüyor",
            st.deleteSection("boyle-bir-id-yok") === false,
            "yoksa 'silindi' bildirimi yanlış çıkar");
    st.state = JSON.parse(oncekiDurum);
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
