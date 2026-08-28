/* ===========================================================================
   NormMatik™ — e-Okul içe aktarma testi
   ===========================================================================
   NE DENETLER: e-Okul'dan indirilen Excel dosyasından şube/alan/öğrenci
   bilgisinin doğru okunması ve ALANIN DOĞRU EŞLEŞMESİ.

   NEDEN VAR
   ---------
   Alan eşleştirme, elle yazılmış 36 alanlık bir anahtar kelime tablosuna
   bakıyordu; veri tabanında 58 alan var. Ölçüldü (28.08.2026): 58 alandan
   yalnızca 35'i doğru eşleşiyor, 14'ü hiç eşleşmiyor, 9'u YANLIŞ alana
   gidiyordu. En ağırı:

       "Grafik ve Fotoğraf Alanı"  ->  "Motorlu Araçlar Teknolojisi Alanı"

   çünkü anahtar kelimelerden biri "oto" idi ve "fotograf" kelimesinin içinde
   geçiyordu. O şube grafik yerine otomotiv müfredatı alıyor, ekranda hiçbir
   uyarı çıkmıyordu. Benzer şekilde "yapı" -> Gemi Yapımı'nı İnşaat'a,
   "metal" -> Metalürji'yi Metal'e gönderiyordu.

   Artık önce RESMÎ AD karşılaştırılıyor (e-Okul alanı tam adıyla yazar),
   anahtar kelime tahmini en sona kalıyor ve kısa anahtarlar eleniyor.

   ÖLÇÜM GEÇERLİLİĞİ: örnek dosya gerçekten okundu mu, kaç şube çıktı, alan
   listesi doldu mu — hepsi ayrıca doğrulanır.
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const ORNEK = path.join(KOK, "..", "06_ornek_veriler",
    "oog01001r076_818_sube_listesi_dal_bilgili_.xls");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};
function olumcul(m) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + m);
    console.log("   (Test hiçbir şeyi denetlemedi; 'hata yok' anlamsız olurdu.)");
    process.exit(1);
}

/* ---- uygulamayı yükle (XLSX motoru dâhil) ----------------------------- */
const w = {};
const ctx = {
    window: w, self: w, console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    navigator: { userAgent: "node" }, location: { href: "x" },
    screen: { width: 1920, height: 1080 },
    setTimeout, clearTimeout, setInterval, clearInterval,
    crypto: { getRandomValues: (a) => a },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
    alert() {},
};
ctx.globalThis = ctx;
w.dispatchEvent = () => true;
w.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "xlsx.full.min.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);

w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;

const IMP = vm.runInContext("EOkulImporter", ctx);
if (!IMP) olumcul("EOkulImporter sınıfı bulunamadı.");
const imp = new IMP(w.dbService, w.curriculumEngine);

const alanlar = w.dbService.getVocationalAreas("mesleki_ve_teknik_anadolu_lisesi");
if (alanlar.length < 40)
    olumcul("meslek alanı listesi yalnızca " + alanlar.length + " kayıt.");

/* ---- 1) 58 gerçek alan adı doğru eşleşiyor mu? ------------------------ */
// e-Okul alanı BÜYÜK HARFLE ve tam adıyla yazar; test de öyle sorar.
let yanlisSayisi = 0;
for (const a of alanlar) {
    const m = imp.matchVocationalArea(a.name.toUpperCase());
    if (!m || m.id !== a.id) yanlisSayisi++;
    kontrol("alan eşleşmesi: " + a.name,
        !!m && m.id === a.id,
        m ? "→ " + m.name : "hiç eşleşmedi");
}
kontrol("hiçbir alan yanlış eşleşmiyor", yanlisSayisi === 0,
    yanlisSayisi + " alan hatalı");

/* ---- 2) Eski hatanın imzası: kısa anahtar kelime tuzakları ------------ */
// Bu üç ad, eski eşleştiricinin YANLIŞ sonuç verdiği hâllerdir. Bir daha
// aynı hataya düşülürse burada kırmızı yanar.
for (const [ad, olmamali] of [
    ["GRAFİK VE FOTOĞRAF ALANI", "motorluarac"],       // "oto" ⊂ "fotograf"
    ["GEMİ YAPIMI ALANI", "insaat"],                   // "yapı" ⊂ "yapımı"
    ["METALÜRJİ TEKNOLOJİSİ ALANI", "metal"],          // kısa ad uzun adı gölgeliyordu
    ["PLASTİK SANATLAR ALANI", "plastiktek"],
    ["LABORATUVAR HİZMETLERİ ALANI", "kimya"],
]) {
    const m = imp.matchVocationalArea(ad);
    kontrol("yanlış eşleşme geri gelmemiş: " + ad,
        !m || m.id !== olmamali,
        m ? "→ " + m.name : "");
}

/* ---- 3) Gerçek e-Okul dosyası uçtan uca okunuyor mu? ------------------ */
if (!fs.existsSync(ORNEK)) olumcul("örnek e-Okul dosyası bulunamadı: " + ORNEK);
const sonuc = imp.parseExcelData(fs.readFileSync(ORNEK));
if (!sonuc || !sonuc.sections || sonuc.sections.length === 0)
    olumcul("örnek dosyadan hiç şube çıkmadı.");

kontrol("rapor tipi R076 olarak tanındı",
    sonuc.schoolSummary.reportType === "OOG01001R076_DAL_BILGILI",
    sonuc.schoolSummary.reportType);
kontrol("şube sayısı 46", sonuc.schoolSummary.totalActiveSections === 46,
    String(sonuc.schoolSummary.totalActiveSections));
kontrol("öğrenci sayısı 565", sonuc.schoolSummary.totalStudents === 565,
    String(sonuc.schoolSummary.totalStudents));
kontrol("sınıf seviyeleri 9-12",
    ["9", "10", "11", "12"].every(g => sonuc.schoolSummary.grades.includes(g)),
    sonuc.schoolSummary.grades.join(","));
kontrol("özel eğitim şubeleri tanındı",
    sonuc.sections.filter(s => s.isSpecialEdu).length === 3,
    String(sonuc.sections.filter(s => s.isSpecialEdu).length));
kontrol("her şubenin mevcudu sıfırdan büyük",
    sonuc.sections.every(s => s.studentCount > 0));

// "ALANI YOK" yazan şubelere alan atanmamalı.
const alaniYok = sonuc.sections.filter(s => /ALANI YOK/i.test(s.rawText || ""));
kontrol("'ALANI YOK' şubeleri var (ölçüm geçerli)", alaniYok.length > 0);
kontrol("'ALANI YOK' şubelerine alan atanmıyor",
    alaniYok.every(s => !s.matchedAreaId),
    alaniYok.filter(s => s.matchedAreaId).map(s => s.subeAdi).join(", "));

// Alanı olan her şube gerçek bir alana eşleşmeli.
const alanli = sonuc.sections.filter(
    s => !s.isSpecialEdu && !/ALANI YOK/i.test(s.rawText || ""));
kontrol("alanlı şube var (ölçüm geçerli)", alanli.length >= 30,
    String(alanli.length));
const eslesmeyen = alanli.filter(s => !s.matchedAreaId);
kontrol("alanlı şubelerin hepsi eşleşti", eslesmeyen.length === 0,
    eslesmeyen.map(s => s.subeAdi + " [" + s.rawArea + "]").slice(0, 3).join(", "));

// Eşleşen kimlikler veri tabanında GERÇEKTEN var olmalı.
const gecerliIdler = new Set(alanlar.map(a => a.id));
const hayaletler = alanli.filter(s => s.matchedAreaId && !gecerliIdler.has(s.matchedAreaId));
kontrol("eşleşen alan kimlikleri veri tabanında var",
    hayaletler.length === 0,
    hayaletler.map(s => s.matchedAreaId).slice(0, 3).join(", "));

/* ---- 4) Okul türü süzgeci: yabancı alan kimliği yazılmamalı ----------- */
// Bir Anadolu Lisesi'ne meslek alanı yazılsaydı müfredat motoru o şubeyi
// meslek lisesi gibi hesaplardı ve hiçbir uyarı çıkmazdı.
{
    const st = w.appState;
    const sahteSubeler = [{
        tempId: "t1", rawText: "9. Sınıf / A Şubesi (BİLİŞİM TEKNOLOJİLERİ ALANI)",
        grade: "9", letter: "A", subeAdi: "9-A", studentCount: 30,
        boysCount: 15, girlsCount: 15, rawArea: "BİLİŞİM TEKNOLOJİLERİ ALANI",
        matchedAreaId: "bilisim", matchedAreaName: "Bilişim Teknolojileri Alanı",
        dalAdi: null, isSınavlı: false, isSpecialEdu: false,
    }];

    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    if (typeof w.licenseManager !== "undefined") {
        w.licenseManager.licenseStatus = {
            isValid: true, isMaster: true, isDemo: false,
            maxSections: -1, allowExport: true };
    }
    imp.applySectionsToState(st, JSON.parse(JSON.stringify(sahteSubeler)),
        "anadolu_lisesi", true);
    const eklenen = st.state.subeler[0];
    kontrol("Anadolu Lisesi'ne şube eklendi (ölçüm geçerli)", !!eklenen);
    if (eklenen) {
        kontrol("Anadolu Lisesi şubesine meslek alanı YAZILMIYOR",
            !eklenen.alanId, "alanId=" + eklenen.alanId);
        kontrol("Anadolu Lisesi şubesi kendi müfredatını aldı",
            (eklenen.zorunluDersler || []).length > 0,
            (eklenen.zorunluDersler || []).length + " ders");
    }

    // Meslek lisesinde AYNI alan korunmalı — süzgeç fazla geniş olmamalı.
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "mesleki_ve_teknik_anadolu_lisesi";
    imp.applySectionsToState(st, JSON.parse(JSON.stringify(sahteSubeler)),
        "mesleki_ve_teknik_anadolu_lisesi", true);
    const meslek = st.state.subeler[0];
    kontrol("meslek lisesinde alan korunuyor",
        !!meslek && meslek.alanId === "bilisim",
        meslek ? "alanId=" + meslek.alanId : "şube eklenmedi");
}

/* ---- 5) Düzeltme listesi tüm alanları içermeli ------------------------ */
// Ön izleme ekranındaki açılır liste eskiden 36 alan gösteriyordu; yanlış
// eşleşen bir şubeyi doğrusuna çevirmek mümkün değildi.
{
    const katalog = imp.getAreaCatalog("mesleki_ve_teknik_anadolu_lisesi");
    kontrol("düzeltme listesi veri tabanıyla aynı boyutta",
        katalog.length === alanlar.length,
        "katalog " + katalog.length + ", veri tabanı " + alanlar.length);
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ e-OKUL İÇE AKTARMA HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar.slice(0, 25)) console.log("   • " + h);
    if (hatalar.length > 25) console.log("   ... ve " + (hatalar.length - 25) + " tane daha");
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ e-OKUL İÇE AKTARMA DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
