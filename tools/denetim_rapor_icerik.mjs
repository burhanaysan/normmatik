/*
 * RAPOR İÇERİK DENETİMİ  (Cephe 3 — çökertme tatbikatı)
 * =====================================================
 * Hedef: js/bundle.js
 *
 * NEDEN VAR
 * ---------
 * 25-31.08.2026 arasında raporlar ekranı yeniden tasarlandı
 * (commit 1cf20aa "UI Trial 1: Minimalist & compact executive summary").
 * Mevcut rapor testi (test_raporlar.mjs) çizimin ÇÖKMEDİĞİNİ ve branş
 * sayılarının doğru bastığını denetliyor; ancak yeni tasarımın bir bilgiyi
 * SESSİZCE ÇIKARIP çıkarmadığını denetlemiyor.
 *
 * Bu betik motoru gerçekten çalıştırır, sonra motorun HESAPLADIĞI her
 * değerin raporun HTML çıktısında GÖRÜNÜP görünmediğine bakar.
 * "Hesaplanıyor ama gösterilmiyor" durumu burada yakalanır.
 *
 * Çalıştırma: node tools/denetim_rapor_icerik.mjs
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.join(__dirname, "..");

let gorunen = 0, kayip = 0;
const kayiplar = [];

function denetle(ad, kosul, ayrinti = "") {
    if (kosul) { gorunen++; console.log("  [VAR]   " + ad); }
    else {
        kayip++; kayiplar.push({ ad, ayrinti });
        console.log("  [KAYIP] " + ad + (ayrinti ? "   " + ayrinti : ""));
    }
}

// ---------------------------------------------------------------- ortam
const win = {};
const ctx = {
    window: win, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: a => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {}
};
ctx.globalThis = ctx;
win.dispatchEvent = () => true;
win.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(
    fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
        .replace(/^export /gm, ""), ctx);

const st = win.appState, ce = win.curriculumEngine;
win.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};

// ------------------------------------------------------------- test okulu
// Yönetici ve rehber öğretmen KARŞILAŞTIRMASININ üretilmesi için mevcut
// kadro sayıları BİLEREK normdan farklı verilir; böylece "Tam" değil,
// "Fazla" ve "İhtiyaç" etiketleri oluşur ve raporda görünmesi gerekir.
st.state = st.getDefaultState();
st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
st.state.okulBilgisi.okulAdi = "Test Anadolu Lisesi";
["9", "9", "10", "10", "11", "12", "12", "11"].forEach((g, i) =>
    st.addSection({
        subeAdi: g + "-" + "ABCDEFGH"[i], sinifSeviyesi: g, ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", g, null, null)
    }));
st.state.mevcutOgretmenler = { "Matematik": 5, "Türk Dili ve Edebiyatı": 1, "Fizik": 0 };
st.state.okulBilgisi.adminOptions = {
    ...(st.state.okulBilgisi.adminOptions || {}),
    mevcutRehberOgretmeni: 3,
    mevcutIdareciler: { mudur: 1, mudurBasyardimcisi: 1, mudurYardimcisi: 1, rehberOgretmeni: 3 }
};

const R = new win.MebReportsEngine(win.dbService, win.normEngine, win.curriculumEngine);
const UI = new win.UIComponentManager(win.dbService, st, win.normEngine, win.curriculumEngine);

console.log("RAPOR İÇERİK DENETİMİ");
console.log("=".repeat(72));
console.log("Soru: motorun hesapladığı her değer raporda GÖRÜNÜYOR mu?");
console.log("=".repeat(72));

const veri = R.generateExecutiveSummary(st.state);
const html = UI.renderExecutiveReport(veri, false) || "";
const an = veri.adminNorms, gn = veri.guidanceNorms;

// Sadece görünür metni denetle: HTML etiketleri ve stil değerleri
// (renk kodları, sınıf adları) "görünüyor" sayılmamalı.
const metin = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const gecer = (s) => metin.includes(String(s));

console.log("\n--- Motorun hesapladığı değerler ---");
if (an) {
    console.log(`  Yönetici normu : müdür ${an.mudur} · başyrd ${an.mudurBasyardimcisi} · ` +
        `mdr.yrd ${an.mudurYardimcisiTotal} (temel ${an.mudurYardimcisiBase} + ilave ${an.mudurYardimcisiExtra}) · toplam ${an.toplamYonetici}`);
    const k = an.karsilastirma;
    console.log(`  Karşılaştırma  : müdür "${k.mudur.etiket}" · başyrd "${k.mudurBasyardimcisi.etiket}" · ` +
        `mdr.yrd "${k.mudurYardimcisi.etiket}" · toplam "${k.toplam.etiket}"`);
}
if (gn) {
    console.log(`  Rehberlik      : norm ${gn.ilkNorm}+${gn.ilaveNorm} · eşik ${gn.esik} (${gn.esikMadde}) · ` +
        `aralık ${gn.aralik} · karşılaştırma "${gn.karsilastirma.etiket}"`);
}

console.log("\n--- A. Yönetici icmali: sayılar raporda görünüyor mu? ---");
if (!an) {
    denetle("A0  yönetici normu hiç üretilmiyor", false, "adminNorms yok");
} else {
    const k = an.karsilastirma;
    denetle("A1  müdür normu", gecer(an.mudur));
    // Müdür başyardımcısı ünvanı 2026-08-26'da kapatıldı; raporda GÖRÜNMEMELİ.
    denetle("A2  müdür başyardımcısı raporda YOK",
        an.mudurBasyardimcisiAktif === false
            ? !/Başyrd|Başyardımcı/i.test(metin)
            : gecer(an.mudurBasyardimcisi),
        "ünvan kapalı olmasına rağmen raporda geçiyor");
    denetle("A3  müdür yardımcısı toplamı", gecer(an.mudurYardimcisiTotal));
    denetle("A4  toplam yönetici normu", gecer(an.toplamYonetici));
    denetle("A5  müdür yrd. TEMEL/İLAVE ayrımı",
        gecer(`Temel: ${an.mudurYardimcisiBase}`) ||
        (gecer(an.mudurYardimcisiBase) && gecer(an.mudurYardimcisiExtra)),
        `temel ${an.mudurYardimcisiBase} + ilave ${an.mudurYardimcisiExtra} ayrı ayrı yazmıyor`);
    denetle("A6  MEVCUT yönetici sayıları (kaç kişi var)",
        gecer(`${k.mudur.mevcut} /`) || gecer(`${k.toplam.mevcut} /`),
        "mevcut kadro raporda hiç yok — sadece norm var");
    // DİKKAT: çıplak "Tam"/"Fazla" aranmaz — bu kelimeler BRANŞ
    // istatistiğinde de geçiyor ve kontrolü yanlış geçiriyordu.
    // Etiket, "mevcut / norm" ikilisinin yanında aranır.
    const yoneticiKiyas = [k.mudur,
            ...(an.mudurBasyardimcisiAktif === false ? [] : [k.mudurBasyardimcisi]),
            k.mudurYardimcisi, k.toplam]
        .some(c => metin.includes(`${c.mevcut} / ${c.norm}`) && metin.includes(c.etiket));
    denetle("A7  yönetici TAM/FAZLA/İHTİYAÇ etiketi", yoneticiKiyas,
        `beklenen "${k.toplam.mevcut} / ${k.toplam.norm} · ${k.toplam.etiket}" biçiminde bir kıyas`);
}

console.log("\n--- B. Rehberlik: sayılar raporda görünüyor mu? ---");
if (!gn) {
    denetle("B0  rehberlik normu hiç üretilmiyor", false, "guidanceNorms yok");
} else {
    denetle("B1  ilk norm", gecer(gn.ilkNorm));
    denetle("B2  ilave norm", gecer(gn.ilaveNorm));
    denetle("B3  eşik öğrenci sayısı", gecer(gn.esik));
    denetle("B4  eşiğin dayandığı YÖNETMELİK MADDESİ", gecer(gn.esikMadde),
        `motor "${gn.esikMadde}" diyor, raporda geçmiyor`);
    denetle("B5  ilave norm aralığı (her N öğrencide +1)", gecer(gn.aralik));
    denetle("B6  MEVCUT rehber öğretmen sayısı",
        gecer(`${gn.karsilastirma.mevcut} /`) ||
        metin.includes(`${gn.karsilastirma.mevcut} / ${gn.karsilastirma.norm}`),
        "mevcut rehber öğretmen sayısı raporda yok");
    const kr = gn.karsilastirma;
    denetle("B7  rehberlik TAM/FAZLA/İHTİYAÇ etiketi",
        metin.includes(`${kr.mevcut} / ${kr.norm}`) && metin.includes(kr.etiket),
        `beklenen "${kr.mevcut} / ${kr.norm} · ${kr.etiket}"`);
}

// ---------------------------------------------- Excel/CSV ile karşılaştır
// Aynı veri dışa aktarımda duruyor mu? Duruyorsa kayıp SADECE ekran/kâğıt
// raporunda demektir — yani veri değil, SUNUM kaybı.
console.log("\n--- C. Aynı bilgi Excel/CSV yolunda duruyor mu? ---");
const kaynak = fs.readFileSync(path.join(KOK, "js", "reportsEngine.js"), "utf8");
denetle("C1  Excel/CSV yönetici karşılaştırmasını yazıyor",
    /kr\s*\?\s*kr\.mudur\.etiket/.test(kaynak));
denetle("C2  Excel/CSV rehberlik karşılaştırmasını yazıyor",
    /gn\.karsilastirma\.etiket/.test(kaynak));

console.log("\n" + "=".repeat(72));
if (kayip === 0) {
    console.log(`✅ RAPOR EKSİKSİZ — ${gorunen} değerin hepsi görünüyor`);
} else {
    console.log(`⚠️  ${kayip} DEĞER HESAPLANIYOR AMA RAPORDA GÖRÜNMÜYOR (${gorunen} değer görünüyor)`);
    console.log("=".repeat(72));
    kayiplar.forEach(k => console.log("   • " + k.ad + (k.ayrinti ? "\n     " + k.ayrinti : "")));
}
console.log("=".repeat(72));
process.exit(kayip === 0 ? 0 : 1);
