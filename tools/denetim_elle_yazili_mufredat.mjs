/*
 * ELLE YAZILI MÜFREDATLARIN DOĞRULANMASI
 * =======================================
 * curriculumEngine.js içinde dört müfredat ELLE YAZILMIŞTIR ve bugüne kadar
 * hiçbir kaynağa karşı doğrulanmamıştır:
 *     IHO_CURRICULUM      (satır ~472)
 *     ORTAOKUL_CURRICULUM (satır ~540)
 *     İLKOKUL_CURRICULUM  (satır ~596)
 *     ANADOLU_CURRICULUM  (satır ~847)
 *
 * MESEM'de elle yazılmış müfredatın tamamen uydurma çıktığı görüldüğü için
 * bu dördü de şüphelidir.
 *
 * Bu betik motoru GERÇEK YOLDAN çağırır (getMandatoryCourses) — nesneyi
 * okumaz. Böylece hem verinin kendisi hem de kablolama denetlenir.
 *
 * Karşılaştırma kaynağı: data/kaynak_cizelgeler/ altındaki, PDF'lerden
 * çıkarılıp doğrulanmış TTKB çizelgeleri.
 *
 * Çalıştırma: node tools/denetim_elle_yazili_mufredat.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BURASI = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.dirname(BURASI);

// ---------------------------------------------------------------- motoru yükle
function motoruYukle() {
    const kaynak = fs.readFileSync(path.join(KOK, "js/curriculumEngine.js"), "utf8");
    const temiz = kaynak
        .split("\n")
        .filter((s) => !/^\s*import\s/.test(s))
        .filter((s) => !/^\s*export\s+const\s+curriculumEngine/.test(s))
        .join("\n")
        .replace(/if \(typeof module[\s\S]*$/, "");
    const uret = new Function(
        "STRICT_PDF_CURRICULUM_DB", "MESEM_CURRICULUM_DB", "window",
        temiz + "\nreturn MebCurriculumEngine;"
    );
    const Sinif = uret({}, {}, undefined);
    return new Sinif(null);
}

// ---------------------------------------------------------------- ad eşleme
const trKucuk = (s) => String(s).replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();

function anahtar(ad) {
    return trKucuk(ad)
        .replace(/\(.*?\)/g, " ")          // "(İngilizce)" gibi ekleri at
        .replace(/[^a-zçğıöşü0-9]/g, "");  // noktalama ve boşluk
}

// Kaynak ile uygulamanın farklı adlandırdığı, AYNI dersler.
const ES_ANLAM = {
    yabancidil: "yabancidilingilizce",
    tcinkilaptarihiveataturkculuk: "tcinkilaptarihiveataturkculuk",
    bilisimteknolojilerivayazilim: "bilisimteknolojileriveyazilim",
};
function esle(a) {
    const k = anahtar(a);
    return ES_ANLAM[k] || k;
}

// ---------------------------------------------------------------- referans oku
function referansCizelge(dosya, kok = "ana_cizelge", alan = "zorunlu_dersler") {
    const j = JSON.parse(fs.readFileSync(path.join(KOK, "data/kaynak_cizelgeler", dosya), "utf8"));
    const bolum = kok ? j[kok] : j;
    const liste = bolum && bolum[alan] ? bolum[alan] : [];
    const cikti = {};
    for (const d of liste) {
        for (const [sinif, deger] of Object.entries(d.saatler || {})) {
            if (!deger) continue;
            const saat = deger.saat;
            if (typeof saat !== "number") continue;
            (cikti[sinif] = cikti[sinif] || {})[esle(d.ders_adi)] = { saat, ad: d.ders_adi };
        }
    }
    return { veri: cikti, belge: j.belge_adi, yururluk: j.yururluk, ham: j };
}

// ---------------------------------------------------------------- karşılaştır
const BULGULAR = [];

function karsilastir(baslik, okulTuru, siniflar, ref) {
    const motor = motoruYukle();
    console.log("\n" + "=".repeat(72));
    console.log(baslik);
    console.log("Kaynak: " + (ref.belge || "-") + "  |  Yürürlük: " + (ref.yururluk || "-"));
    console.log("=".repeat(72));

    for (const g of siniflar) {
        const uyg = motor.getMandatoryCourses(okulTuru, g) || [];
        const uygMap = {};
        for (const d of uyg) uygMap[esle(d.ders)] = { saat: d.saat, ad: d.ders };
        const refMap = ref.veri[String(g)] || {};

        const eksik = [], fazla = [], farkli = [];
        for (const [k, v] of Object.entries(refMap)) {
            if (!(k in uygMap)) eksik.push(v);
            else if (uygMap[k].saat !== v.saat) farkli.push({ ad: v.ad, ref: v.saat, uyg: uygMap[k].saat });
        }
        for (const [k, v] of Object.entries(uygMap)) {
            if (!(k in refMap)) fazla.push(v);
        }

        const tRef = Object.values(refMap).reduce((t, x) => t + x.saat, 0);
        const tUyg = Object.values(uygMap).reduce((t, x) => t + x.saat, 0);

        console.log("\n--- %d. sınıf ---", g);
        console.log("  toplam saat:  kaynak %d  |  uygulama %d  %s",
            tRef, tUyg, tRef === tUyg ? "" : "  <-- FARKLI");

        if (eksik.length) {
            console.log("  UYGULAMADA YOK (kaynakta var):");
            for (const d of eksik) console.log("     - %s (%d saat)", d.ad, d.saat);
        }
        if (fazla.length) {
            console.log("  KAYNAKTA YOK (uygulamada var):");
            for (const d of fazla) console.log("     + %s (%d saat)", d.ad, d.saat);
        }
        if (farkli.length) {
            console.log("  SAAT FARKI:");
            for (const d of farkli) console.log("     ! %s : kaynak %d, uygulama %d", d.ad, d.ref, d.uyg);
        }
        if (!eksik.length && !fazla.length && !farkli.length) console.log("  (fark yok)");

        if (eksik.length || fazla.length || farkli.length) {
            BULGULAR.push({ baslik, sinif: g, eksik, fazla, farkli, tRef, tUyg });
        }
    }
}

// OGM çizelgeleri farklı biçimde: tablolar[].gruplar[].dersler[]
// Yalnızca ZORUNLU (ortak/alan) dersler alınır; seçmeli havuzlar hariç,
// çünkü uygulamanın elle yazılmış listesi de zorunlu dersleri temsil ediyor.
function referansOgm(dosya, tabloAdi, sadeceGruplar) {
    const j = JSON.parse(fs.readFileSync(path.join(KOK, "data/kaynak_cizelgeler", dosya), "utf8"));
    const t = (j.tablolar || []).find((x) => x.tablo_adi === tabloAdi);
    if (!t) throw new Error("tablo bulunamadi: " + tabloAdi);
    const cikti = {};
    for (const grup of t.gruplar || []) {
        if (sadeceGruplar && !sadeceGruplar.includes(grup.grup_adi)) continue;
        for (const d of grup.dersler || []) {
            for (const [sinif, deger] of Object.entries(d.saatler || {})) {
                if (!deger || typeof deger.saat !== "number") continue;
                (cikti[sinif] = cikti[sinif] || {})[esle(d.ders_adi)] =
                    { saat: deger.saat, ad: d.ders_adi };
            }
        }
    }
    // Rehberlik ve Yönlendirme çizelgede ayrı satırda duruyor
    // DİKKAT: bu alan {"9":{tip,saat}} biçimindedir, {saatler:{...}} DEĞİL.
    // Yanlış okunursa uygulamada haklı olarak bulunan ders "fazla" görünür.
    const reh = t.rehberlik_ve_yonlendirme;
    if (reh) {
        for (const [sinif, deger] of Object.entries(reh)) {
            if (!deger || typeof deger.saat !== "number") continue;
            // Anahtar ELLE yazılmaz; esle() ile üretilir (Türkçe "ö" tutmuyordu).
            (cikti[sinif] = cikti[sinif] || {})[esle("Rehberlik ve Yönlendirme")] =
                { saat: deger.saat, ad: "Rehberlik ve Yönlendirme" };
        }
    }
    return {
        veri: cikti,
        belge: (j.meta && j.meta.konu) || tabloAdi,
        yururluk: (j.meta && j.meta.karar_tarihi) || "-",
        gruplar: (t.gruplar || []).map((g) => g.grup_adi),
        toplam: t.toplam_ders_saati,
    };
}

// ---------------------------------------------------------------- 1) İHO
karsilastir(
    "İMAM HATİP ORTAOKULU  (IHO_CURRICULUM, curriculumEngine.js:472)",
    "imam_hatip_ortaokulu", [5, 6, 7, 8],
    referansCizelge("dogm/imam_hatip_ortaokulu.json")
);

// ---------------------------------------------------------------- 2) ANADOLU
const anadolu = referansOgm("ogm/sayi05_anadolu_fen_sosyalbilimler.json",
                            "Anadolu Lisesi", ["ORTAK DERSLER"]);
console.log("\n[bilgi] Anadolu Lisesi çizelgesindeki gruplar: %s",
            anadolu.gruplar.join(" | "));
console.log("[bilgi] Çizelgenin kendi toplam ders saati: %s",
            JSON.stringify(anadolu.toplam));
karsilastir(
    "ANADOLU LİSESİ — ortak dersler  (ANADOLU_CURRICULUM, curriculumEngine.js:847)",
    "anadolu_lisesi", [9, 10, 11, 12],
    anadolu
);

// ---------------------------------------------------------------- özet
console.log("\n" + "=".repeat(72));
if (!BULGULAR.length) {
    console.log("FARK BULUNAMADI.");
} else {
    console.log("TOPLAM %d SINIF SEVİYESİNDE FARK VAR", BULGULAR.length);
    for (const b of BULGULAR) {
        console.log("  %s / %d. sınıf : %d eksik, %d fazla, %d saat farkı (toplam %d vs %d)",
            b.baslik.split("(")[0].trim(), b.sinif,
            b.eksik.length, b.fazla.length, b.farkli.length, b.tRef, b.tUyg);
    }
}
console.log("=".repeat(72));
