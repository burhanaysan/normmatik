/*
 * İLKOKUL + ORTAOKUL — FARK RAPORU
 * ================================
 * Elle yazılmış İLKOKUL_CURRICULUM (1-4) ve ORTAOKUL_CURRICULUM (5-8) ile,
 * resmî PDF'ten çıkarılan data/kaynak_cizelgeler/temel_egitim/
 * ilkogretim_ilkokul_ortaokul.json karşılaştırılır.
 *
 * Yalnızca yazım farkından doğan sahte bulgular ayrı gösterilir; anahtar,
 * parantezli açıklamayı ve şapkalı harfleri sadeleştirir.
 *
 * Çalıştırma: node tools/fark_ilkogretim.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function sabitOku(dosya, ad) {
    const m = fs.readFileSync(dosya, "utf8");
    const i = m.search(new RegExp("(?:export\\s+)?const\\s+" + ad + "\\s*="));
    if (i < 0) throw new Error(ad + " bulunamadı");
    const ac = m.indexOf("{", i);
    let d = 1, j = ac + 1;
    while (j < m.length && d > 0) {
        const c = m[j];
        if (c === "{") d++;
        else if (c === "}") d--;
        else if (c === '"') { j++; while (j < m.length && m[j] !== '"') j += (m[j] === "\\" ? 2 : 1); }
        j++;
    }
    return new Function("return (" + m.slice(ac, j) + ");")();
}

const anahtar = s => s
    .replace(/\(.*?\)/g, " ")
    .replace(/[îİi]/g, "i").replace(/[âa]/g, "a").replace(/[ûu]/g, "u")
    .replace(/['’‘]/g, "")
    .toLocaleLowerCase("tr")
    .replace(/[^a-zçğıöşü0-9]/g, "");

const MOTOR = path.join(KOK, "js", "curriculumEngine.js");
const kay = JSON.parse(fs.readFileSync(
    path.join(KOK, "data", "kaynak_cizelgeler", "temel_egitim",
        "ilkogretim_ilkokul_ortaokul.json"), "utf8"));

const kaynak = {};
for (const d of kay.ana_cizelge.zorunlu_dersler)
    for (const [s, v] of Object.entries(d.saatler || {}))
        (kaynak[s] = kaynak[s] || {})[anahtar(d.ders_adi)] = { saat: v.saat, ad: d.ders_adi };

console.log("İLKOKUL + ORTAOKUL — FARK RAPORU");
console.log("=".repeat(76));
console.log("kaynak: " + kay.karar);
console.log();

let gercek = 0, yazim = 0, rehberlik = 0;

function bak(sabitAdi, siniflar, baslik) {
    let C;
    try { C = sabitOku(MOTOR, sabitAdi); }
    catch { console.log(`### ${baslik}: ${sabitAdi} bulunamadı, atlandı\n`); return; }

    console.log("### " + baslik + "  (" + sabitAdi + ")");
    for (const s of siniflar) {
        const u = {}, adlar = {};
        for (const d of C[s] || []) { u[anahtar(d.ders)] = d.saat; adlar[anahtar(d.ders)] = d.ders; }
        const k = kaynak[s] || {};
        const tU = Object.values(u).reduce((a, b) => a + b, 0);
        const tK = Object.values(k).reduce((a, b) => a + b.saat, 0);
        const satir = [];

        for (const [key, v] of Object.entries(k)) {
            const reh = /rehberlik/.test(key);
            if (!(key in u)) { satir.push(`   ${reh ? "(reh.)  " : "EKSİK   "} ${v.ad.padEnd(36)} ${v.saat} saat`); reh ? rehberlik++ : gercek++; }
            else if (u[key] !== v.saat) { satir.push(`   SAAT     ${v.ad.padEnd(36)} uygulama ${u[key]} -> kaynak ${v.saat}`); reh ? rehberlik++ : gercek++; }
            else if (adlar[key] !== v.ad) { satir.push(`   (yazım)  ${adlar[key]}  ->  ${v.ad}`); yazim++; }
        }
        for (const [key, saat] of Object.entries(u))
            if (!(key in k)) {
                const reh = /rehberlik/.test(key);
                satir.push(`   ${reh ? "(reh.)  " : "FAZLA   "} ${adlar[key].padEnd(36)} ${saat} saat`);
                reh ? rehberlik++ : gercek++;
            }

        console.log(`  ${s}. sınıf   toplam: uygulama ${tU} | kaynak ${tK}` +
            (tU === tK ? "" : "   <-- FARKLI"));
        satir.forEach(x => console.log(x));
    }
    console.log();
}

bak("İLKOKUL_CURRICULUM", ["1", "2", "3", "4"], "İLKOKUL");
bak("ORTAOKUL_CURRICULUM", ["5", "6", "7", "8"], "ORTAOKUL");

console.log("=".repeat(76));
console.log(`${gercek} gerçek fark | ${rehberlik} Rehberlik kaynaklı (dokunulmuyor) | ${yazim} yazım`);
console.log("=".repeat(76));
