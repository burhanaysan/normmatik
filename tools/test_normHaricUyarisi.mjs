/*
 * NORMA DAHİL EDİLMEYEN YAN DERS UYARISI TESTİ
 * ============================================
 *
 * Ne yapar: Bir ders, seçilen branşın norm hesabına dahil edilmiyorsa ders
 * satırında küçük bir uyarı işareti çıkar. UYARIDIR, ENGEL DEĞİLDİR — saat
 * yine o branşın yüküne eklenir (bkz. test_bransSecimi.mjs).
 *
 * Kaynak: MEB Norm Kadroya Esas Dersler Çizelgesi, her branşın
 * "norma dahil edilmeyen yan dersler" listesi.
 *
 * BU TESTİN ASIL İŞİ: uyarının FAZLA konuşmasını engellemek.
 * Yanlış uyarı, hiç uyarmamaktan daha zararlıdır — idareci bir süre sonra
 * hepsini görmezden gelir. O yüzden testin ağırlığı "şurada uyarmamalı"
 * kontrollerinde.
 *
 * Üç kural denetlenir:
 *   1. Çizelgede ADIYLA geçen eşleşmelerde uyarır.
 *   2. Kademeyi gözetir. Çizelge "Fen Bilimleri (Ortaokul)" ile "(Lise)"
 *      ayrımını bilerek yapmıştır: birincisi Fizik'in normuna girmez,
 *      ikincisi Biyoloji'nin normuna GİRER.
 *   3. Doğru atamalarda ve çizelgede geçmeyen derslerde SUSAR.
 *
 * Çalıştırma: node tools/test_normHaricUyarisi.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const ctx = {
    console: { log() {}, warn() {}, error() {} },
    window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: a => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
ctx.window.dispatchEvent = () => true;
ctx.window.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

let gecti = 0;
const hatalar = [];
function kontrol(ad, olan, beklenen) {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${beklenen}   bulunan: ${olan}`);
}

console.log("NORMA DAHİL EDİLMEYEN YAN DERS UYARISI");
console.log("=".repeat(70));

// -------------------------------------------------------------- geçerlilik
const tablo = ctx.window.NORM_HARIC_DERSLER || ctx.NORM_HARIC_DERSLER;
const bul = ctx.window.normHaricKaydiBul || ctx.normHaricKaydiBul;
if (typeof bul !== "function" || !Array.isArray(tablo)) {
    console.log("!! normHaricKaydiBul/NORM_HARIC_DERSLER pakete girmemiş.");
    console.log("   build_bundle.py listesinde norm_haric_dersler.js var mı?");
    process.exit(1);
}
console.log(`tablo: ${tablo.length} kayıt`);
if (tablo.length < 20) {
    console.log("!! tablo şüpheli derecede küçük — test hiçbir şeyi denetlemiyor.");
    process.exit(1);
}
const uyarir = (d, b, t) => bul(d, b, t) !== null;

// ---------------------------------------------------- 1. Uyarması gerekenler
console.log("\n── 1. Çizelgede adıyla geçen eşleşmelerde uyarır");
kontrol("Sağlık Bilgisi -> Biyoloji (lise)",
    uyarir("Sağlık Bilgisi ve Trafik Kültürü", "Biyoloji", "anadolu_lisesi"), true);
kontrol("Sağlık Bilgisi -> Beden Eğitimi (lise)",
    uyarir("Sağlık Bilgisi ve Trafik Kültürü", "Beden Eğitimi", "anadolu_lisesi"), true);
kontrol("Biyoloji -> Sağlık Hizmetleri",
    uyarir("Biyoloji", "Sağlık Hizmetleri", "meslek_lisesi"), true);
kontrol("Sosyal Bilgiler -> Tarih",
    uyarir("Sosyal Bilgiler", "Tarih", "ortaokul"), true);
kontrol("Almanca -> İngilizce",
    uyarir("Almanca", "İngilizce", "anadolu_lisesi"), true);
kontrol("Teknoloji ve Tasarım -> Görsel Sanatlar",
    uyarir("Teknoloji ve Tasarım", "Görsel Sanatlar", "ortaokul"), true);

// ------------------------------------------------------------ 2. Kademe ayrımı
console.log("── 2. Kademeyi gözetir");
kontrol("Fen Bilimleri -> Fizik ORTAOKULDA uyarır",
    uyarir("Fen Bilimleri", "Fizik", "ortaokul"), true);
kontrol("Fen Bilimleri -> Fizik LİSEDE uyarmaz",
    uyarir("Fen Bilimleri", "Fizik", "anadolu_lisesi"), false);
kontrol("Biyoloji -> Fen Bilimleri LİSEDE uyarır",
    uyarir("Biyoloji", "Fen Bilimleri", "anadolu_lisesi"), true);
kontrol("Biyoloji -> Fen Bilimleri ORTAOKULDA uyarmaz",
    uyarir("Biyoloji", "Fen Bilimleri", "ortaokul"), false);
kontrol("Türkçe -> Türk Dili ve Edebiyatı ORTAOKULDA uyarır",
    uyarir("Türkçe", "Türk Dili ve Edebiyatı", "ortaokul"), true);
kontrol("Türkçe -> Türk Dili ve Edebiyatı LİSEDE uyarmaz",
    uyarir("Türkçe", "Türk Dili ve Edebiyatı", "anadolu_lisesi"), false);

// ------------------------------------------------- 3. SUSMASI gerekenler
// Asıl risk burada: fazla konuşan uyarı işe yaramaz hâle gelir.
console.log("── 3. Gereksiz yere konuşmaz");
for (const [d, b] of [
    ["Matematik", "Matematik"], ["Biyoloji", "Biyoloji"],
    ["Türk Dili ve Edebiyatı", "Türk Dili ve Edebiyatı"],
    ["Fizik", "Fizik"], ["Kimya", "Kimya"], ["Tarih", "Tarih"],
    ["Coğrafya", "Coğrafya"], ["İngilizce", "İngilizce"],
    ["Beden Eğitimi ve Spor", "Beden Eğitimi"],
    ["Görsel Sanatlar/Müzik", "Görsel Sanatlar"],
    ["Din Kültürü ve Ahlak Bilgisi", "Din Kültürü ve Ahlak Bilgisi"],
    ["Rehberlik ve Yönlendirme", "Rehberlik"],
    ["Sağlık Bilgisi ve Trafik Kültürü", "Sağlık Hizmetleri"]
]) {
    kontrol(`doğru atama sessiz: ${d} -> ${b}`, uyarir(d, b, "anadolu_lisesi"), false);
}
kontrol("çizelgede hiç geçmeyen meslek dersi sessiz",
    uyarir("CUMHURİYET BAŞSAVCILIĞI KALEM HİZMETLERİ", "Adalet", "meslek_lisesi"), false);
kontrol("branş boşsa sessiz",
    uyarir("Sağlık Bilgisi ve Trafik Kültürü", "", "anadolu_lisesi"), false);
kontrol("ders boşsa sessiz", uyarir("", "Biyoloji", "anadolu_lisesi"), false);

// ---- Gerçek müfredat üzerinde tarama: uyarı oranı makul mü? ----
// Uygulamanın kendi ürettiği doğru atamalarda HİÇ uyarı çıkmamalı.
console.log("── 4. Uygulamanın kendi ürettiği müfredatta hiç uyarı çıkmaz");
{
    // curriculumEngine de `const`; global nesneye paketleyici yazıyor.
    const ce = ctx.window.curriculumEngine || ctx.curriculumEngine;
    if (!ce) { console.log('!! curriculumEngine bulunamadı'); process.exit(1); }
    let ders = 0, uyari = 0;
    const kurulum = [
        ["anadolu_lisesi", ["9", "10", "11", "12"]],
        ["ortaokul", ["5", "6", "7", "8"]],
        ["imam_hatip_ortaokulu", ["5", "6", "7", "8"]],
        ["ilkokul", ["1", "2", "3", "4"]]
    ];
    for (const [tur, siniflar] of kurulum)
        for (const g of siniflar)
            for (const d of ce.getMandatoryCourses(tur, g, null, null) || []) {
                ders++;
                if (bul(d.ders, d.atananBrans, tur)) {
                    uyari++;
                    hatalar.push(`  ✗ kendi müfredatında uyarı: ${tur} ${g}. sınıf — ` +
                        `${d.ders} -> ${d.atananBrans}`);
                }
            }
    console.log(`   taranan ders: ${ders}`);
    if (ders < 100) {
        console.log("!! taranan ders sayısı çok az — bu bölüm hiçbir şeyi denetlemiyor.");
        process.exit(1);
    }
    kontrol("kendi müfredatında sıfır uyarı", uyari, 0);
}

console.log("\n" + "=".repeat(70));
if (!hatalar.length) {
    console.log(`✅ UYARI DOĞRU ÇALIŞIYOR — ${gecti} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${hatalar.length} HATA (${gecti} kontrol geçti)`);
    hatalar.forEach(h => console.log(h));
}
console.log("=".repeat(70));
process.exit(hatalar.length ? 1 : 0);
