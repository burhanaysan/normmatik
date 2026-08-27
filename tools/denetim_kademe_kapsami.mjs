/*
 * KADEME KAPSAM DENETİMİ
 * ======================
 * Uygulamanın SUNDUĞU her okul türü, gerçekten kendi resmî müfredatını
 * alıyor mu? Yoksa sessizce başka bir okulun çizelgesine mi düşüyor?
 *
 * NEDEN VAR
 * ---------
 * 27.08.2026'da ölçüldü: Fen Lisesi, Sosyal Bilimler Lisesi, Anadolu İmam
 * Hatip Lisesi, Güzel Sanatlar ve Spor Lisesi seçildiğinde motor SESSİZCE
 * Anadolu Lisesi müfredatını döndürüyordu. Bir Anadolu İmam Hatip Lisesi,
 * Kur'an-ı Kerim ve Arapça dersleri olmadan hesaplanıyordu.
 *
 * Hiçbir hata mesajı yoktu. Ekran doluydu, sayılar makuldü, sonuç yanlıştı.
 * Bu denetim tam olarak o sessizliği kırmak için var: yeni bir okul türü
 * eklendiğinde ya da bir çizelge bağlanmayı unutulduğunda burada kırmızı yanar.
 *
 * Çalıştırma: node tools/denetim_kademe_kapsami.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const w = {};
const ctx = {
    window: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: a => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8").replace(/^export /gm, ""), ctx);

const ce = w.curriculumEngine;
const db = w.dbService;

let gecti = 0;
const bulgular = [];
function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gecti++; return; }
    bulgular.push({ ad, ayrinti });
}

console.log("KADEME KAPSAM DENETİMİ");
console.log("=".repeat(76));

const turler = (db.getSchoolTypes && db.getSchoolTypes()) || [];
console.log("uygulamanın sunduğu okul türü: " + turler.length);
if (turler.length < 15) {
    console.log("!! okul türü listesi şüpheli derecede kısa — denetim geçersiz");
    process.exit(1);
}

// Alan/dal seçimi isteyen türler bu denetimin dışındadır: alan verilmeden
// ders listesi boş dönmesi doğrudur, hata değildir.
const ALAN_ISTEYENLER = new Set(turler.filter(t => t.hasAreas).map(t => t.id));
// Özel eğitim, kullanıcı kararıyla kapsam dışı.
const KAPSAM_DISI = new Set([...ALAN_ISTEYENLER, "ozel_egitim_meslek_okulu",
    "ozel_egitim_uygulama_okulu"]);

const imza = (tur, g) => (ce.getMandatoryCourses(tur, g, null, null) || [])
    .map(d => `${d.ders}#${d.saat}#${d.atananBrans}`).sort().join("|");

// Karşılaştırma tabanı: Anadolu Lisesi. Başka bir lise türü BUNUNLA birebir
// aynı listeyi veriyorsa, kendi çizelgesi yok demektir.
const TABAN = {};
for (const g of ["9", "10", "11", "12"]) TABAN[g] = imza("anadolu_lisesi", g);

console.log("\n%s %s %s", "OKUL TÜRÜ".padEnd(34), "DERS SAYISI".padEnd(22), "DURUM");
console.log("-".repeat(76));

for (const t of turler) {
    if (KAPSAM_DISI.has(t.id)) continue;
    const siniflar = (t.gradeLevels || []).filter(g => g !== "hazirlik");
    const sayilar = siniflar.map(g => (ce.getMandatoryCourses(t.id, g, null, null) || []).length);
    const bosVar = sayilar.some(n => n === 0);

    // Anadolu ile birebir aynı mı? (Anadolu'nun kendisi hariç)
    let ayni = false;
    if (t.id !== "anadolu_lisesi" && t.category === "OGM" || t.category === "DÖGM") {
        const ortak = siniflar.filter(g => TABAN[g]);
        ayni = t.id !== "anadolu_lisesi" && ortak.length > 0
            && ortak.every(g => imza(t.id, g) === TABAN[g]);
    }

    // HAZIRLIK SINIFLI TÜRLER İSTİSNA:
    // Hazırlıklı bir okulun 9-12 sütunları, hazırlıksız hâliyle ZATEN
    // aynıdır; resmî çizelgede yalnızca hazırlık sütunu eklenir. Bu yüzden
    // "Anadolu ile aynı" ölçütü onlar için yanılticidir. Onlarda bakılacak
    // şey, HAZIRLIK sınıfının dolu olup olmadığıdır.
    const hazirlikliMi = (t.gradeLevels || []).includes("hazirlik");
    let hazirlikSayisi = null;
    if (hazirlikliMi) {
        hazirlikSayisi = (ce.getMandatoryCourses(t.id, "hazirlik", null, null) || []).length;
        if (hazirlikSayisi > 0) ayni = false;   // kendi hazırlık çizelgesi var
    }

    let durum = "kendi çizelgesi";
    if (bosVar) durum = "!! BAZI SINIFLAR BOŞ";
    else if (ayni) durum = "!! ANADOLU LİSESİ'NE DÜŞÜYOR";
    else if (hazirlikliMi) durum = "kendi çizelgesi (hazırlık " + hazirlikSayisi + " ders)";

    if (hazirlikliMi) {
        denetle(`${t.id}: hazırlık sınıfı çizelgesi dolu`, hazirlikSayisi > 0,
            "hazırlık sınıfı için ders bulunamadı");
    }

    console.log("%s %s %s", t.id.padEnd(34),
        sayilar.join("/").padEnd(22), durum);

    denetle(`${t.id}: hiçbir sınıfı boş değil`, !bosVar,
        `sınıf başına ders: ${sayilar.join("/")}`);
    denetle(`${t.id}: Anadolu Lisesi'ne düşmüyor`, !ayni,
        "kendi resmî çizelgesi bağlanmamış olabilir");
}

console.log("-".repeat(76));
console.log("\n" + "=".repeat(76));
if (!bulgular.length) {
    console.log(`✅ HER OKUL TÜRÜ KENDİ ÇİZELGESİNİ ALIYOR — ${gecti} kontrol temiz`);
} else {
    console.log(`⚠️  ${bulgular.length} BULGU (${gecti} kontrol geçti)`);
    for (const b of bulgular)
        console.log("   • " + b.ad + (b.ayrinti ? "\n     " + b.ayrinti : ""));
}
console.log("=".repeat(76));
process.exit(bulgular.length ? 1 : 0);
