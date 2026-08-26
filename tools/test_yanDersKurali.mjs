/*
 * YAN DERS KURALI TESTİ
 * =====================
 * Norm Kadroya Esas Dersler Çizelgesi bazı dersleri bir branşın "norma dahil"
 * listesine yazar, ama o ders okulun asıl dersi değildir:
 *
 *     Sağlık Bilgisi ve Trafik Kültürü  ->  Sağlık / Sağlık Hizmetleri
 *     Trafik Güvenliği (İlkokul)        ->  Beden Eğitimi
 *
 * Bu dersler tek başlarına norm İHTİYACI doğurmamalıdır. Sahadaki karşılığı:
 * idareci, elinde o branştan öğretmen yoksa dersi boş bırakır (kullanıcı
 * teyidi, 27.08.2026). Ama okulda o branştan öğretmen VARSA saat onun normuna
 * sayılır — çizelge bunu açıkça söylüyor.
 *
 * NEDEN KALICI TEST: kural iki yönlü ve iki yönü de sessizce bozulabilir.
 *   - "yoksa gizle" bozulursa: 6 şubeli her Anadolu Lisesi'nde olmayan bir
 *     "sağlık öğretmeni ihtiyacı" görünür.
 *   - "varsa say" bozulursa: gerçek bir norm susturulmuş olur — ki bu daha
 *     tehlikelidir, çünkü ekranda hiçbir iz bırakmaz.
 *
 * Çalıştırma: node tools/test_yanDersKurali.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8")
    .replace(/^export /gm, "");

let gecti = 0;
const hatalar = [];
function kontrol(ad, olan, beklenen) {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${beklenen}   bulunan: ${olan}`);
}

function okulKur(tur, sinif, subeSayisi, ogretmenler) {
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
    vm.createContext(ctx); vm.runInContext(KAYNAK, ctx);
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
    };
    const st = w.appState, ce = w.curriculumEngine;
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = tur;
    for (let i = 0; i < subeSayisi; i++)
        st.addSection({
            subeAdi: sinif + "-" + "ABCDEFGH"[i], sinifSeviyesi: sinif, ogrenciSayisi: 30,
            zorunluDersler: ce.getMandatoryCourses(tur, sinif, null, null)
        });
    const saat = st.state.subeler.reduce((t, s) =>
        t + (s.zorunluDersler || []).reduce((a, d) => a + d.saat, 0), 0);
    const r = w.normEngine.calculateSchoolNorms(
        st.state.subeler, ogretmenler, tur, {});
    return { rapor: r.branchReport || [], saat, subeSayisi: st.state.subeler.length };
}

console.log("YAN DERS KURALI TESTİ");
console.log("=".repeat(66));

// --------------------------------------------------------------- geçerlilik
// Kurgu boşsa test hiçbir şeyi denetlemez ama "geçti" görünür. Önce kurgunun
// gerçekten dolu olduğu doğrulanır.
const on = okulKur("anadolu_lisesi", "9", 6, {});
console.log(`kurgu: ${on.subeSayisi} şube, ${on.saat} saat`);
if (on.subeSayisi !== 6 || on.saat <= 0) {
    console.log("!! KURGU GEÇERSİZ — test hiçbir şeyi denetlemiyor.");
    process.exit(1);
}

const brans = (o, ad) => o.rapor.find(b => b.branchName === ad);

// ------------------------------------------- Sağlık Bilgisi / Anadolu Lisesi
console.log("\n── Sağlık Bilgisi ve Trafik Kültürü (Anadolu Lisesi, 6 şube)");
{
    const yok = okulKur("anadolu_lisesi", "9", 6, {});
    const var_ = okulKur("anadolu_lisesi", "9", 6, { "Sağlık Hizmetleri": 1 });
    kontrol("öğretmen yokken branş listede görünmez",
        brans(yok, "Sağlık Hizmetleri") === undefined, true);
    const b = brans(var_, "Sağlık Hizmetleri");
    kontrol("öğretmen varken branş listede görünür", b !== undefined, true);
    kontrol("öğretmen varken saat normuna sayılır", b && b.totalHours, 6);
    kontrol("6 saat -> 1 norm (Madde 18 barajı)", b && b.calculatedNorm, 1);
    // Biyoloji bu saati ASLA almamalı (TTK kararı; kullanıcı teyidi)
    const bio = brans(yok, "Biyoloji");
    kontrol("Biyoloji yükü yalnızca Biyoloji dersinden (2 sa x 6 şube)",
        bio && bio.totalHours, 12);
}

// ------------------------------------------------ Trafik Güvenliği / İlkokul
console.log("── Trafik Güvenliği (İlkokul 4. sınıf, 6 şube)");
{
    const yok = okulKur("ilkokul", "4", 6, {});
    const var_ = okulKur("ilkokul", "4", 6, { "Beden Eğitimi": 1 });
    kontrol("öğretmen yokken Beden Eğitimi listede görünmez",
        brans(yok, "Beden Eğitimi") === undefined, true);
    const b = brans(var_, "Beden Eğitimi");
    kontrol("öğretmen varken Beden Eğitimi listede görünür", b !== undefined, true);
    kontrol("öğretmen varken saat normuna sayılır", b && b.totalHours, 6);
}

// ----------------------------------------------- kural fazla geniş olmamalı
// Asıl dersi olan bir branş, öğretmeni olmasa da listede KALMALI; aksi hâlde
// gerçek ihtiyaçlar gizlenir.
console.log("── Kural fazla geniş mi? (asıl dersler etkilenmemeli)");
{
    const yok = okulKur("anadolu_lisesi", "9", 6, {});
    for (const ad of ["Matematik", "Türk Dili ve Edebiyatı", "Biyoloji", "Kimya"]) {
        const b = brans(yok, ad);
        kontrol(`${ad}: öğretmen yokken de listede kalır`, b !== undefined, true);
        kontrol(`${ad}: ihtiyaç olarak gösterilir`,
            b && b.calculatedNorm > 0 ? b.statusText.includes("İhtiyaç") : true, true);
    }
}

console.log("\n" + "=".repeat(66));
if (!hatalar.length) {
    console.log(`✅ YAN DERS KURALI DOĞRU — ${gecti} kontrol başarılı, 0 hata`);
} else {
    console.log(`❌ ${hatalar.length} HATA (${gecti} kontrol geçti)`);
    hatalar.forEach(h => console.log(h));
}
console.log("=".repeat(66));
process.exit(hatalar.length ? 1 : 0);
