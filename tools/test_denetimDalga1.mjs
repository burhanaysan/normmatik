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
     N-06  Öğrenci sayısı 0 yapılan şube grup hesabında 30 sayılıyordu.
     N-07  Kur'an 25+, bire bir çalgı ve ses eğitimi kuralları dayanağı olmayan
           türlere ve derslere taşıyordu (spor/GSL Kur'an, İHO çalgı, Toplu Ses).
     N-08  Özel eğitim sınıfı olan okulda normal şubelerden Özel Eğitim
           branşına verilen saat kayboluyor, mutabakat bozuluyordu.
     N-09  MESEM işletme yükünün yazıldığı branş şube ekleme sırasına bağlıydı.
     N-10  "Branş Atanmadı" seçimi hesapta çalışmıyor, ders adıyla sahte branş
           satırı açılıyordu.
     N-11  Meslek lisesinde 12. sınıfı olan her meslek branşına dayanaksız
           +10 saat ekleniyordu (kullanıcı kararı: yerine idarecinin girdiği
           alan şefi +10 / atölye-laboratuvar şefi x6; Md. 22/1-c-2,
           Ek Ders Kararı Md. 6/4, OÖKY Md. 84).
     N-13  9. sınıfta 31 öğrencili atölye şubesi 3 grup sayılıyordu
           ("31'den fazla 3" -> 31 ikinci kademede).
     N-14  Kaynaştırma bölünmesi "gruplara eşit dağıtım" şartını uygulamıyordu.

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
    // Bu ölçüm BİRLEŞTİRMEYİ sınıyor. Şeflik varsayılanı (aktif alanda alan şefi
    // +10 saat, kullanıcı kararı 16.09.2026) sayıyı kaydırmasın diye açıkça kapatılır.
    st.setAdminOptions({ alanSefleri: { "Elektrik-Elektronik Teknolojisi": 0 }, atolyeSefleri: {} });
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
/* N-11 — alan / atölye şeflikleri                                         */
/* ======================================================================= */
{
    const MTAL = "mesleki_ve_teknik_anadolu_lisesi";
    const BT = "Bilişim Teknolojileri";
    const sube = { id: "s12", subeAdi: "12-A", sinifSeviyesi: "12", ogrenciSayisi: 18, alanId: "bilisim",
        zorunluDersler: ce.getMandatoryCourses(MTAL, "12", "bilisim", null) || [], secmeliDersler: [] };
    kontrol("N11 ölçüm geçerli: 12. sınıf bilişim dersleri üretildi", sube.zorunluDersler.length > 0);
    // KULLANICI KARARI 16.09.2026: okulda AÇIK olan her alanda alan şefliği vardır
    // (OÖKY Md. 84/1) -> kutu varsayılan olarak işaretli gelir ve 10 saat yazılır.
    // İdareci işareti kaldırırsa kayda 0 yazılır ve saat eklenmez.
    const varsayilan = ne.calculateSchoolNorms([sube], {}, MTAL, {});
    const bVars = brans(varsayilan, BT);
    kontrol("N11 aktif alanda alan şefliği VARSAYILAN olarak 10 saat",
        !!bVars && bVars.seflikHours === 10, bVars && bVars.seflikHours);
    kontrol("N11 eski otomatik koordinatörlük kalemi yok (şeflik kalemi ayrı)",
        varsayilan.branchReport.every(b => !b.coordinatorHours),
        varsayilan.branchReport.filter(b => b.coordinatorHours).map(b => b.branchName).join(", "));
    const sade = ne.calculateSchoolNorms([sube], {}, MTAL,
        { adminOptions: { alanSefleri: { [BT]: 0 } } });
    kontrol("N11 işaret kaldırılınca (0) hiçbir branşa ek saat yazılmıyor",
        sade.branchReport.every(b => !b.coordinatorHours && !b.seflikHours),
        sade.branchReport.filter(b => b.coordinatorHours || b.seflikHours).map(b => b.branchName).join(", "));
    kontrol("N11 varsayılan 10 saat, kapatınca 0: fark tam 10",
        !!bVars && !!brans(sade, BT) && bVars.totalHours === brans(sade, BT).totalHours + 10,
        bVars && brans(sade, BT) && (brans(sade, BT).totalHours + " -> " + bVars.totalHours));
    kontrol("N11 motorda otomatik 12. sınıf kalemi kaldırıldı",
        !/branchesWithGrade12Vocational/.test(oku("js", "normEngine.js")));

    // "OKULDA AKTİF ALAN" = şubede seçilmiş alan (canlı okul bildirimi, 16.09.2026):
    // alanı seçilmemiş 9. sınıfın Görsel Sanatlar kültür dersi şeflik açmaz.
    const subeYap = (id, g, alan) => ({ id, subeAdi: g + "-" + id, sinifSeviyesi: g, ogrenciSayisi: 24, alanId: alan,
        zorunluDersler: ce.getMandatoryCourses(MTAL, g, alan, null) || [], secmeliDersler: [] });
    const karma = [subeYap("g9", "9", null), subeYap("s10", "10", "saglik"), subeYap("s11", "11", "saglik")];
    kontrol("N11 ölçüm geçerli: alansız 9. sınıfta Görsel Sanatlar dersi var",
        karma[0].zorunluDersler.some(d => d.atananBrans === "Görsel Sanatlar"));
    const aktif = ne.acikAlanBranslari(karma, MTAL);
    kontrol("N11 açık alan yalnız şubede seçilmiş alan (Sağlık Hizmetleri)",
        aktif.length === 1 && aktif[0] === "Sağlık Hizmetleri", aktif.join(", "));
    const rKarma = ne.calculateSchoolNorms(karma, {}, MTAL, {});
    kontrol("N11 Görsel Sanatlar ve Sağlık Bilgisi dersi şeflik saati doğurmuyor",
        rKarma.branchReport.filter(b => b.seflikHours > 0).map(b => b.branchName).join(",") === "Sağlık Hizmetleri",
        rKarma.branchReport.filter(b => b.seflikHours > 0).map(b => b.branchName + " " + b.seflikHours).join(", "));
    kontrol("N11 yalnız alansız 9. sınıflar: hiçbir branşa şeflik yok",
        ne.calculateSchoolNorms([subeYap("g9", "9", null)], {}, MTAL, {}).branchReport.every(b => !b.seflikHours));
    const sefBranslari = (alan) => ne.calculateSchoolNorms(["9", "10", "11", "12"].map(g => subeYap(alan + g, g, alan)), {}, MTAL, {})
        .branchReport.filter(b => b.seflikHours > 0).map(b => b.branchName).join(",");
    kontrol("N11 Geleneksel Türk Sanatları okulunda Türk Dili ve Edebiyatı'na şeflik yazılmıyor (Osmanlı Türkçesi)",
        !/Türk Dili ve Edebiyatı/.test(sefBranslari("geleneksel")), sefBranslari("geleneksel"));
    kontrol("N11 Radyo-TV okulunda İHL Meslek Dersleri'ne şeflik yazılmıyor",
        sefBranslari("radyotv") === "Radyo-Televizyon", sefBranslari("radyotv"));
    // Metalürji alanının dersleri Türkçe harf silen arama yüzünden Metal Teknolojisi'ne
    // gidiyordu (düzeltildi 16.09.2026). Esaslar sıra 53: Metalürji Teknolojisi.
    kontrol("N11 Metalürji alanında şef ve dersler Metalürji Teknolojisi'nde",
        sefBranslari("metalurji") === "Metalürji Teknolojisi", sefBranslari("metalurji"));
    kontrol("N11 ekran 'Okulda Aktif Alan' ölçütünü motordan alıyor",
        /this\.normEngine\.acikAlanlar\(subeler, schoolType\)/.test(oku("js", "uiComponents.js")));

    // ALAN -> BRANŞ (TTKB Öğretmenlik Alanları, Atama ve Ders Okutma Esasları, 19.12.2025-129)
    const mesBrans = (alan) => [...new Set(["9", "10", "11", "12"].flatMap(g =>
        (ce.getMandatoryCourses(MTAL, g, alan, null) || []).filter(d => d.isAtolye).map(d => d.atananBrans)))].join(",");
    kontrol("ESASLAR sıra 53: Metalürji alanı meslek dersleri Metalürji Teknolojisi", mesBrans("metalurji") === "Metalürji Teknolojisi", mesBrans("metalurji"));
    kontrol("ESASLAR sıra 73: Plastik Sanatlar alanı -> Sanat ve Tasarım / Plastik Sanatlar",
        mesBrans("plastiksanatlar") === "Sanat ve Tasarım / Plastik Sanatlar", mesBrans("plastiksanatlar"));
    kontrol("ESASLAR sıra 52: Metal alanı değişmedi", mesBrans("metal") === "Metal Teknolojisi", mesBrans("metal"));
    kontrol("ESASLAR: Sanat ve Tasarım / Plastik Sanatlar bilinen branş", ce.isKnownBranch("Sanat ve Tasarım / Plastik Sanatlar"));
    // Kullanıcı onayı 16.09.2026 (esaslar + okul sayfaları): Mikromekanik -> Makine (sıra 49),
    // Basım Teknolojileri alanı -> Matbaa Teknolojisi (sıra 50), Yapay Zekâ -> Bilişim Teknolojileri.
    kontrol("ESASLAR sıra 49: Mikromekanik alanı -> Makine ve Tasarım Teknolojisi", mesBrans("mikromekanik") === "Makine ve Tasarım Teknolojisi", mesBrans("mikromekanik"));
    kontrol("ESASLAR sıra 50: Basım Teknolojileri alanı -> Matbaa Teknolojisi", mesBrans("basim") === "Matbaa Teknolojisi", mesBrans("basim"));
    kontrol("KARAR: Yapay Zekâ alanı -> Bilişim Teknolojileri", mesBrans("yapayzeka") === "Bilişim Teknolojileri", mesBrans("yapayzeka"));
    const meslekListesi = w.dbService.getVocationalBranchesList();
    kontrol("ESASLAR: öğretmenlik alanı olmayan adlar meslek branş listesinde yok (Basım Teknolojileri, Mikromekanik, Siber Güvenlik, Yapay Zekâ)",
        ["Basım Teknolojileri", "Mikromekanik", "Siber Güvenlik", "Yapay Zekâ"].every(b => !meslekListesi.includes(b)) && meslekListesi.includes("Matbaa Teknolojisi"),
        meslekListesi.filter(b => ["Basım Teknolojileri", "Mikromekanik", "Siber Güvenlik", "Yapay Zekâ"].includes(b)).join(", "));
    {
        const mk = ["makine", "mikromekanik"].map((a, i) => subeYap("mk" + i, "10", a));
        const makSef = brans(ne.calculateSchoolNorms(mk, {}, MTAL, {}), "Makine ve Tasarım Teknolojisi");
        kontrol("ALANŞEF Makine + Mikromekanik açık: Makine ve Tasarım Teknolojisi'ne 2 alan şefi (20 saat)", !!makSef && makSef.seflikHours === 20, makSef && makSef.seflikHours);
    }
    kontrol("MESEM Matbaa Teknolojisi alanının branşı Matbaa Teknolojisi", /"brans": "Matbaa Teknolojisi"/.test(oku("js", "mesem_curriculum_db.js")) && !/"brans": "Basım Teknolojileri"/.test(oku("js", "mesem_curriculum_db.js")));
    kontrol("SEÇMELİ meslek dersi branşı merkezi alan-branş tablosundan", /merkeziHarita\[areaKey\] \|\| AREA_BRANCHES\[areaKey\]/.test(oku("js", "uiComponents.js")));

    // HER ALANA BİR ŞEF (kullanıcı kararı 16.09.2026, OÖKY Md. 84/1)
    const iki = [subeYap("b10", "10", "bilisim"), subeYap("c10", "10", "siber")];
    const alanlarIki = ne.acikAlanlar(iki, MTAL);
    kontrol("ALANŞEF Bilişim + Siber Güvenlik: iki ayrı alan, ikisi de Bilişim Teknolojileri",
        alanlarIki.length === 2 && alanlarIki.every(a => a.brans === BT), JSON.stringify(alanlarIki));
    const rIki = ne.calculateSchoolNorms(iki, {}, MTAL, {});
    kontrol("ALANŞEF iki alan -> Bilişim Teknolojileri'ne 2 alan şefi, 20 saat",
        brans(rIki, BT) && brans(rIki, BT).seflikHours === 20, brans(rIki, BT) && brans(rIki, BT).seflikHours);
    const siberAnahtar = (alanlarIki.find(a => /Siber/.test(a.ad)) || {}).anahtar;
    const rBir = ne.calculateSchoolNorms(iki, {}, MTAL, { adminOptions: { alanSefiAlanlari: { [siberAnahtar]: 0 } } });
    kontrol("ALANŞEF bir alanın kutusu kaldırılınca 10 saat",
        brans(rBir, BT) && brans(rBir, BT).seflikHours === 10, brans(rBir, BT) && brans(rBir, BT).seflikHours);
    const rEski = ne.calculateSchoolNorms(iki, {}, MTAL, { adminOptions: { alanSefleri: { [BT]: 0 } } });
    kontrol("ALANŞEF eski branş kaydı 0 -> o branşın bütün alanlarında şef yok",
        !brans(rEski, BT) || !brans(rEski, BT).seflikHours, brans(rEski, BT) && brans(rEski, BT).seflikHours);
    const notSatiri = (brans(rIki, BT).courses || []).find(c => c.isSeflik);
    kontrol("ALANŞEF rapor notunda alan adları ve 2 x 10s",
        notSatiri && /2 alan şefi \(.*Siber Güvenlik.*\) x 10s = 20s/.test(notSatiri.note), notSatiri && notSatiri.note);
    const pro = [subeYap("d10", "10", "denizcilik"), subeYap("p10", "10", "denizcilikpro")];
    kontrol("ALANŞEF aynı alanın protokollü programı ayrı alan sayılmaz (Denizcilik: 1 şef)",
        ne.acikAlanlar(pro, MTAL).length === 1
        && brans(ne.calculateSchoolNorms(pro, {}, MTAL, {}), "Denizcilik").seflikHours === 10,
        JSON.stringify(ne.acikAlanlar(pro, MTAL)));
    const mesemAlan = ne.seflikSaatleri({}, "mesleki_egitim_merkezi", alanlarIki);
    kontrol("ALANŞEF MESEM'de alan şefi yok", !mesemAlan[BT], JSON.stringify(mesemAlan));
    kontrol("ALANŞEF alan adı çizelge başlığından", ce.alanAdi("siber") === "Siber Güvenlik Alanı", ce.alanAdi("siber"));
    const ui2 = oku("js", "uiComponents.js");
    kontrol("ALANŞEF ekran alan başına kutu yazıp alanSefiAlanlari olarak kaydediyor",
        /data-alan=/.test(ui2) && /alanSefiAlanlari\[input\.dataset\.alan\]/.test(ui2) && /alanSefiAlanlari: alanSefiAlanlari/.test(ui2));
    kontrol("ALANŞEF bulut kaydı alanSefiAlanlari tablosunu kodluyor",
        (oku("js", "cloudDatabaseService.js").match(/"alanSefleri", "alanSefiAlanlari", "atolyeSefleri"/g) || []).length === 2);

    const sefli = ne.calculateSchoolNorms([sube], {}, MTAL,
        { adminOptions: { alanSefleri: { [BT]: 1 }, atolyeSefleri: { [BT]: 2 } } });
    const b0 = brans(sade, BT), b1 = brans(sefli, BT);
    kontrol("N11 alan şefi 10 + 2 atölye şefi x 6 = 22 saat", b1 && b1.seflikHours === 22, b1 && b1.seflikHours);
    kontrol("N11 şeflik saati branş yüküne ekleniyor", b0 && b1 && b1.totalHours === b0.totalHours + 22,
        b0 && b1 && (b0.totalHours + " -> " + b1.totalHours));
    kontrol("N11 şeflik ATÖLYE kovasına (Md. 19) giriyor", b0 && b1 && b1.workshopHours === b0.workshopHours + 22
        && b1.generalHours === b0.generalHours, b0 && b1 && (b0.workshopHours + " -> " + b1.workshopHours));
    const satir = b1 && (b1.courses || []).find(c => c.isSeflik);
    kontrol("N11 raporda 'Planlama ve Bakım-Onarım Görevi' satırı dayanağıyla",
        !!satir && satir.courseName === "Planlama ve Bakım-Onarım Görevi" && /22\/1-c-2/.test(satir.note) && /6\/4/.test(satir.note),
        satir && satir.note);
    kontrol("N11 mutabakat tutarlı ve şeflik eki 22", sefli.yukMutabakati.tutarli === true && sefli.yukMutabakati.seflikEki === 22,
        JSON.stringify(sefli.yukMutabakati));
    kontrol("N11 okul toplamı +22", sefli.totalHours === sade.totalHours + 22, sade.totalHours + " -> " + sefli.totalHours);

    const cift = ne.seflikSaatleri({ alanSefleri: { [BT]: 3 } }, MTAL);
    kontrol("N11 bir alanda en çok 1 alan şefi (OÖKY Md. 84/2)", cift[BT] && cift[BT].saat === 10, JSON.stringify(cift));
    kontrol("N11 MESEM'de VARSAYILAN alan şefliği de oluşmaz (OÖKY Md. 84/1)",
        Object.keys(ne.seflikSaatleri({}, "mesleki_egitim_merkezi", [BT])).length === 0,
        JSON.stringify(ne.seflikSaatleri({}, "mesleki_egitim_merkezi", [BT])));
    kontrol("N11 meslekî olmayan okulda varsayılan şeflik yok",
        Object.keys(ne.seflikSaatleri({}, "anadolu_lisesi", ["Matematik"])).length === 1
        && ne.seflikSaatleri({}, "anadolu_lisesi", ["Matematik"]).Matematik.saat === 10,
        "motor kapısı calculateSchoolNorms'ta: meslekî olmayan okulda blok hiç çalışmaz");
    const mesem = ne.seflikSaatleri({ alanSefleri: { [BT]: 1 }, atolyeSefleri: { [BT]: 1 } }, "mesleki_egitim_merkezi");
    kontrol("N11 MESEM'de alan şefi sayılmaz, atölye şefi sayılır",
        mesem[BT] && mesem[BT].alanSefi === 0 && mesem[BT].saat === 6, JSON.stringify(mesem));
    const eksi = ne.seflikSaatleri({ atolyeSefleri: { [BT]: -4, "X": "abc" } }, MTAL);
    kontrol("N11 bozuk/eksi şeflik sayısı saat doğurmaz", Object.keys(eksi).length === 0, JSON.stringify(eksi));

    const genel = [{ id: "g", subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Matematik", saat: 6, atananBrans: "Matematik" }], secmeliDersler: [] }];
    const g0 = ne.calculateSchoolNorms(genel, {}, "anadolu_lisesi", {});
    const g1 = ne.calculateSchoolNorms(genel, {}, "anadolu_lisesi", { adminOptions: { alanSefleri: { Matematik: 1 }, atolyeSefleri: { Matematik: 2 } } });
    kontrol("N11 meslekî olmayan okulda şeflik yük doğurmaz", g1.totalHours === g0.totalHours, g0.totalHours + " / " + g1.totalHours);
}
// Eski kayıtlardaki koordinatörlük saati açılışta şefliğe çevrilir
{
    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "mesleki_ve_teknik_anadolu_lisesi";
    st.state.okulBilgisi.adminOptions = { atolyeSefleri: { "Hazır": 3 } };
    st.state.koordinatorlukYukleri = { "On": 10, "YirmiIki": 22, "Alti": 6, "Sifir": 0, "Hazır": 10 };
    st.sanitizeExistingState();
    const ao = st.state.okulBilgisi.adminOptions;
    kontrol("N11 göç: 10 saat -> alan şefi", ao.alanSefleri.On === 1 && !ao.atolyeSefleri.On, JSON.stringify(ao));
    kontrol("N11 göç: 22 saat -> alan şefi + 2 atölye şefi", ao.alanSefleri.YirmiIki === 1 && ao.atolyeSefleri.YirmiIki === 2, JSON.stringify(ao));
    kontrol("N11 göç: 6 saat -> 1 atölye şefi", !ao.alanSefleri.Alti && ao.atolyeSefleri.Alti === 1, JSON.stringify(ao));
    kontrol("N11 göç: 0 saat şeflik açmaz", !("Sifir" in ao.alanSefleri) && !("Sifir" in ao.atolyeSefleri), JSON.stringify(ao));
    kontrol("N11 göç: elle girilmiş şefliğin üzerine yazılmaz", ao.atolyeSefleri["Hazır"] === 3 && !ao.alanSefleri["Hazır"], JSON.stringify(ao));
    kontrol("N11 göç: eski tablo boşaltıldı", JSON.stringify(st.state.koordinatorlukYukleri) === "{}");
    const once = JSON.stringify(ao);
    st.sanitizeExistingState();
    kontrol("N11 göç ikinci açılışta bir şey değiştirmez", JSON.stringify(st.state.okulBilgisi.adminOptions) === once);

    st.state = st.getDefaultState();
    st.state.okulBilgisi.okulTuru = "mesleki_egitim_merkezi";
    st.state.koordinatorlukYukleri = { "Bilişim Teknolojileri": 40 };
    st.sanitizeExistingState();
    kontrol("N11 göç: MESEM işletme yükü (Md. 22/2) olduğu gibi kalır",
        st.state.koordinatorlukYukleri["Bilişim Teknolojileri"] === 40, JSON.stringify(st.state.koordinatorlukYukleri));
}
{
    const ui = oku("js", "uiComponents.js");
    kontrol("N11 ekranda alan şefi kutusu ve atölye şefi sayısı var",
        /seflik-alan-input/.test(ui) && /seflik-atolye-input/.test(ui));
    kontrol("N11 kaydet düğmesi şeflikleri adminOptions'a yazıyor",
        /alanSefleri/.test(ui) && /atolyeSefleri/.test(ui) && /adminOptsToSave/.test(ui));
    const bulut = oku("js", "cloudDatabaseService.js");
    kontrol("N11 bulut şeflik tablolarının branş anahtarlarını kodluyor",
        (bulut.match(/alanSefleri/g) || []).length >= 2 && (bulut.match(/atolyeSefleri/g) || []).length >= 2);
}

/* ======================================================================= */
/* N-06 — öğrenci sayısı 0                                                  */
/* ======================================================================= */
{
    const TUR = "guzel_sanatlar_muzik";
    st.resetSchool(); st.setSchoolType(TUR);
    const s = st.addSection({ sinifSeviyesi: "9", subeAdi: "9-A", ogrenciSayisi: 20,
        zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(TUR, "9", null, null) || [])), secmeliDersler: [] });
    kontrol("N06 ölçüm geçerli: GSL müzik 9. sınıfta Çalgı Eğitimi var", (s.zorunluDersler || []).some(d => /Çalgı/i.test(d.ders)));
    st.updateSection(s.id, { ogrenciSayisi: 1 });
    const bir = brans(hesapla(), "Müzik");
    st.updateSection(s.id, { ogrenciSayisi: 0 });
    kontrol("N06 ölçüm geçerli: kayıtta 0 öğrenci", st.state.subeler[0].ogrenciSayisi === 0, st.state.subeler[0].ogrenciSayisi);
    const sifir = brans(hesapla(), "Müzik");
    kontrol("N06 0 öğrencili şube 1 öğrencili şubeden fazla yük doğurmaz",
        !!bir && !!sifir && sifir.totalHours <= bir.totalHours, bir && sifir && (bir.totalHours + " / " + sifir.totalHours));
    kontrol("N06 tek kural: 0 -> 0, '12' -> 12, alan yoksa 30",
        ne.subeOgrenciSayisi({ ogrenciSayisi: 0 }) === 0 && ne.subeOgrenciSayisi({ ogrenciSayisi: "12" }) === 12
        && ne.subeOgrenciSayisi({}) === 30);
    kontrol("N06 ekran ve rapor aynı kuralı kullanıyor",
        !/ogrenciSayisi \|\| 30, schoolType/.test(oku("js", "app.js"))
        && !/parseInt\(sec\.ogrenciSayisi, 10\) \|\| 30/.test(oku("js", "reportsEngine.js")));
}

/* ======================================================================= */
/* N-07 — grup kuralları yalnız dayanağı olan tür ve derste                 */
/* ======================================================================= */
{
    const g = (tur, ders, ogr, sinif) => ne.evaluateCourseMultiplier({ ders, saat: 2 }, ogr, tur, sinif, 0).groupCount;
    kontrol("N07 spor lisesinde seçmeli Kur'an-ı Kerim bölünmez", g("spor_lisesi", "KUR’AN-I KERİM", 30, "10") === 1, g("spor_lisesi", "KUR’AN-I KERİM", 30, "10"));
    kontrol("N07 GSL'de seçmeli Kur'an-ı Kerim bölünmez", g("guzel_sanatlar_gorsel", "KUR’AN-I KERİM", 30, "11") === 1);
    kontrol("N07 AİHL'de Kur'an-ı Kerim 26+ öğrencide 2 grup (dayanak korunur)", g("anadolu_imam_hatip_lisesi", "Kur'an-ı Kerim", 30, "9") === 2);
    kontrol("N07 İHO'da Kur'an-ı Kerim 26+ öğrencide 2 grup (dayanak korunur)", g("imam_hatip_ortaokulu", "KUR’AN-I KERİM", 30, "6") === 2);
    kontrol("N07 AİHL'de 25 öğrencide bölünmez", g("anadolu_imam_hatip_lisesi", "Kur'an-ı Kerim", 25, "9") === 1);
    kontrol("N07 'Kur'an Okuma Teknikleri' Kur'an-ı Kerim kuralına girmez", g("anadolu_imam_hatip_lisesi", "Kur'an Okuma Teknikleri", 30, "10") === 1);
    kontrol("N07 İHO'da Bireysel Çalgı Eğitimi öğrenci başına çoğaltılmaz", g("imam_hatip_ortaokulu", "Bireysel Çalgı Eğitimi", 30, "6") === 1,
        g("imam_hatip_ortaokulu", "Bireysel Çalgı Eğitimi", 30, "6"));
    kontrol("N07 AİHL Toplu Ses Eğitimi en çok 3 grup", g("anadolu_imam_hatip_lisesi", "Toplu Ses Eğitimi", 30, "9") <= 3,
        g("anadolu_imam_hatip_lisesi", "Toplu Ses Eğitimi", 30, "9"));
    kontrol("N07 GSL müzik TOPLU SES EĞİTİMİ en çok 3 grup", g("guzel_sanatlar_muzik", "TOPLU SES EĞİTİMİ", 30, "9") <= 3);
    kontrol("N07 AİHL musiki Çalgı Eğitimi bire bir kalır (çizelge dayanağı)", g("anadolu_imam_hatip_lisesi", "Çalgı Eğitimi", 30, "11") > 1);
    kontrol("N07 GSL müzik Bireysel Ses Eğitimi 2'şerli kalır", g("guzel_sanatlar_muzik", "Bireysel Ses Eğitimi", 20, "9") === 10,
        g("guzel_sanatlar_muzik", "Bireysel Ses Eğitimi", 20, "9"));
    // 16.09.2026 taraması: bu iki ders seçmeli havuzunda GERÇEKTEN var ve eski
    // motorda bölünüyordu (AİHL "Kur'an'ın Ana Konuları" 2 grup, İHO "Bireysel
    // Ses Eğitimi" 15 grup). Çizelge hükmü yalnız "Kur'an-ı Kerim" dersi için;
    // İHO'da bire bir ders tanımı yok.
    kontrol("N07 AİHL 'Kur'an'ın Ana Konuları' bölünmez", g("anadolu_imam_hatip_lisesi", "Kur’an’ın Ana Konuları", 30, "9") === 1,
        g("anadolu_imam_hatip_lisesi", "Kur’an’ın Ana Konuları", 30, "9"));
    kontrol("N07 İHO 'Bireysel Ses Eğitimi' bölünmez", g("imam_hatip_ortaokulu", "Bireysel Ses Eğitimi", 30, "5") === 1,
        g("imam_hatip_ortaokulu", "Bireysel Ses Eğitimi", 30, "5"));
    kontrol("N07 hazırlıklı AİHL'de Kur'an-ı Kerim kuralı sürüyor", g("hazirlik_imam_hatip_lisesi", "KUR’AN-I KERİM", 30, "9") === 2,
        g("hazirlik_imam_hatip_lisesi", "KUR’AN-I KERİM", 30, "9"));
}

/* ======================================================================= */
/* N-08 — normal şubeden Özel Eğitim'e verilen saat                         */
/* ======================================================================= */
{
    const TUR = "ortaokul_temel_egitim";
    const okul = (ozelSubeVar) => {
        st.resetSchool(); st.setSchoolType(TUR);
        const n = [0, 1, 2].map(i => st.addSection({ sinifSeviyesi: "6", subeAdi: "6-" + "ABC"[i], ogrenciSayisi: 28,
            zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(TUR, "6", null, null) || [])), secmeliDersler: [] }));
        for (const s of n) st.updateCourseBranch(s.id, "Matematik", "Özel Eğitim");
        if (ozelSubeVar) st.addSection({ sinifSeviyesi: "6", subeAdi: "6-Özel", ogrenciSayisi: 8, alanId: "ozel_egitim",
            dalAdi: "Özel Eğitim Sınıfı", isSpecialEdu: true, specialEduType: "hafif_zihinsel", engelTuru: "hafif_zihinsel",
            zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(TUR, "6", "ozel_egitim", "Özel Eğitim Sınıfı") || [])), secmeliDersler: [] });
        return hesapla();
    };
    const r1 = okul(false), r2 = okul(true);
    const oe1 = brans(r1, "Özel Eğitim"), oe2 = brans(r2, "Özel Eğitim");
    kontrol("N08 ölçüm geçerli: normal şubelerden Özel Eğitim'e saat verildi", !!oe1 && oe1.totalHours > 0, oe1 && oe1.totalHours);
    // Özel eğitim 2. dalga (16.09.2026): özel şubenin alan öğretmeninin okuttuğu dersleri
    // (DKAB, görsel sanatlar, müzik, beden eğitimi) ilgili branşa yazılır; ozelEgitimSaati
    // yalnız özel eğitim öğretmeninin saatidir.
    const alanaYazilan = r2.branchReport.reduce((t, b) => t + (b.ozelEgitimSinifiSaati || 0), 0);
    kontrol("N08 özel şube eklenince okul toplamı = önceki + özel şube saati (özel eğitim + alan dersleri)",
        r2.totalHours === r1.totalHours + r2.yukMutabakati.ozelEgitimSaati + alanaYazilan && alanaYazilan === 8,
        r1.totalHours + " + " + r2.yukMutabakati.ozelEgitimSaati + " + " + alanaYazilan + " / " + r2.totalHours);
    kontrol("N08 mutabakat tutarlı (rapor paneli gizlenmez)", r2.yukMutabakati.tutarli === true);
    kontrol("N08 normal şube saati Özel Eğitim satırında ayrıca yazılı",
        !!oe2 && oe2.normalSubeSaati === oe1.totalHours && /Normal şubelerden/.test(oe2.formulaExplanation),
        oe2 && oe2.normalSubeSaati);
    kontrol("N08 Özel Eğitim normu yine şube başına (Md. 17/1)",
        !!oe2 && oe2.calculatedNorm === (oe2.ozelEgitimDetay || []).reduce((t, x) => t + x.norm, 0));
}

/* ======================================================================= */
/* N-09 — MESEM işletme yükünün branşı şube sırasına bağlı değil            */
/* ======================================================================= */
{
    const TUR = "mesleki_egitim_merkezi", ALAN = "elektrik_elektronik_teknolojisi";
    const IKINCI = "Endüstriyel Otomasyon Teknolojileri";
    const okul = (sira, mevcut) => {
        st.resetSchool(); st.setSchoolType(TUR);
        const s = {};
        for (const k of sira) s[k] = st.addSection({ sinifSeviyesi: "10", subeAdi: "10-" + k, ogrenciSayisi: mevcut[k], alanId: ALAN,
            zorunluDersler: JSON.parse(JSON.stringify(ce.getMandatoryCourses(TUR, "10", ALAN, null) || [])), secmeliDersler: [] });
        const isl = (s.B.zorunluDersler || []).find(d => ne.mesemIsletmeDersiMi(d));
        if (!isl) return null;
        st.updateCourseBranch(s.B.id, isl.ders, IKINCI);
        const r = hesapla();
        return r.branchReport.filter(b => b.coordinatorHours > 0)
            .map(b => ({ ad: b.branchName, saat: b.coordinatorHours, not: ((b.courses || []).find(c => c.isCoordinator) || {}).note || "" }));
    };
    const esitAB = okul(["A", "B"], { A: 30, B: 30 }), esitBA = okul(["B", "A"], { A: 30, B: 30 });
    kontrol("N09 ölçüm geçerli: MESEM çizelgesinde işletme dersi var", !!esitAB && esitAB.length === 1, JSON.stringify(esitAB));
    if (esitAB && esitBA) {
        kontrol("N09 eşit çırakta sonuç şube sırasına bağlı değil",
            JSON.stringify(esitAB.map(x => [x.ad, x.saat])) === JSON.stringify(esitBA.map(x => [x.ad, x.saat])),
            JSON.stringify(esitAB) + " / " + JSON.stringify(esitBA));
        kontrol("N09 çelişen branş seçimi not satırında gösteriliyor", /farklı branş seçilmiş/.test(esitAB[0].not), esitAB[0].not);
    }
    const cokAB = okul(["A", "B"], { A: 10, B: 40 }), cokBA = okul(["B", "A"], { A: 10, B: 40 });
    kontrol("N09 yük en çok çırağı olan branşa yazılır (her iki sırada)",
        !!cokAB && !!cokBA && cokAB.length === 1 && cokAB[0].ad === IKINCI && cokBA[0].ad === IKINCI,
        JSON.stringify(cokAB) + " / " + JSON.stringify(cokBA));
}

/* ======================================================================= */
/* N-14 — kaynaştırma: gruplara eşit dağıtım                                */
/* ======================================================================= */
for (const [ogr, sinif, k, beklenen] of [[24, "10", 2, 2], [34, "11", 3, 4], [20, "12", 4, 4], [30, "10", 3, 3],
        [20, "11", 2, 2], [20, "11", 3, 3], [40, "10", 8, 5], [31, "9", 1, 2], [31, "9", 5, 4]]) {
    const gm = ne.calculateWorkshopGroups(ogr, sinif, k);
    kontrol(`N14 ${sinif}. sınıf ${ogr} öğrenci, ${k} kaynaştırma -> ${beklenen} grup`, gm === beklenen, gm);
}

/* ======================================================================= */
/* Y10 — grup oluşturma sayısının ALTINDAKİ şube (kullanıcı kararı: değişiklik yok) */
/* ======================================================================= */
// Md. 22/1-ç alt sınırı bir BÖLÜNME eşiğidir: 8'den (9. sınıfta 10'dan) az
// öğrencili şube bölünmez ama dersi okutulur, yükü tek gruptur. Kullanıcı kararı
// 16.09.2026: bugünkü davranış doğru, değiştirilmeyecek — teste bağlandı.
for (const [ogr, sinif] of [[7, "10"], [1, "11"], [9, "9"], [0, "12"]]) {
    kontrol(`Y10 ${sinif}. sınıf ${ogr} öğrenci -> 1 grup (yük sıfırlanmaz)`,
        ne.calculateWorkshopGroups(ogr, sinif) === 1, ne.calculateWorkshopGroups(ogr, sinif));
}

/* ======================================================================= */
/* Y7 — GERİ ALINDI (kullanıcı kararı 22.09.2026): norm İDARECİNİN SEÇTİĞİ    */
/* branşa yazılır. Gerekçe: bazı derslerin (İslam Bilim Tarihi, Fen Bilimleri */
/* Uygulamaları ve benzerleri) branşı tek değildir; karar müdürün, uygulama   */
/* kısıtlamaz. (16.09'da eklenen "resmî alana yaz" kuralı kapatıldı.)         */
/* ======================================================================= */
{
    kontrol("Y7 geri alındı: normDersinResmiAlaninaYazilir bayrağı KAPALI", ne.normDersinResmiAlaninaYazilir === false,
        String(ne.normDersinResmiAlaninaYazilir));

    // Ortaokulda İnkılap Tarihi çizelgede Sosyal Bilgiler'in; idareci Tarih seçerse norm TARİH'e yazılır.
    const TUR = "ortaokul_temel_egitim";
    const dersler = ce.getMandatoryCourses(TUR, "8", null, null) || [];
    const ink = dersler.find(d => /İnkılap/i.test(d.ders || ""));
    kontrol("Y7 ölçüm geçerli: 8. sınıf çizelgesinde İnkılap Tarihi var ve Sosyal Bilgiler'in",
        !!ink && ink.atananBrans === "Sosyal Bilgiler", ink && ink.atananBrans);
    if (ink) {
        const zorunlu = JSON.parse(JSON.stringify(dersler))
            .map(d => /İnkılap/i.test(d.ders || "") ? Object.assign({}, d, { atananBrans: "Tarih" }) : d);
        const sube = { id: "y7a", subeAdi: "8-A", sinifSeviyesi: "8", ogrenciSayisi: 28,
            zorunluDersler: zorunlu, secmeliDersler: [] };
        const r = ne.calculateSchoolNorms([sube], {}, TUR, {});
        const sb = brans(r, "Sosyal Bilgiler"), tar = brans(r, "Tarih");
        kontrol("Y7 idarecinin seçtiği Tarih branşına yazılıyor",
            !!tar && (tar.courses || []).some(c => /İnkılap/i.test(c.courseName || "")), tar && tar.totalHours);
        kontrol("Y7 dersin çizelgedeki alanına (Sosyal Bilgiler) YAZILMIYOR",
            !sb || !(sb.courses || []).some(c => /İnkılap/i.test(c.courseName || "")), sb && sb.totalHours);
        const satir = tar && (tar.courses || []).find(c => /İnkılap/i.test(c.courseName || ""));
        kontrol("Y7 'fiilî' notu üretilmiyor (seçim zaten asıl kayıt)", !!satir && !satir.fiiliBrans, satir && satir.fiiliBrans);
        kontrol("Y7 okul toplam yükü değişmiyor (saat kaybolmaz)",
            r.totalHours === zorunlu.reduce((t, d) => t + (parseInt(d.saat, 10) || 0), 0), r.totalHours);
    }

    // Kullanıcının kendi örneği: Fizik dersini Kimya branşına veren müdür -> Kimya normu artar.
    {
        const iki = (atanan) => ({ id: "y7f", subeAdi: "10-A", sinifSeviyesi: "10", ogrenciSayisi: 30, secmeliDersler: [],
            zorunluDersler: [
                { ders: "Kimya", saat: 4, atananBrans: "Kimya", kategori: "ORTAK DERSLER" },
                { ders: "Fizik", saat: 4, atananBrans: atanan, kategori: "ORTAK DERSLER" }] });
        const normal = ne.calculateSchoolNorms([iki("Fizik")], {}, "anadolu_lisesi", {});
        const verilen = ne.calculateSchoolNorms([iki("Kimya")], {}, "anadolu_lisesi", {});
        kontrol("Y7 Fizik dersi Fizik'teyken Kimya 4 saat", (brans(normal, "Kimya") || {}).totalHours === 4);
        kontrol("Y7 Fizik dersi Kimya'ya verilince Kimya yükü 8 saate çıkar (müdürün sorumluluğu)",
            (brans(verilen, "Kimya") || {}).totalHours === 8, (brans(verilen, "Kimya") || {}).totalHours);
        kontrol("Y7 Fizik satırı yükü kalmadığı için listeden çıkar", !brans(verilen, "Fizik"));
    }

    // "Branş Atanmadı" seçimi: ders hiçbir branşa yazılmaz.
    const sube2 = { id: "y7b", subeAdi: "9-A", sinifSeviyesi: "9", ogrenciSayisi: 30,
        zorunluDersler: [{ ders: "Matematik", saat: 6, atananBrans: ATANMADI }], secmeliDersler: [] };
    const r2 = ne.calculateSchoolNorms([sube2], {}, "anadolu_lisesi", {});
    kontrol("Y7 'Branş Atanmadı' korunur (norma yazılmaz)", !brans(r2, "Matematik"),
        r2.branchReport.map(b => b.branchName).join(", "));
    kontrol("Y7 atanmamış dersin saati okul toplamında kalır", r2.totalHours === 6, r2.totalHours);

    // Rehberlik ve Yönlendirme dersi: giren branşın yüküne eklenir (her iki karar döneminde aynı).
    {
        st.resetSchool(); st.setSchoolType("anadolu_lisesi");
        const dr = JSON.parse(JSON.stringify(ce.getMandatoryCourses("anadolu_lisesi", "9", null, null) || []));
        const sr = st.addSection({ sinifSeviyesi: "9", subeAdi: "9-R", ogrenciSayisi: 30, zorunluDersler: dr, secmeliDersler: [] });
        const reh = (sr.zorunluDersler || []).find(x => /Rehberlik/i.test(x.ders || ""));
        kontrol("Y7 rehberlik ölçümü geçerli: rehberlik dersi var", !!reh, reh && reh.atananBrans);
        if (reh) {
            const oncekiBio = brans(hesapla(), "Biyoloji");
            st.updateCourseBranch(sr.id, reh.ders, "Biyoloji");
            const sonrakiBio = brans(hesapla(), "Biyoloji");
            kontrol("Y7 rehberlik saati giren branşın yüküne ekleniyor",
                !!sonrakiBio && !!oncekiBio && sonrakiBio.totalHours === oncekiBio.totalHours + (parseInt(reh.saat, 10) || 1),
                (oncekiBio && oncekiBio.totalHours) + " -> " + (sonrakiBio && sonrakiBio.totalHours));
        }
    }

    // RAPOR TARAFI: matris de aynı kuralı izlemeli (kart başlığı motordan, satırlar rapordan gelir).
    {
        st.resetSchool(); st.setSchoolType("anadolu_lisesi");
        const d9 = JSON.parse(JSON.stringify(ce.getMandatoryCourses("anadolu_lisesi", "9", null, null) || []));
        const sy = st.addSection({ sinifSeviyesi: "9", subeAdi: "9-A", ogrenciSayisi: 30, zorunluDersler: d9, secmeliDersler: [] });
        const sag = (sy.zorunluDersler || []).find(x => /Sağlık Bilgisi/i.test(x.ders || ""));
        kontrol("Y7 rapor ölçümü geçerli: Sağlık Bilgisi dersi var", !!sag, sag && sag.atananBrans);
        if (sag) {
            st.updateCourseBranch(sy.id, sag.ders, "Biyoloji");
            const RE = new w.MebReportsEngine(w.dbService, w.normEngine, w.curriculumEngine);
            const gruplar = (RE.generateMasterLoadGrid(st.state, "ALL").branchGroups) || {};
            const bioGrup = gruplar["Biyoloji"];
            kontrol("Y7 raporda ders idarecinin seçtiği branşın (Biyoloji) altında",
                !!bioGrup && Object.values(bioGrup.courses || {}).some(c => /Sağlık Bilgisi/i.test(c.courseName || "")),
                Object.keys(gruplar).join(", "));
            const sagGrup = gruplar["Sağlık Hizmetleri"];
            kontrol("Y7 raporda ders çizelgedeki alanının (Sağlık Hizmetleri) altında DEĞİL",
                !sagGrup || !Object.values(sagGrup.courses || {}).some(c => /Sağlık Bilgisi/i.test(c.courseName || "")));
        }
    }
}

/* ======================================================================= */
/* DALGA 2 V-05 — 9. sınıf anahtarındaki hazırlık kaydı seçilmez             */
/* ======================================================================= */
for (const tur of ["mesleki_ve_teknik_anadolu_lisesi", "anadolu_teknik_programi"]) {
    const d9 = ce.getMandatoryCourses(tur, "9", "havacilik_ve_uzay_teknolojisi", null) || [];
    kontrol(`V05 ${tur} havacılık 9. sınıf dersleri üretildi`, d9.length > 0, d9.length);
    kontrol(`V05 ${tur} havacılık 9. sınıfta "Hazırlık Sınıfı" dersi YOK`,
        !d9.some(x => /HAZIRLIK/i.test(x.ders || "")), d9.map(x => x.ders).join(" | "));
    kontrol(`V05 ${tur} havacılık 9. sınıfta Fizik var (gerçek 9. sınıf çizelgesi)`,
        d9.some(x => /Fizik/i.test(x.ders || "")), d9.map(x => x.ders).join(" | "));
    const yd = d9.find(x => /Yabancı Dil/i.test(x.ders || ""));
    kontrol(`V05 ${tur} havacılık 9. sınıf yabancı dil 24 saat değil`, !yd || (parseInt(yd.saat, 10) || 0) < 10, yd && yd.saat);
    const dal = ce.getMandatoryCourses(tur, "9", "havacilik_ve_uzay_teknolojisi", "İtki Sistemleri") || [];
    kontrol(`V05 ${tur} dal seçilince de hazırlık kaydı seçilmiyor`,
        dal.length > 0 && !dal.some(x => /HAZIRLIK/i.test(x.ders || "")), dal.map(x => x.ders).join(" | "));
}
{
    // Tek kayıtlı sayfalar etkilenmez: denizcilik ve gazetecilik 9. sınıf dolu kalır.
    const den = ce.getMandatoryCourses("mesleki_ve_teknik_anadolu_lisesi", "9", "denizcilik", null) || [];
    const gaz = ce.getMandatoryCourses("mesleki_ve_teknik_anadolu_lisesi", "9", "gazetecilik", null) || [];
    kontrol("V05 denizcilik 9. sınıf etkilenmedi", den.length > 0 && !den.some(x => /HAZIRLIK/i.test(x.ders || "")), den.length);
    kontrol("V05 gazetecilik 9. sınıf etkilenmedi", gaz.length === 14, gaz.length);
}

/* ======================================================================= */
if (hatalar.length) {
    console.log(`❌ test_denetimDalga1: ${hatalar.length} hata, ${gecen} geçti`);
    hatalar.forEach(h => console.log("   - " + h));
    process.exit(1);
}
console.log(`✅ test_denetimDalga1: ${gecen} kontrol geçti`);
