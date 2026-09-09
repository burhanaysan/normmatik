/* ===========================================================================
   NormMatik™ — Md. 18 norm cetveli testi
   ===========================================================================
   NEDEN VAR (Search Console, 3 aylık veri, 09.09.2026)
   ---------------------------------------------------
   "norm tablosu" (10 gösterim), "norm hesaplama çizelgesi" (6), "norm
   hesaplama tablosu" (4), "norm hesaplama cetveli" (2), "norm kadro
   tablosu" (1) = 23 gösterim, 0 tıklama. Arayan kişi kural cümlesi değil,
   bakıp okuyacağı bir cetvel istiyor. norm-kadro-hesaplama.html'e Md. 18
   için böyle bir cetvel kondu.

   Cetvelin aralıkları elle yazıldı; motorun formülünden TÜRETİLMEDİ. Bu test
   ikisinin ayrışmasını engeller: sayfadaki her aralığın her iki ucu ve içinden
   bir nokta, motorun verdiği normla karşılaştırılır. Ayrıca aralıkların
   0-200 saat arasını BOŞLUKSUZ kapladığı doğrulanır.

   Çalıştırma:  node tools/test_normCetveli.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import { NormEngine } from "../js/normEngine.js";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const SAYFA = path.join(KOK, "norm-kadro-hesaplama.html");
const engine = new NormEngine();

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

const norm = (s) => engine.calculateGeneralSubjectNorm(s).normCount;

/* Sayfadaki cetvelin BİREBİR kopyası. Sayfa değişirse burası da değişmeli;
   aşağıdaki "sayfada gerçekten yazıyor mu" kontrolü bunu zorlar. */
const CETVEL = [
    { metin: "6 saatin altı", alt: 0,   ust: 5,   norm: 0 },
    { metin: "6-30 saat",     alt: 6,   ust: 30,  norm: 1 },
    { metin: "31-56 saat",    alt: 31,  ust: 56,  norm: 2 },
    { metin: "57-77 saat",    alt: 57,  ust: 77,  norm: 3 },
    { metin: "78-98 saat",    alt: 78,  ust: 98,  norm: 4 },
    { metin: "99-119 saat",   alt: 99,  ust: 119, norm: 5 },
    { metin: "120-140 saat",  alt: 120, ust: 140, norm: 6 },
];

/* ---- 1) Her satırın iki ucu ve ortası motorla uyuşuyor mu? ------------ */
for (const s of CETVEL) {
    const orta = Math.floor((s.alt + s.ust) / 2);
    for (const saat of [s.alt, orta, s.ust]) {
        kontrol(`${s.metin}: ${saat} saat -> ${s.norm} norm`,
            norm(saat) === s.norm, `motor ${norm(saat)} verdi`);
    }
}

/* ---- 2) Aralıklar bitişik mi, boşluk/çakışma var mı? ------------------ */
for (let i = 1; i < CETVEL.length; i++) {
    kontrol(`aralık bitişikliği: ${CETVEL[i - 1].metin} / ${CETVEL[i].metin}`,
        CETVEL[i].alt === CETVEL[i - 1].ust + 1,
        `${CETVEL[i - 1].ust} + 1 != ${CETVEL[i].alt}`);
}

/* ---- 3) 0-140 saatin TAMAMI cetvelde karşılık buluyor mu? ------------- */
for (let s = 0; s <= 140; s++) {
    const satir = CETVEL.find((x) => s >= x.alt && s <= x.ust);
    kontrol(`kapsam: ${s} saat bir satıra düşüyor`, !!satir);
    if (satir) {
        kontrol(`kapsam doğru: ${s} saat`, norm(s) === satir.norm,
            `cetvel ${satir.norm}, motor ${norm(s)}`);
    }
}

/* ---- 4) "Sonrası: her 21 saatte 1" iddiası doğru mu? ------------------ */
// 140'tan sonra basamaklar 21 saatte bir ilerlemeli: 141, 162, 183, 204...
for (let k = 0; k < 6; k++) {
    const esik = 141 + k * 21;
    kontrol(`21 saatlik ritim: ${esik} saat -> ${7 + k} norm`,
        norm(esik) === 7 + k, `motor ${norm(esik)} verdi`);
    kontrol(`21 saatlik ritim: ${esik - 1} saat -> ${6 + k} norm`,
        norm(esik - 1) === 6 + k, `motor ${norm(esik - 1)} verdi`);
}

/* ---- 5) Sayfada anlatılan 56/57 örneği ------------------------------- */
kontrol("örnek: 56 saat -> 2 norm", norm(56) === 2, String(norm(56)));
kontrol("örnek: 57 saat -> 3 norm", norm(57) === 3, String(norm(57)));

/* ---- 6) Cetvel gerçekten SAYFADA yazıyor mu? ------------------------- */
const html = fs.readFileSync(SAYFA, "utf8");
for (const s of CETVEL) {
    kontrol(`sayfada var: "${s.metin}"`, html.includes(`<td>${s.metin}</td>`));
    const beklenen = s.norm === 0 ? "Norm verilmez" : String(s.norm);
    kontrol(`sayfada doğru norm: ${s.metin} -> ${beklenen}`,
        html.includes(`<td>${s.metin}</td><td class="sayi">${beklenen}</td>`));
}
kontrol('sayfada var: "Sonrası / her 21 saatte 1"',
    html.includes('<td>Sonrası</td><td class="sayi">her 21 saatte 1</td>'));

/* ---- SONUÇ ----------------------------------------------------------- */
if (hatalar.length) {
    console.log(`\n❌ ${hatalar.length} KONTROL BAŞARISIZ (${gecen} geçti)\n`);
    hatalar.forEach((h) => console.log("   • " + h));
    process.exit(1);
}
console.log(`\n✅ Md. 18 norm cetveli: ${gecen} kontrolün tamamı geçti.`);
console.log("   Sayfadaki cetvel ile motorun hesabı birebir örtüşüyor.");
