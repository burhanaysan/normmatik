/*
 * AYNI SEÇMELİ DERS İKİ KEZ EKLENEMEZ
 * ===================================
 * Kullanıcı bildirimi (08.09.2026): "aynı şubeye aynı seçmeli dersi 1'den
 * fazla ekleyebiliyorum, sistem 'zaten var' demiyor."
 *
 * SEBEBİ: karşılaştırma TAM METİN eşitliğiydi (`===`). Bu yüzden
 *     "Seçmeli Matematik"  /  "SEÇMELİ MATEMATİK"  /  "  seçmeli matematik  "
 * üç ayrı ders sayılıyordu. Üçü de branş yüküne ekleniyordu:
 *     3 kayıt, 12 saat   (doğrusu: 1 kayıt, 2 saat)
 * Norm bu yüzden olduğundan yüksek çıkıyor, ekranda hiçbir uyarı görünmüyordu.
 *
 * Bu dosya, hatanın geri gelmesini engeller. Kontroller iki katmanı da
 * denetler: veri katmanı (state.addElectiveCourse) ve seçmeli çekmecesinin
 * kaynak kodu (draftSelections artık ham ad ile anahtarlanmamalı).
 *
 * Çalıştırma: node tools/test_secmeliTekrar.mjs
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

let gecti = 0;
const hatalar = [];
const kontrol = (ad, olan, beklenen) => {
    if (olan === beklenen) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}\n      beklenen: ${JSON.stringify(beklenen)}   bulunan: ${JSON.stringify(olan)}`);
};
const dogru = (ad, kosul, ayrinti) => {
    if (kosul) { gecti++; return; }
    hatalar.push(`  ✗ ${ad}${ayrinti ? "\n      " + ayrinti : ""}`);
};

console.log("SEÇMELİ DERS TEKRARI TESTİ");
console.log("=".repeat(66));

/* ---- hazırlık --------------------------------------------------------- */
const st = ctx.window.appState;
st.loadDemoSchool(ctx.window.dbService, ctx.window.curriculumEngine);
// Demo kilidi seçmeli düzenlemeyi kapatıyor; test lisanslı okulu taklit eder.
ctx.window.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true
};

const sube = st.state.subeler[0];
const ekle = (ad, saat) => st.addElectiveCourse(sube.id, {
    ders: ad, saat, kategori: "SEÇMELİ DERSLER", atananBrans: "Matematik"
});
const saatToplami = () => sube.secmeliDersler.reduce((a, d) => a + (parseInt(d.saat, 10) || 0), 0);

/* ---- 1. Yazım farkları aynı ders sayılır ------------------------------ */
console.log("\n── 1. Aynı ders, farklı yazım");
sube.secmeliDersler = [];
const s1 = ekle("Seçmeli Matematik", 2);
const s2 = ekle("SEÇMELİ MATEMATİK", 4);
const s3 = ekle("  seçmeli   matematik  ", 6);

kontrol("ilk ekleme yeni kayıt açar", s1.eklendi, true);
kontrol("büyük harfli tekrar YENİ kayıt açmaz", s2.eklendi, false);
kontrol("boşluklu tekrar YENİ kayıt açmaz", s3.eklendi, false);
kontrol("şubede tek kayıt kaldı", sube.secmeliDersler.length, 1);
kontrol("saat son değere güncellendi", saatToplami(), 6);

/* ---- 2. Görünen ad resmî hâliyle kalır -------------------------------- */
console.log("── 2. Görünen ad korunuyor");
kontrol("resmî ad korundu (dağınık yazım rapora geçmez)",
    sube.secmeliDersler[0].ders, "Seçmeli Matematik");

sube.secmeliDersler = [];
ekle("  Seçmeli   Fizik  ", 2);
kontrol("yeni kayıtta fazla boşluklar temizlenir",
    sube.secmeliDersler[0].ders, "Seçmeli Fizik");

/* ---- 3. Farklı dersler ayrı kalır ------------------------------------- */
console.log("── 3. Farklı dersler birleşmiyor");
sube.secmeliDersler = [];
ekle("Seçmeli Matematik", 2);
ekle("Seçmeli Fizik", 2);
ekle("Seçmeli Kimya", 2);
kontrol("üç farklı ders üç kayıt", sube.secmeliDersler.length, 3);

// Adları birbirine yakın ama AYRI olan dersler ezilmemeli.
sube.secmeliDersler = [];
ekle("Seçmeli Matematik", 2);
ekle("Matematik Uygulamaları", 2);
kontrol("benzer adlı iki ders ayrı kalır", sube.secmeliDersler.length, 2);

/* ---- 4. Silme, ekleme ile aynı anahtarı kullanır ---------------------- */
console.log("── 4. Silme ve ekleme aynı anahtarda");
sube.secmeliDersler = [];
ekle("Seçmeli Matematik", 2);
st.removeElectiveCourse(sube.id, "SEÇMELİ matematik");
kontrol("farklı yazımla silme çalışıyor", sube.secmeliDersler.length, 0);

// Türkçe harfleri tamamen atan eski sadeleştirme, farklı dersleri aynı
// anahtara düşürebiliyordu. Anahtar üreticinin bunları ayırdığını doğrula.
const A = st._secmeliAnahtar.bind(st);
kontrol("anahtar: büyük/küçük harf farkı yok yok sayılır",
    A("Seçmeli Matematik") === A("SEÇMELİ MATEMATİK"), true);
dogru("anahtar: farklı dersler farklı anahtar üretir",
    A("Seçmeli Matematik") !== A("Seçmeli Fizik"));
dogru("anahtar: Türkçe harfler bilgi kaybına yol açmıyor",
    A("Çevre Eğitimi") !== A("Evre Eitimi"),
    A("Çevre Eğitimi") + "  vs  " + A("Evre Eitimi"));

/* ---- 5. Yük hesabına yansıyor mu -------------------------------------- */
console.log("── 5. Norm hesabına etkisi");
sube.secmeliDersler = [];
ekle("Seçmeli Matematik", 2);
ekle("SEÇMELİ MATEMATİK", 2);
ekle("Seçmeli Matematik ", 2);
const ne = ctx.window.normEngine;
const re = new ctx.window.MebReportsEngine(ctx.window.dbService, ne, ctx.window.curriculumEngine);
const rapor = ne.calculateSchoolNorms(
    [sube], {}, st.state.okulBilgisi.okulTuru, re.buildCoordinatorMap(st.state));
const mat = rapor.branchReport.find(x => x.branchName === "Matematik");
dogru("tekrar eden ders branş yükünü şişirmiyor",
    !!mat && mat.totalHours < 100,
    mat ? ("Matematik yükü: " + mat.totalHours + " saat") : "Matematik branşı bulunamadı");
kontrol("şubede yine tek seçmeli kayıt var", sube.secmeliDersler.length, 1);

/* ---- 6. Seçmeli çekmecesi de anahtarla çalışıyor ---------------------- */
console.log("── 6. Seçmeli çekmecesi (kaynak denetimi)");
const UIsrc = fs.readFileSync(path.join(KOK, "js", "uiComponents.js"), "utf8");
const cekmece = UIsrc.slice(UIsrc.indexOf("openElectiveCourseDrawer"),
                            UIsrc.indexOf("applyElectivePreset"));

dogru("çekmece sadeleştirilmiş anahtar kullanıyor",
    /const anahtar = \(ad\) => this\.state\._secmeliAnahtar\(ad\)/.test(cekmece));
kontrol("taslak Map'i ham ders adıyla anahtarlanmıyor",
    /draftSelections\.(set|get|has|delete)\(\s*(cName|item\.ders|courseName)\s*[,)]/.test(cekmece),
    false);
dogru("elle ders eklemede 'zaten seçili' uyarısı var",
    /zaten seçili/.test(cekmece));

/* ---- sonuç ------------------------------------------------------------ */
console.log("\n" + "=".repeat(66));
if (hatalar.length) {
    console.log(`❌ SEÇMELİ TEKRARI HATALI — ${hatalar.length} hata:`);
    hatalar.forEach(h => console.log(h));
    console.log("-".repeat(66));
    console.log(`${gecti} kontrol başarılı, ${hatalar.length} hata`);
    process.exit(1);
}
console.log(`✅ AYNI DERS İKİ KEZ EKLENEMİYOR — ${gecti} kontrol başarılı, 0 hata`);
console.log("=".repeat(66));
