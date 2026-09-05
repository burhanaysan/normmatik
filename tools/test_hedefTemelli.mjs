/* ===========================================================================
   NormMatik™ — "Hedef Temelli Destek Eğitimi" saat dağıtımı testi
   ===========================================================================
   NEDEN VAR (okul müdürü bildirimi + teyidi, 28.08.2026)
   -----------------------------------------------------
   "12. sınıfta 3 saatlik hakkı üçe bölüp 1'er saat farklı branşlardan
    veriyoruz." Teyit: okulun toplam yükü 3 saat kalıyor, 9 olmuyor.

   Çizelge açıklaması (TTKB, taslak DAMGASIZ iki belgeden doğrulandı —
   spor lisesi ve özel program fen lisesi çizelgeleri):
     "Hedef temelli destek eğitimi ... okul idarelerince planlamanın
      yapılacağı derstir. İçeriğinde Türk dili ve edebiyatı, fizik, kimya,
      biyoloji, tarih, coğrafya, felsefe, matematik, sosyoloji, psikoloji,
      mantık, birinci yabancı dil, çağdaş Türk ve dünya tarihi, T.C. inkılap
      tarihi ve Atatürkçülük, din kültürü ve ahlak bilgisi ile Türk kültür ve
      medeniyet tarihi derslerinden DERS BAŞINA EN AZ 1, EN FAZLA 3 SAAT
      verilerek ... program uygulanır."

   ÖNCEKİ DAVRANIŞ VE HATASI: ders "Hedef Temelli Destek Eğitimi" adında
   SAHTE BİR BRANŞA yazılıyordu. Böyle bir öğretmen branşı yok; o saatler
   hiçbir öğretmenin yüküne sayılmıyordu.

   EĞİK ÇİZGİLİ DERSLERDEN FARKI (karıştırılmamalı):
     "Görsel Sanatlar/Müzik" : 2 saat x 2 branş = 4 saat   (ÇARPAR)
     "Hedef Temelli"         : 3 saat -> 1+1+1  = 3 saat   (PAYLAŞTIRIR)
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti) => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti ? "  ->  " + ayrinti : ""));
};
function olumcul(m) {
    console.log("\n❌ ÖLÇÜM GEÇERSİZ: " + m);
    process.exit(1);
}

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
vm.runInContext(fs.readFileSync(path.join(KOK, "js", "bundle.js"), "utf8"), ctx);
w.dbService.masterData = JSON.parse(
    fs.readFileSync(path.join(KOK, "data", "meb_master_db.json"), "utf8"));
w.dbService.isLoaded = true;
w.licenseManager.licenseStatus = {
    isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };

const ce = w.curriculumEngine, ne = w.normEngine, st = w.appState;
const DERS = "HEDEF TEMELLİ DESTEK EĞİTİMİ";

if (typeof ne.hedefTemelliMi !== "function") olumcul("hedefTemelliMi yok.");
if (typeof st.updateCourseBranchDistribution !== "function")
    olumcul("updateCourseBranchDistribution yok.");

/* ---- 1) Kapsam listesi kaynaktan geldi mi? --------------------------- */
{
    const H = w.HEDEF_TEMELLI;
    kontrol("üretilmiş kapsam listesi yüklendi", !!H && Array.isArray(H.kapsamDersleri));
    if (H) {
        kontrol("16 ders okundu", H.kapsamDersleri.length === 16,
            String(H.kapsamDersleri.length));
        kontrol("saat sınırı 1-3", H.enAzSaat === 1 && H.enFazlaSaat === 3,
            H.enAzSaat + "-" + H.enFazlaSaat);
    }
    const k = ne.hedefTemelliBranslari();
    // 16 ders adı gerçek branşlara indirgenir: sosyoloji/psikoloji/mantık ->
    // Felsefe, inkılap tarihi/çağdaş tarih -> Tarih gibi.
    kontrol("kapsam branşa çözüldü (>=8)", k.branslar.length >= 8,
        String(k.branslar.length));
    for (const b of ["Matematik", "Fizik", "Kimya", "Tarih", "Felsefe",
        "Türk Dili ve Edebiyatı", "Din Kültürü ve Ahlak Bilgisi"]) {
        kontrol("kapsamda " + b, k.branslar.includes(b));
    }
    kontrol("kapsam dışı branş listeye girmemiş",
        !k.branslar.includes("Beden Eğitimi") && !k.branslar.includes("Müzik"),
        k.branslar.join(", "));
}

/* ---- 2) Ders tanınıyor mu? (Türkçe büyük harf tuzağı) ---------------- */
kontrol("BÜYÜK harfli ad tanınıyor", ne.hedefTemelliMi({ ders: DERS }));
kontrol("Başlık harfli ad tanınıyor",
    ne.hedefTemelliMi({ ders: "Hedef Temelli Destek Eğitimi" }));
kontrol("başka ders tanınmıyor", !ne.hedefTemelliMi({ ders: "Matematik" }));

/* ---- 3) Paylaştırma kuralları ---------------------------------------- */
{
    const dene = (saat, dag) => ne.dersiGenislet(
        { ders: DERS, saat, kategori: "SEÇMELİ DERSLER", bransDagilimi: dag });
    const toplam = (g) => g.reduce((a, x) => a + (x.saat || 0), 0);

    const a = dene(3, { "Matematik": 1, "Fizik": 1, "Kimya": 1 });
    kontrol("3 saat üç branşa bölünüyor", a.length === 3, a.length + " kayıt");
    kontrol("toplam ÇARPILMIYOR (3 saat)", toplam(a) === 3, toplam(a) + " saat");

    const b = dene(6, { "Matematik": 3, "Fizik": 3 });
    kontrol("6 saat 3+3 olarak dağıtılıyor", b.length === 2 && toplam(b) === 6,
        toplam(b) + " saat");

    // Hakkı aşan dağıtım kabul edilmemeli.
    const c = dene(3, { "Matematik": 3, "Fizik": 3 });
    kontrol("hakkı aşan pay eleniyor", toplam(c) <= 3, toplam(c) + " saat");

    // Mevzuat tavanı: ders başına en fazla 3 saat.
    const d = dene(6, { "Matematik": 5 });
    kontrol("ders başına 3 saat tavanı uygulanıyor", toplam(d) === 3,
        toplam(d) + " saat");

    // Kapsam dışı branş alınmamalı.
    const e = dene(3, { "Beden Eğitimi": 1, "Matematik": 1 });
    kontrol("kapsam dışı branş reddediliyor",
        e.length === 1 && e[0].atananBrans === "Matematik",
        e.map(x => x.atananBrans).join(", "));

    // Dağıtım yoksa ders olduğu gibi kalmalı (sessizce kaybolmamalı).
    const f = ne.dersiGenislet({ ders: DERS, saat: 3 });
    kontrol("dağıtım yokken ders kayboluyor mu", f.length === 1, f.length + " kayıt");
}

/* ---- 4) Norm hesabına yansıma + sahte branşın kalkması --------------- */
function kur() {
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    st.addSection({ subeAdi: "12-A", sinifSeviyesi: "12", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "12", null, null),
        secmeliDersler: [{ ders: DERS, saat: 3, kategori: "SEÇMELİ DERSLER",
            atananBrans: DERS }] });
    return st.state.subeler[0];
}
function rapor() {
    const r = ne.calculateSchoolNorms(st.state.subeler, {}, "anadolu_lisesi", {});
    const m = Object.fromEntries((r.branchReport || []).map(b => [b.branchName, b.totalHours]));
    return { m, toplam: (r.branchReport || []).reduce((a, b) => a + b.totalHours, 0) };
}

{
    const sec = kur();
    const once = rapor();
    kontrol("dağıtımdan önce sahte branş raporda (ölçüm geçerli)",
        !!once.m["Hedef Temelli Destek Eğitimi"],
        JSON.stringify(Object.keys(once.m)));
    kontrol("bu ad gerçek bir branş DEĞİL",
        !ce.isKnownBranch("Hedef Temelli Destek Eğitimi"));

    st.updateCourseBranchDistribution(sec.id, DERS,
        { "Matematik": 1, "Fizik": 1, "Kimya": 1 });
    const sonra = rapor();

    kontrol("dağıtımdan sonra sahte branş kalmıyor",
        !sonra.m["Hedef Temelli Destek Eğitimi"]);
    kontrol("Matematik 1 saat aldı", sonra.m["Matematik"] === 1, String(sonra.m["Matematik"]));
    kontrol("Fizik 1 saat aldı", sonra.m["Fizik"] === 1, String(sonra.m["Fizik"]));
    kontrol("Kimya 1 saat aldı", sonra.m["Kimya"] === 1, String(sonra.m["Kimya"]));
    kontrol("OKUL TOPLAMI DEĞİŞMİYOR (paylaştırma, çarpma değil)",
        sonra.toplam === once.toplam,
        once.toplam + " -> " + sonra.toplam);
}

/* ---- 5) Kaydet/yükle turunda korunuyor mu? --------------------------- */
{
    const sec = kur();
    st.updateCourseBranchDistribution(sec.id, DERS, { "Matematik": 2, "Tarih": 1 });
    const kopya = JSON.parse(JSON.stringify(st.state));
    st.state = kopya;
    st.sanitizeExistingState();
    const d = (st.state.subeler[0].secmeliDersler || [])
        .find(x => ne.hedefTemelliMi(x));
    kontrol("temizlik dağıtımı silmiyor",
        !!d && d.bransDagilimi && d.bransDagilimi["Matematik"] === 2,
        d ? JSON.stringify(d.bransDagilimi) : "-");
    const r = rapor();
    kontrol("yeniden yüklemede dağıtım geçerli",
        r.m["Matematik"] === 2 && r.m["Tarih"] === 3,
        "Mat " + r.m["Matematik"] + ", Tarih " + r.m["Tarih"] + " (Tarih'in 2 saati zorunlu dersten)");

    // Dağıtımı kaldırınca eski hâle dönmeli.
    st.updateCourseBranchDistribution(st.state.subeler[0].id, DERS, {});
    kontrol("dağıtım kaldırılınca sahte branş geri geliyor",
        !!rapor().m["Hedef Temelli Destek Eğitimi"]);
}

/* ---- 6) Demo kilidi -------------------------------------------------- */
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "anadolu_lisesi";
    for (let i = 0; i < 6; i++) {
        st.addSection({ subeAdi: "12-" + "ABCDEF"[i], sinifSeviyesi: "12", ogrenciSayisi: 30,
            zorunluDersler: [],
            secmeliDersler: [{ ders: DERS, saat: 3, kategori: "SEÇMELİ DERSLER",
                atananBrans: DERS }] });
    }
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: false, isDemo: true, maxSections: 3, allowExport: false };
    const kilitli = st.state.subeler[5];
    kontrol("6. şube demoda kilitli (ölçüm geçerli)", st.subeKilitliMi(kilitli.id) === true);
    st.updateCourseBranchDistribution(kilitli.id, DERS, { "Matematik": 1 });
    kontrol("kilitli şubede dağıtım yapılamıyor",
        !kilitli.secmeliDersler[0].bransDagilimi);
    w.licenseManager.licenseStatus = {
        isValid: true, isMaster: true, isDemo: false, maxSections: -1, allowExport: true };
}

/* ---- sonuç ------------------------------------------------------------ */
console.log("=".repeat(70));
if (hatalar.length) {
    console.log("❌ HEDEF TEMELLİ DAĞITIMI HATALI — " + hatalar.length + " hata:");
    for (const h of hatalar) console.log("   • " + h);
    console.log("-".repeat(70));
    console.log(gecen + " kontrol başarılı, " + hatalar.length + " hata");
    process.exit(1);
}
console.log("✅ HEDEF TEMELLİ DAĞITIMI DOĞRU — " + gecen + " kontrol başarılı, 0 hata");
console.log("=".repeat(70));
