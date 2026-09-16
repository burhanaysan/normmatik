/*
 * ÖZEL EĞİTİM KARTI TESTİ
 * =======================
 * Hedef: js/bundle.js
 *
 * NEDEN VAR (kullanıcı bildirimi 09.09.2026, düzeltme 14.09.2026)
 * ---------------------------------------------------------------
 * Master Yük Matrisi'nde kartlar yalnızca DERSİ ATANMIŞ branşlardan
 * çiziliyordu. Özel Eğitim'e ders atanmadığı için motorun ürettiği satır
 * (saat, norm, şube şube dayanak) raporda hiç görünmüyordu. Sanal
 * ortaokulda kartlar 714 saat topluyor, üstteki toplam 803 diyordu; aradaki
 * 89 saat ve 6 norm hiçbir kartta yoktu. Aynı boşluk Excel ve CSV'de de vardı.
 *
 * Kullanıcı kararı: ders satırsız ÖZET KART — şube, haftalık saat, şube
 * normu, dayanak (Md. 17/1). Diğer kartlardaki hiçbir sayı değişmez.
 *
 * Bu test paket yeniden üretilmeden (eski kodla) çalıştırıldığında kırmızı
 * yanmalıdır; yanmıyorsa ölçüm geçersizdir.
 *
 * Çalıştırma: node tools/test_ozelEgitimKarti.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gecti = 0;
const hatalar = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; console.log("  [GEÇTİ] " + ad); }
    else { hatalar.push(ad + "   " + ayrinti); console.log("  [KALDI] " + ad + "   " + ayrinti); }
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
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const st = win.appState, ce = win.curriculumEngine;
win.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};
const R = new win.MebReportsEngine(win.dbService, win.normEngine, win.curriculumEngine);
const UI = new win.UIComponentManager(win.dbService, st, win.normEngine, win.curriculumEngine);

const TUR = "ortaokul_temel_egitim";
function okulKur(ozelli) {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = TUR;
    st.state.okulBilgisi.okulAdi = "Test Ortaokulu";
    [["5", "5-A"], ["6", "6-A"], ["7", "7-A"]].forEach(([g, ad]) => st.addSection({
        subeAdi: ad, sinifSeviyesi: g, ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses(TUR, g, null, null)
    }));
    if (ozelli) {
        // İki farklı engel türü: iki farklı dayanak ve norm (17/1-d = 2, 17/1-ç = 2)
        [["6", "6-B (Özel Eğt)", "hafif_zihinsel"], ["7", "7-B (Özel Eğt)", "orta_agir_otizm"]]
            .forEach(([g, ad, tur]) => st.addSection({
                subeAdi: ad, sinifSeviyesi: g, ogrenciSayisi: 8,
                isSpecialEdu: true, engelTuru: tur, specialEduType: tur,
                alanId: "ozel_egitim", dalAdi: "Özel Eğitim Sınıfı",
                zorunluDersler: ce.getMandatoryCourses(TUR, g, "ozel_egitim", "Özel Eğitim Sınıfı")
            }));
    }
    st.state.mevcutOgretmenler = { "Özel Eğitim": 1, "Matematik": 1 };
}

console.log("ÖZEL EĞİTİM KARTI TESTİ");
console.log("=".repeat(70));

// ============================================================ özel şubeli okul
okulKur(true);
const ozelSubeler = st.state.subeler.filter(s => s.isSpecialEdu);
const grid = R.generateMasterLoadGrid(st.state, "ALL");
const oz = grid.branchReportMap["Özel Eğitim"];

console.log("\nÖlçüm geçerliliği");
denetle("K0a senaryoda 2 özel eğitim şubesi var", ozelSubeler.length === 2, String(ozelSubeler.length));
denetle("K0b motor Özel Eğitim satırı üretiyor", !!(oz && oz.isSpecialEdu));
denetle("K0c Özel Eğitim'e ders atanmamış (hatanın koşulu)", !grid.branchGroups["Özel Eğitim"]);
if (!oz) { console.log("\n❌ ÖLÇÜM GEÇERSİZ: motor Özel Eğitim satırı üretmedi"); process.exit(1); }

console.log("\nMotor detayı");
const detay = oz.ozelEgitimDetay || [];
denetle("K1a her özel şube için bir detay satırı", detay.length === ozelSubeler.length);
denetle("K1b detayda şube kimliği ve haftalık saat var",
        detay.every(x => typeof x.subeId === "string" && Number.isFinite(x.saat) && x.saat > 0),
        JSON.stringify(detay.map(x => [x.subeId, x.saat])));
denetle("K1c şube saatleri toplamı = kart başlığındaki saat (tek kural)",
        detay.reduce((t, x) => t + x.saat, 0) === oz.totalHours,
        detay.reduce((t, x) => t + x.saat, 0) + " / " + oz.totalHours);
denetle("K1d şube normları toplamı = Özel Eğitim normu",
        detay.reduce((t, x) => t + x.norm, 0) === oz.calculatedNorm);
denetle("K1e her şubenin saati kendi derslerinin toplamı (özel eğitim öğretmeni + alana yazılan)",
        detay.every(x => {
            const s = ozelSubeler.find(y => y.id === x.subeId);
            if (!s) return false;
            const h = [...(s.zorunluDersler || []), ...(s.secmeliDersler || [])]
                .reduce((t, d) => t + (parseInt(d.saat, 10) || 0), 0);
            return x.saat + (x.alanSaat || 0) === (h > 0 ? h : 30);
        }));

console.log("\nEkrandaki kart");
const html = UI.renderMasterGridReport(grid, false, true);
const kartlar = html.match(/<section class="dd-brans[^"]*">[\s\S]*?<\/section>/g) || [];
const ozelKart = kartlar.find(k => k.startsWith('<section class="dd-brans ozel">')) || "";
denetle("K2  tam olarak bir Özel Eğitim kartı var  <-- bildirilen hata",
        kartlar.filter(k => k.startsWith('<section class="dd-brans ozel">')).length === 1);
denetle("K3  kart sayısı = branş sayısı + 1",
        kartlar.length === grid.sortedBranchNames.length + 1,
        kartlar.length + " / " + grid.sortedBranchNames.length);
denetle("K4  başlıkta motorun saati, normu ve kadrosu",
        ozelKart.includes(`haftalık <b>${oz.totalHours} saat</b> · norm <b>${oz.calculatedNorm}</b> · kadro <b>${oz.currentTeachers}</b>`));
denetle("K5  her özel şube satırı adı, saati, normu ve dayanağıyla",
        detay.every(x => ozelKart.includes(`<td class="dd-ders">${x.sube}</td>`)
            && ozelKart.includes(`>${x.saat}</span>`) && ozelKart.includes(x.dayanak)));
denetle("K6  normal şubeler özel kartta satır olarak yok",
        st.state.subeler.filter(s => !s.isSpecialEdu)
            .every(s => !ozelKart.includes(`<td class="dd-ders">${s.subeAdi}</td>`)));
const beklenenDurum = oz.diff < 0 ? Math.abs(oz.diff) + " öğretmen açık"
    : (oz.diff > 0 ? "+" + oz.diff + " fazla" : "kadro tam");
denetle("K7  kart durumu motorun farkını söylüyor", ozelKart.includes(beklenenDurum), beklenenDurum);
denetle("K8  dipnot Md. 17/1'e dayanıyor", /Md\. 17\/1/.test(ozelKart));
denetle("K9  'undefined' / 'NaN' sızmıyor", !/undefined|NaN/.test(ozelKart));
denetle("K10 kartlar aciliyete göre sıralı (özel kart dahil)", (() => {
    const sira = [...html.matchAll(/class="dd-durum (acik|fazla|tam)"/g)].map(m => ({ acik: 0, fazla: 1, tam: 2 })[m[1]]);
    return sira.every((v, i) => i === 0 || sira[i - 1] <= v);
})());

// "Kartlar toplanınca üstteki sayı tutar" — kullanıcının asıl şikâyeti.
const kartToplami = [...html.matchAll(/haftalık <b>(\d+) saat<\/b>/g)].reduce((t, m) => t + Number(m[1]), 0);
denetle("K11 kartların saat toplamı = norma esas yük (mutabakat)",
        grid.yukMutabakati && kartToplami === grid.yukMutabakati.normaEsasYuk,
        kartToplami + " / " + (grid.yukMutabakati && grid.yukMutabakati.normaEsasYuk));

console.log("\nDışa aktarma");
const csv = R.exportToCSV(grid);
const csvOzel = csv.split("\n").filter(l => l.startsWith('"Özel Eğitim"'));
denetle("K12 CSV'de her özel şube için bir satır", csvOzel.length === detay.length,
        csvOzel.length + " / " + detay.length);
// CSV ayırıcısı noktalı virgül; satır "...;<saat>;"<norm>"" ile biter.
denetle("K13 CSV satırı saat ve normu taşıyor",
        detay.every(x => csvOzel.some(l => l.includes(x.sube) && l.trimEnd().endsWith(";" + x.saat + ';"' + x.norm + '"'))),
        JSON.stringify(csvOzel));

// Motor dışı kart (Rehberlik) özel şubelerin saatini ikinci kez saymamalı.
const rehberlikKarti = kartlar.find(k => k.includes('<span class="dd-ad">Rehberlik</span>')) || "";
const rehberOzel = ozelSubeler.reduce((t, s) => t + (grid.branchGroups["Rehberlik"]
    ? Object.values(grid.branchGroups["Rehberlik"].courses).reduce((u, c) => u + (parseInt((c.sectionHours || {})[s.id], 10) || 0), 0) : 0), 0);
denetle("K13b ölçüm geçerli: özel şubelerin Rehberlik kartında saati var", rehberOzel > 0, String(rehberOzel));
denetle("K13c Rehberlik kartı özel şube saatini yüke katmıyor, dipnotta yazıyor",
        rehberlikKarti.includes(`haftalık <b>${grid.branchGroups["Rehberlik"].totalHours - rehberOzel} saat</b>`)
        && rehberlikKarti.includes(`Özel eğitim şubelerinin <b>${rehberOzel}</b> saati`));
const kaynak = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
denetle("K14 Excel matrisi de aynı kaynaktan besleniyor",
        (kaynak.match(/this\.ozelEgitimSatirlari\(/g) || []).length === 2);

// ============================================================ özel şubesiz okul
console.log("\nÖzel eğitim şubesi yokken");
okulKur(false);
const grid2 = R.generateMasterLoadGrid(st.state, "ALL");
const html2 = UI.renderMasterGridReport(grid2, false, true);
denetle("K15 özel kart basılmıyor", !html2.includes('class="dd-brans ozel"'));
denetle("K16 kart sayısı = branş sayısı",
        (html2.match(/class="dd-brans/g) || []).length === grid2.sortedBranchNames.length);
denetle("K17 CSV'ye özel satır eklenmiyor", !R.exportToCSV(grid2).includes('"Özel Eğitim"'));

console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ ÖZEL EĞİTİM KARTI HATALI — " + hatalar.length + " hata, " + gecti + " geçti");
    for (const h of hatalar) console.log("   • " + h);
    process.exit(1);
}
console.log("✅ ÖZEL EĞİTİM KARTI DOĞRU — " + gecti + " kontrol başarılı, 0 hata");
