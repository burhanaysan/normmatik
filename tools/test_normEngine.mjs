/**
 * NormMatik™ — Norm Motoru Mevzuat Uygunluk Testi
 * ---------------------------------------------------------------------------
 * Bu test, normEngine.js'in MEB Norm Kadro Yönetmeliği'ne uygun hesap yapıp
 * yapmadığını doğrular. Beklenen değerler DOĞRUDAN yönetmelik metninden
 * türetilmiştir; motorun mevcut davranışından değil.
 *
 * ÇALIŞTIRMA:
 *     node tools/test_normEngine.mjs
 *
 * Kural değiştirdiğinizde (normRulesConfig.js) bu testi mutlaka çalıştırın.
 * ---------------------------------------------------------------------------
 */

import { NormEngine } from '../js/normEngine.js';

const engine = new NormEngine();

let passed = 0;
let failed = 0;
const failures = [];

function check(label, actual, expected) {
    const ok = actual === expected;
    if (ok) {
        passed++;
    } else {
        failed++;
        failures.push(`  ✗ ${label}\n      beklenen: ${expected}   bulunan: ${actual}`);
    }
}

function section(title) {
    console.log(`\n── ${title}`);
}

/* =========================================================================
 * MADDE 18/1 — Genel bilgi ve meslek dersleri öğretmeni normu
 * "6-31 saate kadar 1, 31-42 saate kadar 2, 42'den fazla her 21 saat için 1,
 *  artan ders yükü en az 15 saat ise ilave 1"
 * ========================================================================= */
section("MADDE 18/1 — Genel bilgi ve meslek dersleri normu");

const md18 = (h) => engine.calculateGeneralSubjectNorm(h).normCount;

check("0 saat  -> 0 norm", md18(0), 0);
check("5 saat  -> 0 norm (6 saat barajı altı)", md18(5), 0);
check("6 saat  -> 1 norm (baraj)", md18(6), 1);
check("30 saat -> 1 norm (kademe sonu)", md18(30), 1);
check("31 saat -> 2 norm (kademe başı)", md18(31), 2);
check("42 saat -> 2 norm (kademe sonu)", md18(42), 2);
check("43 saat -> 2 norm (taşma, artan 1s)", md18(43), 2);
check("56 saat -> 2 norm (artan 14s, 15 altı)", md18(56), 2);
check("57 saat -> 3 norm (artan 15s ➔ ilave norm)", md18(57), 3);
check("63 saat -> 3 norm (artan tam 21s)", md18(63), 3);
check("78 saat -> 4 norm (21 + artan 15s)", md18(78), 4);
check("84 saat -> 4 norm (artan tam 42s)", md18(84), 4);

/* =========================================================================
 * MADDE 19/1 — Atölye ve laboratuvar öğretmeni normu
 * "15-41'e kadar 1, 41-81'e kadar 2, 81-121'e kadar 3, 121-161'e kadar 4,
 *  161-201'e kadar 5, 201'den fazla her 40 saat için 1,
 *  artan ders yükü en az 20 saat ise ilave 1"
 * ========================================================================= */
section("MADDE 19/1 — Atölye ve laboratuvar normu");

const md19 = (h) => engine.calculateWorkshopLabNorm(h).normCount;

check("14 saat  -> 0 norm (15 barajı altı)", md19(14), 0);
check("15 saat  -> 1 norm (baraj)", md19(15), 1);
check("40 saat  -> 1 norm (kademe sonu)", md19(40), 1);
check("41 saat  -> 2 norm", md19(41), 2);
check("80 saat  -> 2 norm", md19(80), 2);
check("81 saat  -> 3 norm", md19(81), 3);
check("120 saat -> 3 norm", md19(120), 3);
check("121 saat -> 4 norm", md19(121), 4);
check("160 saat -> 4 norm", md19(160), 4);
check("161 saat -> 5 norm", md19(161), 5);
check("200 saat -> 5 norm (kademe sonu)", md19(200), 5);
check("201 saat -> 5 norm (taşma başı, süreklilik)", md19(201), 5);
check("219 saat -> 5 norm (artan 19s, 20 altı)", md19(219), 5);
check("220 saat -> 6 norm (artan 20s ➔ ilave norm)", md19(220), 6);
check("240 saat -> 6 norm (artan tam 40s)", md19(240), 6);
check("260 saat -> 7 norm (40 + artan 20s)", md19(260), 7);
check("280 saat -> 7 norm (artan tam 80s)", md19(280), 7);

/* =========================================================================
 * REGRESYON — Madde 18'in atölye yüküne uygulanması hatası
 * Eski motor tüm yükü Madde 18 ile hesaplıyordu. Madde 19 sonucunun
 * Madde 18 sonucundan KÜÇÜK olduğunu doğrularız (norm şişmesi giderildi).
 * ========================================================================= */
section("REGRESYON — Atölye yükü artık Madde 18 ile hesaplanmıyor");

for (const h of [40, 60, 100, 120, 200, 300]) {
    const eski = md18(h);
    const yeni = md19(h);
    const ok = yeni < eski;
    if (ok) passed++; else { failed++; failures.push(`  ✗ ${h} saat atölye: Md19(${yeni}) < Md18(${eski}) olmalıydı`); }
    console.log(`     ${String(h).padStart(3)} saat atölye:  eski(Md18)=${eski}  ➔  yeni(Md19)=${yeni}   [${eski - yeni} norm şişmesi giderildi]`);
}

/* =========================================================================
 * MADDE 22/1-ç — Atölye grup bölünmesi (SINIF SEVİYESİNE GÖRE)
 * 9. sınıf   : 10-21'e kadar 1, 21-31'e kadar 2, 31'den fazla 3
 * 10/11/12.  :  8-17'ye kadar 1, 17-25'e kadar 2, 25-33'e kadar 3, 33+ 4
 * ========================================================================= */
section("MADDE 22/1-ç — Grup bölünmesi (9. sınıf)");

const grp = (n, g, k = 0) => engine.calculateWorkshopGroups(n, g, k);

check("9. sınıf /  9 öğrenci -> 1 grup (baraj altı)", grp(9, "9"), 1);
check("9. sınıf / 10 öğrenci -> 1 grup", grp(10, "9"), 1);
check("9. sınıf / 20 öğrenci -> 1 grup", grp(20, "9"), 1);
check("9. sınıf / 21 öğrenci -> 2 grup", grp(21, "9"), 2);
check("9. sınıf / 30 öğrenci -> 2 grup", grp(30, "9"), 2);
check("9. sınıf / 31 öğrenci -> 3 grup", grp(31, "9"), 3);
check("9. sınıf / 45 öğrenci -> 3 grup (9. sınıf TAVANI)", grp(45, "9"), 3);

section("MADDE 22/1-ç — Grup bölünmesi (10/11/12. sınıf)");

check("10. sınıf /  7 öğrenci -> 1 grup (baraj altı)", grp(7, "10"), 1);
check("10. sınıf /  8 öğrenci -> 1 grup", grp(8, "10"), 1);
check("10. sınıf / 16 öğrenci -> 1 grup", grp(16, "10"), 1);
check("10. sınıf / 17 öğrenci -> 2 grup", grp(17, "10"), 2);
check("10. sınıf / 20 öğrenci -> 2 grup  [eski motor 1 diyordu]", grp(20, "10"), 2);
check("10. sınıf / 24 öğrenci -> 2 grup", grp(24, "10"), 2);
check("10. sınıf / 25 öğrenci -> 3 grup", grp(25, "10"), 3);
check("11. sınıf / 26 öğrenci -> 3 grup  [eski motor 2 diyordu]", grp(26, "11"), 3);
check("11. sınıf / 32 öğrenci -> 3 grup", grp(32, "11"), 3);
check("12. sınıf / 33 öğrenci -> 4 grup", grp(33, "12"), 4);
check("12. sınıf / 34 öğrenci -> 4 grup  [eski motor 3 diyordu]", grp(34, "12"), 4);
check("12. sınıf / 60 öğrenci -> 4 grup (kaynaştırmasız TAVAN)", grp(60, "12"), 4);

section("MADDE 22/1-ç kapanış — Kaynaştırma hükmü");

check("10. sınıf / 20 öğr. / 1 kaynaştırma -> 2 grup (2 altı, bölünme yok)", grp(20, "10", 1), 2);
check("10. sınıf / 20 öğr. / 2 kaynaştırma -> 3 grup (1 grup ikiye bölünür)", grp(20, "10", 2), 3);
check("10. sınıf / 20 öğr. / 4 kaynaştırma -> 4 grup (2 grup bölünür)", grp(20, "10", 4), 4);
check("12. sınıf / 40 öğr. / 8 kaynaştırma -> 5 grup (MUTLAK TAVAN 5)", grp(40, "12", 8), 5);
check("9. sınıf  / 45 öğr. / 6 kaynaştırma -> 5 grup (MUTLAK TAVAN 5)", grp(45, "9", 6), 5);

/* =========================================================================
 * MADDE 22/2 — MESEM çırak grupları (regresyon: davranış değişmemeli)
 * ========================================================================= */
section("MADDE 22/2 — MESEM çırak grupları (regresyon)");

const mesem = (n) => engine.calculateMesemApprenticeGroups(n);

check("  9 çırak -> 0 grup", mesem(9), 0);
check(" 10 çırak -> 1 grup", mesem(10), 1);
check(" 40 çırak -> 1 grup", mesem(40), 1);
check(" 41 çırak -> 2 grup", mesem(41), 2);
check(" 80 çırak -> 2 grup", mesem(80), 2);
check(" 81 çırak -> 3 grup", mesem(81), 3);
check("120 çırak -> 3 grup", mesem(120), 3);
check("200 çırak -> 5 grup", mesem(200), 5);
check("440 çırak -> 11 grup", mesem(440), 11);
check("441 çırak -> 12 grup (tavan)", mesem(441), 12);
check("999 çırak -> 12 grup (tavan aşılamaz)", mesem(999), 12);

/* =========================================================================
 * BİRLEŞİK — calculateBranchNorm yük ayrımı
 * ========================================================================= */
section("BİRLEŞİK — Branş normu (Madde 18 + Madde 19 toplamı)");

const b1 = engine.calculateBranchNorm(150, "meslek", "Makine Teknolojisi", { genel: 30, atolye: 120 });
check("30s genel + 120s atölye -> genel 1 norm", b1.generalNorm, 1);
check("30s genel + 120s atölye -> atölye 3 norm", b1.workshopNorm, 3);
check("30s genel + 120s atölye -> toplam 4 norm", b1.normCount, 4);

const b2 = engine.calculateBranchNorm(150, "meslek", "Makine Teknolojisi");
check("yük ayrımı verilmezse eski davranış (hepsi Md.18)", b2.normCount, md18(150));

const b3 = engine.calculateBranchNorm(20, "meslek", "X", { genel: 10, atolye: 10 });
check("10s genel + 10s atölye -> 1 norm (atölye 15 barajı altı)", b3.normCount, 1);

/* =========================================================================
 * ENTEGRASYON — calculateSchoolNorms uçtan uca
 * ========================================================================= */
section("ENTEGRASYON — Okul geneli hesap");

const subeler = [{
    id: "s1",
    subeAdi: "10-A Makine",
    sinifSeviyesi: "10",
    ogrenciSayisi: 20,          // 10. sınıf 20 öğrenci -> 2 grup olmalı
    alanId: "makine",
    zorunluDersler: [
        { ders: "MATEMATİK", saat: 4, atananBrans: "Matematik" },
        { ders: "BİLGİSAYARLI TASARIM ATÖLYESİ", saat: 10, atananBrans: "Makine Teknolojisi", isAtolye: true }
    ],
    secmeliDersler: []
}];

const res = engine.calculateSchoolNorms(subeler, {}, "meslek_teknik");
const mat = res.branchReport.find(b => b.branchName === "Matematik");
const mak = res.branchReport.find(b => b.branchName === "Makine Teknolojisi");

check("Matematik yükü 4s (grup bölünmez)", mat.totalHours, 4);
check("Matematik yükü GENEL kovasında", mat.generalHours, 4);
check("Matematik atölye yükü 0", mat.workshopHours, 0);
check("Atölye dersi 2 gruba bölündü ➔ 20s yük", mak.totalHours, 20);
check("Atölye yükü ATÖLYE kovasında", mak.workshopHours, 20);
check("Atölye yükü Md.18'e sızmadı", mak.generalHours, 0);
check("20s atölye -> 1 norm (Md.19: 15-40 ➔ 1)", mak.calculatedNorm, 1);

/* ===================================================================== */
console.log("\n" + "=".repeat(70));
if (failed === 0) {
    console.log(`✅ TÜM TESTLER GEÇTİ  —  ${passed} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${failed} TEST BAŞARISIZ  (${passed} başarılı)\n`);
    console.log(failures.join("\n"));
}
console.log("=".repeat(70) + "\n");

process.exit(failed === 0 ? 0 : 1);
