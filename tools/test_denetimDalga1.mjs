/* ===========================================================================
   NormMatik — DENETİM DALGA 1 DÜZELTMELERİ   (15.09.2026)

   NEDEN VAR
   ---------
   Çok ajanlı denetimin (05_dokumantasyon/denetim_dalga1/DALGA1_SONUC.md)
   bağımsız hakemce yeniden üretilmiş bulguları düzeltildi. Kural: doğrulanmış
   her bulgu kalıcı teste dönüşür; düzeltilen hata sessizce geri gelemez.

     G-01  Okulun yazdığı metin (şube adı, branş adı, antet, logo) ekrana
           süzülmeden basılıyordu; yönetici oturumu çalınabiliyordu.
     G-03  Sayfalarda güvenlik politikası (CSP) yoktu.
     N-01  Taşıma merkezi kutusu koşulsuz +1 müdür yardımcısı veriyordu
           (kullanıcı kararı: kutu kaldırıldı).
     N-02  Adında "Uygulamaları" geçen genel dersler atölye (Md.19) sayılıyordu.
     N-03  3+ şube birleştirilince ders her şubede ayrı sayılıyor, iki şubede
           sonuç şubelerin sırasına bağlı oluyordu.
     N-04  Güzel sanatlar Çalgı Eğitimi Md.22/4-a tavanını aşıyordu.
     N-10  "Branş Atanmadı" seçimi hesapta çalışmıyor, ders adıyla sahte branş
           satırı açılıyordu.
     N-13  9. sınıfta 31 öğrencili atölye şubesi 3 grup sayılıyordu
           ("31'den fazla 3" -> 31 ikinci kademede).

   Testler YAYIMLANAN paketi (js/bundle.js) çalıştırır; kaynak düzenlendikten
   sonra `python -X utf8 tools/build_bundle.py` çalışmadan sonuç yanıltıcıdır.

   ÇALIŞTIRMA: node tools/test_denetimDalga1.mjs   (çıkış kodu 0 = geçti)
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
const ATANMADI = "— Branş Atanmadı —";

/* ======================================================================= */
/* G-01 — okul verisi zararsızlaştırılır                                   */
/* ======================================================================= */
const G = w.NormGuvenlik;
kontrol("G01 NormGuvenlik pakette tanımlı", !!G);
if (G) {
    kontrol("G01 htmlKacis her tehlikeli karakteri kaçışlar",
        G.htmlKacis(`<a href="x" title='y'>&`) === "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;",
        G.htmlKacis(`<a href="x" title='y'>&`));
    kontrol("G01 metin: Kur'an'daki tek tırnak korunur", G.metin("Kur'an-ı Kerim") === "Kur'an-ı Kerim");
    kontrol("G01 kimlik: Türkçe harf korunur", G.kimlik("sube_demo_9ç") === "sube_demo_9ç");
    kontrol("G01 logo: gerçek resim kalır", G.logo("data:image/jpeg;base64,/9j/4AAQ==") === "data:image/jpeg;base64,/9j/4AAQ==");
    kontrol("G01 logo: dış adres atılır", G.logo("https://kotu.example/x.png") === null);
    kontrol("G01 logo: öznitelikten çıkan değer atılır", G.logo('data:image/png;base64,AA" onerror="alert(1)') === null);
}

const YUK = '9-A"><img src=x onerror=alert(1)>';
const BRANS_YUKU = "<img src=x onerror=eval(name)>";
st.resetSchool();
st.setSchoolType("anadolu_lisesi");
st.state.okulBilgisi.okulAdi = 'DEMO "LİSESİ"';
st.state.okulBilgisi.antet = { resmiOkulAdi: 'OKUL<script>alert(1)</script>', ilceMem: 'A"B', logoBase64: 'x" onerror="alert(1)' };
st.state.subeler = [{
    id: 'sube_1"><b>', subeAdi: YUK, sinifSeviyesi: "9", ogrenciSayisi: 30,
    zorunluDersler: [{ ders: "Matematik", saat: 6, atananBrans: BRANS_YUKU, birlesikSubeler: ['x"><i>'] }],
    secmeliDersler: []
}];
st.state.mevcutOgretmenler = { [BRANS_YUKU]: 2, "Matematik": 1 };
st.state.koordinatorlukYukleri = { [BRANS_YUKU]: 4 };
st.state.aktifSubeId = 'sube_1"><b>';
st.sanitizeExistingState();

const metinler = [];
const topla = (v) => {
    if (typeof v === "string") metinler.push(v);
    else if (Array.isArray(v)) v.forEach(topla);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { metinler.push(k); topla(x); }
};
topla({ s: st.state.subeler, m: st.state.mevcutOgretmenler, k: st.state.koordinatorlukYukleri,
        a: st.state.okulBilgisi.antet, akt: st.state.aktifSubeId });
const kirli = metinler.filter(x => /[<>"]/.test(x));
kontrol("G01 temizlik sonrası hiçbir metin/anahtarda < > \" kalmadı", kirli.length === 0, JSON.stringify(kirli));
kontrol("G01 geçersiz logo atıldı", st.state.okulBilgisi.antet.logoBase64 === null, String(st.state.okulBilgisi.antet.logoBase64));
kontrol("G01 şube kimliği güvenli", st.state.subeler[0].id === "sube_1b", st.state.subeler[0].id);
kontrol("G01 birleşik şube bağı da güvenli", (st.state.subeler[0].zorunluDersler[0].birlesikSubeler || [])[0] === "xi");
kontrol("G01 okulAdi DEĞİŞMEDİ (bulut kimlik kilidi)", st.state.okulBilgisi.okulAdi === 'DEMO "LİSESİ"');

// Proje dosyasından içe aktarma da aynı temizlikten geçer
st.resetSchool();
const iceAktarildi = st.importProjectJSON(JSON.stringify({
    okulBilgisi: { okulAdi: "X", okulTuru: "anadolu_lisesi", antet: { resmiOkulAdi: "<b>A</b>" } },
    subeler: [{ id: "sube_9", subeAdi: YUK, sinifSeviyesi: "9", ogrenciSayisi: 20, zorunluDersler: [], secmeliDersler: [] }],
    mevcutOgretmenler: {}
}));
kontrol("G01 proje dosyası içe aktarıldı", iceAktarildi === true);
kontrol("G01 proje dosyasındaki şube adı temizlendi", iceAktarildi && !/[<>"]/.test(st.state.subeler[0].subeAdi), st.state.subeler[0] && st.state.subeler[0].subeAdi);

// Buluta giden kayıt da temizlenir (kural < > reddediyor); ekrandaki veri ve okulAdi değişmez
{
    st.resetSchool(); st.setSchoolType("anadolu_lisesi");
    st.state.okulBilgisi.okulAdi = 'DEMO "LİSESİ"';
    st.state.okulBilgisi.antet = { resmiOkulAdi: "OKUL<b>", logoBase64: "data:image/png;base64,iVBORw0KGgo=" };
    st.state.subeler = [{ id: "sube_7", subeAdi: YUK, sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Matematik", saat: 6, atananBrans: "Matematik" }], secmeliDersler: [] }];
    st.state.mevcutOgretmenler = { [BRANS_YUKU]: 1 };
    const bulut = w.cloudDbService || w.cloudDatabaseService;
    kontrol("G01 bulut servisi pakette", !!(bulut && bulut.saveSchoolData));
    if (bulut && bulut.saveSchoolData) {
        let yuk = null;
        const eski = bulut._istekTekrarli;
        bulut._istekTekrarli = async (yol, yontem, govde) => { yuk = govde; return { ok: true, status: 200 }; };
        const eskiAnahtar = bulut.getEffectiveKey;
        bulut.getEffectiveKey = () => "424242";
        try { await bulut.saveSchoolData("424242", st.state); } finally {
            bulut._istekTekrarli = eski; bulut.getEffectiveKey = eskiAnahtar;
        }
        kontrol("G01 kayıt yükü yakalandı", !!yuk);
        if (yuk) {
            const yukMetin = [];
            const yukTopla = (v) => {
                if (typeof v === "string") yukMetin.push(v);
                else if (Array.isArray(v)) v.forEach(yukTopla);
                else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { yukMetin.push(k); yukTopla(x); }
            };
            yukTopla(Object.assign({}, yuk, { okulAdi: "" }));
            kontrol("G01 buluta giden kayıtta < > yok", !yukMetin.some(x => /[<>]/.test(x)),
                JSON.stringify(yukMetin.filter(x => /[<>]/.test(x))));
            kontrol("G01 buluta giden okulAdi aynen (kimlik kilidi)", yuk.okulAdi === 'DEMO "LİSESİ"', yuk.okulAdi);
            kontrol("G01 geçerli logo buluta gidiyor", yuk.antet && yuk.antet.logoBase64 === "data:image/png;base64,iVBORw0KGgo=");
        }
        kontrol("G01 kayıt ekrandaki veriyi değiştirmedi", st.state.subeler[0].subeAdi === YUK, st.state.subeler[0].subeAdi);
    }
}

// Okul açılır açılmaz çizilen ekranlar ikinci katman olarak kaçışlıyor
const appKaynak = oku("js", "app.js");
const uiKaynak = oku("js", "uiComponents.js");
kontrol("G01 şube kartı adı kaçışlı", appKaynak.includes('title="${NormGuvenlik.htmlKacis(s.subeAdi)}">${NormGuvenlik.htmlKacis(s.subeAdi)}</span>'));
kontrol("G01 şube başlığı kaçışlı", appKaynak.includes('${NormGuvenlik.htmlKacis(activeSec.subeAdi)}</h1>'));
kontrol("G01 norm tablosu branş adı kaçışlı", appKaynak.includes('<span class="norm-branch-text">${NormGuvenlik.htmlKacis(b.branchName)}</span>'));
kontrol("G01 çıplak şube adı basan şablon kalmadı (app.js)", !/>\$\{(s|activeSec)\.subeAdi\}</.test(appKaynak));
kontrol("G01 logo çıplak basılmıyor", !uiKaynak.includes('<img src="${antet.logoBase64}"'));
kontrol("G01 e-Okul önizlemesi şube adı kaçışlı", !uiKaynak.includes('value="${sec.subeAdi}"'));

/* ======================================================================= */
/* G-03 — güvenlik politikası                                              */
/* ======================================================================= */
const disUclar = new Set();
for (const f of ["firebaseAuth.js", "cloudDatabaseService.js", "liveUpdateSyncEngine.js", "authService.js", "state.js"]) {
    for (const m of oku("js", f).matchAll(/https:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) disUclar.add(m[1].toLowerCase());
}
for (const u of ["wa.me", "www.normmatik.com.tr", "normmatik.com.tr", "schema.org"]) disUclar.delete(u);
for (const sayfa of ["index.html", "app.html", "sifre.html", "yonetim.html"]) {
    const html = oku(sayfa);
    const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    kontrol(`G03 ${sayfa}: güvenlik politikası var`, !!m);
    if (!m) continue;
    const csp = m[1];
    const connect = (csp.match(/connect-src ([^;]+)/) || [])[1] || "";
    for (const uc of disUclar) {
        kontrol(`G03 ${sayfa}: kodun bağlandığı ${uc} politikada izinli`, connect.includes("https://" + uc), connect);
    }
    kontrol(`G03 ${sayfa}: eklenti nesnesi kapalı`, /object-src 'none'/.test(csp));
    kontrol(`G03 ${sayfa}: politika <head> içinde, betiklerden önce`,
        html.indexOf("Content-Security-Policy") < html.indexOf("<script"), "");
}

/* ======================================================================= */
/* N-01 — taşıma merkezi kutusu kaldırıldı                                 */
/* ======================================================================= */
for (const [tur, ogr] of [["ortaokul_temel_egitim", 400], ["imam_hatip_ortaokulu", 80], ["anadolu_lisesi", 900]]) {
    const once = ne.calculateAdminNorms(tur, ogr, {}).mudurYardimcisiTotal;
    const sonra = ne.calculateAdminNorms(tur, ogr, { isTasimaMerkezi: true }).mudurYardimcisiTotal;
    kontrol(`N01 ${tur} ${ogr} öğr: eski kayıttaki taşıma alanı norm eklemiyor`, once === sonra, `${once} -> ${sonra}`);
}
kontrol("N01 arayüzde taşıma kutusu yok", !uiKaynak.includes("chk-admin-tasima"));
kontrol("N01 motor taşıma alanını okumuyor", !/options\.isTasimaMerkezi/.test(oku("js", "normEngine.js")));

/* ======================================================================= */
/* N-02 — "Uygulamaları" dersleri atölye sayılmaz                          */
/* ======================================================================= */
const genelUygulama = [
    ["Matematik Uygulamaları", "anadolu_lisesi"], ["MATEMATİK UYGULAMALARI", "fen_lisesi"],
    ["Fen Bilimleri Uygulamaları", "anadolu_imam_hatip_lisesi"], ["Edebiyat Uygulamaları", "sosyal_bilimler_lisesi"],
    ["Proje Tasarımı ve Uygulamaları", "anadolu_lisesi"], ["Matematik ve Bilim Uygulamaları", "ortaokul_temel_egitim"],
    ["Yapay Zeka Uygulamaları", "imam_hatip_ortaokulu"], ["Spor Uygulamaları", "anadolu_imam_hatip_lisesi"],
    ["Bilgisayarlı Tasarım Uygulamaları", "hazirlik_imam_hatip_lisesi"], ["Robotik Uygulamaları", "ozel_program_fen_lisesi"]
];
for (const [ad, tur] of genelUygulama) {
    kontrol(`N02 ${ad} (${tur}) genel ders (Md.18)`,
        !ne.isWorkshopLabCourse({ ders: ad, kategori: "SEÇMELİ DERSLER" }, tur));
}
kontrol("N02 meslekî 'Ofis Uygulamaları' çerçeve işaretiyle atölye kalır",
    ne.isWorkshopLabCourse({ ders: "Ofis Uygulamaları", kategori: "MESLEK DERSLERİ", isAtolye: true }, "mesleki_ve_teknik_anadolu_lisesi"));
kontrol("N02 'Temel Elektrik Atölyesi' ad kalıbıyla atölye kalır",
    ne.isWorkshopLabCourse({ ders: "Temel Elektrik Atölyesi", kategori: "MESLEK DERSLERİ" }, "mesleki_ve_teknik_anadolu_lisesi"));
// Kullanıcı kararı (15.09.2026): meslekî olmayan okulda ADI yüzünden atölye sayılan
// dersler de genel ders sayılır.
for (const [ad, tur] of [
    ["Fizik Laboratuvarı", "ozel_program_fen_lisesi"], ["Kimya Laboratuvarı", "ozel_program_fen_lisesi"],
    ["Biyoloji Laboratuvarı", "ozel_program_fen_lisesi"], ["İki Boyutlu Sanat Atölye", "guzel_sanatlar_gorsel"],
    ["Üç Boyutlu Sanat Atölye", "guzel_sanatlar_gorsel"], ["Üç Boyutlu Sanat Atölye", "anadolu_imam_hatip_lisesi"],
    ["Mesleki Gelişim Atölyesi", "anadolu_imam_hatip_lisesi"], ["Oyun ve Oyuncak Atölyesi", "hazirlik_imam_hatip_lisesi"],
    ["Müzik ve Dramatik Etkinlikler Atölyesi", "anadolu_imam_hatip_lisesi"],
    ["Erken Çocukluk ve Özel Eğitimde Program Atölyesi", "anadolu_imam_hatip_lisesi"]
]) {
    kontrol(`N02b ${ad} (${tur}) genel ders (Md.18)`, !ne.isWorkshopLabCourse({ ders: ad, kategori: "ORTAK DERSLER" }, tur));
}
kontrol("N02b meslek ortaokulunda ad kalıbı geçerli",
    ne.isWorkshopLabCourse({ ders: "Ahşap Atölyesi", kategori: "MESLEK DERSLERİ" }, "meslek_ortaokulu"));
kontrol("N02b MESEM'de işletmelerde mesleki eğitim atölye kovasında",
    ne.isWorkshopLabCourse({ ders: "İşletmelerde Mesleki Eğitim", kategori: "İŞLETMELERDE MESLEKİ EĞİTİM" }, "mesleki_egitim_merkezi"));
kontrol("N02b açık isAtolye işareti genel okulda da geçerli",
    ne.isWorkshopLabCourse({ ders: "İş Eğitimi ve Meslek Ahlakı", isAtolye: true }, "ozel_egitim_uygulama_okulu"));
{
    // Uçtan uca (hakemin örneği): 32 saat Matematik = 24 zorunlu + 8 Matematik Uygulamaları
    st.resetSchool(); st.setSchoolType("anadolu_lisesi");
    const s = st.addSection({ sinifSeviyesi: "11", subeAdi: "11-A", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Matematik", saat: 24, atananBrans: "Matematik", kategori: "ORTAK DERSLER" }], secmeliDersler: [] });
    st.addElectiveCourse(s.id, { ders: "Matematik Uygulamaları", saat: 8, kategori: "SEÇMELİ DERSLER", atananBrans: "Matematik", isAtolye: false });
    const m = brans(hesapla(), "Matematik");
    kontrol("N02 Matematik 32 saat tamamı Md.18 -> 2 norm", m && m.totalHours === 32 && m.calculatedNorm === 2,
        m && `${m.totalHours}s / ${m.calculatedNorm} norm`);
}

/* ======================================================================= */
/* N-03 — birleştirilmiş şube                                              */
/* ======================================================================= */
function ucSube(akis) {
    st.resetSchool(); st.setSchoolType("anadolu_lisesi");
    const s = ["11-A", "11-B", "11-C"].map(ad => st.addSection({ sinifSeviyesi: "11", subeAdi: ad, ogrenciSayisi: 12, zorunluDersler: [], secmeliDersler: [] }));
    for (const x of s) st.addElectiveCourse(x.id, { ders: "Almanca", saat: 2, kategori: "SEÇMELİ DERSLER", atananBrans: "Almanca", isAtolye: false });
    akis(s);
    const r = hesapla();
    return { al: (brans(r, "Almanca") || { totalHours: 0 }).totalHours, r };
}
for (const [ad, akis, beklenen] of [
    ["N03 iki şube birleşik, üçüncüsü ayrı", s => st.toggleCourseMerge(s[0].id, "Almanca", s[1].id), 4],
    ["N03 üç şube TEK pencereden birleştirildi", s => { st.toggleCourseMerge(s[0].id, "Almanca", s[1].id); st.toggleCourseMerge(s[0].id, "Almanca", s[2].id); }, 2],
    ["N03 üç şube her pencereden birleştirildi", s => { st.toggleCourseMerge(s[0].id, "Almanca", s[1].id); st.toggleCourseMerge(s[0].id, "Almanca", s[2].id); st.toggleCourseMerge(s[1].id, "Almanca", s[2].id); }, 2],
    ["N03 üç şube zincir (A-B, B-C) birleştirildi", s => { st.toggleCourseMerge(s[0].id, "Almanca", s[1].id); st.toggleCourseMerge(s[1].id, "Almanca", s[2].id); }, 2],
]) {
    const o = ucSube(akis);
    kontrol(`${ad}: Almanca yükü ${beklenen} saat`, o.al === beklenen, `${o.al} saat`);
    kontrol(`${ad}: mutabakat tutarlı`, o.r.yukMutabakati && o.r.yukMutabakati.tutarli === true, JSON.stringify(o.r.yukMutabakati));
}
function ikiAtolyeSubesi(sira) {
    st.resetSchool(); st.setSchoolType("mesleki_ve_teknik_anadolu_lisesi");
    const mevcut = { A: 30, B: 8 };
    const s = {};
    for (const k of sira) {
        s[k] = st.addSection({ sinifSeviyesi: "10", subeAdi: "10-" + k, ogrenciSayisi: mevcut[k], alanId: "elektrik_elektronik_teknolojisi",
            zorunluDersler: [{ ders: "TEMEL ELEKTRİK ATÖLYESİ", saat: 6, atananBrans: "Elektrik-Elektronik Teknolojisi", kategori: "MESLEK DERSLERİ", isAtolye: true }],
            secmeliDersler: [] });
    }
    const ad = s.A.zorunluDersler.find(d => /ATÖLYE/i.test(d.ders)).ders;
    st.toggleCourseMerge(s.A.id, ad, s.B.id);
    const r = hesapla();
    return { b: brans(r, "Elektrik-Elektronik Teknolojisi") || { totalHours: 0 }, r };
}
{
    const ab = ikiAtolyeSubesi(["A", "B"]);
    const ba = ikiAtolyeSubesi(["B", "A"]);
    kontrol("N03 atölye birleşik: sonuç şube sırasından bağımsız", ab.b.totalHours === ba.b.totalHours, `${ab.b.totalHours} / ${ba.b.totalHours}`);
    kontrol("N03 atölye birleşik: 38 öğrenci (10. sınıf) -> 4 grup x 6 = 24 saat", ab.b.totalHours === 24, `${ab.b.totalHours}`);
    kontrol("N03 atölye birleşik: mutabakat tutarlı", ab.r.yukMutabakati.tutarli === true);
}
kontrol("N03 rapor motorun bileşen hesabını kullanıyor",
    oku("js", "reportsEngine.js").includes("birlesikDersBilesenleri") && !oku("js", "reportsEngine.js").includes("handledMergedPairs"));

/* ======================================================================= */
/* N-04 — bire bir ders tavanı                                             */
/* ======================================================================= */
{
    const calgi = (ce.getMandatoryCourses("guzel_sanatlar_muzik", "9") || []).find(d => /Çalgı Eğitimi/i.test(d.ders || ""));
    kontrol("N04 GSL Müzik 9. sınıf çizelgesinde Çalgı Eğitimi 4 saat", calgi && calgi.saat === 4, calgi && calgi.saat);
    if (calgi) {
        const yuk = (n, ders = calgi) => ne.evaluateCourseMultiplier(ders, n, "guzel_sanatlar_muzik", "9", 0).calculatedLoad;
        kontrol("N04 20 öğrenci: tavan 4 + 6x10 = 64", yuk(20) === 64, yuk(20));
        kontrol("N04 8 öğrenci: tavan 4 + 6x4 = 28", yuk(8) === 28, yuk(8));
        kontrol("N04 3 öğrenci: tavan altındaki hesap aynı (4x3 = 12 > 4 + 6 = 10 -> 10)", yuk(3) === 10, yuk(3));
        const ikiSaat = Object.assign({}, calgi, { saat: 2 });
        kontrol("N04 2 saatlik derste tavan aşılmıyor, hesap değişmedi (2x20 = 40)", yuk(20, ikiSaat) === 40, yuk(20, ikiSaat));
        const secimli = Object.assign({}, calgi, { grupSayisi: 19 });
        kontrol("N04 okulun grup seçimi de tavanı aşamaz", yuk(20, secimli) === 64, yuk(20, secimli));
        for (let n = 1; n <= 40; n++) {
            kontrol(`N04 tavan hiçbir mevcutta aşılmıyor (n=${n})`, yuk(n) <= 4 + 6 * Math.floor(n / 2), yuk(n));
        }
    }
}

/* ======================================================================= */
/* N-10 — "Branş Atanmadı"                                                 */
/* ======================================================================= */
kontrol("N10 seçim kutusu 'Branş Atanmadı' değerini gerçekten gönderiyor",
    appKaynak.includes('<option value="— Branş Atanmadı —"'));
{
    st.resetSchool(); st.setSchoolType("anadolu_lisesi");
    const s = st.addSection({ sinifSeviyesi: "9", subeAdi: "9-A", ogrenciSayisi: 30,
        zorunluDersler: ce.getMandatoryCourses("anadolu_lisesi", "9"), secmeliDersler: [] });
    const once = hesapla();
    const beden = s.zorunluDersler.find(d => /Beden Eğitimi/i.test(d.ders || ""));
    kontrol("N10 örnek ders bulundu", !!beden);
    if (beden) {
        const eskiBrans = beden.atananBrans;
        const eskiYuk = (brans(once, eskiBrans) || { totalHours: 0 }).totalHours;
        st.updateCourseBranch(s.id, beden.ders, ATANMADI);
        st.sanitizeExistingState();   // okulun yeniden yüklenmesi
        const kayit = st.state.subeler[0].zorunluDersler.find(d => d.ders === beden.ders);
        kontrol("N10 seçim yeniden yüklemede korunuyor", kayit && kayit.atananBrans === ATANMADI, kayit && kayit.atananBrans);
        const sonra = hesapla();
        kontrol("N10 ders adıyla sahte branş satırı yok", !brans(sonra, beden.ders));
        kontrol("N10 dersin saati eski branşın yükünden düştü",
            ((brans(sonra, eskiBrans) || { totalHours: 0 }).totalHours) === eskiYuk - beden.saat,
            `${eskiBrans}: ${eskiYuk} -> ${(brans(sonra, eskiBrans) || { totalHours: 0 }).totalHours}`);
        kontrol("N10 okulun toplam yükü değişmedi (saat branşsız havuzda)", sonra.totalHours === once.totalHours, `${once.totalHours} -> ${sonra.totalHours}`);
    }
}
kontrol("N10 branşı çözülemeyen ders ders adına değil 'Branş Atanmadı'ya düşer",
    ce.getCanonicalCourseAndBranch("Tasavvuf Kültürü", "", null, "SEÇMELİ DERSLER").branchName === ATANMADI,
    ce.getCanonicalCourseAndBranch("Tasavvuf Kültürü", "", null, "SEÇMELİ DERSLER").branchName);
kontrol("N10 kayıttaki geçerli branş korunur",
    ce.getCanonicalCourseAndBranch("Matematik", "Fizik", null, "ORTAK DERSLER").branchName === "Fizik");
kontrol("N10 boş branş kaydında varsayılan branş verilir (davranış aynı)",
    ce.getCanonicalCourseAndBranch("Matematik", "", null, "ORTAK DERSLER").branchName === "Matematik");
{
    const r = ne.calculateSchoolNorms([{ id: "x", subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Proje Tasarımı", saat: 6, atananBrans: "" }], secmeliDersler: [] }], {}, "anadolu_lisesi", {});
    kontrol("N10 motor: branşsız ders için sahte 'Proje Tasarımı' branşı açılmaz", !brans(r, "Proje Tasarımı"));
    kontrol("N10 motor: saat okul toplamında kalır", r.totalHours === 6, r.totalHours);
}

/* ======================================================================= */
/* N-13 — 9. sınıf grup sınırı                                             */
/* ======================================================================= */
for (const [n, g] of [[9, 1], [10, 1], [20, 1], [21, 2], [30, 2], [31, 2], [32, 3], [40, 3]]) {
    kontrol(`N13 9. sınıf ${n} öğrenci -> ${g} grup`, ne.calculateWorkshopGroups(n, "9") === g, ne.calculateWorkshopGroups(n, "9"));
}
for (const [n, g] of [[16, 1], [17, 2], [24, 2], [25, 3], [32, 3], [33, 4]]) {
    kontrol(`N13 10. sınıf ${n} öğrenci -> ${g} grup (değişmedi)`, ne.calculateWorkshopGroups(n, "10") === g, ne.calculateWorkshopGroups(n, "10"));
}

/* ======================================================================= */
if (hatalar.length) {
    console.log(`❌ test_denetimDalga1: ${hatalar.length} hata, ${gecen} geçti`);
    hatalar.forEach(h => console.log("   - " + h));
    process.exit(1);
}
console.log(`✅ test_denetimDalga1: ${gecen} kontrol geçti`);
