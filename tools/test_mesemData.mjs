/*
 * MESEM MÜFREDAT VERİSİ DOĞRULAMA TESTİ
 * =====================================
 * Hedef dosya : js/mesem_curriculum_db.js
 * Üreten      : tools/rebuild_mesem_db.py
 * Kaynak      : 40 resmî MESEM çerçeve program PDF'i
 *
 * Bu test ÜRETİLEN VERİYİ denetler (motoru değil). Kontroller, bu veriyi
 * kurarken gerçekten karşılaşılan hataların geri gelmesini engeller:
 *
 *   M1  Kategori beyaz listede olmalı ve her çizelgede EN AZ BİR "MESLEK"
 *       kategorili ders bulunmalı.
 *       NEDEN: curriculumEngine isAtolye kararını `kategori.includes("MESLEK")`
 *       ile verir. MESEM kaynak kategorileri "TEMEL DERSLER" / "ALAN/DAL
 *       DERSLERİ"dir; ikisi de "MESLEK" içermez. Dönüşüm bozulursa 32 saatlik
 *       İşletmelerde Mesleki Eğitim atölye dışına düşer ve Madde 18/19
 *       kovaları yanlış dolar.
 *   M2  Her çizelgede "İşletmelerde Mesleki Eğitim" TAM OLARAK BİR KEZ ve
 *       32 saat olmalı.
 *       NEDEN: MESEM'de bu ders dört sınıfta da 32 saattir ve çizelgenin
 *       TOPLAM DERS SAATİ satırına DAHİLDİR (MTEGM'de ise toplamın dışındadır).
 *       Saat düşerse Madde 22/2 çırak grubu hesabı sessizce küçülür.
 *   M3  Başlığın ilk parantezi DAL adı olmalı ("... DALI" ile biter).
 *       NEDEN: hem curriculumEngine hem database.js dal adını oradan okur.
 *   M4  Haftalık toplam (dersler + seçmeli) çizelgenin kendi TOPLAM DERS
 *       SAATİ satırına EŞİT olmalı.
 *       NEDEN: PDF'in kendi kontrol toplamı. Tutmuyorsa bir sütun kaymıştır.
 *   M5  Ders adları makul olmalı: boş değil, "TOPLAM" satırı sızmamış,
 *       aynı çizelgede tekrar etmiyor.
 *   M6  Alan gövdesi eksiksiz: brans, dallar, dört sınıf.
 *   M7  fark_saati (parantezli saat) toplama GİRMEMELİ.
 *       NEDEN: parantez içi, diploma programını seçen öğrenciler için fark
 *       dersi saatidir (çerçeve program, Uygulama Açıklamaları md. 10) ve
 *       çizelgenin kendi TOPLAM satırı onu saymaz.
 *   M8  Uydurma ders adları geri gelmemeli.
 *       NEDEN: 2026-08-24 öncesinde curriculumEngine içinde elle yazılmış
 *       "... Meslek Teknolojisi", "... Ustalık Eğitimi ve Ahilik" gibi
 *       MEB programında bulunmayan dersler vardı.
 *
 * Çalıştırma: node tools/test_mesemData.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "js", "mesem_curriculum_db.js");

function loadDb() {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const marker = "MESEM_CURRICULUM_DB = ";
    const i = raw.indexOf(marker);
    if (i === -1) throw new Error("Dosyada MESEM_CURRICULUM_DB bulunamadı: " + DB_PATH);
    let body = raw.slice(i + marker.length).trim();
    if (body.endsWith(";")) body = body.slice(0, -1);
    return JSON.parse(body);
}

let hata = 0;
let kontrol = 0;
const hataOrnek = [];
const uyari = [];

function assert(kosul, mesaj) {
    kontrol++;
    if (!kosul) {
        hata++;
        if (hataOrnek.length < 40) hataOrnek.push(mesaj);
    }
}
function warn(m) { if (uyari.length < 40) uyari.push(m); }

function norm(s) {
    return (s || "")
        .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
        .replace(/Ş/g, "s").replace(/ş/g, "s")
        .replace(/Ğ/g, "g").replace(/ğ/g, "g")
        .replace(/Ü/g, "u").replace(/ü/g, "u")
        .replace(/Ö/g, "o").replace(/ö/g, "o")
        .replace(/Ç/g, "c").replace(/ç/g, "c")
        .replace(/Â/g, "a").replace(/â/g, "a")
        .toLowerCase().trim();
}

// curriculumEngine isAtolye'yi kategoriden okuduğu için kategori serbest
// metin OLAMAZ. Yeni bir kategori eklenirse burada da bildirilmelidir.
const GECERLI_KATEGORI = new Set([
    "ORTAK DERSLER",                // temel dersler -> genel yük (Madde 18)
    "ALAN VE DAL MESLEK DERSLERİ",  // alan/dal + işletme -> atölye (Madde 19)
    "SEÇMELİ DERSLER",
]);

// Eski, uydurma ders adları (2026-08-24'te kaldırıldı). Geri gelirlerse veri
// yeniden elle yazılmış demektir.
const UYDURMA = [
    "meslek teknolojisi",
    "ustalik egitimi ve ahilik",
    "ileri uygulamalari",
    "temel meslek ve isg",
];

const DB = loadDb();
const alanlar = Object.keys(DB);

console.log("MESEM MÜFREDAT VERİSİ DOĞRULAMA TESTİ");
console.log("=".repeat(70));
console.log(`Dosya : js/mesem_curriculum_db.js`);
console.log(`Alan  : ${alanlar.length}`);

assert(alanlar.length >= 36, `M6: Alan sayısı beklenenden az (${alanlar.length}) — veri kaybı olabilir`);

let toplamCizelge = 0, toplamDers = 0, toplamDal = 0;
const kategoriSayac = {};
const kaynakDosyalar = new Set();

for (const alan of alanlar) {
    const a = DB[alan];

    // ---- M6 alan gövdesi
    assert(a && typeof a === "object", `M6: ${alan} -> alan gövdesi nesne değil`);
    assert(typeof a.brans === "string" && a.brans.length > 2,
        `M6: ${alan} -> brans eksik (öğretmen ataması yapılamaz)`);
    assert(Array.isArray(a.dallar) && a.dallar.length > 0,
        `M6: ${alan} -> dal listesi boş`);
    assert(a.siniflar && typeof a.siniflar === "object",
        `M6: ${alan} -> siniflar yok`);
    (a.kaynak || []).forEach(k => kaynakDosyalar.add(k));
    toplamDal += (a.dallar || []).length;

    const siniflar = Object.keys(a.siniflar || {});
    assert(siniflar.length === 4,
        `M6: ${alan} -> ${siniflar.length} sınıf var, 4 olmalı (${siniflar.join(",")})`);

    for (const gStr of siniflar) {
        assert(["9", "10", "11", "12"].includes(gStr),
            `M6: ${alan} -> beklenmeyen sınıf anahtarı "${gStr}"`);
        const liste = a.siniflar[gStr];
        assert(Array.isArray(liste) && liste.length > 0,
            `M6: ${alan}/${gStr} -> çizelge listesi boş`);
        if (!Array.isArray(liste)) continue;

        // aynı sınıfta aynı dal iki kez listelenmemeli (üretici tekilleştirir)
        const dalGorulen = new Set();

        for (const rec of liste) {
            toplamCizelge++;

            assert(typeof rec.title === "string" && rec.title.length > 10,
                `M3: ${alan}/${gStr} -> title eksik/kısa`);
            assert(String(rec.grade) === gStr,
                `M6: ${alan}/${gStr} -> rec.grade (${rec.grade}) anahtarla uyuşmuyor`);
            assert(Array.isArray(rec.courses) && rec.courses.length >= 3,
                `M6: ${alan}/${gStr} -> ders sayısı çok az: "${rec.title}"`);
            if (!Array.isArray(rec.courses)) continue;

            // ---- M3 dal parantezi. "HAFTALIK" sözcüğünden önceki parantezin
            // TAMAMI alınır; bazı dal adlarında iç parantez vardır
            // ("TEKSTİL BİTİM İŞLEMLERİ (APRE) DALI"). Yedek olarak ilk
            // parantez denenir ki bozuk başlık sessizce geçmesin.
            const m = String(rec.title).match(/\((.+)\)\s*HAFTALIK/) ||
                      String(rec.title).match(/\(([^)]+)\)/);
            assert(m !== null,
                `M3: ${alan}/${gStr} -> başlıkta dal parantezi yok: "${rec.title}"`);
            if (m) {
                assert(norm(m[1]).endsWith("dali"),
                    `M3: ${alan}/${gStr} -> ilk parantez DAL değil ("${m[1]}")`);
                const anahtar = norm(m[1]);
                assert(!dalGorulen.has(anahtar),
                    `M6: ${alan}/${gStr} -> "${m[1]}" aynı sınıfta iki kez listelenmiş`);
                dalGorulen.add(anahtar);
            }

            let toplamSaat = 0;
            let meslekSaat = 0;
            let isletmeSayisi = 0;
            let isletmeSaat = 0;
            const adGorulen = new Set();

            for (const c of rec.courses) {
                toplamDers++;
                const cn = norm(c.ders);

                // ---- M5 ders adı
                assert(typeof c.ders === "string" && c.ders.trim().length > 0,
                    `M5: ${alan}/${gStr} -> boş ders adı: "${rec.title}"`);
                assert(!cn.startsWith("toplam") && !cn.includes("genel toplam") &&
                       !cn.includes("ders saati toplami"),
                    `M5: ${alan}/${gStr} -> TOPLAM satırı veriye sızmış: "${c.ders}"`);
                assert(!adGorulen.has(cn),
                    `M5: ${alan}/${gStr} -> "${c.ders}" aynı çizelgede iki kez`);
                adGorulen.add(cn);

                // ---- M8 uydurma ad
                for (const u of UYDURMA) {
                    assert(!cn.includes(u),
                        `M8: ${alan}/${gStr} -> uydurma ders adı geri gelmiş: "${c.ders}"`);
                }

                assert(typeof c.saat === "number" && c.saat > 0 && c.saat <= 45,
                    `M6: ${alan}/${gStr} -> geçersiz saat (${c.saat}) [${c.ders}]`);

                // ---- M1 kategori
                kategoriSayac[c.kategori] = (kategoriSayac[c.kategori] || 0) + 1;
                assert(GECERLI_KATEGORI.has(c.kategori),
                    `M1: ${alan}/${gStr} -> beyaz listede olmayan kategori "${c.kategori}" [${c.ders}]`);

                // ---- M7 fark saati toplama girmemeli
                if (c.fark_saati !== undefined) {
                    assert(typeof c.fark_saati === "number" && c.fark_saati > 0,
                        `M7: ${alan}/${gStr} -> geçersiz fark_saati (${c.fark_saati}) [${c.ders}]`);
                }

                if (cn.includes("isletmelerde mesleki egitim")) {
                    isletmeSayisi++;
                    isletmeSaat += c.saat;
                    // İşletme dersi ATÖLYE tarafında olmalı, yoksa Madde 19
                    // ve Madde 22/2 hesapları bu 32 saati görmez.
                    assert(String(c.kategori).includes("MESLEK"),
                        `M1: ${alan}/${gStr} -> İşletmelerde Mesleki Eğitim MESLEK kategorisinde değil ("${c.kategori}")`);
                }

                toplamSaat += c.saat;
                if (String(c.kategori).includes("MESLEK")) meslekSaat += c.saat;
            }

            // ---- M1 her çizelgede en az bir atölye dersi
            assert(meslekSaat > 0,
                `M1: ${alan}/${gStr} -> çizelgede hiç MESLEK kategorili ders yok: "${rec.title}"`);

            // ---- M2 işletme dersi tam bir kez, 32 saat
            assert(isletmeSayisi === 1,
                `M2: ${alan}/${gStr} -> "İşletmelerde Mesleki Eğitim" ${isletmeSayisi} kez geçiyor: "${rec.title}"`);
            assert(isletmeSaat === 32,
                `M2: ${alan}/${gStr} -> işletme eğitimi ${isletmeSaat} saat, 32 olmalı: "${rec.title}"`);

            // ---- M4 çizelgenin kendi toplamıyla uyum
            const secmeli = Number(rec.secmeli_saat || 0);
            const beyan = Number(rec.toplam_saat || 0);
            assert(beyan > 0, `M4: ${alan}/${gStr} -> toplam_saat yok: "${rec.title}"`);
            if (beyan > 0) {
                assert(toplamSaat + secmeli === beyan,
                    `M4: ${alan}/${gStr} -> hesaplanan ${toplamSaat}+${secmeli}=${toplamSaat + secmeli}, ` +
                    `çizelgede TOPLAM DERS SAATİ ${beyan}: "${rec.title}"`);
            }
            if (beyan > 45) warn(`M4*: ${alan}/${gStr} -> ${beyan} saat (45 üstü): ${rec.title}`);
        }
    }
}

console.log(`Dal   : ${toplamDal}`);
console.log(`Çizelge : ${toplamCizelge}`);
console.log(`Ders satırı : ${toplamDers}`);
console.log(`Kaynak PDF : ${kaynakDosyalar.size}`);
console.log("Kategori dağılımı :");
for (const [k, v] of Object.entries(kategoriSayac).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(k).padEnd(30)} ${v}`);
}
console.log("-".repeat(70));

if (uyari.length) {
    console.log(`UYARI (${uyari.length}):`);
    uyari.forEach(u => console.log("   ! " + u));
    console.log("-".repeat(70));
}

if (hata === 0) {
    console.log(`✅ MESEM VERİSİ TEMİZ — ${kontrol} kontrol başarılı, 0 hata`);
    process.exit(0);
} else {
    console.log(`❌ ${hata} HATA / ${kontrol} kontrol`);
    hataOrnek.forEach(h => console.log("   × " + h));
    process.exit(1);
}
