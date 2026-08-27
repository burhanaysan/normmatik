/*
 * SEÇMELİ DERS KAPSAM DENETİMİ
 * ============================
 * Resmî çizelgelerdeki seçmeli ders havuzlarının ne kadarı uygulamaya
 * bağlanmış?
 *
 * NEDEN VAR
 * ---------
 * Zorunlu dersler 27.08.2026'da kaynağa bağlandı. Seçmeliler bağlanmadı:
 * uygulamada genel liselerin TAMAMI tek bir havuzu paylaşıyor
 * (GENEL_ORTAOGRETIM_SECMELI). Oysa her okul türünün çizelgesinde KENDİ
 * seçmeli tablosu var ve bunlar birbirinden farklı — Anadolu İmam Hatip
 * Lisesi'nin "A grubu / B grubu" tabloları gibi.
 *
 * Bu denetim, kaynakta olup uygulamada olmayan seçmeli dersleri sayar.
 * Sayı düşerse (yeni bağlama yapıldıkça) burada görünür.
 *
 * Çalıştırma: node tools/denetim_secmeli_kapsami.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = path.join(KOK, "data", "kaynak_cizelgeler");

const anahtar = s => String(s || "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[îİi]/g, "i").replace(/[âa]/g, "a").replace(/[ûu]/g, "u")
    .replace(/['’‘]/g, "")
    .toLocaleLowerCase("tr")
    .replace(/[^a-zçğıöşü0-9]/g, "");

// --- uygulamadaki genel seçmeli havuzu ------------------------------------
const dbMetin = fs.readFileSync(
    path.join(KOK, "js", "strict_elective_courses_db.js"), "utf8");
const DB = JSON.parse(dbMetin.slice(dbMetin.indexOf("{"), dbMetin.lastIndexOf("}") + 1));
const genel = DB["GENEL_ORTAOGRETIM_SECMELI"] || [];
const genelAnahtar = new Set(genel.map(c => anahtar(c.ders)));

console.log("SEÇMELİ DERS KAPSAM DENETİMİ");
console.log("=".repeat(78));
console.log("uygulamadaki genel seçmeli havuzu: %d ders", genel.length);
console.log("meslek alanı havuzu               : %d alan",
    Object.keys(DB).filter(k => k !== "GENEL_ORTAOGRETIM_SECMELI").length);
if (genel.length === 0) {
    console.log("!! genel havuz boş — denetim geçersiz");
    process.exit(1);
}

// --- kaynaklardaki seçmeli tablolar ---------------------------------------
function* jsonDosyalari(dizin) {
    for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
        const yol = path.join(dizin, g.name);
        if (g.isDirectory()) yield* jsonDosyalari(yol);
        else if (g.name.endsWith(".json")) yield yol;
    }
}

const tablolar = [];
for (const yol of jsonDosyalari(KAYNAK)) {
    let j;
    try { j = JSON.parse(fs.readFileSync(yol, "utf8")); } catch { continue; }
    const rel = path.relative(KAYNAK, yol).replace(/\\/g, "/");

    // OGM biçimi: tablolar[].gruplar[] içinde "SEÇMELİ" grubu
    for (const t of (j.tablolar || [])) {
        for (const g of (t.gruplar || [])) {
            if (!/SEÇMEL/i.test(g.grup_adi || "")) continue;
            tablolar.push({
                kaynak: rel, tablo: t.tablo_adi || "(tek tablo)",
                grup: g.grup_adi,
                dersler: (g.dersler || []).map(d => d.ders_adi).filter(Boolean)
            });
        }
    }
    // DÖGM biçimi: secmeli_dersler
    //
    // DİKKAT — bu tarayıcının İLK hâli AİHL'yi sessizce atlıyordu:
    // AİHL'de ders listesi bir kat daha derinde duruyor
    //     secmeli_dersler.a_grubu.alanlar[].dersler[]
    //     secmeli_dersler.b_grubu.programlar[].dersler[]
    // İlk yazımda dizi görülür görülmez ders adı aranıyordu; `alanlar`
    // dizisinin öğelerinde ders_adi olmadığı için liste boş çıkıyor ve boş
    // tablolar atlandığı için AİHL raporda HİÇ görünmüyordu. Yani denetim,
    // sorulan okulu tam da dışarıda bırakıyordu.
    const sd = j.secmeli_dersler;
    if (sd) {
        const topla = (o, etiket) => {
            if (Array.isArray(o)) {
                const dersler = o.map(d => d.ders_adi || d.ders).filter(Boolean);
                if (dersler.length) {
                    tablolar.push({ kaynak: rel, tablo: j.belge_adi || rel,
                                    grup: etiket, dersler });
                }
                // Öğeleri ders değilse (alan/program sarmalayıcısı) içine in.
                for (const oge of o) {
                    if (oge && typeof oge === "object" && !oge.ders_adi && !oge.ders) {
                        const ad = oge.alan_adi || oge.program_adi || "";
                        topla(oge.dersler || oge, etiket + (ad ? "/" + ad : ""));
                    }
                }
            } else if (o && typeof o === "object") {
                for (const [k, v] of Object.entries(o)) {
                    if (k === "aciklama") continue;
                    topla(v, etiket + "/" + k);
                }
            }
        };
        topla(sd, "seçmeli");
    }
}

console.log("\nKAYNAKLARDAKİ SEÇMELİ TABLOLARI");
console.log("-".repeat(78));
console.log("%s %s %s %s",
    "KAYNAK".padEnd(30), "TABLO / GRUP".padEnd(26), "DERS".padStart(5), "  UYGULAMADA YOK");
console.log("-".repeat(78));

let toplamDers = 0, toplamEksik = 0;
const eksikAdlar = new Map();
for (const t of tablolar) {
    if (!t.dersler.length) continue;
    const eksik = t.dersler.filter(d => !genelAnahtar.has(anahtar(d)));
    toplamDers += t.dersler.length;
    toplamEksik += eksik.length;
    for (const d of eksik) {
        if (!eksikAdlar.has(anahtar(d))) eksikAdlar.set(anahtar(d), d);
    }
    console.log("%s %s %s %s",
        t.kaynak.slice(0, 30).padEnd(30),
        (t.tablo + " / " + t.grup).slice(0, 26).padEnd(26),
        String(t.dersler.length).padStart(5),
        "  " + (eksik.length ? eksik.length + " eksik" : "tamam"));
}

console.log("-".repeat(78));
console.log("kaynaklardaki seçmeli ders kaydı : %d", toplamDers);
console.log("uygulamada karşılığı olmayan     : %d (tekil ad: %d)",
    toplamEksik, eksikAdlar.size);
console.log("=".repeat(78));

if (process.argv.includes("--liste")) {
    console.log("\nUYGULAMADA OLMAYAN TEKİL DERS ADLARI");
    console.log("-".repeat(78));
    [...eksikAdlar.values()].sort((a, b) => a.localeCompare(b, "tr"))
        .forEach(d => console.log("  " + d));
}
