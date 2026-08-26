/*
 * NORM MOTORU — SINIR DEĞER SÜPÜRMESİ  (Cephe 2 — çökertme tatbikatı)
 * ===================================================================
 * Hedef: js/bundle.js
 *
 * MEVCUT TESTTEN FARKI
 * --------------------
 * `test_normEngine.mjs` "motor yönetmeliğe uyuyor mu?" diye bakar; beklenen
 * değerler yönetmelik metninden elle türetilmiştir. İyi bir testtir ama
 * yalnızca BAKTIĞI noktaları görür.
 *
 * Bu betik farklı bir soru sorar: **kuraldan bağımsız olarak her zaman
 * hata sayılacak** durumlar var mı? Yönetmeliği okumaya gerek yok; şunlar
 * hiçbir kuralda doğru olamaz:
 *
 *   T1  Öğrenci/saat ARTARKEN norm AZALIYORSA          (tekdüzelik ihlali)
 *   T2  Bir eşikte norm 1'den fazla ZIPLIYORSA          (süreksizlik)
 *   T3  Sonuç tam sayı değilse, negatifse, NaN/Infinity ise
 *   T4  Bozuk girdide (metin, negatif, ondalık, çok büyük) ÇÖKÜYORSA
 *
 * Çalıştırma: node tools/denetim_norm_sinirlari.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gecti = 0;
const bulgular = [];
function bulgu(cephe, ad, ayrinti) {
    bulgular.push({ cephe, ad, ayrinti });
}

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

const NE = win.normEngine;

// KURGU GEÇERLİLİK DENETİMİ
// Bir süpürme, işlev yanlış çağrıldığı için hep aynı değeri döndürüyorsa
// hiçbir şey denetlemez ("hep 0" da tekdüzedir, ihlal görünmez). Bu yüzden
// her süpürmeden önce girdinin çıktıyı GERÇEKTEN etkilediği doğrulanır.
function kurguGecerliMi(ad, fn, kucuk, buyuk) {
    const a = fn(kucuk), b = fn(buyuk);
    if (a === b) {
        bulgu("KURGU", `${ad}: girdi değişmesine rağmen sonuç sabit (${a})`,
            "süpürme geçersiz — işlev yanlış çağrılıyor olabilir");
        return false;
    }
    return true;
}

const sayiMi = (x) => typeof x === "number" && Number.isFinite(x);

console.log("NORM MOTORU — SINIR DEĞER SÜPÜRMESİ");
console.log("=".repeat(76));

// =====================================================================
// 1. GENEL DERS NORMU (Madde 18) — saat süpürmesi 0..600
// =====================================================================
console.log("\n1. Genel ders normu (Md. 18): 0-600 saat süpürmesi");
{
    let oncekiNorm = -1, oncekiSaat = -1;
    const ziplamalar = [];
    for (let saat = 0; saat <= 600; saat++) {
        let n;
        try { n = NE.calculateGeneralSubjectNorm(saat); }
        catch (e) { bulgu("Md.18", `${saat} saatte çöküyor`, e.message); continue; }
        const norm = (typeof n === "object" && n !== null) ? n.normCount : n;

        if (!sayiMi(norm)) { bulgu("Md.18", `${saat} saat -> sayı değil`, String(norm)); continue; }
        if (norm < 0) bulgu("Md.18", `${saat} saat -> NEGATİF norm`, String(norm));
        if (!Number.isInteger(norm)) bulgu("Md.18", `${saat} saat -> tam sayı değil`, String(norm));
        if (oncekiNorm >= 0) {
            if (norm < oncekiNorm)
                bulgu("Md.18", "TEKDÜZELİK İHLALİ: saat artarken norm azaldı",
                    `${oncekiSaat} saat -> ${oncekiNorm} norm, ${saat} saat -> ${norm} norm`);
            if (norm - oncekiNorm > 1)
                ziplamalar.push(`${oncekiSaat}→${saat} saat: ${oncekiNorm}→${norm} norm`);
        }
        oncekiNorm = norm; oncekiSaat = saat; gecti++;
    }
    if (ziplamalar.length)
        bulgu("Md.18", `SÜREKSİZLİK: norm 1'den fazla zıpladı (${ziplamalar.length} yer)`,
            ziplamalar.slice(0, 6).join(" · "));
    console.log(`   ${601} saat değeri denendi`);
}

// =====================================================================
// 2. ATÖLYE/LAB NORMU (Madde 19) — saat süpürmesi
// =====================================================================
console.log("\n2. Atölye/lab normu (Md. 19): 0-800 saat süpürmesi");
{
    let oncekiNorm = -1, oncekiSaat = -1;
    const ziplamalar = [];
    for (let saat = 0; saat <= 800; saat++) {
        let n;
        try { n = NE.calculateWorkshopLabNorm(saat); }
        catch (e) { bulgu("Md.19", `${saat} saatte çöküyor`, e.message); continue; }
        const norm = (typeof n === "object" && n !== null) ? n.normCount : n;

        if (!sayiMi(norm)) { bulgu("Md.19", `${saat} saat -> sayı değil`, String(norm)); continue; }
        if (norm < 0) bulgu("Md.19", `${saat} saat -> NEGATİF norm`, String(norm));
        if (!Number.isInteger(norm)) bulgu("Md.19", `${saat} saat -> tam sayı değil`, String(norm));
        if (oncekiNorm >= 0) {
            if (norm < oncekiNorm)
                bulgu("Md.19", "TEKDÜZELİK İHLALİ: saat artarken norm azaldı",
                    `${oncekiSaat} saat -> ${oncekiNorm} norm, ${saat} saat -> ${norm} norm`);
            if (norm - oncekiNorm > 1)
                ziplamalar.push(`${oncekiSaat}→${saat} saat: ${oncekiNorm}→${norm} norm`);
        }
        oncekiNorm = norm; oncekiSaat = saat; gecti++;
    }
    if (ziplamalar.length)
        bulgu("Md.19", `SÜREKSİZLİK: norm 1'den fazla zıpladı (${ziplamalar.length} yer)`,
            ziplamalar.slice(0, 6).join(" · "));
    console.log(`   ${801} saat değeri denendi`);
}

// =====================================================================
// 3. ATÖLYE GRUP BÖLÜNMESİ (Madde 22/1-ç) — mevcut süpürmesi 0..120
// =====================================================================
console.log("\n3. Atölye grup bölünmesi (Md. 22/1-ç): her sınıfta 0-120 öğrenci");
for (const sinif of ["9", "10", "11", "12"]) {
    let oncekiGrup = -1, oncekiMevcut = -1;
    for (let ogr = 0; ogr <= 120; ogr++) {
        let g;
        try { g = NE.calculateWorkshopGroups(ogr, sinif); }
        catch (e) { bulgu("Md.22/1-ç", `${sinif}. sınıf ${ogr} öğrencide çöküyor`, e.message); continue; }
        const grup = (typeof g === "object" && g !== null) ? (g.groups ?? g.grup ?? g.value) : g;

        if (!sayiMi(grup)) { bulgu("Md.22/1-ç", `${sinif}/${ogr} -> sayı değil`, String(grup)); continue; }
        if (grup < 0) bulgu("Md.22/1-ç", `${sinif}. sınıf ${ogr} öğrenci -> NEGATİF grup`, String(grup));
        if (!Number.isInteger(grup)) bulgu("Md.22/1-ç", `${sinif}/${ogr} -> tam sayı değil`, String(grup));
        if (ogr > 0 && grup < 1)
            bulgu("Md.22/1-ç", `${sinif}. sınıf ${ogr} öğrenci -> grup SIFIR`,
                "öğrenci varken grup sayısı 1'den küçük olamaz");
        if (oncekiGrup >= 0 && grup < oncekiGrup)
            bulgu("Md.22/1-ç", "TEKDÜZELİK İHLALİ: öğrenci artarken grup azaldı",
                `${sinif}. sınıf: ${oncekiMevcut} öğr -> ${oncekiGrup} grup, ${ogr} öğr -> ${grup} grup`);
        oncekiGrup = grup; oncekiMevcut = ogr; gecti++;
    }
}
console.log(`   4 sınıf × 121 mevcut denendi`);

// =====================================================================
// 4. MESEM ÇIRAK GRUPLARI (Madde 22/2) — 0..1000
// =====================================================================
console.log("\n4. MESEM çırak grupları (Md. 22/2): 0-1000 çırak");
{
    let oncekiGrup = -1, oncekiCirak = -1;
    for (let c = 0; c <= 1000; c++) {
        let g;
        try { g = NE.calculateMesemApprenticeGroups(c); }
        catch (e) { bulgu("Md.22/2", `${c} çırakta çöküyor`, e.message); continue; }
        const grup = (typeof g === "object" && g !== null) ? (g.groups ?? g.grup ?? g.value) : g;
        if (!sayiMi(grup)) { bulgu("Md.22/2", `${c} çırak -> sayı değil`, String(grup)); continue; }
        if (grup < 0) bulgu("Md.22/2", `${c} çırak -> NEGATİF grup`, String(grup));
        if (!Number.isInteger(grup)) bulgu("Md.22/2", `${c} çırak -> tam sayı değil`, String(grup));
        if (oncekiGrup >= 0 && grup < oncekiGrup)
            bulgu("Md.22/2", "TEKDÜZELİK İHLALİ: çırak artarken grup azaldı",
                `${oncekiCirak} çırak -> ${oncekiGrup} grup, ${c} çırak -> ${grup} grup`);
        oncekiGrup = grup; oncekiCirak = c; gecti++;
    }
    console.log(`   1001 çırak değeri denendi`);
}

// =====================================================================
// 5. REHBER ÖĞRETMEN NORMU (Madde 21) — 0..5000 öğrenci, her okul türü
// =====================================================================
console.log("\n5. Rehber öğretmen normu (Md. 21): 0-5000 öğrenci × okul türleri");
{
    const turler = ["anadolu_lisesi", "meslek_lisesi", "ortaokul", "ilkokul",
                    "imam_hatip_lisesi", "ozel_egitim_okulu", "mesleki_egitim_merkezi"];
    for (const tur of turler) {
        let oncekiNorm = -1, oncekiOgr = -1;
        for (let ogr = 0; ogr <= 5000; ogr += 1) {
            let r;
            try { r = NE.calculateGuidanceCounselorNorm(tur, ogr, {}); }
            catch (e) { bulgu("Md.21", `${tur} ${ogr} öğrencide çöküyor`, e.message); break; }
            const norm = r && r.norm;
            if (!sayiMi(norm)) { bulgu("Md.21", `${tur}/${ogr} -> sayı değil`, String(norm)); break; }
            if (norm < 0) bulgu("Md.21", `${tur} ${ogr} öğrenci -> NEGATİF norm`, String(norm));
            if (!Number.isInteger(norm)) bulgu("Md.21", `${tur}/${ogr} -> tam sayı değil`, String(norm));
            if (oncekiNorm >= 0 && norm < oncekiNorm)
                bulgu("Md.21", "TEKDÜZELİK İHLALİ: öğrenci artarken rehber normu azaldı",
                    `${tur}: ${oncekiOgr} öğr -> ${oncekiNorm}, ${ogr} öğr -> ${norm}`);
            oncekiNorm = norm; oncekiOgr = ogr; gecti++;
        }
    }
    console.log(`   ${turler.length} okul türü × 5001 mevcut denendi`);
}

// =====================================================================
// 6. YÖNETİCİ NORMU (Madde 5-14) — 0..6000 öğrenci
// =====================================================================
console.log("\n6. Yönetici normu (Md. 5-14): 0-6000 öğrenci");
{
    let oncekiToplam = -1, oncekiOgr = -1;
    for (let ogr = 0; ogr <= 6000; ogr++) {
        let r;
        try { r = NE.calculateAdminNorms("anadolu_lisesi", ogr, {}); }
        catch (e) { bulgu("Md.5-14", `${ogr} öğrencide çöküyor`, e.message); break; }
        const t = r && r.toplamYonetici;
        if (!sayiMi(t)) { bulgu("Md.5-14", `${ogr} öğrenci -> sayı değil`, String(t)); break; }
        if (t < 0) bulgu("Md.5-14", `${ogr} öğrenci -> NEGATİF toplam`, String(t));
        if (!Number.isInteger(t)) bulgu("Md.5-14", `${ogr} öğrenci -> tam sayı değil`, String(t));
        if (oncekiToplam >= 0 && t < oncekiToplam)
            bulgu("Md.5-14", "TEKDÜZELİK İHLALİ: öğrenci artarken yönetici normu azaldı",
                `${oncekiOgr} öğr -> ${oncekiToplam}, ${ogr} öğr -> ${t}`);
        oncekiToplam = t; oncekiOgr = ogr; gecti++;
    }
    console.log(`   6001 mevcut denendi`);
}

// =====================================================================
// 7. BOZUK GİRDİ — çökmemeli
// =====================================================================
console.log("\n7. Bozuk girdi dayanıklılığı");
{
    const kotuler = [
        ["negatif", -5], ["ondalık", 27.5], ["metin", "otuz"], ["boş metin", ""],
        ["null", null], ["undefined", undefined], ["NaN", NaN],
        ["Infinity", Infinity], ["çok büyük", 1e9], ["nesne", {}], ["dizi", []],
        ["sayısal metin", "30"], ["boşluklu metin", " 30 "]
    ];
    const hedefler = [
        ["Md.18 genel norm", (v) => NE.calculateGeneralSubjectNorm(v)],
        ["Md.19 atölye norm", (v) => NE.calculateWorkshopLabNorm(v)],
        ["Md.22/1-ç grup", (v) => NE.calculateWorkshopGroups(v, "10")],
        ["Md.22/2 MESEM", (v) => NE.calculateMesemApprenticeGroups(v)],
        ["Md.21 rehber", (v) => NE.calculateGuidanceCounselorNorm("anadolu_lisesi", v, {})],
        ["Md.5-14 yönetici", (v) => NE.calculateAdminNorms("anadolu_lisesi", v, {})]
    ];
    for (const [hAd, fn] of hedefler) {
        for (const [gAd, deger] of kotuler) {
            let sonuc;
            try { sonuc = fn(deger); }
            catch (e) {
                bulgu("bozuk girdi", `${hAd} <- ${gAd} ÇÖKÜYOR`, e.message);
                continue;
            }
            const n = (sonuc && typeof sonuc === "object")
                ? (sonuc.normCount ?? sonuc.norm ?? sonuc.toplamYonetici)
                : sonuc;
            if (n !== undefined && n !== null && !sayiMi(n))
                bulgu("bozuk girdi", `${hAd} <- ${gAd} -> geçersiz sayı`, String(n));
            else if (sayiMi(n) && n < 0)
                bulgu("bozuk girdi", `${hAd} <- ${gAd} -> NEGATİF sonuç`, String(n));
            else gecti++;
        }
    }
    console.log(`   ${hedefler.length} işlev × ${kotuler.length} bozuk girdi denendi`);
}

// =====================================================================
// 8. SÜPÜRME GEÇERLİ Mİ?  (kurgu denetimi)
// =====================================================================
// Bir süpürme, işlev yanlış çağrıldığı için hep aynı değeri döndürüyorsa
// hiçbir şey denetlemez: "hep 0" da tekdüzedir, ihlal görünmez ve test
// sessizce geçer. Bu yüzden her işlevin girdiye GERÇEKTEN tepki verdiği
// ayrıca kanıtlanır.
//
// (Bu bölüm, ilk yazımda argüman sırasını ters verdiğim için eklendi:
//  calculateGuidanceCounselorNorm(schoolType, totalStudents) imzasına
//  (600, "anadolu_lisesi") diye çağırmıştım; motor 0 öğrenci sayıyor,
//  süpürme hep 0 döndürüyor ve "temiz" görünüyordu.)
console.log("\n8. Süpürme geçerlilik denetimi");
{
    const denemeler = [
        ["Md.18 genel norm",   v => NE.calculateGeneralSubjectNorm(v).normCount,            [0, 6, 42, 84, 400]],
        ["Md.19 atölye norm",  v => NE.calculateWorkshopLabNorm(v).normCount,               [0, 15, 200, 280, 500]],
        ["Md.22/1-ç grup",     v => NE.calculateWorkshopGroups(v, "10"),                    [0, 8, 24, 40, 80]],
        ["Md.22/2 MESEM",      v => NE.calculateMesemApprenticeGroups(v),                   [0, 10, 41, 81, 400]],
        ["Md.21 rehber",       v => NE.calculateGuidanceCounselorNorm("anadolu_lisesi", v, {}).norm,   [0, 150, 500, 1000, 2000]],
        ["Md.5-14 yönetici",   v => NE.calculateAdminNorms("anadolu_lisesi", v, {}).toplamYonetici,    [0, 300, 1000, 2000, 3000]]
    ];
    for (const [ad, fn, girdiler] of denemeler) {
        const sonuclar = girdiler.map(fn);
        const farkli = new Set(sonuclar).size;
        console.log(`   ${farkli > 1 ? "✓" : "✗"} ${ad.padEnd(20)} ${girdiler.join(",")} -> ${sonuclar.join(",")}`);
        if (farkli <= 1)
            bulgu("KURGU", `${ad}: girdi değişmesine rağmen sonuç sabit`,
                "süpürme geçersiz — işlev yanlış çağrılıyor olabilir");
        else gecti++;
    }
}

// =====================================================================
// 9. EŞİK NOKTALARI — yönetmelik metnine karşı
// =====================================================================
// Süpürme "norm hiç azalmıyor" der ama eşiğin DOĞRU YERDE olduğunu
// söylemez. Burada eşikler tam noktalarında sınanır.
// Kaynak: data/kaynak_cizelgeler/mevzuat/norm_kadro_yonetmeligi.json
//   Md. 21/2 : "... öğrenci sayısı X ve daha fazla olanların her birine 1"
//              -> X-1'de 0, X'te 1 olmalı
//   Md. 21/3 : "... 500 ve 500'ün katlarına ULAŞMASI hâlinde her defasında
//              ilave olarak 1" -> ilave sayısı floor(öğrenci / 500);
//              eşikten ARTAN öğrenci üzerinden DEĞİL.
console.log("\n9. Eşik noktaları (yönetmelik metnine karşı)");
{
    const reh = (t) => (v) => NE.calculateGuidanceCounselorNorm(t, v, {}).norm;
    const esikler = [
        ["Md.21/2-b ilkokul 300",          reh("ilkokul"), 300, 0, 1],
        ["Md.21/2-b ortaokul 150",         reh("ortaokul"), 150, 0, 1],
        ["Md.21/2-c ortaöğretim 150",      reh("anadolu_lisesi"), 150, 0, 1],
        ["Md.21/2-a özel eğitim 25",       reh("ozel_egitim_okulu"), 25, 0, 1],
        ["Md.21/2-f MESEM 200",            reh("mesleki_egitim_merkezi"), 200, 0, 1],
        ["Md.21/3 Anadolu 500'e ulaşma",   reh("anadolu_lisesi"), 500, 1, 2],
        ["Md.21/3 Anadolu 1000'e ulaşma",  reh("anadolu_lisesi"), 1000, 2, 3],
        ["Md.21/3 Anadolu 1500'e ulaşma",  reh("anadolu_lisesi"), 1500, 3, 4],
        ["Md.21/3 özel eğitim 100",        reh("ozel_egitim_okulu"), 100, 1, 2],
        ["Md.21/3 özel eğitim 200",        reh("ozel_egitim_okulu"), 200, 2, 3],
        ["Md.22/2 MESEM ilk grup 10",      v => NE.calculateMesemApprenticeGroups(v), 10, 0, 1],
        ["Md.22/2 MESEM ikinci grup 41",   v => NE.calculateMesemApprenticeGroups(v), 41, 1, 2],
        ["Md.22/2 MESEM üçüncü grup 81",   v => NE.calculateMesemApprenticeGroups(v), 81, 2, 3]
    ];
    for (const [ad, fn, nokta, altBek, ustBek] of esikler) {
        const alt = fn(nokta - 1), ust = fn(nokta);
        if (alt === altBek && ust === ustBek) { gecti++; continue; }
        bulgu("eşik", `${ad} yanlış yerde`,
            `${nokta - 1} -> ${alt} (beklenen ${altBek}), ${nokta} -> ${ust} (beklenen ${ustBek})`);
    }
    console.log(`   ${esikler.length} eşik tam noktasında sınandı`);
}

// =====================================================================
console.log("\n" + "=".repeat(76));
if (bulgular.length === 0) {
    console.log(`✅ SINIR DEĞERLER TEMİZ — ${gecti} kontrol, 0 bulgu`);
} else {
    // Aynı bulgunun binlerce tekrarını bastırma: türe göre grupla.
    const grup = new Map();
    for (const b of bulgular) {
        const anahtar = b.cephe + " | " + b.ad;
        if (!grup.has(anahtar)) grup.set(anahtar, { sayi: 0, ornek: b.ayrinti });
        grup.get(anahtar).sayi++;
    }
    console.log(`⚠️  ${bulgular.length} bulgu (${grup.size} farklı tür) · ${gecti} kontrol geçti`);
    console.log("=".repeat(76));
    for (const [anahtar, v] of grup) {
        console.log(`   • ${anahtar}${v.sayi > 1 ? `   [${v.sayi} kez]` : ""}`);
        if (v.ornek) console.log(`     ${v.ornek}`);
    }
}
console.log("=".repeat(76));
process.exit(bulgular.length === 0 ? 0 : 1);
