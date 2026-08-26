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

/* =========================================================================
 * MADDE 5 - 14 & 22 — YÖNETİCİ (İDARECİ) NORM KADROSU
 * ========================================================================= */
section("MADDE 9 & 10 — Temel müdür yardımcısı normu (ortaokul/lise)");

const adm = (ogr, opts = {}, tur = "anadolu_lisesi") => engine.calculateAdminNorms(tur, ogr, opts);

check("500 öğrenci -> 1 Mdr. Yrd. (Md. 10/1-a)", adm(500).mudurYardimcisiTotal, 1);
check("501 öğrenci -> 2 Mdr. Yrd. (Md. 10/1-b)", adm(501).mudurYardimcisiTotal, 2);
check("1000 öğrenci -> 2 Mdr. Yrd.", adm(1000).mudurYardimcisiTotal, 2);
check("1001 öğrenci -> 3 Mdr. Yrd. (Md. 10/1-c)", adm(1001).mudurYardimcisiTotal, 3);
check("1501 öğrenci -> 4 Mdr. Yrd. (Md. 10/1-ç)", adm(1501).mudurYardimcisiTotal, 4);
check("2001 öğrenci -> 5 Mdr. Yrd. (Md. 10/1-d)", adm(2001).mudurYardimcisiTotal, 5);
check("Bağımsız kurumda müdür normu 1 (Md. 5/1)", adm(500).mudur, 1);
check("Şart yoksa müdür başyardımcısı 0", adm(500).mudurBasyardimcisi, 0);
check("500 öğrenci -> toplam 2 yönetici", adm(500).toplamYonetici, 2);

section("MADDE 12 — MESEM müdür yardımcısı normu");

const admMesem = (c) => engine.calculateAdminNorms("mesleki_egitim_merkezi", c, {}).mudurYardimcisiTotal;
check("400 çırak -> 1 Mdr. Yrd. (Md. 12/1-a)", admMesem(400), 1);
check("401 çırak -> 2 Mdr. Yrd. (Md. 12/1-b)", admMesem(401), 2);
check("801 çırak -> 3 Mdr. Yrd. (Md. 12/1-c)", admMesem(801), 3);
check("1201 çırak -> 4 Mdr. Yrd. (Md. 12/1-ç)", admMesem(1201), 4);

section("MADDE 14 — İlave müdür yardımcısı normları ve tavan");

check("Pansiyon +1 ilave (Md. 14/1-a)", adm(500, { isPansiyonlu: true }).mudurYardimcisiTotal, 2);
// Md. 6 kuralı ünvan kaldırıldığı için varsayılan olarak KAPALI
// (normEngine.mudurBasyardimcisiUnvaniYururlukte = false).
// Kural silinmedi; bu yüzden testi de silinmiyor. Bayrak geçici açılıp
// kuralın hâlâ doğru işlediği doğrulanır, sonra tekrar kapatılır.
engine.mudurBasyardimcisiUnvaniYururlukte = true;
check("[bayrak AÇIK] Pansiyon -> 1 müdür başyardımcısı (Md. 6/1-a)",
      adm(500, { isPansiyonlu: true }).mudurBasyardimcisi, 1);
check("Döner sermaye +1 (Md. 14/1-b)", adm(500, { hasDonerSermaye: true }).mudurYardimcisiTotal, 2);
check("Taşıma merkezi +1 (Md. 14/1-e)", adm(500, { isTasimaMerkezi: true }).mudurYardimcisiTotal, 2);

const altiIlave = {
    isPansiyonlu: true, hasDonerSermaye: true, isTamGunTamYil: true,
    hasStajyer100Plus: true, hasSigortali500Plus: true, isTasimaMerkezi: true
};
check("1000 öğrenci + 6 ilave -> tavan 6 (Md. 14/2)", adm(1000, altiIlave).mudurYardimcisiTotal, 6);
check("1600 öğrenci + 6 ilave -> tavan 7 (Md. 14/2)", adm(1600, altiIlave).mudurYardimcisiTotal, 7);
check("[bayrak AÇIK] 6 Mdr. Yrd. -> 1 müdür başyardımcısı (Md. 6/1-b)",
      adm(1000, altiIlave).mudurBasyardimcisi, 1);
engine.mudurBasyardimcisiUnvaniYururlukte = false;

// Ünvan kapalıyken, Md. 6 şartları OLUŞSA BİLE norm üretilmemeli.
check("[bayrak KAPALI] Pansiyon -> başyardımcı normu 0",
      adm(500, { isPansiyonlu: true }).mudurBasyardimcisi, 0);
check("[bayrak KAPALI] 6 Mdr. Yrd. -> başyardımcı normu 0",
      adm(1000, altiIlave).mudurBasyardimcisi, 0);
check("[bayrak KAPALI] toplam yöneticiye başyardımcı eklenmiyor",
      adm(500, { isPansiyonlu: true }).toplamYonetici,
      adm(500, { isPansiyonlu: true }).mudur + adm(500, { isPansiyonlu: true }).mudurYardimcisiTotal);
check("[bayrak KAPALI] arayüz bayrağı false geliyor",
      adm(500).mudurBasyardimcisiAktif, false);

section("MADDE 5/3, 5/5, 6/2, 22/1-a, 22/7 — Müdür normu verilmeyen kurumlar");

const ayniBina = adm(1000, { isAyniBinadaKucuk: true });
check("Aynı binada küçük kurum -> müdür 0 (Md. 5/3)", ayniBina.mudur, 0);
check("Aynı binada küçük kurum -> mdr. yrd. 0 (Md. 22/1-a)", ayniBina.mudurYardimcisiTotal, 0);
check("Aynı binada küçük kurum -> başyrd. 0 (Md. 22/1-a)", ayniBina.mudurBasyardimcisi, 0);
check("Aynı binada küçük kurum -> toplam 0", ayniBina.toplamYonetici, 0);

const birlestirilmis = adm(60, { isBirlestirilmis: true });
check("Birleştirilmiş sınıf -> müdür 0 (Md. 5)", birlestirilmis.mudur, 0);
check("Birleştirilmiş sınıf -> toplam 0 (Md. 22/1-a)", birlestirilmis.toplamYonetici, 0);

const kampus = adm(1000, { isKampusIcinde: true });
check("Kampüs içi kurum -> müdür 0 (Md. 5/5)", kampus.mudur, 0);
check("Kampüs içi kurum -> müdür başyrd. 0 (Md. 6/2)", kampus.mudurBasyardimcisi, 0);
check("Kampüs içi kurum -> mdr. yrd. bağımsız: 2 + 1 (Md. 22/7 & 14/1-f)", kampus.mudurYardimcisiTotal, 3);
check("Kampüs içi kurum -> toplam 3", kampus.toplamYonetici, 3);

section("MADDE 22/1-b — Norma esas öğrenci sayısına ek sınıfların dâhil edilmesi");

const ekli = adm(450, { ekSinifOgrencileri: 60 });
check("450 + 60 ek -> norma esas 510", ekli.normaEsasOgrenciSayisi, 510);
check("450 + 60 ek -> 2 Mdr. Yrd. (500 eşiği aşıldı)", ekli.mudurYardimcisiTotal, 2);
check("Ek girilmezse norma esas = şube toplamı", adm(450).normaEsasOgrenciSayisi, 450);

section("Mevcut idareci karşılaştırması");

const kars = adm(1000, { mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 0, mudurYardimcisi: 1 } }).karsilastirma;
check("Müdür 1/1 -> tam", kars.mudur.durum, "tam");
check("Mdr. Yrd. norm 2, mevcut 1 -> ihtiyaç", kars.mudurYardimcisi.durum, "ihtiyac");
check("Mdr. Yrd. eksik 1", kars.mudurYardimcisi.fark, -1);
check("Toplam norm 3, mevcut 2 -> ihtiyaç etiketi", kars.toplam.etiket, "1 İhtiyaç");

const karsFazla = adm(500, { mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 1, mudurYardimcisi: 3 } }).karsilastirma;
check("Başyrd. norm 0, mevcut 1 -> fazla", karsFazla.mudurBasyardimcisi.durum, "fazla");
check("Mdr. Yrd. norm 1, mevcut 3 -> 2 Fazla", karsFazla.mudurYardimcisi.etiket, "2 Fazla");

/* =========================================================================
 * MADDE 22/6 — Yöneticilerin okuttuğu ders saatlerinin düşülmesi
 * ========================================================================= */
section("MADDE 22/6 — Yönetici ders saatinin branş yükünden düşülmesi");

const subelerAdm = [{
    id: "s9",
    subeAdi: "9-A",
    sinifSeviyesi: "9",
    ogrenciSayisi: 30,
    zorunluDersler: [{ ders: "MATEMATİK", saat: 40, atananBrans: "Matematik" }],
    secmeliDersler: []
}];

const resDusumsuz = engine.calculateSchoolNorms(subelerAdm, {}, "anadolu_lisesi");
const matDusumsuz = resDusumsuz.branchReport.find(b => b.branchName === "Matematik");
check("Düşüm yokken yük 40s", matDusumsuz.totalHours, 40);
check("Düşüm yokken norm 2 (Md. 18)", matDusumsuz.calculatedNorm, 2);

const resDusum = engine.calculateSchoolNorms(subelerAdm, {}, "anadolu_lisesi", {
    adminOptions: { yoneticiDersYukleri: { "Matematik": 10 } }
});
const matDusum = resDusum.branchReport.find(b => b.branchName === "Matematik");
check("10s yönetici dersi düşüldü -> yük 30s", matDusum.totalHours, 30);
check("Düşüm sonrası norm 1 (Md. 18)", matDusum.calculatedNorm, 1);
check("Düşülen saat raporlanıyor", matDusum.adminDeductedHours, 10);

const resAsim = engine.calculateSchoolNorms(subelerAdm, {}, "anadolu_lisesi", {
    adminOptions: { yoneticiDersYukleri: { "Matematik": 100 } }
});
const matAsim = resAsim.branchReport.find(b => b.branchName === "Matematik");
check("Branş yükünden fazla saat girilirse yük eksiye düşmez", matAsim.totalHours, 0);
check("Yükü sıfırlanan branş listede kalır", !!matAsim, true);
check("Sıfırlanan branşın normu 0", matAsim.calculatedNorm, 0);

/* =========================================================================
 * MADDE 21/2 ve 21/3 — Okul rehberlik servisi (rehber öğretmen) normu
 * 21/2-a özel eğitim 25 · 21/2-b ilkokul 300, ortaokul/anaokulu 150
 * 21/2-c ortaöğretim 150 · 21/2-ç yatılı/pansiyonlu şartsız 1
 * 21/2-d ilçenin en kalabalık kurumu şartsız 1 · 21/2-e MESEM 200
 * 21/3 ilave: özel eğitimde her 100, diğerlerinde her 500
 * ========================================================================= */
section("MADDE 21/2 — Rehber öğretmen ilk norm eşikleri");

const reh = (tur, ogr, opt = {}) => engine.calculateGuidanceCounselorNorm(tur, ogr, opt);

check("Ortaöğretim 149 öğrenci -> 0 norm", reh("anadolu_lisesi", 149).norm, 0);
check("Ortaöğretim 150 öğrenci -> 1 norm (Md. 21/2-c)", reh("anadolu_lisesi", 150).norm, 1);
check("Ortaöğretim eşiği 150", reh("anadolu_lisesi", 150).esik, 150);
check("Ortaöğretim dayanağı Md. 21/2-c", reh("anadolu_lisesi", 150).esikMadde, "Md. 21/2-c");
check("Fen lisesi de ortaöğretim eşiğinde", reh("fen_lisesi", 150).norm, 1);
check("MTAL de ortaöğretim eşiğinde (150, 100 değil)", reh("mesleki_ve_teknik_anadolu_lisesi", 150).esik, 150);
check("MTAL 149 öğrenci -> 0 norm", reh("mesleki_ve_teknik_anadolu_lisesi", 149).norm, 0);

check("Ortaokul 149 -> 0 norm", reh("ortaokul_temel_egitim", 149).norm, 0);
check("Ortaokul 150 -> 1 norm (Md. 21/2-b)", reh("ortaokul_temel_egitim", 150).norm, 1);
check("İmam hatip ortaokulu eşiği 150", reh("imam_hatip_ortaokulu", 150).esik, 150);
check("İmam hatip ortaokulu dayanağı Md. 21/2-b", reh("imam_hatip_ortaokulu", 150).esikMadde, "Md. 21/2-b");

check("Anaokulu eşiği 150", reh("anaokulu", 150).esik, 150);
check("İlkokul eşiği 300 (Md. 21/2-b)", reh("ilkokul", 300).esik, 300);
check("İlkokul 299 -> 0 norm", reh("ilkokul", 299).norm, 0);
check("İlkokul 300 -> 1 norm", reh("ilkokul", 300).norm, 1);

check("Özel eğitim eşiği 25 (Md. 21/2-a)", reh("ozel_egitim_uygulama_okulu", 25).esik, 25);
check("Özel eğitim 24 -> 0 norm", reh("ozel_egitim_uygulama_okulu", 24).norm, 0);
check("Özel eğitim 25 -> 1 norm", reh("ozel_egitim_uygulama_okulu", 25).norm, 1);
check("Özel eğitim MESLEK okulu MESEM sayılmaz, eşiği 25", reh("ozel_egitim_meslek_okulu", 25).esik, 25);
check("Özel eğitim meslek okulu dayanağı Md. 21/2-a", reh("ozel_egitim_meslek_okulu", 25).esikMadde, "Md. 21/2-a");

check("MESEM eşiği 200 (Md. 21/2-e)", reh("mesleki_egitim_merkezi", 200).esik, 200);
check("MESEM 199 çırak -> 0 norm", reh("mesleki_egitim_merkezi", 199).norm, 0);
check("MESEM 200 çırak -> 1 norm", reh("mesleki_egitim_merkezi", 200).norm, 1);
check("MESEM dayanağı Md. 21/2-e", reh("mesleki_egitim_merkezi", 200).esikMadde, "Md. 21/2-e");

section("MADDE 21/2-ç ve 21/2-d — Öğrenci sayısına bakılmayan hâller");

check("Pansiyonlu okul 10 öğrenci -> 1 norm (Md. 21/2-ç)", reh("anadolu_lisesi", 10, { isPansiyonlu: true }).norm, 1);
check("Pansiyonlu okul eşik altında da olsa ilk norm 1", reh("anadolu_lisesi", 10, { isPansiyonlu: true }).ilkNorm, 1);
check("İlçenin en kalabalık kurumu 100 öğrenci -> 1 norm (Md. 21/2-d)", reh("anadolu_lisesi", 100, { isIlceEnKalabalikKurum: true }).norm, 1);
check("İlçe kuralı işaretli değilse eşik altı -> 0 norm", reh("anadolu_lisesi", 100).norm, 0);

section("MADDE 21/3 — İlave normlar (özel eğitimde 100, diğerlerinde 500)");

check("Ortaöğretim aralığı 500", reh("anadolu_lisesi", 500).aralik, 500);
check("Ortaöğretim 499 -> 1 norm", reh("anadolu_lisesi", 499).norm, 1);
check("Ortaöğretim 500 -> 2 norm", reh("anadolu_lisesi", 500).norm, 2);
check("Ortaöğretim 999 -> 2 norm", reh("anadolu_lisesi", 999).norm, 2);
check("Ortaöğretim 1000 -> 3 norm", reh("anadolu_lisesi", 1000).norm, 3);
check("1000 öğrencide ilk norm 1", reh("anadolu_lisesi", 1000).ilkNorm, 1);
check("1000 öğrencide ilave norm 2", reh("anadolu_lisesi", 1000).ilaveNorm, 2);
check("Özel eğitim aralığı 100", reh("ozel_egitim_uygulama_okulu", 100).aralik, 100);
check("Özel eğitim 99 -> 1 norm", reh("ozel_egitim_uygulama_okulu", 99).norm, 1);
check("Özel eğitim 100 -> 2 norm", reh("ozel_egitim_uygulama_okulu", 100).norm, 2);
check("Özel eğitim 200 -> 3 norm", reh("ozel_egitim_uygulama_okulu", 200).norm, 3);
check("Eşik altındaysa ilave norm da yok", reh("anadolu_lisesi", 149).ilaveNorm, 0);
check("Pansiyonlu 600 öğrenci -> 1 + 1 = 2 norm", reh("anadolu_lisesi", 600, { isPansiyonlu: true }).norm, 2);

section("Rehber öğretmen — mevcut karşılaştırması ve Md. 21/4 uyarısı");

check("Norm 2, mevcut 1 -> ihtiyaç", reh("anadolu_lisesi", 500, { mevcutRehberOgretmeni: 1 }).karsilastirma.durum, "ihtiyac");
check("Norm 2, mevcut 1 -> '1 İhtiyaç'", reh("anadolu_lisesi", 500, { mevcutRehberOgretmeni: 1 }).karsilastirma.etiket, "1 İhtiyaç");
check("Norm 2, mevcut 2 -> Tam", reh("anadolu_lisesi", 500, { mevcutRehberOgretmeni: 2 }).karsilastirma.etiket, "Tam");
check("Norm 2, mevcut 3 -> '1 Fazla'", reh("anadolu_lisesi", 500, { mevcutRehberOgretmeni: 3 }).karsilastirma.etiket, "1 Fazla");
check("Mevcut girilmezse 0 kabul edilir", reh("anadolu_lisesi", 500).karsilastirma.mevcut, 0);
check("Norma esas öğrenci sayısı raporlanıyor", reh("anadolu_lisesi", 500).normaEsasOgrenciSayisi, 500);
check("Norm 2 olduğunda Md. 21/4 atama kısıtı açıklaması eklenir",
    reh("anadolu_lisesi", 500).explanations.some(e => e.includes("21/4")), true);
check("Norm 1 iken Md. 21/4 kısıtı eklenmez",
    reh("anadolu_lisesi", 200).explanations.some(e => e.includes("21/4")), false);
check("Özel eğitimde Md. 21/4 kısıtı eklenmez",
    reh("ozel_egitim_uygulama_okulu", 200).explanations.some(e => e.includes("21/4")), false);

section("Rehber öğretmen normu ana hesaba bağlı mı?");

const subelerReh = [{
    id: "r9", subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 600,
    zorunluDersler: [{ ders: "MATEMATİK", saat: 6, atananBrans: "Matematik" }],
    secmeliDersler: []
}];
const resReh = engine.calculateSchoolNorms(subelerReh, {}, "anadolu_lisesi", {
    adminOptions: { mevcutRehberOgretmeni: 1 }
});
check("calculateSchoolNorms guidanceNorms döndürüyor", !!resReh.guidanceNorms, true);
check("600 öğrencili lise -> 2 rehber öğretmen normu", resReh.guidanceNorms.norm, 2);
check("Mevcut rehber öğretmen ana hesaba geçiyor", resReh.guidanceNorms.karsilastirma.mevcut, 1);
check("Rehberlik branş raporunda YER ALMAZ (ders yükü normu değil)",
    resReh.branchReport.some(b => String(b.branchName).includes("Rehberlik")), false);

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
