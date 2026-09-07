/*
 * DEMO OKUL TESTİ
 * ===============
 * Demo okul, ürünün vitrinidir: siteye gelen herkes "Demo Okulu Deneyin"e
 * basınca bunu görür. Bu yüzden içeriği bozulursa ilk izlenim bozulur ve
 * bunu kimse fark etmeyebilir — hiçbir hata çıkmaz, sadece ekran zayıflar.
 *
 * Bu test, demo okulun VİTRİN OLARAK çalıştığını denetler:
 *   1. Gerçek ölçek: 10 şube, dört sınıf seviyesi
 *   2. Sağ panelde üç durum birden: Tam / İhtiyaç / Fazla
 *   3. Sol panelde üç renk birden: tam (40/40) / eksik / fazla
 *   4. Seçmeli dersler norm hesabına GİRİYOR
 *   5. Müfredat hataları geri gelmemiş (hayalet Almanca)
 *
 * (4) neden var: eski demo verisi seçmelileri `dersAdi`/`dersSaati`/
 * `ttkbKarsiligi` alanlarıyla yazıyordu. Norm motoru dersi `ders`, saati
 * `saat`, branşı `atananBrans` alanından okur. Alan adları tutmadığı için
 * demo okulun BÜTÜN seçmeli saatleri sessizce yok sayılıyordu; ekranda
 * hiçbir hata görünmüyordu.
 *
 * Çalıştırma: node tools/test_demoOkul.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const w = {};
const ctx = {
    window: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: a => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: true, maxSections: -1, allowExport: true
};

let gecti = 0;
const hatalar = [];
function kontrol(ad, olan, beklenen) {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${beklenen}   bulunan: ${olan}`);
}
function enAz(ad, olan, alt) {
    if (olan >= alt) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      en az ${alt} bekleniyordu, bulunan: ${olan}`);
}

console.log("DEMO OKUL TESTİ");
console.log("=".repeat(66));

w.appState.loadDemoSchool(w.dbService, w.curriculumEngine);
const s = w.appState.state;
const subeler = s.subeler || [];

// ---------------------------------------------------------- geçerlilik
console.log(`kurulan okul: ${s.okulBilgisi.okulAdi}, ${subeler.length} şube`);
if (!subeler.length) {
    console.log("!! demo okul kurulamadı — test hiçbir şeyi denetlemiyor.");
    process.exit(1);
}

// ------------------------------------------------------------- 1. ölçek
console.log("\n── 1. Gerçek ölçekte bir okul");
enAz("en az 8 şube", subeler.length, 8);
kontrol("dört sınıf seviyesi de var",
    new Set(subeler.map(x => String(x.sinifSeviyesi))).size, 4);

// ------------------------------------------- 2. sağ panelde üç durum
console.log("── 2. Norm tablosunda Tam / İhtiyaç / Fazla üçü birden");
const rapor = w.normEngine.calculateSchoolNorms(
    subeler, s.mevcutOgretmenler, s.okulBilgisi.okulTuru, {}).branchReport || [];
const say = { tam: 0, ihtiyac: 0, fazla: 0 };
for (const b of rapor) {
    const d = b.statusText || "";
    if (d.includes("İhtiyaç")) say.ihtiyac++;
    else if (d.includes("Fazla")) say.fazla++;
    else say.tam++;
}
console.log(`   Tam: ${say.tam}  İhtiyaç: ${say.ihtiyac}  Fazla: ${say.fazla}`);
enAz("en az 1 branş Tam", say.tam, 1);
enAz("en az 1 branş İhtiyaç", say.ihtiyac, 1);
enAz("en az 1 branş Fazla", say.fazla, 1);

// Hiçbir branşa 0 öğretmen yazılmamalı: sıfır kadrolu bir lise gerçekçi değil
const sifirlar = Object.entries(s.mevcutOgretmenler || {}).filter(([, v]) => !v);
kontrol("öğretmen listesinde 0 yazan branş yok", sifirlar.length, 0);

// Listede olup tabloda hiç görünmeyen öğretmen olmamalı
const tablodakiler = new Set(rapor.map(b => b.branchName));
const gorunmeyen = Object.keys(s.mevcutOgretmenler || {}).filter(b => !tablodakiler.has(b));
kontrol("kayıtlı her öğretmenin branşı tabloda görünüyor",
    gorunmeyen.join(", "), "");

// ------------------------------------------- 3. sol panelde üç renk
console.log("── 3. Şube rozetlerinde üç durum birden");
const renk = { tam: 0, eksik: 0, fazla: 0 };
for (const x of subeler) {
    const t = [...(x.zorunluDersler || []), ...(x.secmeliDersler || [])]
        .reduce((a, d) => a + (parseInt(d.saat || d.ders_saati || 0, 10) || 0), 0);
    if (t === 40) renk.tam++; else if (t > 40) renk.fazla++; else renk.eksik++;
}
console.log(`   tam: ${renk.tam}  eksik: ${renk.eksik}  fazla: ${renk.fazla}`);
enAz("en az 1 şube tam (40/40)", renk.tam, 1);
enAz("en az 1 şube eksik", renk.eksik, 1);
enAz("en az 1 şube fazla", renk.fazla, 1);

// ------------------------------------- 4. seçmeliler norm hesabına giriyor
console.log("── 4. Seçmeli dersler norm hesabına giriyor");
const secmeliSaat = subeler.reduce((t, x) =>
    t + (x.secmeliDersler || []).reduce((a, d) =>
        a + (parseInt(d.saat || d.ders_saati || 0, 10) || 0), 0), 0);
enAz("demo okulda seçmeli ders saati var", secmeliSaat, 50);
// Alan adları doğru mu? Motor `ders` ve `atananBrans` okur.
const bozukAlan = subeler.flatMap(x => (x.secmeliDersler || []))
    .filter(d => !d.ders || !d.atananBrans);
kontrol("seçmelilerin hepsinde `ders` ve `atananBrans` alanı var",
    bozukAlan.length, 0);
// Matematik yükü, zorunlu Matematik saatlerinden BÜYÜK olmalı: seçmeliler
// sayılmasaydı ikisi eşit çıkardı.
const zorunluMat = subeler.reduce((t, x) => t + (x.zorunluDersler || [])
    .filter(d => d.atananBrans === "Matematik")
    .reduce((a, d) => a + d.saat, 0), 0);
const matYuk = (rapor.find(b => b.branchName === "Matematik") || {}).totalHours || 0;
console.log(`   Matematik: zorunlu ${zorunluMat} saat, tabloda ${matYuk} saat`);
enAz("Matematik yükü seçmelilerle birlikte artmış", matYuk - zorunluMat, 1);

// --------------------------------------- 5. eski müfredat hataları yok
console.log("── 5. Düzeltilmiş müfredat hataları geri gelmemiş");
const tumDersler = subeler.flatMap(x => (x.zorunluDersler || []));
kontrol("hiçbir şubede hayalet Almanca dersi yok",
    tumDersler.filter(d => /Almanca/.test(d.ders)).length, 0);
kontrol("9. sınıf ortak ders toplamı 32 (çizelgeyle aynı)",
    (subeler.find(x => x.sinifSeviyesi === "9").zorunluDersler || [])
        .filter(d => d.kategori === "ORTAK DERSLER")
        .reduce((a, d) => a + d.saat, 0), 32);

/* ====== 6) MESLEK LİSESİ DEMOSU ======================================
   08.09.2026'da eklendi. Tek demo vardı ve anadolu lisesi olarak kilitliydi;
   ürünün en ayırt edici tarafı — atölye normu (Md. 19), sınıf seviyesine
   duyarlı grup bölünmesi (Md. 22/1-ç), işletme koordinatörlüğü — demoya
   giren hiç kimseye görünmüyordu.

   Bu bölüm o demonun VİTRİN OLARAK çalıştığını denetler. Sessizce bozulması
   çok kolay: şubenin alanı ya da dalı yanlış yazılırsa müfredat motoru boş
   liste döndürür, ekran "şubeler var ama ders yok" hâline gelir ve hiçbir
   hata görünmez. */
console.log("\n── 6. Meslek lisesi demosu");
w.appState.loadDemoMeslekLisesi(w.dbService, w.curriculumEngine);
const m = w.appState.state;
const mSubeler = m.subeler || [];

kontrol("okul türü meslekî ve teknik",
    m.okulBilgisi.okulTuru, "mesleki_ve_teknik_anadolu_lisesi");
enAz("en az 6 şube", mSubeler.length, 6);
kontrol("hiçbir şube boş çizelgeyle kalmadı",
    mSubeler.filter(x => !(x.zorunluDersler || []).length).length, 0);
kontrol("10-12. sınıfların hepsinde alan ve dal yazılı",
    mSubeler.filter(x => x.sinifSeviyesi !== "9" && !(x.alanId && x.dalAdi)).length, 0);
kontrol("9. sınıf alansız (ortak program)",
    mSubeler.filter(x => x.sinifSeviyesi === "9" && x.alanId).length, 0);

const mRe = new w.MebReportsEngine(w.dbService, w.normEngine, w.curriculumEngine);
const mNorm = w.normEngine.calculateSchoolNorms(
    mSubeler, m.mevcutOgretmenler, m.okulBilgisi.okulTuru, mRe.buildCoordinatorMap(m));

console.log(`   ${mSubeler.length} şube, ${mNorm.totalStudents} öğrenci, `
    + `${mNorm.totalHours} saat, ${mNorm.totalCalculatedNorm} norm`);

// Ürünün farkı tam olarak burada görünür: atölye normu Madde 19'dan gelir.
const atolyeli = mNorm.branchReport.filter(x => x.workshopNorm > 0);
enAz("en az iki alanda atölye normu çıkıyor", atolyeli.length, 2);
kontrol("atölye normu Madde 19'dan hesaplanıyor",
    atolyeli.every(x => /Madde 19/.test(x.formulaExplanation || "")), true);

// Grup bölünmesi SINIF SEVİYESİNE duyarlı olmalı; tek tabloyla yapılırsa
// 9. sınıflı okullarda sistematik hata üretir.
const grupNotlari = mNorm.branchReport.flatMap(x => x.courses || [])
    .filter(c => String(c.note || "").includes("22/1-ç"));
enAz("grup bölünmesi uygulanmış ders var", grupNotlari.length, 5);
kontrol("28 öğrencili 10. sınıf 3 gruba bölünüyor",
    grupNotlari.some(c => /10\. sınıf, 28 öğrenci .{0,3} 3 grup/.test(c.note)), true);

// İşletme koordinatörlüğü: Norm Kadro Yönetmeliği DIŞINDAN gelen tek kalem
// (OÖKY Md. 88 / Ek Ders Kararı) ve Madde 19 yüküne eklenir.
enAz("12. sınıf işletme koordinatörlüğü yüke giriyor",
    mNorm.branchReport.flatMap(x => x.courses || []).filter(c => c.isCoordinator).length, 2);

// Md. 14: döner sermaye + 100 stajyer = 2 ilave müdür yardımcısı normu.
kontrol("ilave müdür yardımcısı normu 2 (Md. 14)",
    mNorm.adminNorms.mudurYardimcisiExtra, 2);

// Vitrin: norm tablosu tek renk olmamalı.
const mDurum = new Set(mNorm.branchReport.map(x => x.statusType));
kontrol("norm tablosunda hem İhtiyaç hem Fazla görünüyor",
    mDurum.has("ihtiyac") && mDurum.has("fazla"), true);

// İki demo GERÇEKTEN farklı şeyler mi gösteriyor: genel lise demosunda
// atölye normu hiç çıkmamalı. Çıkarsa demolardan biri yanlış kurulmuştur.
w.appState.loadDemoSchool(w.dbService, w.curriculumEngine);
const g = w.appState.state;
const gNorm = w.normEngine.calculateSchoolNorms(
    g.subeler, g.mevcutOgretmenler, g.okulBilgisi.okulTuru, mRe.buildCoordinatorMap(g));
kontrol("genel lise demosunda atölye normu yok",
    gNorm.branchReport.filter(x => x.workshopNorm > 0).length, 0);

console.log("\n" + "=".repeat(66));
if (!hatalar.length) {
    console.log(`✅ DEMO OKUL SAĞLAM — ${gecti} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${hatalar.length} HATA (${gecti} kontrol geçti)`);
    hatalar.forEach(h => console.log(h));
}
console.log("=".repeat(66));
process.exit(hatalar.length ? 1 : 0);
