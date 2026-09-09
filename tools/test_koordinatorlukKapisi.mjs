/* ===========================================================================
   NormMatik™ — Koordinatörlük kapısı testi
   ===========================================================================
   NEDEN VAR (müşteri bildirimi, 09.09.2026)
   -----------------------------------------
   Ortaokulda üst çubukta "🏢 Kadro & Koordinatörlük" yazıyordu. Anadolu
   Lisesi'nde yazmıyordu. Aradaki fark özel eğitim şubesiydi:

     eOkulImporter.js  ->  alanId = "ozel_egitim"   (SAHTE alan kimliği)
     dört ayrı yerde   ->  subeler.some(s => s.alanId)  ==> "mesleki kurum"

   İşletmelerde meslek eğitimi (koordinatörlük) ortaokulda YOKTUR. Etiketin
   yanlış çıkması yüzeydeki belirtiydi; asıl risk şuydu: aynı kural
   normEngine'de koordinatörlük saatlerinin norma EKLENMESİNİ, uiComponents'te
   de o saatin kullanıcıya SORULMASINI açıyordu. Ortaokulda oraya girilecek
   her saat, ilgili branşın normunu haksız yere büyütürdü.

   Bu test iki şeyi birden tutar:
     (1) kararın kendisi (isMeslekiKurum) doğru mu,
     (2) karar gerçekten TEK yerden mi veriliyor — dört kopya geri gelirse
         kaynak taraması bunu yakalar.

   Çalıştırma:  node tools/test_koordinatorlukKapisi.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import { NormEngine } from "../js/normEngine.js";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const engine = new NormEngine();

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const sube = (alanId) => ({ id: "s", subeAdi: "5-A", alanId });

/* ---- 1) HATANIN KENDİSİ: özel eğitimli ortaokul mesleki DEĞİLDİR ------ */
// Müşterinin ekranındaki durum: ortaokul + e-Okul'dan gelen özel eğitim şubesi.
kontrol("ortaokul + özel eğitim şubesi -> mesleki DEĞİL",
    engine.isMeslekiKurum("ortaokul",
        [sube(null), sube("ozel_egitim"), sube(null)]) === false,
    "düzeltmeden önce true dönüyordu");

kontrol("ilkokul + özel eğitim şubesi -> mesleki DEĞİL",
    engine.isMeslekiKurum("ilkokul", [sube("ozel_egitim")]) === false);

kontrol("anadolu lisesi + özel eğitim şubesi -> mesleki DEĞİL",
    engine.isMeslekiKurum("anadolu_lisesi", [sube("ozel_egitim")]) === false);

/* ---- 2) DOĞRU DAVRANIŞ KORUNDU MU? ----------------------------------- */
// Bunlar mesleki SAYILMAYA DEVAM ETMELİ; düzeltme fazla kesmiş olmamalı.
for (const [tur, ad] of [
    ["mesleki_ve_teknik_anadolu_lisesi", "MTAL"],
    ["mesleki_egitim_merkezi", "MESEM"],
    ["mtegm_ozel_program", "MTEGM özel program"],
    ["ozel_egitim_meslek_okulu", "Özel Eğitim Meslek Okulu"],
]) {
    kontrol(`${ad} -> mesleki`, engine.isMeslekiKurum(tur, []) === true, tur);
}

// Gerçek alan kimliği taşıyan şube okulu mesleki yapar (okul türü boş olsa da).
kontrol("gerçek alanlı şube (bilisim) -> mesleki",
    engine.isMeslekiKurum("", [sube("bilisim")]) === true);
kontrol("gerçek alanlı şube (elektrik) -> mesleki",
    engine.isMeslekiKurum("anadolu_lisesi", [sube("elektrik")]) === true);

// Karışık: hem özel eğitim hem gerçek alan varsa mesleki kalmalı.
kontrol("özel eğitim + gerçek alan bir arada -> mesleki",
    engine.isMeslekiKurum("", [sube("ozel_egitim"), sube("bilisim")]) === true);

/* ---- 3) SINIR DURUMLARI ---------------------------------------------- */
kontrol("şube listesi boş -> mesleki değil",
    engine.isMeslekiKurum("ortaokul", []) === false);
kontrol("şube listesi undefined -> patlamaz, mesleki değil",
    engine.isMeslekiKurum("ortaokul", undefined) === false);
kontrol("okul türü null -> patlamaz, mesleki değil",
    engine.isMeslekiKurum(null, [sube(null)]) === false);
kontrol("alanId boş dizi elemanı -> patlamaz",
    engine.isMeslekiKurum("ortaokul", [null, undefined, sube("")]) === false);

/* ---- 4) KARAR TEK YERDE Mİ? ------------------------------------------ */
// Dört kopyanın geri gelmesini engelleyen kapı. Yorum satırları sayılmaz;
// düzeltmenin gerekçesi normEngine.js'te eski kalıbı ALINTILAYARAK anlatıyor.
const kodSatirlari = (yol) =>
    fs.readFileSync(path.join(KOK, yol), "utf8").split(/\r?\n/)
        .map((s, i) => [i + 1, s.trim()])
        .filter(([, s]) => !(s.startsWith("*") || s.startsWith("//") || s.startsWith("/*")));

for (const yol of ["js/app.js", "js/uiComponents.js", "js/normEngine.js"]) {
    const suclu = kodSatirlari(yol).filter(([, s]) => s.includes("some(s => s.alanId)"));
    kontrol(`${yol}: elle yazılmış "mesleki mi" kuralı kalmamış`,
        suclu.length === 0, suclu.map(([n]) => "satır " + n).join(", "));
}

// Ve karar gerçekten motordan soruluyor mu?
for (const [yol, adet] of [["js/app.js", 2], ["js/uiComponents.js", 1]]) {
    const s = fs.readFileSync(path.join(KOK, yol), "utf8");
    const n = (s.match(/normEngine\.isMeslekiKurum\(/g) || []).length;
    kontrol(`${yol}: ${adet} yerde motora soruluyor`, n === adet, `${n} bulundu`);
}

/* ---- SONUÇ ----------------------------------------------------------- */
if (hatalar.length) {
    console.log(`\n❌ ${hatalar.length} KONTROL BAŞARISIZ (${gecen} geçti)\n`);
    hatalar.forEach((h) => console.log("   • " + h));
    process.exit(1);
}
console.log(`\n✅ Koordinatörlük kapısı: ${gecen} kontrolün tamamı geçti.`);
console.log("   Özel eğitim şubesi artık okulu mesleki kurum yapmıyor.");
