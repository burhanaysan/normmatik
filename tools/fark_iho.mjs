/*
 * İMAM HATİP ORTAOKULU — FARK RAPORU
 * ==================================
 * Elle yazılmış IHO_CURRICULUM ile, PDF'ten çıkarılıp doğrulanmış
 * data/kaynak_cizelgeler/dogm/imam_hatip_ortaokulu.json karşılaştırılır.
 *
 * Ders adları yalnızca yazım farkıyla ayrışabiliyor ("Dinî"/"Dini", kesme
 * işaretinin türü). Bunlar GERÇEK hata değildir; ayrı sayılırsa denetim
 * olmayan hatayı var gösterir. Bu yüzden karşılaştırma anahtarı, Türkçe
 * harfleri ve şapkalı/kesme işaretlerini sadeleştirir.
 *
 * Çalıştırma: node tools/fark_iho.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SINIFLAR = ["5", "6", "7", "8"];

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

// Şapkalı harfler, iki farklı kesme işareti ve parantezli açıklama sadeleşir.
// Parantez şart: uygulama "Yabancı Dil (İngilizce)" yazıyor, çizelge yalnızca
// "Yabancı Dil". Aynı ders, aynı saat; ayrı sayılırsa 8 sahte fark üretir.
const anahtar = s => s
    .replace(/\(.*?\)/g, " ")
    .replace(/[îİi]/g, "i").replace(/[âa]/g, "a").replace(/[ûu]/g, "u")
    .replace(/['’‘]/g, "")
    .toLocaleLowerCase("tr")
    .replace(/[^a-zçğıöşü0-9]/g, "");

const uyg = sabitOku(path.join(KOK, "js", "curriculumEngine.js"), "IHO_CURRICULUM");
const kay = JSON.parse(fs.readFileSync(
    path.join(KOK, "data", "kaynak_cizelgeler", "dogm", "imam_hatip_ortaokulu.json"), "utf8"));

const kaynak = {};
for (const d of kay.ana_cizelge.zorunlu_dersler)
    for (const [s, v] of Object.entries(d.saatler || {}))
        if (v && typeof v.saat === "number")
            (kaynak[s] = kaynak[s] || {})[anahtar(d.ders_adi)] = { saat: v.saat, ad: d.ders_adi };

console.log("İMAM HATİP ORTAOKULU — FARK RAPORU");
console.log("=".repeat(76));
console.log("kaynak: " + kay.belge_adi + "  (" + kay.yururluk + ")");
console.log();

let gercek = 0, yazim = 0;
for (const s of SINIFLAR) {
    const u = {}, adlar = {};
    for (const d of uyg[s] || []) { u[anahtar(d.ders)] = d.saat; adlar[anahtar(d.ders)] = d.ders; }
    const k = kaynak[s] || {};
    const tU = Object.values(u).reduce((a, b) => a + b, 0);
    const tK = Object.values(k).reduce((a, b) => a + b.saat, 0);

    console.log(`${s}. SINIF   toplam:  uygulama ${tU}  |  kaynak ${tK}` +
        (tU === tK ? "" : "   <-- FARKLI"));

    for (const [key, v] of Object.entries(k)) {
        if (!(key in u)) { console.log(`   EKSİK    ${v.ad.padEnd(34)} ${v.saat} saat`); gercek++; }
        else if (u[key] !== v.saat) {
            console.log(`   SAAT     ${v.ad.padEnd(34)} uygulama ${u[key]} -> kaynak ${v.saat}`); gercek++;
        } else if (adlar[key] !== v.ad) {
            console.log(`   (yazım)  ${adlar[key]}  ->  ${v.ad}`); yazim++;
        }
    }
    for (const [key, saat] of Object.entries(u))
        if (!(key in k)) { console.log(`   FAZLA    ${adlar[key].padEnd(34)} ${saat} saat`); gercek++; }
    console.log();
}

console.log("=".repeat(76));
console.log(`${gercek} gerçek fark, ${yazim} yalnızca yazım farkı`);
console.log("=".repeat(76));
