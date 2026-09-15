/* ===========================================================================
   NormMatik — KOORDİNATÖRLÜK BRANŞLARI   (14.09.2026)

   NEDEN VAR
   ---------
   Kullanıcı bulgusu: "koordinatörlük sekmesinde meslekî branşların (alanların)
   hepsi yoktu." Ölçüldü: ekran okul ALANININ adından "Alanı" kelimesini atıp
   öğretmen BRANŞI arıyordu. İkisi çoğu zaman aynı ad değil:

       Bilişim Teknolojileri Alanı  -> branş kültür listesinde -> satır YOKTU
       Kimya Teknolojisi Alanı      -> branş "Kimya / Kimya Teknolojisi"
       Otomotiv Teknolojileri Alanı -> branş "Motorlu Araçlar Teknolojisi"
       Marmara Gastronomi ... Alanı -> branş "Yiyecek İçecek Hizmetleri"

   Başka bir araçta yapılan ilk düzeltme belirtiyi örtmek için branş listesine
   okul alanı adları ekledi, resmî "Kimya / Kimya Teknolojisi" adını değiştirdi
   ve resmî "Matbaa Teknolojisi" branşını sildi. Bunlar TTKB Öğretmenlik
   Alanları, Atama ve Ders Okutma Esasları'ndaki 90 resmî alanla çelişir.
   Çalışır hâlde denendi: dersi olmayan uydurma bir branşa yazılan
   koordinatörlük saati sağ panelde ayrı bir satır olur ve asıl branşın
   normuna girmez.

   BU TEST ŞUNLARI BAĞLAR
     1. Koordinatörlük, alanın derslerini okutan GERÇEK branşa yazılır
        (norm motoru ve müfredat aynı cevabı verir).
     2. O branşlar uygulamanın tanıdığı branşlardır.
     3. Ekran aktif branşları motordan alır, adı kırparak tahmin etmez.
     4. Meslek branş listesi resmî adları korur, okul alanı adı içermez.

   15.09.2026: 12. sınıfa kendiliğinden yazılan +10 "koordinatörlük" kaldırıldı
   (Denetim N-11); yerini idarecinin girdiği ALAN / ATÖLYE ŞEFLİKLERİ aldı
   (Norm Kadro Yön. Md. 22/1-c-2, Ek Ders Kararı Md. 6/4). Branş eşlemesi
   kuralı aynen geçerli: şeflik saati alanın GERÇEK branşına yazılır.

   ÇALIŞTIRMA: node tools/test_koordinatorlukBranslari.mjs
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};

/* ---- uygulamayı yükle ------------------------------------------------- */
const w = {};
const bos = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
const ctx = {
    window: w, console: { log() {}, warn() {}, error() {} },
    localStorage: bos, sessionStorage: bos,
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
vm.runInContext(oku("js", "bundle.js"), ctx);

const ce = w.curriculumEngine || vm.runInContext("typeof curriculumEngine!=='undefined'?curriculumEngine:null", ctx);
const ne = w.normEngine || vm.runInContext("typeof normEngine!=='undefined'?normEngine:null", ctx);
const db = w.dbService || vm.runInContext("typeof dbService!=='undefined'?dbService:null", ctx);
if (!ce || !ne || !db) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: motorlar paketten çıkmadı.");
    process.exit(1);
}

const TUR = "mesleki_ve_teknik_anadolu_lisesi";
const sube12 = (alanId) => ({
    id: "s_" + alanId, subeAdi: "12-" + alanId, sinifSeviyesi: "12",
    ogrenciSayisi: 20, alanId,
    zorunluDersler: ce.getMandatoryCourses(TUR, "12", alanId, null) || [],
    secmeliDersler: [], rehberlikVarMi: true,
});

/* ---- 1-2) Koordinatörlük gerçek branşa yazılıyor ----------------------
   Beklenen branşlar curriculumEngine.AREA_BRANCH_MAP ile aynıdır ve 12.
   sınıf meslek dersleri de bu branşa atanır (14.09.2026'da ölçüldü). */
const BEKLENEN = {
    bilisim:  "Bilişim Teknolojileri",
    kimya:    "Kimya / Kimya Teknolojisi",
    otomotiv: "Motorlu Araçlar Teknolojisi",
    elektrik: "Elektrik-Elektronik Teknolojisi",
};
const ALAN_ADI_TUZAKLARI = {
    kimya: "Kimya Teknolojisi",
    otomotiv: "Otomotiv Teknolojileri",
};

for (const [alanId, brans] of Object.entries(BEKLENEN)) {
    const sube = sube12(alanId);
    kontrol(`${alanId}: 12. sınıf dersleri üretildi`, sube.zorunluDersler.length > 0,
        String(sube.zorunluDersler.length));

    const r0 = ne.calculateSchoolNorms([sube], {}, TUR, {});
    const otomatik = (r0.branchReport || [])
        .filter(x => (parseInt(x.coordinatorHours, 10) || 0) > 0 || (parseInt(x.seflikHours, 10) || 0) > 0)
        .map(x => x.branchName);
    kontrol(`${alanId}: şeflik girilmeden hiçbir branşa ek saat yazılmıyor`,
        otomatik.length === 0, otomatik.join(", "));

    // Müfredatın atadığı branş, ekranda işaretlenecek branşla aynı olmalı.
    const r = ne.calculateSchoolNorms([sube], {}, TUR,
        { adminOptions: { alanSefleri: { [brans]: 1 } } });
    const koord = (r.branchReport || [])
        .filter(x => (parseInt(x.seflikHours, 10) || 0) > 0)
        .map(x => x.branchName);
    const hedef = (r.branchReport || []).find(x => x.branchName === brans);

    kontrol(`${alanId}: alan şefliği "${brans}" branşına yazılıyor`,
        koord.includes(brans), koord.join(", ") || "(şeflik yok)");
    kontrol(`${alanId}: "${brans}" branşının 12. sınıf dersleri de var (ayrı satır açılmıyor)`,
        !!hedef && (hedef.courses || []).some(c => !c.isSeflik), hedef ? String((hedef.courses || []).length) : "-");
    kontrol(`${alanId}: "${brans}" uygulamanın tanıdığı bir branş`,
        ce.isKnownBranch(brans) === true);
    if (ALAN_ADI_TUZAKLARI[alanId]) {
        kontrol(`${alanId}: alan adı "${ALAN_ADI_TUZAKLARI[alanId]}" ayrı satır DEĞİL`,
            !koord.includes(ALAN_ADI_TUZAKLARI[alanId]), koord.join(", "));
    }
}

/* ---- 3) Ekran aktif branşları motordan alıyor ------------------------- */
{
    const ui = oku("js", "uiComponents.js");
    const bas = ui.indexOf("openTeacherStaffModal() {");
    const govde = bas >= 0 ? ui.slice(bas, ui.indexOf("const modalHtml", bas)) : "";
    kontrol("kadro penceresi bulundu", govde.length > 0);
    kontrol("aktif branşlar norm motorundan hesaplanıyor",
        /calculateSchoolNorms\(subeler, \{\}, schoolType, \{\}\)/.test(govde));
    kontrol("alan adından 'Alanı' kırpılarak branş tahmin EDİLMİYOR",
        !/replace\(\/\\s\*ALANI\$\/i/.test(govde));
    kontrol("liste = meslek branşları + alan branşları + aktif branşlar (+ girilmiş şeflikler)",
        /new Set\(\[\.\.\.vocBranches, \.\.\.alanBranslari, \.\.\.activeVocBranchesSet,/.test(govde));
    kontrol("şeflik saatleri ekranda motorun tek hesabından",
        /this\.normEngine\.seflikSaatleri\(/.test(govde));
    kontrol("alan branşları müfredat motorundan geliyor (elle yazılmıyor)",
        /this\.curriculum\.koordinatorlukBranslari\(\)/.test(govde));
    kontrol("varsayılan saat sabit 10 değil, motorun hesabı",
        /varsayilanKoordinatorluk\[bName\]/.test(govde)
        && !/\(isActive \? 10 : 0\)/.test(govde));
}

/* ---- 3b) Liste TAM: okulda o alan olmasa da branş satırı var ----------
   Kullanıcı isteği (14.09.2026): "koordinatörlük listesi de tam olsun".
   Liste = meslek branşları + her okul alanının derslerini okutan tanınmış
   branş. Bilişim Teknolojileri kültür listesinde durduğu için eskiden hiç
   görünmüyordu. */
{
    const alan = typeof ce.koordinatorlukBranslari === "function" ? ce.koordinatorlukBranslari() : null;
    kontrol("müfredat motoru koordinatörlük branşlarını veriyor", Array.isArray(alan),
        String(alan));
    const tam = new Set([...(db.getVocationalBranchesList() || []), ...(alan || [])]);
    for (const b of ["Bilişim Teknolojileri", "Yiyecek İçecek Hizmetleri", "Uçak Bakım",
                     "Motorlu Araçlar Teknolojisi", "Kimya / Kimya Teknolojisi",
                     "Endüstriyel Otomasyon Teknolojileri"]) {
        kontrol(`tam listede: ${b}`, tam.has(b));
    }
    kontrol("tanınmayan hedef listeye girmiyor: Mesleki Gelişim",
        !(alan || []).includes("Mesleki Gelişim"));
    const tanimsiz = (alan || []).filter(b => ce.isKnownBranch(b) !== true);
    kontrol("alan branşlarının hepsi tanınmış branş", tanimsiz.length === 0,
        tanimsiz.join(", "));
    // Her alanın koordinatörlük branşı tam listede olmalı: hiçbir alan
    // "branşı listede yok" diye koordinatörsüz kalmasın.
    const eksik = [];
    for (const [alanId, brans] of Object.entries(ce.AREA_BRANCH_MAP || {})) {
        if (ce.isKnownBranch(brans) && !tam.has(brans)) eksik.push(alanId + " -> " + brans);
    }
    kontrol("her alanın branşı koordinatörlük listesinde", eksik.length === 0,
        eksik.join(" | "));
}

/* ---- 4) Meslek branş listesi resmî adları koruyor --------------------- */
{
    const liste = db.getVocationalBranchesList();
    for (const resmi of ["Kimya / Kimya Teknolojisi", "Matbaa Teknolojisi"]) {
        kontrol(`resmî branş listede: ${resmi}`, liste.includes(resmi));
    }
    // TTKB'nin 90 resmî öğretmenlik alanında YOK; bunlar OKUL ALANI adları.
    // Dersleri Yiyecek İçecek Hizmetleri, Endüstriyel Otomasyon, Uçak Bakım
    // ve Motorlu Araçlar branşlarına atanır (AREA_BRANCH_MAP).
    for (const alanAdi of ["Doğu Anadolu Gastronomi ve Mutfak Sanatları",
                           "Marmara Gastronomi ve Mutfak Sanatları",
                           "Endüstriyel Kalite Kontrol",
                           "Havacılık ve Uzay Teknolojisi",
                           "Otomotiv Teknolojileri"]) {
        kontrol(`okul alanı adı branş listesinde DEĞİL: ${alanAdi}`, !liste.includes(alanAdi));
    }
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ KOORDİNATÖRLÜK BRANŞLARI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ KOORDİNATÖRLÜK BRANŞLARI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
