/* ===========================================================================
   NormMatik — DENETİM DALGA 3 DÜZELTMELERİ   (21.09.2026)

   NEDEN VAR
   ---------
   Dalga 3 (Y = müdür gözüyle, A = arayüz) bulgularından hakemce yeniden
   üretilenler düzeltildi (05_dokumantasyon/denetim_dalga3/HK/HAKEM_DALGA3.md).
   Kural: doğrulanmış her bulgu kalıcı teste dönüşür.

     Y-13  KRİTİK  Dersi kalmayan branşın öğretmeni MEVCUT toplamından ve norm
                   fazlası listesinden düşüyordu (gerçek okulda Müzik).
     Y-14          Şube düzenleme penceresi dalı boş açıyor, kaydedince silinirdi
                   ("YAZILIM GELİŞTİRME DALI" ↔ "Yazılım Geliştirme").
     Y-02/Y-03     Öğrenci sayısı -5 / 9999 ve boş/yinelenen şube adı kabul ediliyordu.
     Y-05          "Toplam Okul Yükü" ile satır toplamı arasındaki fark
                   (branşa verilmemiş Rehberlik saati) hiçbir yerde yazmıyordu.
     Y-08          Matriste Rehberlik "norm 0 · kadro tam" diyordu.
     Y-09          Rehber öğretmen açığı ihtiyaç/fazla raporuna hiç girmiyordu.
     Y-10          Üst çubuk/rapor dili Bakanlık sesiyle yazılmıştı.
     A-05          Çalışma alanı 1200 px'ten dar pencerede/telefonda kesiliyordu.
     A-06          1280 px'te "Çıkış" düğmesi görünmüyordu.
     A-12/Y-04     Demo kilidi reddettiği işlem için "güncellendi" de diyordu.

   DÜRÜSTLÜK NOTU: Node'da DOM yok. Motor ve rapor davranışı (Y-13, Y-05, Y-09,
   dalAnahtari) GERÇEKTEN çalıştırılıp ölçülür. Yalnızca ekrana/pencereye/CSS'e
   dokunan düzeltmeler (Y-02/03 doğrulama iletileri, A-05/06, A-12, Y-10 metinleri)
   KAYNAK DENETİMİdir: doğru kodun yerinde durduğunu korur, tarayıcıda çalıştığını
   kanıtlamaz; onlar hakem tarafından tarayıcıda ayrıca denendi.

   Testler YAYIMLANAN paketi (js/bundle.js) çalıştırır; kaynak düzenlendikten
   sonra `python -X utf8 tools/build_bundle.py` çalışmadan sonuç yanıltıcıdır.

   ÇALIŞTIRMA: node tools/test_denetimDalga3.mjs   (çıkış kodu 0 = geçti)
   ======================================================================== */
import fs from "fs";
import path from "path";
import url from "url";
import vm from "vm";

const KOK = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const oku = (...y) => fs.readFileSync(path.join(KOK, ...y), "utf8");

let gecen = 0;
const hatalar = [];
const kontrol = (ad, kosul, ayrinti = "") => {
    if (kosul) { gecen++; return; }
    hatalar.push(ad + (ayrinti !== "" ? "  ->  " + ayrinti : ""));
};

// ---------------------------------------------------------------- paket
async function paketYukle() {
    const w = {};
    const fetchSaplama = async (adres) => {
        const a = String(adres);
        if (/^https?:|^\/\//i.test(a)) return { ok: false, status: 0, json: async () => null, text: async () => "" };
        const yol = path.join(KOK, a.replace(/^\.\//, "").split("?")[0]);
        if (!yol.startsWith(KOK) || !fs.existsSync(yol)) return { ok: false, status: 404, json: async () => null, text: async () => "" };
        const m = fs.readFileSync(yol, "utf8");
        return { ok: true, status: 200, json: async () => JSON.parse(m), text: async () => m };
    };
    const bos = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    const ctx = {
        window: w, self: w, console: { log() {}, warn() {}, error() {}, info() {} }, fetch: fetchSaplama,
        localStorage: bos, sessionStorage: bos, navigator: { userAgent: "node" },
        location: { href: "x", hostname: "localhost" }, screen: { width: 1920, height: 1080 },
        setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
        crypto: { getRandomValues: (a) => a },
        CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o); } },
        alert() {}, confirm: () => true
    };
    ctx.globalThis = ctx; w.dispatchEvent = () => true; w.addEventListener = () => {}; w.fetch = fetchSaplama;
    vm.createContext(ctx);
    vm.runInContext(oku("js", "bundle.js").replace(/^export /gm, ""), ctx);
    if (w.dbService && w.dbService.loadDatabase) await w.dbService.loadDatabase();
    if (w.licenseManager) w.licenseManager.licenseStatus = Object.assign({}, w.licenseManager.licenseStatus,
        { isValid: true, licenseType: "TEST", isMaster: false, isDemo: false, maxSections: -1, allowExport: true });
    return { w, st: w.appState, ne: w.normEngine, ce: w.curriculumEngine };
}

const { w, st, ne, ce } = await paketYukle();
const hesapla = () => {
    const cm = { ...(st.state.koordinatorlukYukleri || {}) };
    cm.adminOptions = st.state.okulBilgisi.adminOptions || {};
    return ne.calculateSchoolNorms(st.state.subeler, st.state.mevcutOgretmenler || {}, st.state.okulBilgisi.okulTuru, cm);
};
const brans = (r, ad) => r.branchReport.find(b => b.branchName === ad);
const R = new w.MebReportsEngine(w.dbService, ne, ce);

const okulKur = (subeSayisi, ogrenci) => {
    st.resetSchool();
    st.setSchoolType("anadolu_lisesi");
    for (let i = 0; i < subeSayisi; i++) {
        st.addSection({ sinifSeviyesi: "9", subeAdi: "9-" + String.fromCharCode(65 + i), ogrenciSayisi: ogrenci,
            zorunluDersler: [{ ders: "Matematik", saat: 6, atananBrans: "Matematik", kategori: "ORTAK" }],
            secmeliDersler: [] });
    }
};

/* ======================================================================= */
/* Y-13 — dersi olmayan branşın öğretmeni hesaptan düşmez                  */
/* ======================================================================= */
okulKur(2, 30);
st.state.mevcutOgretmenler = { "Matematik": 1, "Almanca": 1 };
{
    const r = hesapla();
    const alm = brans(r, "Almanca");
    kontrol("Y13 dersi olmayan Almanca öğretmeni branş listesinde", !!alm);
    kontrol("Y13 Almanca: yük 0, norm 0, mevcut 1, fazla +1",
        !!alm && alm.totalHours === 0 && alm.calculatedNorm === 0 && alm.currentTeachers === 1 && alm.diff === 1,
        JSON.stringify(alm && { h: alm.totalHours, n: alm.calculatedNorm, m: alm.currentTeachers, d: alm.diff }));
    kontrol("Y13 MEVCUT toplamı Almanca'yı da sayıyor (Matematik 1 + Almanca 1 = 2)",
        r.totalCurrentTeachers === 2, r.totalCurrentTeachers);
    kontrol("Y13 norm fazlası toplamına giriyor", r.totalSurplus >= 1, r.totalSurplus);

    const eylem = R.generateNormActionReport(st.state);
    kontrol("Y13 norm fazlası (atama/nakil) listesinde Almanca var",
        eylem.surplusList.some(x => x.branchName === "Almanca" && x.surplusCount === 1));

    const izgara = R.generateMasterLoadGrid(st.state);
    kontrol("Y13 Master Yük Matrisinde Almanca kartı var",
        izgara.sortedBranchNames.includes("Almanca"), izgara.sortedBranchNames.join(","));
}
// Hem yükü hem kadrosu 0 olan branş hâlâ gizli (eski kullanıcı talimatı korunur).
st.state.mevcutOgretmenler = { "Matematik": 1, "Almanca": 0, "Fransızca": 0 };
{
    const r = hesapla();
    kontrol("Y13 yük 0 VE kadro 0 olan branş hâlâ gizli", !brans(r, "Almanca") && !brans(r, "Fransızca"));
}

/* ======================================================================= */
/* Y-05 — satırlarda görünmeyen saatler açıklanabilir                      */
/* ======================================================================= */
okulKur(3, 30);   // addSection her şubeye 1 saatlik "Rehberlik ve Yönlendirme" dersi kendisi ekler
kontrol("Y05 senaryo: her şubede otomatik Rehberlik dersi var",
    st.state.subeler.every(s => s.zorunluDersler.some(d => /^Rehberlik/.test(d.ders))));
st.state.mevcutOgretmenler = { "Matematik": 1 };
{
    const r = hesapla();
    const satirToplami = r.branchReport.reduce((t, b) => t + (b.totalHours || 0), 0);
    kontrol("Y05 motor branşa verilmemiş Rehberlik saatini ayrı bildiriyor (3 şube x 1 = 3)",
        r.rehberlikBranssizSaat + r.branssizSaat === 3, `${r.rehberlikBranssizSaat} + ${r.branssizSaat}`);
    kontrol("Y05 satır toplamı + açıklanan saatler = Toplam Okul Yükü",
        satirToplami + r.rehberlikBranssizSaat + r.branssizSaat === r.totalHours,
        `${satirToplami} + ${r.rehberlikBranssizSaat} + ${r.branssizSaat} ≠ ${r.totalHours}`);
}

/* ======================================================================= */
/* Y-09 — rehber öğretmen açığı ihtiyaç raporunda görünür                  */
/* ======================================================================= */
okulKur(10, 60);   // 600 öğrenci: rehber öğretmen normu birden fazla
st.state.mevcutOgretmenler = { "Matematik": 5 };
st.setAdminOptions({ mevcutRehberOgretmeni: 1 });
{
    const eylem = R.generateNormActionReport(st.state);
    const icmal = R.generateExecutiveSummary(st.state);
    const gn = icmal.guidanceNorms && icmal.guidanceNorms.karsilastirma;
    kontrol("Y09 senaryo: rehber öğretmen ihtiyacı gerçekten var", !!gn && gn.fark < 0, JSON.stringify(gn));
    kontrol("Y09 rapor rehber öğretmen satırını taşıyor", !!eylem.rehberSatiri && eylem.rehberSatiri.ihtiyac === Math.abs(gn.fark),
        JSON.stringify(eylem.rehberSatiri));
    kontrol("Y09 branş rozetleri İcmal KPI'larıyla tutmaya devam ediyor (rehber sayıya katılmaz)",
        eylem.totalNeeded === icmal.kpis.totalNeeded && eylem.totalSurplus === icmal.kpis.totalSurplus,
        `${eylem.totalNeeded}/${icmal.kpis.totalNeeded}`);
}
okulKur(5, 30);   // 150 öğrenci: rehber öğretmen normu 1 (ölçüldü)
st.state.mevcutOgretmenler = { "Matematik": 3 };
st.setAdminOptions({ mevcutRehberOgretmeni: 1 });
{
    const eylem = R.generateNormActionReport(st.state);
    const gn = R.generateExecutiveSummary(st.state).guidanceNorms.karsilastirma;
    kontrol("Y09 senaryo: rehber normu 1, mevcut 1 (tam)", gn.norm === 1 && gn.fark === 0, JSON.stringify(gn));
    kontrol("Y09 rehber normu tutuyorsa satır çıkmaz", eylem.rehberSatiri === null, JSON.stringify(eylem.rehberSatiri));
}
okulKur(2, 30);   // 60 öğrenci: norm 0; mevcut 1 rehber öğretmen NORM FAZLASIDIR (İcmal ile aynı)
st.state.mevcutOgretmenler = { "Matematik": 1 };
st.setAdminOptions({ mevcutRehberOgretmeni: 1 });
{
    const eylem = R.generateNormActionReport(st.state);
    kontrol("Y09 norm 0, mevcut 1 -> rehber öğretmen fazlası satırı",
        !!eylem.rehberSatiri && eylem.rehberSatiri.fazla === 1 && eylem.rehberSatiri.ihtiyac === 0,
        JSON.stringify(eylem.rehberSatiri));
}

/* ======================================================================= */
/* Y-14 — dal adı eşleşmesi yazım farkına bağışık                          */
/* ======================================================================= */
{
    const K = w.UIComponentManager && w.UIComponentManager.dalAnahtari;
    kontrol("Y14 dalAnahtari pakette", typeof K === "function");
    if (typeof K === "function") {
        kontrol("Y14 'YAZILIM GELİŞTİRME DALI' = 'Yazılım Geliştirme'", K("YAZILIM GELİŞTİRME DALI") === K("Yazılım Geliştirme"),
            `${K("YAZILIM GELİŞTİRME DALI")} / ${K("Yazılım Geliştirme")}`);
        kontrol("Y14 'AĞ İŞLETMENLİĞİ DALI' = 'Ağ İşletmenliği'", K("AĞ İŞLETMENLİĞİ DALI") === K("Ağ İşletmenliği"));
        kontrol("Y14 farklı dallar farklı kalır", K("YAZILIM GELİŞTİRME DALI") !== K("AĞ İŞLETMENLİĞİ DALI"));
        kontrol("Y14 boş dal boş anahtar (yanlışlıkla eşleşmez)", K("") === "" && K(null) === "" && K(undefined) === "");
        kontrol("Y14 'dalı' eki yalnız SONDA atılır", K("Dalı Yönetimi") !== K("Yönetimi"), K("Dalı Yönetimi"));
    }
}

/* ======================================================================= */
/* KAYNAK DENETİMİ — ekran/pencere/CSS (DOM gerektirir, bkz. dürüstlük notu) */
/* ======================================================================= */
const ui = oku("js", "uiComponents.js");
const app = oku("js", "app.js");
const css = oku("css", "app.css");
const html = oku("app.html");
const re = oku("js", "reportsEngine.js");
const lic = oku("js", "licenseClientManager.js");

// Y-14: pencere dalı eşleştirerek seçili getirir ve kaydederken kayıttaki yazımı korur.
kontrol("Y14 düzenleme penceresi dalı dalAnahtari ile eşliyor", /dalAnahtari\(b\) === seciliDalAnahtari/.test(ui));
kontrol("Y14 eşi listede yoksa kayıttaki dal ayrı seçenek olarak korunuyor", /!dalListedeVar && selectedDal/.test(ui));
kontrol("Y14 kayıtta aynı dal farklı yazımla geldiyse kayıttaki yazım korunuyor",
    /dalAnahtari\(dalName\) === UIComponentManager\.dalAnahtari\(sectionToEdit\.dalAdi\)/.test(ui));

// Y-02 / Y-03: girdi denetimi.
kontrol("Y02 öğrenci sayısı tam sayı ve tavan denetimi var", /\^\\d\+\$/.test(ui) && /ogrenciTavani/.test(ui));
kontrol("Y02 MESEM için geniş tavan (çırak grupları)", /mesleki_egitim_merkezi\|mesem/.test(ui) && /450/.test(ui));
kontrol("Y03 boş şube adı reddediliyor", /Şube adı boş olamaz/.test(ui));
kontrol("Y03 yinelenen şube adı reddediliyor", /adında bir şube zaten var/.test(ui));
kontrol("Y03 boş ad artık sessizce 'X-A'ya çevrilmiyor", !/sec-name"\)\.value\.trim\(\) \|\| `\$\{defaultPrefix\}-A`/.test(ui));

// Y-08 / Y-05: Rehberlik açıklamaları.
kontrol("Y08 matris Rehberlik kartı 'norm doğurmaz' diyor", /norm doğurmaz/.test(ui) && /rehberlikDersKarti/.test(ui));
kontrol("Y05 sağ panel toplama dâhil ama satırda olmayan saati yazıyor",
    /rehberlikBranssizSaat/.test(app) && /hiçbir branşa verilmemiş/.test(app));

// Y-10: Bakanlık sesi kalmadı (ürün kararı, kullanıcı onayı 21.09.2026).
const YASAKLI = ["İLK VE TEK MEB", "MEBBİS Norm Güncelleme Cetveli", "MEB GEREKÇESİ", "Ar-Ge Grubu",
    "MEB NORM SİSTEMİ", "RESMÎ EYLEM CETVELİ", "resmî norm kadro analizi MEB", "MEB NORM KADRO SİSTEMİ"];
for (const y of YASAKLI) {
    const nerede = [["app.js", app], ["uiComponents.js", ui], ["reportsEngine.js", re], ["licenseClientManager.js", lic]]
        .filter(([, m]) => m.includes(y)).map(([a]) => a);
    kontrol(`Y10 arayüz metninde "${y}" kalmadı`, nerede.length === 0, nerede.join(","));
}
kontrol("Y10 raporda bağımsızlık beyanı (MEBBİS esastır) yazıyor", /resmî işlemlerde MEBBİS verileri esastır/.test(ui));

// A-05 / A-06: dar pencere ve telefon.
kontrol("A05 app.html görünüm alanını 1200 px'e sabitliyor", /<meta name="viewport" content="width=1200">/.test(html));
kontrol("A05 kök yatay kaydırılabilir (Norm Kadro paneline ve Çıkış'a ulaşılır)",
    /html\s*\{\s*overflow-x:\s*auto;\s*overflow-y:\s*hidden;\s*\}/.test(css));
kontrol("A06 dar ekranda yalnız simge: .hdr-yazi 1500 px altında gizli",
    /@media screen and \(max-width: 1499px\)\s*\{\s*\.app-header \.hdr-yazi\s*\{\s*display:\s*none/.test(css));
kontrol("A06 simge düğmelerin erişilebilir adı var (aria-label)",
    ["btn-export-json", "btn-import-json", "btn-header-more", "btn-parola-degistir", "btn-reset-school"]
        .every(id => new RegExp(`id="${id}"[^>]*aria-label=`).test(app)));
kontrol("A06 'Çıkış' yazısı her boyutta kalıyor (hdr-yazi ile sarılmadı)", !/hdr-yazi">Çıkış/.test(app));
kontrol("A06 ⋯ Diğer menüsü simgeye tıklanınca da kapanıyor (closest)", /closest\?\.\("#btn-header-more"\)/.test(app));

// A-12 / Y-04: demo kilidi.
kontrol("A12 kilit reddi sonrası başarı bildirimi bastırılıyor", /__sonDemoKilidi/.test(ui) && /__sonDemoKilidi/.test(app));
kontrol("A12 kilitten sonra ekran gerçek veriyle yeniden çiziliyor (seçim kutusu eski değere döner)",
    /normmatik:demo-kilit[\s\S]{0,700}this\.render\(\)/.test(app));

/* ======================================================================= */
/* Y-12 — demo sıfırlanınca demo kalır (bulut hatası çıkmaz)               */
/* ======================================================================= */
{
    st.resetSchool(); st.setSchoolType("anadolu_lisesi");
    st.state.okulBilgisi.isDemo = true; st.state.okulBilgisi.kurumKodu = "123456";
    st.resetSchool();
    kontrol("Y12 demo sıfırlanınca isDemo korunur", st.state.okulBilgisi.isDemo === true, String(st.state.okulBilgisi.isDemo));
    st.state.okulBilgisi.isDemo = false; st.state.okulBilgisi.kurumKodu = "754123";
    st.resetSchool();
    kontrol("Y12 gerçek okul sıfırlanınca isDemo AÇILMAZ", !st.state.okulBilgisi.isDemo);
}
kontrol("Y12 demoda bulut silme atlanıyor", ui.includes("const demoMu = !!this.state.state.okulBilgisi?.isDemo") && ui.includes("if (kod && !demoMu)"));

/* ======================================================================= */
/* A-09 — kontrast: düzeltilen renkler WCAG AA (>= 4.5) — GERÇEKTEN hesaplanır */
/* ======================================================================= */
{
    const lum = (hex) => {
        const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
            .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const oran = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    // Dosyadaki SON tanım geçerlidir (kontrast bloğu dosya sonunda): seçicinin son "{...}" gövdesinden color okunur.
    const sonRenk = (sec) => {
        let i = css.lastIndexOf(sec + " {");
        while (i > 0 && !/[\s}]/.test(css[i - 1])) i = css.lastIndexOf(sec + " {", i - 1);
        if (i < 0) return null;
        const govde = css.slice(i, css.indexOf("}", i));
        const m = govde.match(/(?:^|[\s;{])color:\s*(#[0-9a-fA-F]{6})/);
        return m ? m[1] : null;
    };
    const ol = [
        [".norm-status-chip.ihtiyac", "#e0f2fe"], [".norm-status-chip.fazla", "#fee2e2"],
        [".norm-chip-load", "#dbeefa"], [".badge-total-sections", "#d3e8f4"],
        [".kpi-chip-num.blue", "#ffffff"], [".kpi-chip-num.purple", "#ffffff"],
        [".course-hours-value", "#ffffff"], [".baraj-pill", "#fef2f2"]
    ];
    for (const [sec, bg] of ol) {
        const renk = sonRenk(sec);
        kontrol(`A09 ${sec} rengi bulundu`, !!renk);
        if (renk) kontrol(`A09 ${sec}: ${renk} / ${bg} >= 4.5`, oran(renk, bg) >= 4.5, oran(renk, bg).toFixed(2));
    }
    kontrol("A09 e-Okul düğmesi: beyaz / #047857 >= 4.5", oran("#ffffff", "#047857") >= 4.5, oran("#ffffff", "#047857").toFixed(2));
    kontrol("A09 e-Okul düğmesi arka planı dosyada koyulaştırıldı", css.includes(".btn-sec-eokul { background: #047857 !important"));
    kontrol("A09 eski marka mavisi #0284c7 beyaz üstünde 4.5 altında (neden değiştirildiğinin kanıtı)", oran("#0284c7", "#ffffff") < 4.5);
}

/* ======================================================================= */
/* A-07 / A-08 / A-10 / A-01..03 — klavye ve etiket (KAYNAK DENETİMİ)      */
/* ======================================================================= */
const idx = oku("index.html");
kontrol("A07 şube kartı odaklanabilir ve adı var", app.includes('tabindex="0" role="group" aria-label="${NormGuvenlik.htmlKacis(s.subeAdi)} şubesi'));
kontrol("A07 Enter/Boşluk kartı seçer, odak yeni karta döner", app.includes("this._kartOdakId = card.dataset.id") && app.includes("yeniKart.focus("));
kontrol("A07 odakta kart düğmeleri görünür (:focus-within)", css.includes(".section-card:focus-within .sec-action-chips"));
kontrol("A07 odak halkası var", css.includes(".section-card:focus-visible"));
kontrol("A08 branş seçicisi ders adıyla etiketli", app.includes('class="branch-select" data-course="${cName}" aria-label='));
kontrol("A08 sezon ve şube arama alanı etiketli", app.includes('id="season-selector" aria-label=') && app.includes('id="section-search-input" aria-label='));
kontrol("A08 Kadro penceresi: öğretmen sayısı ve branş arama etiketli",
    ui.includes('teacher-count-input" data-branch="${bName}" aria-label=') && ui.includes('id="staff-branch-search" aria-label='));
kontrol("A08 lisans penceresi etiketleri alanlara bağlı",
    ["lic-inp-kurum-kodu", "lic-inp-okul-adi", "lic-inp-okul-turu", "lic-inp-il-ilce"].every(i => ui.includes(`<label for="${i}"`)));
kontrol("A10 uygulama pencereleri: dialog rolü + Tab kapanı + Esc + odak iadesi",
    ui.includes('setAttribute("role", "dialog")') && ui.includes("aria-modal") && ui.includes("MutationObserver") && ui.includes("acan.focus"));
kontrol("A01 giriş penceresi: dialog rolü, Kapat adı, Esc ve Tab kapanı",
    idx.includes('auth-modal-box" role="dialog" aria-modal="true"') && idx.includes('id="btn-close-auth-modal" aria-label="Kapat"')
    && idx.includes("e.key === 'Escape'") && idx.includes("function kutuAc"));
kontrol("A02 ekran görüntüsü klavyeyle açılıyor", idx.includes("card.setAttribute('tabindex', '0')") && idx.includes("e.key === 'Enter' || e.key === ' '"));
kontrol("A03 ✕ düğmeleri 'Kapat' adlı", idx.includes('id="lightbox-close" aria-label="Kapat"'));

/* ======================================================================= */
if (hatalar.length) {
    console.log(`❌ test_denetimDalga3: ${hatalar.length} hata, ${gecen} geçti`);
    hatalar.forEach(h => console.log("   - " + h));
    process.exit(1);
}
console.log(`✅ test_denetimDalga3: ${gecen} kontrol geçti`);
