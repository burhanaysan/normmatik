/*
 * MÜFREDAT FARK RAPORU  (elle yazılan  ↔  kaynaktan üretilen)
 * ==========================================================
 *
 * NEDEN VAR
 * ---------
 * curriculumEngine.js içindeki ANADOLU_CURRICULUM elle yazılmıştı ve canlı
 * sitede hatalı olduğu görüldü. Yerine resmî PDF'ten üretilen veri konacak.
 *
 * Ama üretilen veriyi doğrudan yerine koymak KÖR bir değişiklik olur:
 * hangi hesabın nasıl değişeceğini kimse görmez. Bu betik, iki veriyi ders
 * ders karşılaştırır ve HER farkı ekrana döker. Değişikliği onaylamak
 * kullanıcının kararıdır; betiğin işi farkı görünür kılmaktır.
 *
 * Çalıştırma: node tools/fark_mufredat.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- elle yazılmış veriyi motordan çek --------------------------------
// curriculumEngine.js bir modül değil; sabitleri okumak için dosyayı
// değerlendirip ANADOLU_CURRICULUM'u dışarı veriyoruz.
// Dosyanın tamamı çalıştırılamaz (en altta dbService'e bağlı bir kurulum var).
// Yalnızca istenen sabitin süslü parantez bloğu kesilip değerlendirilir.
function sabitOku(dosya, ad) {
    const m = fs.readFileSync(dosya, "utf8");
    const i = m.search(new RegExp("(?:export\\s+)?const\\s+" + ad + "\\s*="));
    if (i < 0) throw new Error(ad + " bulunamadı: " + dosya);
    const ac = m.indexOf("{", i);
    let d = 1, j = ac + 1;
    while (j < m.length && d > 0) {
        const c = m[j];
        if (c === "{") d++;
        else if (c === "}") d--;
        else if (c === '"' || c === "'") {           // metin içindeki parantezi sayma
            const t = c; j++;
            while (j < m.length && m[j] !== t) j += (m[j] === "\\" ? 2 : 1);
        } else if (c === "/" && m[j + 1] === "/") {   // satır yorumu
            j = m.indexOf("\n", j);
            if (j < 0) break;
        }
        j++;
    }
    return new Function("return (" + m.slice(ac, j) + ");")();
}

const eski = sabitOku(path.join(KOK, "js", "curriculumEngine.js"), "ANADOLU_CURRICULUM");

const uretilenDosya = JSON.parse(fs.readFileSync(
    path.join(KOK, "data", "kaynak_cizelgeler", "ogm", "uretilen_anadolu_lisesi.json"), "utf8"));
const yeni = uretilenDosya.dersler;

const SINIFLAR = ["9", "10", "11", "12"];
const norm = s => s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9]/g, "");

let eklenen = 0, silinen = 0, degisen = 0;

console.log("MÜFREDAT FARK RAPORU — Anadolu Lisesi");
console.log("=".repeat(78));
console.log("eski : js/curriculumEngine.js  (elle yazılmış)");
console.log("yeni : " + uretilenDosya.kaynak_cizelge.slice(0, 52));
console.log("       " + uretilenDosya.karar);
console.log();

for (const sinif of SINIFLAR) {
    const a = eski[sinif] || [], b = yeni[sinif] || [];
    const ha = new Map(a.map(d => [norm(d.ders), d]));
    const hb = new Map(b.map(d => [norm(d.ders), d]));
    const satirlar = [];

    for (const [k, d] of hb) {
        if (!ha.has(k)) { satirlar.push(["  + EKLENEN", d.ders, `${d.saat} sa`, d.atananBrans]); eklenen++; }
    }
    for (const [k, d] of ha) {
        if (!hb.has(k)) { satirlar.push(["  - SİLİNEN", d.ders, `${d.saat} sa`, d.atananBrans]); silinen++; }
    }
    for (const [k, x] of ha) {
        const y = hb.get(k); if (!y) continue;
        if (x.saat !== y.saat) { satirlar.push(["  ~ SAAT   ", x.ders, `${x.saat} -> ${y.saat}`, ""]); degisen++; }
        if (x.atananBrans !== y.atananBrans) { satirlar.push(["  ~ BRANŞ  ", x.ders, "", `${x.atananBrans} -> ${y.atananBrans}`]); degisen++; }
    }

    const tA = a.filter(d => d.kategori !== "REHBERLİK").reduce((s, d) => s + d.saat, 0);
    const tB = b.filter(d => d.kategori !== "REHBERLİK").reduce((s, d) => s + d.saat, 0);
    const resmi = uretilenDosya.cizelge_toplamlari;
    let resmiOrtak = null;
    for (const [ad, v] of Object.entries(resmi))
        if (ad.toLocaleUpperCase("tr").includes("ORTAK DERS SAATİ TOPLAMI"))
            resmiOrtak = v[SINIFLAR.indexOf(sinif)];

    console.log(`${sinif}. SINIF   ortak saat:  eski ${tA}  ->  yeni ${tB}   (resmî çizelge: ${resmiOrtak})`);
    console.log(`            seçmeli hedefi: eski ${40 - tA - 1}  ->  yeni ${40 - tB - 1}`);
    if (satirlar.length === 0) console.log("            (fark yok)");
    for (const [tip, ders, saat, brans] of satirlar)
        console.log(`${tip}  ${ders.padEnd(38)} ${saat.padEnd(12)} ${brans}`);
    console.log();
}

console.log("=".repeat(78));
console.log(`TOPLAM: ${eklenen} eklenen, ${silinen} silinen, ${degisen} değişen alan`);
console.log("=".repeat(78));
