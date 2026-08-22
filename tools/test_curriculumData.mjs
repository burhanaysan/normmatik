/*
 * MÜFREDAT VERİSİ DOĞRULAMA TESTİ
 * ================================
 * Hedef dosya : js/strict_pdf_curriculum_db.js
 * Üreten      : tools/rebuild_curriculum_db.py
 *
 * Bu test, ÜRETİLEN VERİYİ denetler (motoru değil). Amacı, geçmişte yaşanan
 * somut hataların bir daha sessizce geri gelmesini engellemektir:
 *
 *   K1  Her başlıkta AMP/ATP ifadesinden TAM OLARAK BİRİ bulunmalı.
 *       (Aksi halde curriculumEngine.js:752-755'teki program filtresi
 *        sessizce devre dışı kalır; ATP şubesi AMP dersleri görür.)
 *   K2  Başlıktaki ilk parantez grubu DAL adı olmalı.
 *       (database.js:getBranchesForArea dal adını buradan çıkarıyor.)
 *   K3  12. sınıfta AMP ve ATP çizelgeleri AYNI OLMAMALI.
 *       (Eski sütun birleşme hatası: ATP'ye 24 saat "İşletmelerde Mesleki
 *        Eğitim" yazılıyordu; ATP'de bu ders hiç yoktur.)
 *   K4  Kategori değerleri beyaz listede olmalı.
 *       (curriculumEngine.js:796 -> isAtolye = kategori.includes("MESLEK"))
 *   K5  REHBERLİK satırları asla MESLEK kategorisinde olmamalı.
 *       (Aksi halde rehberlik saati Madde 19 atölye yüküne yazılır.)
 *   K6  Haftalık toplam saat makul aralıkta olmalı.
 *   K7  Ek tablolar (tablo_turu / dal_adi yok) çizelge sayılmamalı;
 *       "TOPLAM" satırları veriye sızmamalı.
 *   K8  Yapısal bütünlük: zorunlu alanlar, tip kontrolleri, sınıf tutarlılığı.
 *
 * Çalıştırma: node tools/test_curriculumData.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "js", "strict_pdf_curriculum_db.js");

// ---------------------------------------------------------------- yükleme
function loadDb() {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const marker = "STRICT_PDF_CURRICULUM_DB = ";
    const i = raw.indexOf(marker);
    if (i === -1) throw new Error("Dosyada STRICT_PDF_CURRICULUM_DB bulunamadı: " + DB_PATH);
    let body = raw.slice(i + marker.length).trim();
    if (body.endsWith(";")) body = body.slice(0, -1);
    return JSON.parse(body);
}

// ---------------------------------------------------------------- raporlama
let hata = 0;
let kontrol = 0;
const uyari = [];
const hataOrnek = [];

function assert(kosul, mesaj) {
    kontrol++;
    if (!kosul) {
        hata++;
        if (hataOrnek.length < 40) hataOrnek.push(mesaj);
    }
}
function warn(mesaj) {
    if (uyari.length < 40) uyari.push(mesaj);
}

// ---------------------------------------------------------------- sabitler
const AMP = "anadolu meslek programi";
const ATP = "anadolu teknik programi";

// curriculumEngine isAtolye kararını kategoriden veriyor; bu yüzden kategori
// serbest metin OLAMAZ. Yeni bir kategori eklenirse burada da bildirilmeli.
const GECERLI_KATEGORI = new Set([
    "ORTAK DERSLER",    // ortak/kültür dersleri  -> genel yük (Madde 18)
    "MESLEK DERSLERİ",  // alan/dal meslek dersi  -> atölye yükü (Madde 19)
    "REHBERLİK",        // rehberlik ve yönlendirme -> genel yük (MESLEK içermez!)
]);

// Türkçe harf duyarsız normalleştirme (Python tarafıyla aynı mantık)
function norm(s) {
    return (s || "")
        .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
        .replace(/Ş/g, "s").replace(/ş/g, "s")
        .replace(/Ğ/g, "g").replace(/ğ/g, "g")
        .replace(/Ü/g, "u").replace(/ü/g, "u")
        .replace(/Ö/g, "o").replace(/ö/g, "o")
        .replace(/Ç/g, "c").replace(/ç/g, "c")
        .toLowerCase().trim();
}

function dersImzasi(rec) {
    return (rec.courses || [])
        .map(c => `${norm(c.ders)}|${c.saat}`)
        .sort()
        .join("¶");
}

// ---------------------------------------------------------------- test
const DB = loadDb();
const alanlar = Object.keys(DB);

console.log("MÜFREDAT VERİSİ DOĞRULAMA TESTİ");
console.log("=".repeat(70));
console.log(`Dosya : js/strict_pdf_curriculum_db.js`);
console.log(`Alan  : ${alanlar.length}`);

let toplamCizelge = 0;
let toplamDers = 0;
let ampSayi = 0;
let atpSayi = 0;
const kategoriSayac = {};

assert(alanlar.length > 50, `K8: Alan sayısı beklenenden az (${alanlar.length}) — veri kaybı olabilir`);

for (const alan of alanlar) {
    const alanDb = DB[alan];
    assert(alanDb && typeof alanDb === "object", `K8: ${alan} -> alan gövdesi nesne değil`);

    for (const gStr of Object.keys(alanDb)) {
        assert(["9", "10", "11", "12"].includes(gStr),
            `K8: ${alan} -> beklenmeyen sınıf anahtarı "${gStr}"`);

        const liste = alanDb[gStr];
        assert(Array.isArray(liste) && liste.length > 0,
            `K8: ${alan}/${gStr} -> çizelge listesi boş veya dizi değil`);
        if (!Array.isArray(liste)) continue;

        // K3 için: program bazında ders imzalarını topla
        const imzaByProgram = { AMP: new Set(), ATP: new Set() };

        for (const rec of liste) {
            toplamCizelge++;

            // ---- K8 yapısal bütünlük
            assert(typeof rec.title === "string" && rec.title.length > 10,
                `K8: ${alan}/${gStr} -> title eksik/kısa`);
            assert(String(rec.grade) === gStr,
                `K8: ${alan}/${gStr} -> rec.grade (${rec.grade}) anahtarla uyuşmuyor`);
            assert(Array.isArray(rec.courses),
                `K8: ${alan}/${gStr} -> courses dizi değil: ${rec.title}`);
            assert(typeof rec.page === "number",
                `K8: ${alan}/${gStr} -> page sayı değil: ${rec.title}`);
            if (!Array.isArray(rec.courses)) continue;

            const nt = norm(rec.title);

            // ---- K1 AMP/ATP tekilliği
            const hasAmp = nt.includes(AMP);
            const hasAtp = nt.includes(ATP);
            assert(hasAmp !== hasAtp,
                `K1: ${alan}/${gStr} -> başlık AMP/ATP bakımından belirsiz: "${rec.title}"`);
            if (hasAmp && !hasAtp) ampSayi++;
            if (hasAtp && !hasAmp) atpSayi++;

            // rec.program alanı başlıkla tutarlı mı
            if (rec.program) {
                const beklenen = rec.program === "ATP" ? hasAtp : hasAmp;
                assert(beklenen,
                    `K1: ${alan}/${gStr} -> rec.program=${rec.program} ama başlık farklı: "${rec.title}"`);
            }

            // ---- K2 ilk parantez grubu DAL olmalı
            const m = rec.title.match(/\(([^)]+)\)/);
            assert(m !== null,
                `K2: ${alan}/${gStr} -> başlıkta dal parantezi yok: "${rec.title}"`);
            if (m) {
                assert(norm(m[1]).includes("dali"),
                    `K2: ${alan}/${gStr} -> ilk parantez DAL değil ("${m[1]}"): "${rec.title}"`);
            }

            // ---- ders satırları
            let toplamSaat = 0;
            let meslekSaat = 0;
            assert(rec.courses.length >= 3,
                `K8: ${alan}/${gStr} -> çizelgede ${rec.courses.length} ders var (çok az): "${rec.title}"`);

            for (const c of rec.courses) {
                toplamDers++;
                const cn = norm(c.ders);

                assert(typeof c.ders === "string" && c.ders.trim().length > 0,
                    `K8: ${alan}/${gStr} -> boş ders adı: "${rec.title}"`);
                assert(typeof c.saat === "number" && c.saat > 0 && c.saat <= 45,
                    `K8: ${alan}/${gStr} -> geçersiz saat (${c.saat}) [${c.ders}]`);

                // ---- K7 TOPLAM satırı sızmamalı
                assert(!cn.startsWith("toplam") && !cn.includes("genel toplam"),
                    `K7: ${alan}/${gStr} -> TOPLAM satırı veriye sızmış: "${c.ders}"`);

                // ---- K4 kategori beyaz listesi
                kategoriSayac[c.kategori] = (kategoriSayac[c.kategori] || 0) + 1;
                assert(GECERLI_KATEGORI.has(c.kategori),
                    `K4: ${alan}/${gStr} -> beyaz listede olmayan kategori "${c.kategori}" [${c.ders}]`);

                // ---- K5 rehberlik asla MESLEK olmamalı
                if (cn.includes("rehberlik")) {
                    assert(!String(c.kategori).includes("MESLEK"),
                        `K5: ${alan}/${gStr} -> REHBERLİK dersi MESLEK kategorisinde (atölye yüküne yazılır): "${c.ders}"`);
                }

                toplamSaat += c.saat;
                if (String(c.kategori).includes("MESLEK")) meslekSaat += c.saat;
            }

            // ---- K6 haftalık toplam makul mü
            // Çizelgeler seçmeli havuzunu içermeyebilir; alt sınır bu yüzden gevşek.
            assert(toplamSaat >= 8 && toplamSaat <= 50,
                `K6: ${alan}/${gStr} -> haftalık toplam ${toplamSaat} saat (makul dışı): "${rec.title}"`);
            if (toplamSaat > 45) {
                warn(`K6*: ${alan}/${gStr} -> ${toplamSaat} saat (45 üstü): ${rec.title}`);
            }

            // ---- K3 verisi
            const prog = rec.program === "ATP" ? "ATP" : "AMP";
            imzaByProgram[prog].add(dersImzasi(rec));
        }

        // ---- K3: 12. sınıfta AMP ve ATP birebir aynı olmamalı
        if (gStr === "12" && imzaByProgram.AMP.size > 0 && imzaByProgram.ATP.size > 0) {
            const kesisim = [...imzaByProgram.ATP].filter(x => imzaByProgram.AMP.has(x));
            assert(kesisim.length === 0,
                `K3: ${alan}/12 -> AMP ve ATP çizelgeleri BİREBİR AYNI ` +
                `(eski sütun birleşme hatası geri gelmiş olabilir)`);
        }
    }
}

// ---------------------------------------------------------------- ek denetim
// 12. sınıf "İşletmelerde Mesleki Eğitim" yalnızca AMP'de olmalı.
let atpIsletmeIhlal = 0;
for (const alan of alanlar) {
    const g12 = DB[alan]["12"];
    if (!g12) continue;
    for (const rec of g12) {
        if (rec.program !== "ATP") continue;
        for (const c of rec.courses || []) {
            if (norm(c.ders).includes("isletmelerde")) {
                atpIsletmeIhlal++;
                if (hataOrnek.length < 40) {
                    hataOrnek.push(`K3b: ${alan}/12 ATP -> "İşletmelerde Mesleki Eğitim" ATP'de olmamalı (${c.saat} saat)`);
                }
            }
        }
    }
}
kontrol++;
if (atpIsletmeIhlal > 0) hata++;

// ---------------------------------------------------------------- özet
console.log(`Çizelge : ${toplamCizelge}  (AMP ${ampSayi} / ATP ${atpSayi})`);
console.log(`Ders satırı : ${toplamDers}`);
console.log("Kategori dağılımı :");
for (const [k, v] of Object.entries(kategoriSayac).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(k).padEnd(12)} ${v}`);
}
console.log("-".repeat(70));

if (uyari.length) {
    console.log(`UYARI (${uyari.length}):`);
    uyari.forEach(u => console.log("   ! " + u));
    console.log("-".repeat(70));
}

if (hata === 0) {
    console.log(`✅ MÜFREDAT VERİSİ TEMİZ — ${kontrol} kontrol başarılı, 0 hata`);
    process.exit(0);
} else {
    console.log(`❌ ${hata} HATA / ${kontrol} kontrol`);
    hataOrnek.forEach(h => console.log("   × " + h));
    process.exit(1);
}
